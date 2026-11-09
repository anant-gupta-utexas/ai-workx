import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
from types import SimpleNamespace
from unittest.mock import Mock

import pytest

import adapter
from bundle import inspect_resources, prepare_bundle


@pytest.fixture
def workspace(tmp_path):
    work = tmp_path / "work"
    work.mkdir()
    (work / "assets").mkdir()
    (work / "brief.md").write_text("# Queue recovery\n\nAudience: service operators.\n")
    (work / "DESIGN.md").write_text("Default diagram style: clean\nHand-drawn support: disabled\n")
    (work / "assets/chart.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><text x="10" y="50">Queue</text></svg>')
    (work / "slides.md").write_text('---\ntitle: Queue recovery\n---\n\n# Queue recovery\n\n---\n\n## Queued work\n\n![Queue](assets/chart.svg)\n\n---\n\n## Recovery\n\nRetry failed work.\n')
    return work


def call_cli(work, out, format="source", *extra):
    # No site packages, user site, shared Python paths, uv or backend commands.
    return subprocess.run([sys.executable, "-S", str(Path(adapter.__file__)),
                           "--workspace", str(work), "--out", str(out), "--format", format, *extra],
                          env={"PATH": "", "HOME": str(work.parent)}, text=True, capture_output=True)


def test_source_only_without_site_packages_or_slides(workspace, tmp_path):
    (workspace / "slides.md").unlink()
    out = tmp_path / "bundle"
    result = call_cli(workspace, out)
    assert result.returncode == 0, result.stderr
    report = json.loads(result.stdout)
    assert report["completed"] == ["source"]
    assert not report["visually_reviewed"]
    assert (out / "brief.md").read_bytes() == (workspace / "brief.md").read_bytes()
    assert (out / "assets/chart.svg").read_bytes() == (workspace / "assets/chart.svg").read_bytes()


def test_missing_backend_keeps_sources_and_reports_incomplete_export(workspace, tmp_path):
    out = tmp_path / "bundle"
    result = call_cli(workspace, out, "html")
    assert result.returncode == 1
    assert "uv sync" in result.stderr
    report = json.loads((out / "render-report.json").read_text())
    assert report["status"] == "failed"
    assert report["requested"] == "html"
    assert report["completed"] == ["source"]
    assert (out / "slides.md").read_bytes() == (workspace / "slides.md").read_bytes()
    assert not (out / "slides.html").exists()


def test_real_html_bundles_assets_and_discloses_cdn_dependencies(workspace, tmp_path):
    (workspace / "assets/theme.css").write_text(":root { --colloquium-accent: #235e71; }")
    slides = workspace / "slides.md"
    slides.write_text(slides.read_text().replace("title: Queue recovery", "title: Queue recovery\ncustom_css: assets/theme.css"))
    before = {p.name: p.read_bytes() for p in workspace.glob("*.md")}
    report = adapter.render_bundle(workspace, tmp_path / "bundle", "html")
    assert report["status"] == "complete", report
    assert report["completed"] == ["source", "html"]
    assert report["external_resources"]
    assert any("jsdelivr" in url for url in report["external_resources"])
    assert any("network" in warning for warning in report["warnings"])
    html = (tmp_path / "bundle/slides.html").read_text()
    assert 'src="assets/chart.svg"' in html
    assert "#235e71" in html
    assert {p.name: p.read_bytes() for p in workspace.glob("*.md")} == before


@pytest.mark.parametrize("format", ["pptx", "google-slides"])
def test_powerpoint_is_not_an_adapter_backend(workspace, tmp_path, format):
    result = call_cli(workspace, tmp_path / "bundle", format)
    assert result.returncode != 0
    assert "PowerPoint" in result.stderr
    assert not (tmp_path / "bundle").exists()


@pytest.mark.parametrize("change,error", [
    ("mermaid", "pre-render"), ("missing", "Missing local resource"),
    ("escape", "outside"), ("template", "PowerPoint"),
])
def test_unsupported_or_missing_assets_fail_without_changing_sources(workspace, tmp_path, change, error):
    slides = workspace / "slides.md"
    if change == "mermaid":
        slides.write_text(slides.read_text() + "\n```mermaid\nA --> B\n```\n")
    elif change == "missing":
        (workspace / "assets/chart.svg").unlink()
    elif change == "escape":
        slides.write_text(slides.read_text().replace("assets/chart.svg", "../private.svg"))
    else:
        slides.write_text(slides.read_text().replace("title: Queue recovery", "title: Queue recovery\npptx:\n  template: company.pptx"))
    source = slides.read_bytes()
    report = adapter.render_bundle(workspace, tmp_path / "bundle", "html")
    assert report["status"] == "failed"
    assert error in report["error"]
    assert slides.read_bytes() == source
    assert (tmp_path / "bundle/slides.md").read_bytes() == source
    assert not (tmp_path / "bundle/slides.pdf").exists()


def test_pdf_without_browser_does_not_claim_html_as_pdf(workspace, tmp_path, monkeypatch):
    backend = adapter.load_backend()
    backend.export_pdf = Mock(return_value=None)
    monkeypatch.setattr(adapter, "load_backend", lambda: backend)
    report = adapter.render_bundle(workspace, tmp_path / "bundle", "pdf")
    assert report["status"] == "failed"
    assert report["completed"] == ["source", "html"]
    assert "Chromium" in report["error"]
    assert not (tmp_path / "bundle/slides.pdf").exists()


def test_upstream_warnings_are_preserved(workspace, tmp_path):
    (workspace / "assets/invalid.bib").write_text("@article{unfinished,")
    (workspace / "slides.md").write_text("---\nbibliography: assets/invalid.bib\n---\n# Evidence\n\n[@unknown]\n")
    report = adapter.render_bundle(workspace, tmp_path / "bundle", "html")
    assert report["status"] == "complete", report
    assert any("bibliography" in w and "invalid.bib" in w for w in report["warnings"])


@pytest.mark.parametrize("config,error", [("custom_css: ../private.css", "assets/"), ("bibliography: assets/missing.bib", "Missing local resource"), ("theme: untested", "default")])
def test_local_configuration_sources_are_bundled(workspace, tmp_path, config, error):
    (workspace / "slides.md").write_text(f"---\n{config}\n---\n# Topic\n")
    report = adapter.render_bundle(workspace, tmp_path / "bundle", "html")
    assert report["status"] == "failed"
    assert error in report["error"]
    assert report["completed"] == ["source"]


def test_main_reports_success_failure_and_invalid_options(workspace, tmp_path, capsys):
    args = ["--workspace", str(workspace), "--out", str(tmp_path / "bundle"), "--format", "source"]
    assert adapter.main(args) == 0
    assert json.loads(capsys.readouterr().out)["status"] == "complete"
    assert adapter.main(args) == 1
    assert "empty" in capsys.readouterr().err
    with pytest.raises(ValueError, match="PDF"):
        adapter.render_bundle(workspace, tmp_path / "unused", "html", capture=True)
    with pytest.raises(ValueError, match="engine"):
        adapter.render_bundle(workspace, tmp_path / "unused", "source", capture_engine="bad")


def test_bundle_refuses_aliases_nonempty_output_and_symlinks(workspace, tmp_path):
    with pytest.raises(ValueError, match="separate"):
        prepare_bundle(workspace, workspace / "out")
    out = tmp_path / "occupied"
    out.mkdir()
    (out / "previous.pdf").write_bytes(b"keep")
    with pytest.raises(ValueError, match="empty"):
        prepare_bundle(workspace, out)
    (workspace / "assets/link").symlink_to(tmp_path)
    with pytest.raises(ValueError, match="symlink"):
        prepare_bundle(workspace, tmp_path / "bundle")
    assert (out / "previous.pdf").read_bytes() == b"keep"


def test_missing_brief_and_missing_slides_are_clear(tmp_path, workspace):
    with pytest.raises(ValueError, match="brief.md"):
        prepare_bundle(tmp_path / "missing", tmp_path / "out")
    (workspace / "slides.md").unlink()
    report = adapter.render_bundle(workspace, tmp_path / "bundle", "html")
    assert report["status"] == "failed"
    assert "slides.md" in report["error"]
    assert (tmp_path / "bundle/brief.md").exists()


def test_resource_audit_checks_css_svg_and_relative_paths(tmp_path):
    assets = tmp_path / "assets"
    assets.mkdir()
    (assets / "bg.png").write_bytes(b"png")
    (assets / "style.css").write_text('@import "https://example.org/theme.css"; .bg { background:url(bg.png) }')
    (assets / "icon.svg").write_text('<svg><image href="bg.png"/><use href="#id"/></svg>')
    html = tmp_path / "slides.html"
    html.write_text('<link href="assets/style.css"/><img src="assets/icon.svg"/><img src="data:image/png;base64,YQ=="/><style>.x { color:red }</style>')
    assert inspect_resources(html, tmp_path) == ["https://example.org/theme.css"]
    (assets / "bg.png").unlink()
    with pytest.raises(ValueError, match="Missing local resource"):
        inspect_resources(html, tmp_path)


@pytest.mark.parametrize("resource", ["/etc/private.png", "file:///private.png", "../outside.png", "javascript:bad"])
def test_resource_audit_refuses_unbundled_paths(tmp_path, resource):
    file = tmp_path / "slides.html"
    file.write_text(f'<img src="{resource}"/>')
    with pytest.raises(ValueError):
        inspect_resources(file, tmp_path)


def test_srcset_is_explicitly_unsupported(tmp_path):
    html = tmp_path / "slides.html"
    html.write_text('<img srcset="x.png 1x, y.png 2x"/>')
    with pytest.raises(ValueError, match="srcset"):
        inspect_resources(html, tmp_path)


def test_backend_requires_evaluated_revision(monkeypatch):
    monkeypatch.setattr(adapter.metadata, "distribution", lambda _: SimpleNamespace(read_text=lambda _: json.dumps({"vcs_info": {"commit_id": "wrong"}})))
    with pytest.raises(RuntimeError, match="pinned"):
        adapter.load_backend()


@pytest.mark.parametrize("engine,available,expected", [("auto", {"gs"}, "native"), ("auto", {"pdftoppm"}, "poppler"), ("poppler", {"gs", "pdftoppm"}, "poppler")])
def test_capture_routes_without_changing_export_format(tmp_path, monkeypatch, engine, available, expected):
    monkeypatch.setattr(adapter.shutil, "which", lambda name: name if name in available else None)
    def write_preview(out):
        out.mkdir(exist_ok=True)
        file = out / "slide-1.png"
        file.write_bytes(b"\x89PNG\r\n\x1a\npreview")
        return [str(file)]
    backend = SimpleNamespace(capture_slides=lambda _input, out: write_preview(Path(out)))
    def run(command, **_):
        write_preview(tmp_path / "previews")
        return subprocess.CompletedProcess(command, 0)
    monkeypatch.setattr(adapter.subprocess, "run", run)
    paths, used, warnings = adapter.capture_pdf(backend, tmp_path / "slides.html", tmp_path / "slides.pdf", tmp_path / "previews", engine)
    assert len(paths) == 1
    assert used == expected
    assert not warnings


def test_capture_unavailable_or_failed_native_is_honest(tmp_path, monkeypatch):
    monkeypatch.setattr(adapter.shutil, "which", lambda _: None)
    with pytest.raises(RuntimeError, match="capture"):
        adapter.capture_pdf(SimpleNamespace(), tmp_path / "x.html", tmp_path / "x.pdf", tmp_path / "previews", "auto")
    monkeypatch.setattr(adapter.shutil, "which", lambda _: "gs")
    with pytest.raises(RuntimeError, match="capture"):
        adapter.capture_pdf(SimpleNamespace(capture_slides=lambda *_: None), tmp_path / "x.html", tmp_path / "x.pdf", tmp_path / "previews", "native")


def test_native_capture_failure_uses_clean_poppler_previews(tmp_path, monkeypatch):
    monkeypatch.setattr(adapter.shutil, "which", lambda name: name)
    output = tmp_path / "previews"
    def native(_html, directory):
        Path(directory).mkdir()
        (Path(directory) / "slide-001.png").write_bytes(b"partial")
        return None
    def poppler(command, **_):
        (output / "slide-1.png").write_bytes(b"\x89PNG\r\n\x1a\npreview")
        return subprocess.CompletedProcess(command, 0)
    monkeypatch.setattr(adapter.subprocess, "run", poppler)
    files, used, warnings = adapter.capture_pdf(SimpleNamespace(capture_slides=native), tmp_path / "slides.html", tmp_path / "slides.pdf", output, "auto")
    assert len(files) == 1 and used == "poppler"
    assert warnings
    assert not (output / "slide-001.png").exists()


@pytest.mark.skipif(os.environ.get("VISUAL_SKILLS_PDF_SMOKE") != "1", reason="explicit browser/Poppler integration smoke")
def test_real_three_slide_pdf_and_capture(workspace, tmp_path):
    report = adapter.render_bundle(workspace, tmp_path / "bundle", "pdf", capture=True, capture_engine="poppler")
    assert report["status"] == "complete", report
    assert report["completed"] == ["source", "html", "pdf", "capture"]
    assert len(report["previews"]) == 3
    assert not report["visually_reviewed"]
    info = subprocess.run(["pdfinfo", str(tmp_path / "bundle/slides.pdf")], capture_output=True, text=True, check=True)
    assert "Pages:           3" in info.stdout
    assert not any("pptx" in name or "canvas" in name or "pele" == name for name in report["installed_packages"])
