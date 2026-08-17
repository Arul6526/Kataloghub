#!/usr/bin/env python3
"""Generate SECURITY-HARDENING.html from SECURITY-HARDENING.md"""

import markdown, os

with open("Kataloghub-go-live/SECURITY-HARDENING.md", "r", encoding="utf-8") as f:
    md = f.read()

# Preprocess: markdown table → better HTML
html_body = markdown.markdown(md, extensions=["extra", "codehilite", "tables", "sane_lists"])

html_template = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>KatalogHub — Security Hardening Plan</title>
<style>
@page {{ size: A4; margin: 18mm 16mm 22mm 16mm; }}
@media print {{ body {{ font-size: 8.5pt; }} pre {{ page-break-inside: avoid; }} h2,h3 {{ page-break-after: avoid; }} table {{ page-break-inside: avoid; }} }}
* {{ box-sizing: border-box; }}
body {{ font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 9pt; line-height: 1.55; color: #1e293b; max-width: 210mm; margin: 0 auto; padding: 0 10px; }}
.title-block {{ text-align: center; padding: 24px 0 16px 0; border-bottom: 3px solid #dc2626; margin-bottom: 20px; }}
.title-block h1 {{ font-size: 20pt; color: #111827; margin: 0 0 6px 0; }}
.title-block .subtitle {{ font-size: 10pt; color: #dc2626; font-weight: 600; margin: 0; }}
h1 {{ font-size: 14pt; color: #111827; border-bottom: 3px solid #ef4444; padding-bottom: 5px; margin: 22px 0 10px 0; }}
h2 {{ font-size: 12pt; color: #dc2626; border-bottom: 1.5px solid #fca5a5; padding-bottom: 3px; margin: 18px 0 8px 0; }}
h3 {{ font-size: 10pt; color: #1e293b; margin: 14px 0 6px 0; }}
code {{ font-family: 'Consolas','Courier New',monospace; font-size: 7.5pt; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; }}
pre {{ background: #0f172a; color: #e2e8f0; padding: 8px 10px; border-radius: 5px; font-size: 7pt; line-height: 1.4; overflow-x: auto; }}
pre code {{ background: none; padding: 0; color: inherit; }}
table {{ border-collapse: collapse; width: 100%; font-size: 8pt; margin: 6px 0 12px 0; border: 1px solid #e2e8f0; }}
th {{ background: #fef2f2; text-align: left; padding: 4px 7px; border: 1px solid #fecaca; font-weight: 700; color: #991b1b; }}
td {{ padding: 3px 7px; border: 1px solid #e2e8f0; vertical-align: top; }}
tr:nth-child(even) td {{ background: #fafafa; }}
ul,ol {{ padding-left: 18px; margin: 3px 0 6px 0; }}
li {{ margin: 1px 0; }}
p {{ margin: 3px 0 6px 0; }}
strong {{ color: #0f172a; }}
blockquote {{ border-left: 4px solid #ef4444; padding: 4px 10px; margin: 8px 0; background: #fef2f2; color: #991b1b; border-radius: 0 5px 5px 0; font-size: 8.5pt; }}
hr {{ border: none; border-top: 2px solid #fecaca; margin: 16px 0; }}
.severity-critical {{ color: #dc2626; font-weight: 700; }}
.severity-high {{ color: #ea580c; font-weight: 600; }}
</style>
</head>
<body>
<div class="title-block">
  <h1>🛡️ KatalogHub — Security Hardening Plan</h1>
  <p class="subtitle">Dari 3.5/10 → Target 10/10</p>
</div>
{html_body}
<p style="text-align:center; color:#94a3b8; font-size:7pt; margin-top:20px; border-top:1px solid #e2e8f0; padding-top:8px;">
  <strong>KatalogHub</strong> — Security Hardening Plan &bull; 30 Juli 2026
</p>
</body>
</html>"""

with open("Kataloghub-go-live/SECURITY-HARDENING.html", "w", encoding="utf-8") as f:
    f.write(html_template)

print(f"✅ HTML generated: Kataloghub-go-live/SECURITY-HARDENING.html ({len(html_template) / 1024:.0f} KB)")
print(f"📌 Buka → Ctrl+P → Save as PDF")
