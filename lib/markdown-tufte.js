// Renders genuine tufte.css markup (the real checkbox/label/span sidenote
// and marginnote mechanism, plus <figure>/<figcaption>) from plain markdown.
export default function tufteMarkdownPlugin(md) {
  overrideFootnotesAsSidenotes(md);
  addMarginnoteAndNewthought(md);
  wrapLoneImagesInFigure(md);
}

// --- 1. Sidenotes -----------------------------------------------------
// `text^[note]` (markdown-it-footnote's inline-footnote syntax) renders
// inline, right where it's written, as tufte.css's numbered sidenote:
//   <label class="margin-toggle sidenote-number"></label>
//   <input type="checkbox" class="margin-toggle"/>
//   <span class="sidenote">note</span>
// The auto-generated footnote list at the bottom of the page is suppressed
// (its content already lives inline).
function overrideFootnotesAsSidenotes(md) {
  md.renderer.rules.footnote_ref = (tokens, idx, options, env, slf) => {
    const id = tokens[idx].meta.id;
    const entry = env.footnotes && env.footnotes.list && env.footnotes.list[id];
    const content = entry && entry.tokens ? slf.renderInline(entry.tokens, options, env) : "";
    return (
      `<label for="sn-${id}" class="margin-toggle sidenote-number"></label>` +
      `<input type="checkbox" id="sn-${id}" class="margin-toggle"/>` +
      `<span class="sidenote">${content}</span>`
    );
  };
  // The plugin still appends a footnote list block at the end of the
  // document; comment it out rather than deleting tokens (simplest way to
  // fully suppress it, including the paragraph/anchor markup inside).
  md.renderer.rules.footnote_block_open = () => "<!--";
  md.renderer.rules.footnote_block_close = () => "-->";
}

// --- 2. Marginnotes and newthought spans -------------------------------
// `[content]{.marginnote}` (optionally `[content]{.marginnote lang="tr"}`)
// renders as tufte.css's unnumbered margin note:
//   <label class="margin-toggle">&#8853;</label>
//   <input type="checkbox" class="margin-toggle"/>
//   <span class="marginnote" lang="tr">content</span>
// `[content]{.newthought}` renders as a plain styled span (no toggle):
//   <span class="newthought">content</span>
function addMarginnoteAndNewthought(md) {
  let counter = 0;

  md.inline.ruler.after("footnote_ref", "bracketed_span", (state, silent) => {
    const start = state.pos;
    if (state.src.charCodeAt(start) !== 0x5b /* [ */) return false;

    const labelStart = start + 1;
    const labelEnd = state.md.helpers.parseLinkLabel(state, start, false);
    if (labelEnd < 0) return false;

    let pos = labelEnd + 1;
    if (state.src.charCodeAt(pos) !== 0x7b /* { */) return false;
    const attrsStart = pos + 1;
    const attrsEnd = state.src.indexOf("}", attrsStart);
    if (attrsEnd < 0) return false;

    const attrsSrc = state.src.slice(attrsStart, attrsEnd);
    const classMatch = attrsSrc.match(/^\.(\S+)/);
    if (!classMatch) return false;
    const className = classMatch[1];
    if (className !== "marginnote" && className !== "newthought") return false;

    if (!silent) {
      const langMatch = attrsSrc.match(/lang="([^"]*)"/);
      const lang = langMatch ? langMatch[1] : null;
      const innerTokens = [];
      state.md.inline.parse(state.src.slice(labelStart, labelEnd), state.md, state.env, innerTokens);
      const content = state.md.renderer.renderInline(innerTokens, state.md.options, state.env);

      const token = state.push("html_inline", "", 0);
      if (className === "newthought") {
        token.content = `<span class="newthought">${content}</span>`;
      } else {
        const id = counter++;
        const langAttr = lang ? ` lang="${lang}"` : "";
        token.content =
          `<label for="mn-${id}" class="margin-toggle">&#8853;</label>` +
          `<input type="checkbox" id="mn-${id}" class="margin-toggle"/>` +
          `<span class="marginnote"${langAttr}>${content}</span>`;
      }
    }

    state.pos = attrsEnd + 1;
    return true;
  });
}

// --- 3. Figures ----------------------------------------------------------
// A paragraph containing nothing but a single image becomes a real
// <figure>/<figcaption>, per tufte.css. `![caption](src){.fullwidth}` (via
// markdown-it-attrs on the image) produces a full-bleed figure.
function wrapLoneImagesInFigure(md) {
  md.core.ruler.push("tufte_figure", (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length - 2; i++) {
      if (tokens[i].type !== "paragraph_open") continue;
      const inline = tokens[i + 1];
      if (tokens[i + 2].type !== "paragraph_close") continue;
      if (!inline.children || inline.children.length !== 1) continue;
      const img = inline.children[0];
      if (img.type !== "image") continue;

      const fullwidth = (img.attrGet("class") || "").split(/\s+/).includes("fullwidth");
      img.attrs = img.attrs.filter(([name]) => name !== "class");
      const caption = md.renderer.renderInlineAsText(img.children || [], state.md.options, state.env);

      tokens[i].type = "html_block";
      tokens[i].tag = "";
      tokens[i].content = `<figure${fullwidth ? ' class="fullwidth"' : ""}>\n`;

      const imgHtml = md.renderer.renderInline([img], state.md.options, state.env);
      const figcaption = caption ? `<figcaption>${caption}</figcaption>\n` : "";
      inline.type = "html_block";
      inline.tag = "";
      inline.content = `${imgHtml}\n${figcaption}`;
      inline.children = null;

      tokens[i + 2].type = "html_block";
      tokens[i + 2].tag = "";
      tokens[i + 2].content = "</figure>\n";
    }
  });
}
