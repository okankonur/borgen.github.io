import MarkdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownItAttrs from "markdown-it-attrs";
import markdownItContainer from "markdown-it-container";
import pluginRss from "@11ty/eleventy-plugin-rss";
import tufteMarkdownPlugin from "./lib/markdown-tufte.js";

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

  eleventyConfig.addCollection("posts", (api) =>
    api
      .getFilteredByGlob("posts/*.md")
      .filter((item) => !item.data.draft)
      .sort((a, b) => b.date - a.date)
  );

  return {
    dir: { input: ".", includes: "_includes", output: "_site" },
    markdownTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
}
