#!/usr/bin/env python3
"""
Generate a print-optimized HTML report from PRE-DEPLOYMENT-CHECKLIST.md.
Open the HTML in browser → Ctrl+P → Save as PDF for a perfect result.
"""

import markdown, re, os

MD_PATH = "Kataloghub-go-live/PRE-DEPLOYMENT-CHECKLIST.md"
HTML_PATH = "Kataloghub-go-live/PRE-DEPLOYMENT-CHECKLIST.html"

with open(MD_PATH, "r", encoding="utf-8") as f:
    md = f.read()

# Pre-process: wrap tables with div for styling
md = md.replace("[ ]", '<span class="unchecked">☐</span>')
md = md.replace("[x]", '<span class="checked">☑</span>')

html_body = markdown.markdown(md, extensions=["extra", "codehilite", "tables", "sane_lists"])

# Build print-optimized HTML
html = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>KatalogHub — Pre-Deployment Checklist</title>
<style>
/* ───────────── Print / Screen Styles ───────────── */
@page {{
  size: A4;
  margin: 18mm 16mm 22mm 16mm;
  @bottom-center {{
    content: counter(page) " / " counter(pages);
    font-size: 8pt;
    color: #94a3b8;
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }}
}}

@media print {{
  body {{ font-size: 8.5pt; }}
  pre {{ page-break-inside: avoid; }}
  h2, h3 {{ page-break-after: avoid; }}
  table {{ page-break-inside: avoid; }}
}}

* {{ box-sizing: border-box; }}

body {{
  font-family: 'Helvetica Neue', Arial, 'Segoe UI', sans-serif;
  font-size: 9pt;
  line-height: 1.55;
  color: #1e293b;
  max-width: 210mm;
  margin: 0 auto;
  padding: 0 10px;
}}

/* ───────────── Cover / Title ───────────── */
.title-block {{
  text-align: center;
  padding: 30px 0 20px 0;
  border-bottom: 4px solid #6366f1;
  margin-bottom: 20px;
}}
.title-block h1 {{
  font-size: 22pt;
  color: #111827;
  margin: 0 0 6px 0;
  letter-spacing: -0.5px;
}}
.title-block .subtitle {{
  font-size: 11pt;
  color: #6366f1;
  font-weight: 600;
  margin: 0 0 4px 0;
}}
.title-block .meta {{
  font-size: 8pt;
  color: #94a3b8;
  margin: 0;
}}

/* ───────────── Headings ───────────── */
h1 {{
  font-size: 15pt;
  color: #111827;
  border-bottom: 3px solid #6366f1;
  padding-bottom: 5px;
  margin: 24px 0 12px 0;
}}
h2 {{
  font-size: 12pt;
  color: #4338ca;
  border-bottom: 1.5px solid #c7d2fe;
  padding-bottom: 3px;
  margin: 20px 0 10px 0;
}}
h3 {{
  font-size: 10pt;
  color: #1e293b;
  margin: 16px 0 8px 0;
}}
h4 {{
  font-size: 9pt;
  color: #334155;
  margin: 12px 0 6px 0;
}}

/* ───────────── Code ───────────── */
code {{
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', 'Courier New', monospace;
  font-size: 7.5pt;
  background: #f1f5f9;
  padding: 1px 4px;
  border-radius: 3px;
  color: #0f172a;
  word-break: break-word;
}}
pre {{
  background: #0f172a;
  color: #e2e8f0;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 7pt;
  line-height: 1.45;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}}
pre code {{
  background: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
}}

/* ───────────── Tables ───────────── */
table {{
  border-collapse: collapse;
  width: 100%;
  font-size: 8pt;
  margin: 8px 0 14px 0;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}}
th {{
  background: #eef2ff;
  text-align: left;
  padding: 5px 8px;
  border: 1px solid #cbd5e1;
  font-weight: 700;
  color: #1e293b;
  font-size: 7.5pt;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}}
td {{
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  vertical-align: top;
}}
tr:nth-child(even) td {{
  background: #f8fafc;
}}

/* ───────────── Lists ───────────── */
ul, ol {{
  padding-left: 20px;
  margin: 4px 0 8px 0;
}}
li {{
  margin: 2px 0;
}}
li > p {{ margin: 0; }}

/* ───────────── Paragraphs & Text ───────────── */
p {{
  margin: 4px 0 8px 0;
}}
strong {{ color: #0f172a; }}
blockquote {{
  border-left: 4px solid #6366f1;
  padding: 6px 12px;
  margin: 10px 0;
  background: #f8fafc;
  color: #475569;
  border-radius: 0 6px 6px 0;
}}
hr {{
  border: none;
  border-top: 2px solid #cbd5e1;
  margin: 20px 0;
}}

/* ───────────── Score Badges ───────────── */
.score-badge {{
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 8pt;
}}
.score-red {{ background: #fef2f2; color: #dc2626; }}
.score-orange {{ background: #fff7ed; color: #ea580c; }}
.score-green {{ background: #f0fdf4; color: #16a34a; }}

/* ───────────── Checklist overrides ───────────── */
.unchecked {{ color: #94a3b8; font-size: 11pt; }}
.checked {{ color: #22c55e; font-size: 11pt; }}

/* ───────────── Severity indicators ───────────── */
.severity-critical {{ color: #dc2626; font-weight: 700; }}
.severity-high {{ color: #ea580c; font-weight: 600; }}
.severity-medium {{ color: #ca8a04; }}

/* ───────────── Page breaks ───────────── */
.page-break {{ page-break-before: always; }}
@media screen {{
  .page-break {{ border-top: 2px dashed #cbd5e1; margin: 30px 0; padding-top: 10px; }}
}}

/* ───────────── Two-column for summary ───────────── */
.summary-grid {{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 10px 0;
}}
.summary-card {{
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fafafa;
}}
.summary-card .label {{
  font-size: 7pt;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  font-weight: 600;
}}
.summary-card .value {{
  font-size: 14pt;
  font-weight: 800;
  margin-top: 2px;
}}
</style>
</head>
<body>

<div class="title-block">
  <h1>🚀 KatalogHub — Pre-Deployment Production Checklist</h1>
  <p class="subtitle">Full Codebase Review untuk Go-Live Readiness</p>
  <p class="meta">Audit Date: 30 Juli 2026 &nbsp;|&nbsp; Auditor: AI-assisted &nbsp;|&nbsp; Target: DomaiNesia VPS → Coolify</p>
</div>

{html_body}

<hr>
<p style="text-align:center; color:#94a3b8; font-size:7pt; margin-top:20px;">
  <strong>KatalogHub</strong> — Pre-Deployment Checklist &bull; Generated 30 Juli 2026<br>
  <em>Dokumen ini adalah hasil audit codebase otomatis. Verifikasi manual tetap diperlukan untuk keputusan production.</em>
</p>

</body>
</html>"""

with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write(html)

print(f"✅ HTML generated: {HTML_PATH}")
print(f"   Size: {os.path.getsize(HTML_PATH) / 1024:.0f} KB")
print(f"")
print(f"📌 Cara export ke PDF:")
print(f"   1. Buka file {HTML_PATH} di Chrome/Edge/Firefox")
print(f"   2. Ctrl+P (atau File → Print)")
print(f"   3. Pilih 'Save as PDF' / 'Print to PDF'")
print(f"   4. Set Margins: Default / Minimum")
print(f"   5. Centang 'Background graphics'")
print(f"   6. Klik Save 💾")
