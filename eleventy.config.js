import MarkdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownItAttrs from "markdown-it-attrs";
import markdownItContainer from "markdown-it-container";
import pluginRss from "@11ty/eleventy-plugin-rss";
import tufteMarkdownPlugin from "./lib/markdown-tufte.js";
import { DEFAULT_LANG, postLang, postRef } from "./lib/i18n.js";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("pics");
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
    api.getFilteredByGlob("posts/*.md").filter((item) => !item.data.draft)
  );

  // One entry per post (its default-language version if it has one) for the
  // homepage and RSS feed, so translations don't show up as duplicates.
  eleventyConfig.addCollection("posts", (api) => {
    const byRef = new Map();
    for (const item of api.getFilteredByGlob("posts/*.md")) {
      if (item.data.draft) continue;
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
