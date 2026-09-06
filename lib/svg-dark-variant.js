// Builds a dark-mode twin of every diagram in pics/.
//
// The diagrams carry their own `@media (prefers-color-scheme: dark)` block, and
// in Chrome and Firefox that is enough: an SVG referenced by <img> resolves the
// query against the viewer's preference and repaints itself. Safari does not —
// it renders the image document in the light scheme no matter what the page is
// doing — so on iOS the diagrams came out as near-black ink on the dark page.
//
// Rather than depend on the image document evaluating the query, the decision
// moves out to the page: lib/markdown-tufte.js emits a <picture> whose <source>
// carries `media="(prefers-color-scheme: dark)"`, and the host document (where
// media queries work everywhere) picks the file. This module is what produces
// the file it points at, `<name>.dark.svg`, by unwrapping the dark block so its
// rules apply unconditionally. The rules stay last in the stylesheet, so they
// still override the light defaults above them exactly as they did inside the
// media query.
//
// The variants are generated into the output directory at build time and never
// committed, so there is no second copy of the artwork to keep in sync: edit
// the diagram, and its dark twin follows.
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const AT_RULE = "@media (prefers-color-scheme: dark)";

// The `.dark.svg` sibling of a diagram path — `/pics/x.svg` -> `/pics/x.dark.svg`,
// leaving any query or fragment alone. Shared with the markdown plugin so the
// two can never disagree about the name.
export function darkVariantPath(src) {
  return src.replace(/\.svg(?=[?#]|$)/i, ".dark.svg");
}

// Hoist the contents of every dark media block up into the stylesheet body.
// Returns null when there is nothing to hoist, which is how a diagram opts out
// of having a dark twin at all.
export function toDarkVariant(svg) {
  let out = svg;
  let found = false;

  for (;;) {
    const at = out.indexOf(AT_RULE);
    if (at === -1) break;

    const open = out.indexOf("{", at + AT_RULE.length);
    if (open === -1) break;

    // Brace matching rather than line matching, so reformatting a diagram's
    // stylesheet later can't quietly produce a broken variant.
    let depth = 0;
    let close = -1;
    for (let i = open; i < out.length; i++) {
      if (out[i] === "{") depth++;
      else if (out[i] === "}" && --depth === 0) {
        close = i;
        break;
      }
    }
    if (close === -1) break;

    out = out.slice(0, at) + out.slice(open + 1, close).trim() + out.slice(close + 1);
    found = true;
  }

  return found ? out : null;
}

// Write a `.dark.svg` next to every diagram Eleventy copied into the output.
export async function writeDarkVariants(sourceDir, outputDir) {
  // A <picture> shows a broken image when the <source> it matched is missing —
  // it does not fall back to the <img> — so never depend on the passthrough
  // copy having created the directory first.
  await mkdir(outputDir, { recursive: true });

  const names = (await readdir(sourceDir)).filter(
    (name) => name.endsWith(".svg") && !name.endsWith(".dark.svg")
  );

  const written = [];
  for (const name of names) {
    const dark = toDarkVariant(await readFile(path.join(sourceDir, name), "utf8"));
    if (!dark) continue;
    const target = path.join(outputDir, darkVariantPath(name));
    await writeFile(target, dark);
    written.push(target);
  }
  return written;
}
