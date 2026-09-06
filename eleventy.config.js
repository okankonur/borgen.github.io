import MarkdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownItAttrs from "markdown-it-attrs";
import markdownItContainer from "markdown-it-container";
import pluginRss from "@11ty/eleventy-plugin-rss";
import tufteMarkdownPlugin from "./lib/markdown-tufte.js";
import { writeDarkVariants } from "./lib/svg-dark-variant.js";
import { DEFAULT_LANG, postLang, postRef } from "./lib/i18n.js";

// Drafts stay out of the homepage and the feed in a production build
// (`npm run build`, which is what CI runs) but show up while developing
// (`npm run serve`), so work in progress can be previewed in place.
// Draft pages are always written to their own URL either way.
const SHOW_DRAFTS = process.env.ELEVENTY_RUN_MODE !== "build";
const isListed = (item) => SHOW_DRAFTS || !item.data.draft;

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addPassthroughCopy("css");
  // css/ is copied verbatim; without this its README would also be built
  // as a page, since the input directory is the repo root.
  eleventyConfig.ignores.add("css/**");
  eleventyConfig.addPassthroughCopy("pics");
  // Each diagram also gets a generated `.dark.svg` twin in the output, which
  // the <picture> in lib/markdown-tufte.js selects on a dark-mode viewport.
  // See lib/svg-dark-variant.js for why the SVG's own media query is not
  // enough on its own.
  eleventyConfig.on("eleventy.after", ({ dir }) =>
    writeDarkVariants("pics", `${dir.output}/pics`)
  );
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("favicon-16x16.png");
  eleventyConfig.addPassthroughCopy("favicon-32x32.png");
  eleventyConfig.addPassthroughCopy("apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("android-chrome-192x192.png");
  eleventyConfig.addPassthroughCopy("android-chrome-512x512.png");

  const md = new MarkdownIt({ html: true, typographer: true })
    .use(markdownItFootnote)
    .use(markdownItAttrs, { allowedAttributes: ["class", "lang"] })
    .use(markdownItContainer, "epigraph", {
      render(tokens, idx) {
        return tokens[idx].nesting === 1 ? '<div class="epigraph">\n' : "</div>\n";
      },
    })
    .use(tufteMarkdownPlugin);
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addFilter("dateIso", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("dateHuman", (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  );

  // Every post, in every language — used to find a post's translation.
  eleventyConfig.addCollection("postsAll", (api) =>
    api.getFilteredByGlob("posts/*.md").filter(isListed)
  );

  // One entry per post (its default-language version if it has one) for the
  // homepage and RSS feed, so translations don't show up as duplicates.
  eleventyConfig.addCollection("posts", (api) => {
    const byRef = new Map();
    for (const item of api.getFilteredByGlob("posts/*.md")) {
      if (!isListed(item)) continue;
      const ref = postRef(item.data);
      if (!byRef.has(ref) || postLang(item.data) === DEFAULT_LANG) byRef.set(ref, item);
    }
    return [...byRef.values()].sort((a, b) => b.date - a.date);
  });

  // The translation of `ref` in a language other than `lang`, or null if none.
  eleventyConfig.addFilter(
    "translationOf",
    (all, ref, lang) =>
      (all || []).find((p) => postRef(p.data) === ref && postLang(p.data) !== lang) || null
  );

  return {
    dir: { input: ".", includes: "_includes", output: "_site" },
    markdownTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
}
