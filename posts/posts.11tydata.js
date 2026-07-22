import { postLang, postRef, postPermalink } from "../lib/i18n.js";

export default {
  layout: "post.njk",
  eleventyComputed: {
    // Published URL derived from language + shared ref (see lib/i18n.js).
    permalink: (data) => postPermalink(data),
    // Resolved values (with defaults applied) for use in templates.
    resolvedLang: (data) => postLang(data),
    resolvedRef: (data) => postRef(data),
  },
};
