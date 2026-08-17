#!/usr/bin/env python3
"""Generate DATA-OPTIMIZATION.html from DATA-OPTIMIZATION.md"""

import markdown

with open("Kataloghub-go-live/DATA-OPTIMIZATION.md", "r", encoding="utf-8") as f:
    md = f.read()

html_body = markdown.markdown(md, extensions=["extra", "codehilite", "tables", "sane_lists"])

html_template = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>KatalogHub — Data Optimization Plan</title>
<style>
@page {{ size: A4; margin: 16mm 14mm 20mm 14mm; }}
@media print {{ body {{ font-size: 8pt; }} pre {{ page-break-inside: avoid; }} h2,h3 {{ page-break-after: avoid; }} table {{ page-break-inside: avoid; }} }}
* {{ box-sizing: border-box; }}
body {{ font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 9pt; line-height: 1.5; color: #1e293b; max-width: 210mm; margin: 0 auto; padding: 0 10px; }}
.title-block {{ text-align: center; padding: 20px 0 14px 0; border-bottom: 3px solid #2563eb; margin-bottom: 18px; }}
.title-block h1 {{ font-size: 20pt; color: #111827; margin: 0 0 6px 0; }}
.title-block .subtitle {{ font-size: 10pt; color: #2563eb; font-weight: 600; margin: 0; }}
h1 {{ font-size: 14pt; color: #111827; border-bottom: 3px solid #3b82f6; padding-bottom: 4px; margin: 20px 0 8px 0; }}
h2 {{ font-size: 12pt; color: #2563eb; border-bottom: 1.5px solid #93c5fd; padding-bottom: 3px; margin: 16px 0 6px 0; }}
h3 {{ font-size: 10pt; color: #1e293b; margin: 12px 0 5px 0; }}
code {{ font-family: 'Consolas','Courier New',monospace; font-size: 7pt; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; }}
pre {{ background: #0f172a; color: #e2e8f0; padding: 7px 9px; border-radius: 5px; font-size: 6.5pt; line-height: 1.35; overflow-x: auto; }}
pre code {{ background: none; padding: 0; color: inherit; }}
table {{ border-collapse: collapse; width: 100%; font-size: 7.5pt; margin: 5px 0 10px 0; border: 1px solid #e2e8f0; }}
th {{ background: #eff6ff; text-align: left; padding: 3px 6px; border: 1px solid #bfdbfe; font-weight: 700; color: #1e40af; }}
td {{ padding: 3px 6px; border: 1px solid #e2e8f0; vertical-align: top; }}
tr:nth-child(even) td {{ background: #fafafa; }}
ul,ol {{ padding-left: 18px; margin: 2px 0 5px 0; }}
li {{ margin: 1px 0; }}
p {{ margin: 2px 0 5px 0; }}
strong {{ color: #0f172a; }}
blockquote {{ border-left: 4px solid #3b82f6; padding: 4px 10px; margin: 6px 0; background: #eff6ff; color: #1e40af; border-radius: 0 5px 5px 0; font-size: 8pt; }}
hr {{ border: none; border-top: 2px solid #bfdbfe; margin: 14px 0; }}
.tag-critical {{ display: inline-block; background: #dc2626; color: #fff; font-size: 7pt; font-weight: 700; padding: 1px 6px; border-radius: 3px; }}
.tag-high {{ display: inline-block; background: #ea580c; color: #fff; font-size: 7pt; font-weight: 700; padding: 1px 6px; border-radius: 3px; }}
.tag-medium {{ display: inline-block; background: #ca8a04; color: #fff; font-size: 7pt; font-weight: 700; padding: 1px 6px; border-radius: 3px; }}
</style>
</head>
<body>
<div class="title-block">
  <h1>📊 KatalogHub — Data Optimization Plan</h1>
  <p class="subtitle">Dari 5.5/10 → Target 9.5/10 • Eliminasi N+1 Query</p>
</div>
{html_body}
<p style="text-align:center; color:#94a3b8; font-size:7pt; margin-top:16px; border-top:1px solid #e2e8f0; padding-top:6px;">
  <strong>KatalogHub</strong> — Data Optimization Plan &bull; 30 Juli 2026
</p>
</body>
</html>"""

with open("Kataloghub-go-live/DATA-OPTIMIZATION.html", "w", encoding="utf-8") as f:
    f.write(html_template)

print(f"✅ HTML generated: Kataloghub-go-live/DATA-OPTIMIZATION.html ({len(html_template) / 1024:.0f} KB)")
