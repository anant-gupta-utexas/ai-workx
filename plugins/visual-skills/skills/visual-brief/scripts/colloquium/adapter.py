"""Optional source/HTML/PDF handoff. No diagram, art or PowerPoint engine."""
from __future__ import annotations

import argparse
from contextlib import redirect_stderr
from importlib import metadata
from io import StringIO
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
from types import SimpleNamespace

from bundle import inspect_resources, prepare_bundle

REVISION = "f22ab9bf4328482e4555bdd4ae85734e69e0f116"
SETUP = "Run uv sync --project <skill-dir>/scripts/colloquium --frozen --no-dev, then uv run --project <skill-dir>/scripts/colloquium --frozen --no-dev python <skill-dir>/scripts/colloquium/adapter.py ..."


def load_backend():
    try:
        distribution = metadata.distribution("colloquium")
        direct = json.loads(distribution.read_text("direct_url.json") or "{}")
        if direct.get("vcs_info", {}).get("commit_id") != REVISION:
            raise RuntimeError("Colloquium must use the pinned evaluated revision. " + SETUP)
        from colloquium.build import build_file
        from colloquium.export import capture_slides, export_pdf
        from colloquium.parse import parse_file
    except ImportError as error:
        raise RuntimeError("Optional Colloquium backend is missing. Sources are preserved. " + SETUP) from error
    return SimpleNamespace(build_file=build_file, export_pdf=export_pdf, capture_slides=capture_slides, parse_file=parse_file)


def validate_sources(backend, slides: Path, root: Path):
    deck = backend.parse_file(str(slides))
    if deck.theme != "default":
        raise ValueError("This adapter supports the default Colloquium theme plus assets/ custom CSS; do not replace a supplied PowerPoint template.")
    for value in [deck.custom_css_path, deck.bibliography]:
        if not value:
            continue
        file = Path(value)
        file = (file if file.is_absolute() else root / file).resolve()
        if not file.is_relative_to(root / "assets"):
            raise ValueError("Stylesheets and bibliography must be inside the bundle's assets/ directory.")
        if not file.is_file():
            raise ValueError(f"Missing local resource: {file.name}")


def capture_pdf(backend, html: Path, pdf: Path, output: Path, engine: str):
    warnings = []
    files = None
    used = "native"
    if engine in {"auto", "native"} and shutil.which("gs"):
        files = backend.capture_slides(str(html), str(output))
        if not files:
            warnings.append("Native capture failed; a Poppler fallback may be used.")
    if not files and engine in {"auto", "poppler"} and shutil.which("pdftoppm"):
        output.mkdir(parents=True, exist_ok=True)
        # A failed native attempt may have left partial previews with different padding.
        for stale in output.glob("slide-*.png"):
            stale.unlink()
        subprocess.run([shutil.which("pdftoppm"), "-png", "-r", "128", str(pdf), str(output / "slide")],
                       check=True, capture_output=True, timeout=120)
        files = sorted(str(file) for file in output.glob("slide-*.png"))
        used = "poppler"
    if not files:
        raise RuntimeError("Slide capture is unavailable or failed. Install Ghostscript for native capture or Poppler for PDF previews. The PDF and sources are preserved.")
    for file in files:
        if not Path(file).read_bytes().startswith(b"\x89PNG\r\n\x1a\n"):
            raise RuntimeError("Slide capture produced an invalid PNG. Inspect the PDF and tool errors.")
    return files, used, warnings


def render_bundle(workspace: Path, output: Path, format: str, capture=False, capture_engine="auto"):
    if format not in {"source", "html", "pdf"}:
        raise ValueError("PowerPoint stays on the existing host presentation workflow; this adapter supports source, html and pdf only.")
    if capture and format != "pdf":
        raise ValueError("--capture applies to PDF output only.")
    if capture_engine not in {"auto", "native", "poppler"}:
        raise ValueError("Unknown capture engine.")
    output = output.resolve()
    # Invalid/overlapping output paths never modify an existing bundle.
    source_hashes = prepare_bundle(workspace, output)
    report = {"requested": format, "status": "complete", "completed": ["source"],
              "backend_revision": REVISION, "source_sha256": source_hashes,
              "external_resources": [], "warnings": [], "previews": [],
              "visually_reviewed": False}
    log = StringIO()
    try:
        if format != "source":
            slides = output / "slides.md"
            if not slides.is_file():
                raise ValueError("HTML/PDF export needs slides.md. The completed brief is preserved.")
            source = slides.read_text(encoding="utf-8")
            if re.search(r"^\s*(?:`{3,}|~{3,})\s*mermaid\b", source, re.M | re.I):
                raise ValueError("Colloquium does not render Mermaid fences: pre-render .mmd with diagram and embed the SVG/PNG asset.")
            # Supplied PowerPoint templates cannot be silently ignored on an HTML/PDF route.
            if re.search(r"^\s*(?:pptx|template)\s*:", source.split("---", 2)[1] if source.startswith("---") else "", re.M):
                raise ValueError("A PowerPoint/template setting needs the existing host PowerPoint workflow. Remove it only when the requested output is HTML/PDF.")
            backend = load_backend()
            validate_sources(backend, slides, output)
            report["installed_packages"] = sorted(distribution.metadata["Name"] for distribution in metadata.distributions())
            html = output / "slides.html"
            with redirect_stderr(log):
                backend.build_file(str(slides), str(html))
            report["external_resources"] = inspect_resources(html, output)
            report["completed"].append("html")
            if report["external_resources"]:
                report["warnings"].append("HTML retains direct network resource URLs (including CDNs/fonts). Transitive and dynamic requests are not enumerated; this is not a verified offline single file. Keep assets/ beside slides.html.")
            if format == "pdf":
                pdf = output / "slides.pdf"
                with redirect_stderr(log):
                    result = backend.export_pdf(str(html), str(pdf))
                if not result or not pdf.is_file() or not pdf.read_bytes().startswith(b"%PDF-"):
                    raise RuntimeError("PDF export is unfinished: a compatible Chromium browser is missing or export failed. Sources and HTML are preserved; HTML is not a completed PDF export.")
                report["completed"].append("pdf")
                if capture:
                    with redirect_stderr(log):
                        files, used, warnings = capture_pdf(backend, html, pdf, output / "previews", capture_engine)
                    report["previews"] = [Path(file).relative_to(output).as_posix() for file in files]
                    report["capture_engine"] = used
                    report["warnings"].extend(warnings)
                    report["completed"].append("capture")
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as error:
        report["status"] = "failed"
        report["error"] = str(error)
    report["warnings"].extend(line for line in log.getvalue().splitlines() if line.strip())
    (output / "render-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description="Bundle a visual brief and optionally render Colloquium HTML/PDF. PowerPoint uses the existing host presentation workflow.")
    parser.add_argument("--workspace", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--format", default="source")
    parser.add_argument("--capture", action="store_true")
    parser.add_argument("--capture-engine", default="auto", choices=["auto", "native", "poppler"])
    args = parser.parse_args(argv)
    try:
        report = render_bundle(args.workspace, args.out, args.format, args.capture, args.capture_engine)
    except (ValueError, OSError) as error:
        print(str(error), file=sys.stderr)
        return 1
    print(json.dumps(report))
    if report["status"] == "failed":
        print(report["error"], file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
