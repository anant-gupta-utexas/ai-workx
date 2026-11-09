"""Source packaging and direct-resource checks; Python standard library only."""
from __future__ import annotations

from hashlib import sha256
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
import re
import shutil
from urllib.parse import unquote, urlsplit


def prepare_bundle(workspace: Path, output: Path) -> dict[str, str]:
    workspace, output = workspace.resolve(), output.resolve()
    if output == workspace or output.is_relative_to(workspace) or workspace.is_relative_to(output):
        raise ValueError("Use a separate output directory outside the source workspace.")
    if not (workspace / "brief.md").is_file():
        raise ValueError("The workspace must contain brief.md.")
    if output.exists() and (not output.is_dir() or any(output.iterdir())):
        raise ValueError("Output must be absent or empty; choose a new bundle directory.")
    files = [workspace / name for name in ["brief.md", "slides.md", "DESIGN.md", "handoff.md"]
             if (workspace / name).exists()]
    assets = workspace / "assets"
    if assets.is_symlink():
        raise ValueError("Bundle assets must be actual files, not symlinks.")
    if assets.exists():
        files.extend(assets.rglob("*"))
    for file in files:
        if file.is_symlink():
            raise ValueError(f"Bundle source is a symlink: {file.name}. Copy the asset instead.")
        if not file.is_file() and not file.is_dir():
            raise ValueError(f"Unsupported bundle source: {file.name}")
    output.mkdir(parents=True, exist_ok=True)
    hashes = {}
    for file in files:
        if not file.is_file():
            continue
        relative = file.relative_to(workspace)
        target = output / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(file, target)
        hashes[relative.as_posix()] = sha256(file.read_bytes()).hexdigest()
    return hashes


def _css_resources(css: str) -> list[str]:
    urls = [m[1] for m in re.findall(r"url\(\s*(['\"]?)(.*?)\1\s*\)", css, re.S)]
    urls.extend(re.findall(r"@import\s+['\"]([^'\"]+)['\"]", css))
    return urls


class _Resources(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.urls = []
        self.in_style = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "srcset" in attrs:
            raise ValueError("srcset is unsupported by bundle validation; use one src asset.")
        self.in_style = tag == "style" or self.in_style
        if attrs.get("style"):
            self.urls.extend(_css_resources(attrs["style"]))
        resource_attrs = {
            "img": ["src"], "script": ["src"], "link": ["href"],
            "video": ["src", "poster"], "audio": ["src"], "source": ["src"],
            "iframe": ["src"], "embed": ["src"], "object": ["data"],
            "image": ["href", "xlink:href"], "use": ["href", "xlink:href"],
        }
        self.urls.extend(attrs[name] for name in resource_attrs.get(tag, []) if attrs.get(name))

    def handle_endtag(self, tag):
        if tag == "style":
            self.in_style = False

    def handle_data(self, data):
        if self.in_style:
            self.urls.extend(_css_resources(data))


def inspect_resources(html: Path, root: Path) -> list[str]:
    """Check local HTML/CSS/SVG references; list direct external resource URLs.

    This does not fetch remote stylesheets or enumerate dynamic JS requests.
    It therefore makes no offline/single-file guarantee.
    """
    root = root.resolve()
    visited, external = set(), set()

    def inspect(file: Path):
        file = file.resolve()
        if file in visited:
            return
        visited.add(file)
        if file.suffix.lower() not in {".html", ".htm", ".svg", ".css"}:
            return
        content = file.read_text(encoding="utf-8")
        if file.suffix.lower() == ".css":
            urls = _css_resources(content)
        else:
            parser = _Resources()
            parser.feed(content)
            urls = parser.urls
        for url in urls:
            url = unescape(url).strip()
            parsed = urlsplit(url)
            if not url or url.startswith("#") or parsed.scheme == "data":
                continue
            if parsed.scheme in {"http", "https"} or url.startswith("//"):
                external.add(url)
                continue
            if parsed.scheme or parsed.netloc or parsed.path.startswith("/"):
                raise ValueError(f"Resource outside the local bundle or unsupported URL scheme: {url}")
            local = (file.parent / unquote(parsed.path)).resolve()
            if not local.is_relative_to(root):
                raise ValueError(f"Resource outside the local bundle: {url}")
            if not local.is_file():
                raise ValueError(f"Missing local resource: {url} (from {file.relative_to(root)})")
            inspect(local)

    inspect(html)
    return sorted(external)
