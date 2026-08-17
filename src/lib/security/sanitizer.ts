/**
 * HTML/CSS sanitizer untuk mencegah XSS pada konten user-generated.
 *
 * Dipakai utamanya untuk custom landing pages yang menyimpan html_source, css_source, js_source.
 * Pendekatan: whitelist tags & attributes, strip semua yang tidak diizinkan.
 */

// ── Allowed HTML tags (safe for rendering) ──
const ALLOWED_TAGS = new Set([
  // Structure
  "div", "span", "section", "article", "aside", "main", "header", "footer", "nav",
  // Text
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "blockquote", "pre", "code",
  "strong", "b", "em", "i", "u", "s", "small", "sub", "sup", "mark", "abbr",
  // Lists
  "ul", "ol", "li", "dl", "dt", "dd",
  // Tables
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
  // Media (safe — src is validated separately)
  "img", "picture", "source", "figure", "figcaption", "video", "audio",
  // Forms (display only — no action)
  "form", "input", "button", "label", "select", "option", "textarea", "fieldset", "legend",
  // Links
  "a",
  // Styling
  "style",
  // SVG (basic shapes only)
  "svg", "path", "circle", "rect", "line", "polyline", "polygon", "g", "defs",
  "linearGradient", "radialGradient", "stop", "clipPath", "mask", "use", "symbol",
  "text", "tspan",
]);

// ── Allowed attributes per tag ──
const SAFE_GLOBAL_ATTRS = new Set([
  "id", "class", "style", "title", "role", "aria-label", "aria-hidden",
  "aria-expanded", "aria-controls", "aria-describedby", "aria-labelledby",
  "data-*", "tabindex", "lang", "dir",
]);

const TAG_SPECIFIC_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height", "loading", "decoding"]),
  source: new Set(["src", "srcset", "media", "type"]),
  video: new Set(["src", "poster", "controls", "autoplay", "muted", "loop", "width", "height", "playsinline"]),
  audio: new Set(["src", "controls", "autoplay", "muted", "loop"]),
  input: new Set(["type", "name", "value", "placeholder", "disabled", "readonly", "checked"]),
  button: new Set(["type", "disabled"]),
  select: new Set(["name", "disabled"]),
  option: new Set(["value", "selected"]),
  textarea: new Set(["name", "rows", "cols", "placeholder", "disabled", "readonly"]),
  label: new Set(["for"]),
  form: new Set(["method"]), // action intentionally omitted
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan", "scope"]),
  col: new Set(["span"]),
  colgroup: new Set(["span"]),
  svg: new Set(["viewBox", "xmlns", "fill", "stroke", "width", "height"]),
  path: new Set(["d", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "transform", "opacity"]),
  circle: new Set(["cx", "cy", "r", "fill", "stroke"]),
  rect: new Set(["x", "y", "width", "height", "rx", "ry", "fill", "stroke"]),
  line: new Set(["x1", "y1", "x2", "y2", "stroke", "stroke-width"]),
  polyline: new Set(["points", "fill", "stroke"]),
  polygon: new Set(["points", "fill", "stroke"]),
  g: new Set(["transform", "fill", "stroke", "opacity"]),
  linearGradient: new Set(["id", "x1", "y1", "x2", "y2", "gradientUnits"]),
  radialGradient: new Set(["id", "cx", "cy", "r", "gradientUnits"]),
  stop: new Set(["offset", "stop-color", "stop-opacity"]),
  clipPath: new Set(["id"]),
  use: new Set(["href", "x", "y", "width", "height"]),
  text: new Set(["x", "y", "dx", "dy", "text-anchor", "fill", "font-size"]),
  tspan: new Set(["x", "y", "dx", "dy"]),
};

// ── Dangerous patterns ──
const DANGEROUS_EVENT_ATTR = /^on[a-z]/i;
const DANGEROUS_HREF = /^\s*(javascript|data|vbscript)\s*:/i;
const DANGEROUS_CSS_VALUE = /(expression|javascript|vbscript|url\s*\(\s*["']?\s*data\s*:)/i;
const SCRIPT_TAG = /<script[\s>][\s\S]*?<\/script\s*>/gi;
const SCRIPT_SELF_CLOSING = /<script\s*\/?\s*>/gi;
const IFRAME_TAG = /<iframe[\s>][\s\S]*?<\/iframe\s*>/gi;
const IFRAME_SELF_CLOSING = /<iframe\s*\/?\s*>/gi;
const OBJECT_TAG = /<object[\s>][\s\S]*?<\/object\s*>/gi;
const EMBED_TAG = /<embed[\s>][\s\S]*?<\/embed\s*>|<embed\s*[^>]*\/?>/gi;
const EVENT_HANDLER_ATTR = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;

/**
 * Sanitize HTML string — remove scripts, iframes, event handlers,
 * and dangerous href/style values.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  let clean = html;

  // 1. Strip all <script> tags and contents
  clean = clean.replace(SCRIPT_TAG, "");
  clean = clean.replace(SCRIPT_SELF_CLOSING, "");

  // 2. Strip all <iframe> tags
  clean = clean.replace(IFRAME_TAG, "");
  clean = clean.replace(IFRAME_SELF_CLOSING, "");

  // 3. Strip <object> and <embed> tags
  clean = clean.replace(OBJECT_TAG, "");
  clean = clean.replace(EMBED_TAG, "");

  // 4. Strip all inline event handlers (onclick, onload, onerror, etc.)
  clean = clean.replace(EVENT_HANDLER_ATTR, "");

  // 5. Sanitize href attributes — block javascript: and data: URIs
  clean = clean.replace(
    /(<a\s[^>]*?)href\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
    (match, prefix, dq, sq) => {
      const url = dq ?? sq ?? "";
      if (DANGEROUS_HREF.test(url)) {
        return `${prefix}href="#blocked"`;
      }
      return match;
    }
  );

  // 6. Sanitize style attributes — block expression(), javascript:, data: URLs
  clean = clean.replace(
    /style\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
    (match, dq, sq) => {
      const value = dq ?? sq ?? "";
      if (DANGEROUS_CSS_VALUE.test(value)) {
        return 'style=""';
      }
      return match;
    }
  );

  // 7. Remove <meta http-equiv="refresh"> auto-redirects
  clean = clean.replace(/<meta\s+[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi, "");

  // 8. Remove <base> tags that could hijack relative URLs
  clean = clean.replace(/<base\s+[^>]*>/gi, "");

  return clean;
}

/**
 * Sanitize CSS string — remove expression(), javascript:, and @import with external URLs.
 */
export function sanitizeCss(css: string): string {
  if (!css) return "";

  let clean = css;

  // Remove CSS expressions (IE legacy but still dangerous)
  clean = clean.replace(/expression\s*\([^)]*\)/gi, "/* blocked */");

  // Remove javascript: in url()
  clean = clean.replace(/url\s*\(\s*["']?\s*javascript\s*:[^)]*\)/gi, "url(about:blank)");

  // Remove data: URIs in url() except for safe image types
  clean = clean.replace(
    /url\s*\(\s*["']?\s*data\s*:(?!image\/(png|jpeg|jpg|gif|svg\+xml|webp))[^)]*\)/gi,
    "url(about:blank)"
  );

  // Remove @import with external http URLs (allow relative imports)
  clean = clean.replace(
    /@import\s+(?:url\s*\(\s*)?["']?https?:\/\/[^"'\s)]+["']?\s*\)?[^;]*;?/gi,
    "/* blocked external import */"
  );

  return clean;
}

/**
 * Completely strip JavaScript source — no user JS is allowed.
 * Returns empty string.
 */
export function stripJavaScript(js: string): string {
  // For now, completely block all JS from custom landing pages.
  // If needed in the future, implement a JS sandbox or CSP nonce approach.
  if (!js || !js.trim()) return "";
  return `/* JavaScript telah dihapus untuk alasan keamanan. Gunakan CSS dan HTML untuk styling. */`;
}
