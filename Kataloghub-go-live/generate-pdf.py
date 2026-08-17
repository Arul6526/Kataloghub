#!/usr/bin/env python3
"""
Convert PRE-DEPLOYMENT-CHECKLIST.md to PDF using fpdf2.
Strips emoji and Unicode chars outside basic plane for compatibility.
"""

import markdown, re, os
from fpdf import FPDF

MD_PATH = "Kataloghub-go-live/PRE-DEPLOYMENT-CHECKLIST.md"
FONT_DIR = "Kataloghub-go-live/fonts"
PDF_PATH = "Kataloghub-go-live/PRE-DEPLOYMENT-CHECKLIST.pdf"

# 1. Read markdown
with open(MD_PATH, "r", encoding="utf-8") as f:
    md = f.read()

# Replace emoji with text equivalents
emoji_map = {
    "🚀": "[ROCKET]",
    "🔴": "[RED]",
    "🟠": "[ORANGE]",
    "🟢": "[GREEN]",
    "✅": "[OK]",
    "❌": "[NO]",
    "☐": "[ ]",
    "☑": "[✓]",
    "🔥": "[FIRE]",
    "💧": "[DROP]",
    "🎯": "[TARGET]",
    "📊": "[CHART]",
    "📁": "[FOLDER]",
    "📝": "[NOTE]",
    "🏆": "[TROPHY]",
    "—": "--",
    "–": "-",
    "•": "*",
    "→": "->",
    "←": "<-",
    "’": "'",
    "‘": "'",
    "“": '"',
    "”": '"',
}
for k, v in emoji_map.items():
    md = md.replace(k, v)

# Also strip any remaining emoji (non-BMP chars)
md = re.sub(r'[^\u0000-\uFFFF]', '', md)

# Replace checklist markers
md = md.replace("[ ]", "[ ]")
md = md.replace("[x]", "[✓]")

# Convert to HTML
html_body = markdown.markdown(md, extensions=["extra", "codehilite", "tables", "sane_lists"])

# 2. Download DejaVu font if not exists
if not os.path.exists(os.path.join(FONT_DIR, "DejaVuSans.ttf")):
    print("Downloading DejaVu font…")
    import urllib.request, zipfile, shutil
    url = "https://github.com/dejavu-fonts/dejavu-fonts/releases/download/version_2_37/dejavu-fonts-ttf-2.37.zip"
    os.makedirs(FONT_DIR, exist_ok=True)
    zip_path = os.path.join(FONT_DIR, "dejavu.zip")
    urllib.request.urlretrieve(url, zip_path)
    with zipfile.ZipFile(zip_path, "r") as z:
        for member in z.namelist():
            if member.endswith(".ttf"):
                name = os.path.basename(member)
                with z.open(member) as src, open(os.path.join(FONT_DIR, name), "wb") as dst:
                    shutil.copyfileobj(src, dst)
    os.remove(zip_path)
    print("  Fonts ready.")

# 3. Generate PDF with fpdf2 write_html (works now that emoji is stripped)
pdf = FPDF()
pdf.add_font("DejaVu", "", os.path.join(FONT_DIR, "DejaVuSans.ttf"))
pdf.add_font("DejaVu", "B", os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf"))
pdf.add_font("DejaVu", "I", os.path.join(FONT_DIR, "DejaVuSans-Oblique.ttf"))
pdf.add_font("DejaVu", "BI", os.path.join(FONT_DIR, "DejaVuSans-BoldOblique.ttf"))
pdf.add_font("DejaVuMono", "", os.path.join(FONT_DIR, "DejaVuSansMono.ttf"))
pdf.add_font("DejaVuMono", "B", os.path.join(FONT_DIR, "DejaVuSansMono-Bold.ttf"))

pdf.set_auto_page_break(auto=True, margin=20)
pdf.set_fallback_fonts(["DejaVu"])

# We need to wrap the HTML with a style that uses DejaVu
styled_html = f"""<html><head><meta charset="utf-8">
<style>
body {{ font-family: 'Times', serif; font-size: 9pt; line-height: 1.5; }}
h1 {{ font-family: 'Times', serif; font-size: 15pt; font-weight: bold; color: #111; }}
h2 {{ font-family: 'Times', serif; font-size: 12pt; font-weight: bold; color: #4338ca; }}
h3 {{ font-family: 'Times', serif; font-size: 10pt; font-weight: bold; }}
table {{ border-collapse: collapse; width: 100%; font-size: 8pt; }}
th, td {{ border: 1px solid #999; padding: 3px 5px; }}
pre {{ font-family: 'Courier', monospace; font-size: 7pt; background: #eee; padding: 4px; }}
code {{ font-family: 'Courier', monospace; font-size: 7.5pt; }}
</style></head><body>
{html_body}
</body></html>"""

pdf.add_page()
pdf.write_html(styled_html)
pdf.output(PDF_PATH)

print(f"✅ PDF generated: {PDF_PATH}")
print(f"   Pages: {pdf.page_no()}")
print(f"   Size: {os.path.getsize(PDF_PATH) / 1024:.0f} KB")
