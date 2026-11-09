// A small Markdown renderer for the site's long-form documents (e.g. thesis/draft1.md).
//
// Supports: headings (#–######), paragraphs, horizontal rules, bulleted lists, pipe tables with
// alignment, footnotes ([^id] and [^id]: text), **bold**, *italic*, `code`,
// [links](url), bare https:// links, backslash escapes, and LaTeX math in
// \( inline \) and \[ display \] form (rendered by the renderMath callback).
// Numbered lists, block quotes, code fences and raw HTML are not supported; raw HTML is escaped.
(function (global) {
  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const PLACEHOLDER = /\u0000(\d+)\u0000/g;

  const isSafeUrl = (url) => /^https?:\/\//i.test(url) || /^[#\w./-][^:]*$/.test(url);

  function renderMarkdown(source, options = {}) {
    const renderMath =
      typeof options.renderMath === 'function'
        ? options.renderMath
        : (tex) => `<code>${escapeHtml(tex)}</code>`;

    // Rendered fragments are swapped out for placeholders so that later passes
    // (escaping, table splitting, emphasis) never touch them.
    const held = [];
    const hold = (html) => `\u0000${held.push(html) - 1}\u0000`;
    const displayIds = new Set();

    let text = String(source).replace(/\r\n?/g, '\n');

    text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_, tex) => {
      const token = hold(`<div class="md-math-display">${renderMath(tex.trim(), true)}</div>`);
      displayIds.add(token);
      return `\n\n${token}\n\n`;
    });
    text = text.replace(/\\\(([\s\S]+?)\\\)/g, (_, tex) => hold(renderMath(tex.trim(), false)));
    text = text.replace(/\\([\\`*_{}[\]()#+\-.!|<>])/g, (_, char) => hold(escapeHtml(char)));

    const footnoteDefs = new Map();
    const footnoteOrder = [];
    const headings = [];
    const usedSlugs = new Map();

    const slugify = (value) => {
      const base =
        value
          .replace(PLACEHOLDER, '')
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s-]/gu, '')
          .trim()
          .replace(/\s+/g, '-') || 'section';
      const count = usedSlugs.get(base) || 0;
      usedSlugs.set(base, count + 1);
      return count ? `${base}-${count}` : base;
    };

    const footnoteNumber = (id) => {
      let index = footnoteOrder.indexOf(id);
      if (index === -1) {
        index = footnoteOrder.push(id) - 1;
      }
      return index + 1;
    };

    const inline = (raw) => {
      let out = escapeHtml(raw);
      out = out.replace(/`([^`]+)`/g, (_, code) => hold(`<code>${code}</code>`));
      out = out.replace(/\[\^([^\]\s]+)\]/g, (_, id) => {
        const n = footnoteNumber(id);
        return hold(
          `<sup class="md-fn-ref"><a href="#fn-${escapeHtml(id)}" id="fnref-${escapeHtml(id)}-${n}">${n}</a></sup>`
        );
      });
      out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, url) => {
        const href = url.replace(/&amp;/g, '&');
        if (!isSafeUrl(href)) {
          return match;
        }
        const external = /^https?:/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
        return hold(`<a href="${escapeHtml(href)}"${external}>${emphasis(label)}</a>`);
      });
      out = out.replace(/https?:\/\/[^\s<\u0000]*[^\s<\u0000.,;:)\]]/g, (url) => {
        const href = url.replace(/&amp;/g, '&');
        return hold(`<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${url}</a>`);
      });
      return emphasis(out);
    };

    const emphasis = (value) =>
      value
        .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(?=\S)([\s\S]*?\S)\*/g, '<em>$1</em>');

    const splitRow = (line) =>
      line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim());

    const isTableSeparator = (line) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line);

    // Bulleted lists ("- ", "* " or "+ "), nested by indentation.
    const LIST_ITEM = /^(\s*)[-*+]\s+(.*)$/;
    const renderList = (items) => {
      let html = '';
      const stack = [];
      items.forEach((item) => {
        if (!stack.length || item.indent > stack[stack.length - 1]) {
          html += '<ul><li>';
          stack.push(item.indent);
        } else {
          while (stack.length > 1 && item.indent < stack[stack.length - 1]) {
            html += '</li></ul>';
            stack.pop();
          }
          html += '</li><li>';
        }
        html += inline(item.text);
      });
      html += '</li></ul>'.repeat(stack.length);
      return html;
    };

    const lines = text.split('\n');
    const blocks = [];

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        continue;
      }

      if (displayIds.has(trimmed)) {
        blocks.push(trimmed);
        continue;
      }

      const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(trimmed);
      if (heading) {
        const level = heading[1].length;
        const id = slugify(heading[2]);
        const html = inline(heading[2]);
        headings.push({ level, id, html });
        blocks.push(`<h${level} id="${id}">${html}</h${level}>`);
        continue;
      }

      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        blocks.push('<hr />');
        continue;
      }

      const footnote = /^\[\^([^\]\s]+)\]:\s*(.*)$/.exec(trimmed);
      if (footnote) {
        footnoteDefs.set(footnote[1], footnote[2]);
        continue;
      }

      if (trimmed.startsWith('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
        const header = splitRow(trimmed);
        const align = splitRow(lines[i + 1]).map((cell) => {
          const left = cell.startsWith(':');
          const right = cell.endsWith(':');
          if (left && right) return 'center';
          if (right) return 'right';
          if (left) return 'left';
          return '';
        });
        const cellAttr = (index) => (align[index] ? ` style="text-align:${align[index]}"` : '');
        const rows = [];
        i += 2;
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          rows.push(splitRow(lines[i]));
          i += 1;
        }
        i -= 1;
        const head = header.map((cell, index) => `<th${cellAttr(index)}>${inline(cell)}</th>`).join('');
        const body = rows
          .map(
            (row) =>
              `<tr>${header.map((_, index) => `<td${cellAttr(index)}>${inline(row[index] || '')}</td>`).join('')}</tr>`
          )
          .join('');
        blocks.push(
          `<div class="md-table"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`
        );
        continue;
      }

      if (LIST_ITEM.test(line)) {
        const items = [];
        while (i < lines.length && (LIST_ITEM.test(lines[i]) || (lines[i].trim() && items.length && /^\s{2,}\S/.test(lines[i])))) {
          const match = LIST_ITEM.exec(lines[i]);
          if (match) {
            items.push({ indent: match[1].replace(/\t/g, '    ').length, text: match[2] });
          } else {
            items[items.length - 1].text += ` ${lines[i].trim()}`;
          }
          i += 1;
        }
        i -= 1;
        blocks.push(renderList(items));
        continue;
      }

      const paragraph = [trimmed];
      while (i + 1 < lines.length) {
        const next = lines[i + 1].trim();
        if (
          !next ||
          displayIds.has(next) ||
          /^#{1,6}\s/.test(next) ||
          /^(-{3,}|\*{3,}|_{3,})$/.test(next) ||
          /^\[\^[^\]\s]+\]:/.test(next) ||
          next.startsWith('|') ||
          LIST_ITEM.test(lines[i + 1])
        ) {
          break;
        }
        paragraph.push(next);
        i += 1;
      }
      blocks.push(`<p>${inline(paragraph.join(' '))}</p>`);
    }

    // Footnotes are numbered in order of first reference; unreferenced ones follow.
    footnoteDefs.forEach((_, id) => footnoteNumber(id));
    if (footnoteOrder.length) {
      const items = footnoteOrder
        .map((id) => {
          const body = footnoteDefs.has(id) ? inline(footnoteDefs.get(id)) : '<em>Missing footnote.</em>';
          const n = footnoteOrder.indexOf(id) + 1;
          return `<li id="fn-${escapeHtml(id)}">${body} <a class="md-fn-back" href="#fnref-${escapeHtml(id)}-${n}" aria-label="Back to text">↩</a></li>`;
        })
        .join('');
      blocks.push(`<section class="md-footnotes" aria-label="Footnotes"><hr /><ol>${items}</ol></section>`);
    }

    let html = blocks.join('\n');
    while (html.includes('\u0000')) {
      html = html.replace(PLACEHOLDER, (_, index) => held[Number(index)]);
    }

    return { html, headings };
  }

  global.renderMarkdown = renderMarkdown;
})(window);
