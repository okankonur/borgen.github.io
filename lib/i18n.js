// Bilingual (Turkish / English) support for posts.
//
// A post is one Markdown file per language. Two files are linked as
// translations of each other by sharing the same `ref` in their front matter.
// The `lang` front matter marks the language ("tr" or "en"); when omitted a
// post is assumed to be in the default language and needs no `ref`.

export const DEFAULT_LANG = "tr";

// Language of a post: explicit front-matter `lang`, else the site default.
export function postLang(data) {
  return data.lang || DEFAULT_LANG;
}

// Identifier shared by translations of the same post. Falls back to the file
// name, so a single-language post works without any extra front matter.
export function postRef(data) {
  return data.ref || data.page.fileSlug;
}

// Where a post is published: the default language lives at the root
// (/posts/<ref>/), other languages under a language segment (/posts/<ref>/en/).
export function postPermalink(data) {
  const lang = postLang(data);
  const ref = postRef(data);
  return lang === DEFAULT_LANG ? `/posts/${ref}/` : `/posts/${ref}/${lang}/`;
}
