/**
 * markdown.js — Lightweight Markdown → HTML converter for Guardian Agent responses
 *
 * Handles the subset Gemini actually produces:
 *   **bold**  *italic*  `code`
 *   # ## ### headings
 *   - / * / • bullet lists
 *   1. numbered lists
 *   > blockquotes
 *   --- horizontal rules
 *   [text](url) links
 *   blank lines → paragraph breaks
 *
 * No external dependencies. Output is sanitised — only a safe allow-list of
 * tags/attributes is ever produced (no script, no event handlers).
 */

/**
 * Convert a markdown string to an HTML string.
 * @param {string} md
 * @returns {string} HTML
 */
export function mdToHtml(md) {
  if (!md || typeof md !== 'string') return '';

  // ── 1. Escape raw HTML in the input so we never pass through user HTML ──────
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // ── 2. Split into lines for block-level processing ───────────────────────────
  const lines = html.split('\n');
  const out   = [];
  let inUl    = false;
  let inOl    = false;
  let inBq    = false;

  const closeUl = () => { if (inUl) { out.push('</ul>'); inUl = false; } };
  const closeOl = () => { if (inOl) { out.push('</ol>'); inOl = false; } };
  const closeBq = () => { if (inBq) { out.push('</blockquote>'); inBq = false; } };
  const closeLists = () => { closeUl(); closeOl(); };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // ── Horizontal rule ───────────────────────────────────────────────────────
    if (/^---+$/.test(line.trim())) {
      closeLists(); closeBq();
      out.push('<hr style="border:none;border-top:1px solid currentColor;opacity:0.2;margin:10px 0">');
      continue;
    }

    // ── Headings ──────────────────────────────────────────────────────────────
    const hMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (hMatch) {
      closeLists(); closeBq();
      const level = hMatch[1].length;
      const sizes = { 1: '1.2em', 2: '1.1em', 3: '1em' };
      out.push(`<div style="font-weight:800;font-size:${sizes[level]};margin:10px 0 4px">${inline(hMatch[2])}</div>`);
      continue;
    }

    // ── Blockquote ────────────────────────────────────────────────────────────
    const bqMatch = line.match(/^&gt;\s*(.*)/);
    if (bqMatch) {
      closeLists();
      if (!inBq) { out.push('<blockquote style="border-left:3px solid currentColor;opacity:0.7;margin:6px 0;padding:4px 10px">'); inBq = true; }
      out.push(`<div>${inline(bqMatch[1])}</div>`);
      continue;
    } else {
      closeBq();
    }

    // ── Unordered list ────────────────────────────────────────────────────────
    const ulMatch = line.match(/^(\s*)[-*•]\s+(.+)$/);
    if (ulMatch) {
      closeOl();
      if (!inUl) { out.push('<ul style="margin:4px 0;padding-left:20px">'); inUl = true; }
      out.push(`<li style="margin:2px 0">${inline(ulMatch[2])}</li>`);
      continue;
    }

    // ── Ordered list ──────────────────────────────────────────────────────────
    const olMatch = line.match(/^(\s*)\d+[.)]\s+(.+)$/);
    if (olMatch) {
      closeUl();
      if (!inOl) { out.push('<ol style="margin:4px 0;padding-left:20px">'); inOl = true; }
      out.push(`<li style="margin:2px 0">${inline(olMatch[2])}</li>`);
      continue;
    }

    // ── Blank line → paragraph break ─────────────────────────────────────────
    if (line.trim() === '') {
      closeLists(); closeBq();
      out.push('<div style="height:6px"></div>');
      continue;
    }

    // ── Regular paragraph line ────────────────────────────────────────────────
    closeLists(); closeBq();
    out.push(`<div style="margin:1px 0">${inline(line)}</div>`);
  }

  // Close any open blocks
  closeUl(); closeOl(); closeBq();

  return out.join('');
}

/**
 * Process inline markdown: bold, italic, code, links, strikethrough.
 * Input is already HTML-escaped.
 */
function inline(text) {
  return text
    // ── Inline code ── `code`
    .replace(/`([^`]+)`/g, '<code style="background:rgba(128,128,128,0.2);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.9em">$1</code>')
    // ── Bold+italic ── ***text***
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // ── Bold ── **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // ── Italic ── *text* or _text_
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/_([^_\n]+)_/g, '<em>$1</em>')
    // ── Strikethrough ── ~~text~~
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // ── Links ── [text](url)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;opacity:0.85">$1</a>')
    // ── Emoji bullet shorthand (lines starting with emoji) — keep as-is
    ;
}
