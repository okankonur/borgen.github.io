# Port Guide: Hugo (loikein/hugo-tufte) → Quarto Tufte

**Audience:** an autonomous coding agent (LLM) that will execute this migration end to
end. Follow the steps in order. Every file's full contents are given. Do not
improvise structure; where a decision is needed it is called out explicitly.

**Repo:** `borgen.github.io` — a personal blog currently built with Hugo + the
unmaintained `loikein/hugo-tufte` theme. The theme infinite-recurses on Hugo ≥
0.146, so the repo is pinned to Hugo 0.128 via a `Makefile` + `./bin/hugo`. This
guide replaces the whole Hugo stack with **Quarto**, whose Tufte layout
(footnotes→sidenotes, margin notes, margin/full-width figures) is maintained
upstream by Posit and works on current tooling.

**Custom domain:** `okankonur.com` (GitHub Pages). Must be preserved.

**Success criteria (verify all at the end):**
1. `quarto render` completes with no errors and produces `_site/`.
2. Every post from `content/posts/` exists and renders, sidenotes/margin notes
   show in the margin, images load, code blocks and the ASCII diagram are intact.
3. `_site/CNAME` contains `okankonur.com`.
4. `_site/index.xml` (RSS) exists.
5. Post URLs `/posts/<slug>/` are unchanged; `/about/me` redirects to the new about page.
6. The GitHub Actions workflow builds and deploys to Pages.

---

## 0. Ground rules

- Work on a new branch: `git checkout -b quarto-migration`. Never touch `master`
  until cutover (Step 12) and never force-push.
- Hugo and Quarto files **coexist** during the migration (Hugo reads `config.yml`
  + `content/`; Quarto reads `_quarto.yml` + `*.qmd`). Nothing is deleted until
  Step 12, so rollback is just `git checkout master`.
- Keep the same **post slugs** as the Hugo file basenames so URLs don't change:
  `callhome`, `selfhost`, `test-post`, `windy-ilion`.
- The blog has **no executable code cells** (no R/Python). Do **not** add
  `execute`/`jupyter`/`knitr` machinery. All fenced code blocks are display-only
  and carry over verbatim.

---

## 1. Prerequisites

Install Quarto (≥ 1.5; use latest stable). Record the version.

```bash
# Linux (adjust version to latest stable release)
QVER=1.6.40
curl -sL -o /tmp/quarto.deb "https://github.com/quarto-dev/quarto-cli/releases/download/v${QVER}/quarto-${QVER}-linux-amd64.deb"
sudo dpkg -i /tmp/quarto.deb
quarto --version
```

If `sudo`/`.deb` is unavailable, use the tarball release into `~/.local` and put
`quarto` on `PATH`. Confirm `quarto check` reports the HTML stack OK.

---

## 2. Target structure

Create exactly this (files defined in later steps):

```
borgen.github.io/
├── _quarto.yml                 # site + format config          (Step 3)
├── index.qmd                   # home = blog listing            (Step 5)
├── about.qmd                   # about page + old-URL redirect  (Step 6)
├── styles/
│   └── tufte.scss              # Tufte typography theme layer   (Step 4)
├── posts/
│   ├── _metadata.yml           # shared per-post defaults       (Step 7)
│   ├── callhome/index.qmd
│   ├── selfhost/index.qmd
│   ├── test-post/index.qmd
│   └── windy-ilion/index.qmd   # (draft)                        (Step 8)
├── pics/                       # copied from static/pics        (Step 9)
│   └── *.png
├── CNAME                       # okankonur.com                  (Step 10)
├── favicon.ico + icon PNGs     # copied from static/            (Step 9)
└── .github/workflows/publish.yml  # replaces the Hugo workflow  (Step 11)
```

---

## 3. `_quarto.yml`

Create `_quarto.yml` at the repo root:

```yaml
project:
  type: website
  output-dir: _site
  resources:
    - CNAME
    - pics/

website:
  title: "Okan's"
  description: "Hello, you've reached Okan's"
  site-url: "https://okankonur.com"
  favicon: favicon.ico
  navbar:
    left:
      - href: index.qmd
        text: Home
      - href: about.qmd
        text: About
    right:
      - icon: github
        href: https://github.com/okankonur/borgen.github.io
        aria-label: Source Code
    search: true
  # Optional: uncomment to show a "reader" font toggle etc.
  # reader-mode: true

format:
  html:
    theme:
      - default
      - styles/tufte.scss
    toc: false
    # Widen the right margin so sidenotes / margin figures have room.
    grid:
      margin-width: 350px
    # Footnotes and citations render as Tufte sidenotes in the margin.
    reference-location: margin
    citation-location: margin
    html-math-method: katex        # matches the old KaTeX setup
    link-external-newwindow: true
    code-copy: true
```

Notes for the executor:
- `reference-location: margin` is what turns markdown footnotes into numbered
  **sidenotes**. `grid.margin-width` gives them space.
- The old site used taxonomies `categories`/`series`/`tags`. Only `categories`
  is actually used in content, and Quarto's listing (Step 5) surfaces categories
  automatically. Do not recreate `series`/`tags`.

---

## 4. `styles/tufte.scss` (Tufte typography layer)

Quarto handles the margin *layout*; this SCSS supplies the Tufte *look*
(et-book serif, cream background, sidenote/newthought/epigraph styling). Create
`styles/tufte.scss`:

```scss
/*-- scss:defaults --*/
// Tufte palette
$body-bg:    #fffff8;
$body-color: #111111;
$link-color: #111111;
$font-family-serif: et-book, Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif;
$font-family-sans-serif: $font-family-serif;
$font-size-root: 15px;
$toc-color: #111111;

/*-- scss:rules --*/
// et-book font — download the four woff/woff2 files from
// https://github.com/edwardtufte/tufte-css/tree/gh-pages/et-book
// into styles/et-book/ preserving subfolders, then these @font-face rules apply.
@font-face {
  font-family: "et-book";
  src: url("et-book/et-book-roman-line-figures/et-book-roman-line-figures.woff") format("woff");
  font-weight: normal; font-style: normal;
}
@font-face {
  font-family: "et-book";
  src: url("et-book/et-book-display-italic-old-style-figures/et-book-display-italic-old-style-figures.woff") format("woff");
  font-weight: normal; font-style: italic;
}
@font-face {
  font-family: "et-book";
  src: url("et-book/et-book-bold-line-figures/et-book-bold-line-figures.woff") format("woff");
  font-weight: bold; font-style: normal;
}

body {
  background-color: $body-bg;
  color: $body-color;
  font-family: $font-family-serif;
  line-height: 1.5;
}

// Comfortable reading measure
main { max-width: 55rem; }

// Tufte-style links: subtle underline
a { text-decoration: underline; text-underline-offset: 2px; }

// Sidenotes / margin notes (Quarto puts them in .column-margin / aside)
.column-margin, aside, .aside {
  font-size: 0.8rem;
  line-height: 1.3;
  color: #333;
}

// Run-in small-caps opener  ->  [text]{.newthought}
.newthought {
  font-variant: small-caps;
  font-size: 1.15em;
  letter-spacing: 0.03em;
}

// Epigraph block  ->  ::: {.epigraph} ... :::
.epigraph {
  margin: 2rem 0;
  font-style: italic;
  blockquote { border: none; padding-left: 0; }
  .epigraph-source {
    font-style: normal;
    font-size: 0.85rem;
    text-align: right;
    color: #333;
  }
}
```

If bundling et-book is not desired, delete the `@font-face` blocks; the serif
stack falls back to Palatino/Georgia and still reads as Tufte-ish.

---

## 5. `index.qmd` (home = blog listing + RSS)

Create `index.qmd` at the repo root:

```yaml
---
title: "Okan's"
subtitle: "Hello, you've reached Okan's"
listing:
  contents: posts
  sort: "date desc"
  type: default
  categories: true
  feed: true            # generates /index.xml (RSS)
  fields: [date, title, description, categories]
page-layout: full
title-block-banner: false
---
```

This lists all non-draft posts under `posts/`, shows a category cloud, and emits
`index.xml`. The Hugo pager size (5) has no exact equivalent; Quarto paginates
listings automatically — leave default.

---

## 6. `about.qmd` (with old-URL redirect)

The Hugo about lived at `/about/me`. Preserve it with `aliases`. The source is
`content/about/me.md` (its body — read it and paste below the front matter).

Create `about.qmd`:

```yaml
---
title: "About"
aliases:
  - /about/me/
  - /about/me
---
```

Then paste the Markdown body from `content/about/me.md` beneath the front matter.
(If that file's body is empty, write a short placeholder and flag it in the final
report.)

---

## 7. `posts/_metadata.yml` (shared post defaults)

Create `posts/_metadata.yml` so every post inherits the Tufte margin behavior
without repeating it:

```yaml
# Applied to every post under posts/
title-block-banner: false
toc: false
reference-location: margin
citation-location: margin
```

---

## 8. Migrate each post

For each Hugo file `content/posts/<slug>.md`, create
`posts/<slug>/index.qmd`. Do two things: (A) rewrite front matter per the map
below, (B) convert shortcodes in the body per Step 8b. Leave all other Markdown,
fenced code blocks, and the ASCII diagram **byte-for-byte unchanged**.

### 8a. Front-matter map (Hugo → Quarto)

| Hugo field                | Quarto field         | Notes |
|---------------------------|----------------------|-------|
| `title`                   | `title`              | as-is |
| `subtitle`                | `subtitle`           | as-is |
| `date: 2022-06-12T16:15:03+03:00` | `date: "2022-06-12"` | date only is fine |
| `draft: true`             | `draft: true`        | keeps it out of the listing |
| `categories: [History]` / list | `categories: [History]` | as-is |
| `description`             | `description`        | as-is; shown in listing |
| `toc: true`               | `toc: true`          | only windy-ilion set it |
| `meta`, `math`            | *(drop)*             | Hugo-theme params; not needed |
| `layout`, `url`           | *(drop)*             | Hugo-only |

Concrete per-post front matter:

- `posts/callhome/index.qmd`:
  ```yaml
  ---
  title: "Calling Home"
  date: "2022-06-12"
  categories: ["Networking"]
  ---
  ```
- `posts/selfhost/index.qmd`:
  ```yaml
  ---
  title: "Hosting Open Source Projects At Home"
  date: "2022-06-02"
  ---
  ```
- `posts/test-post/index.qmd`:
  ```yaml
  ---
  title: "Test Post"
  date: "2022-03-26"
  ---
  ```
- `posts/windy-ilion/index.qmd`:
  ```yaml
  ---
  title: "Standing on Windy Ilion"
  subtitle: "How a dumb question about the Iliad turned into 3,200 years under my feet"
  date: "2026-07-22"
  draft: true
  categories: ["History"]
  toc: true
  description: "It started with me not being able to tell the Iliad and the Odyssey apart. It ended with me realizing you can still stand on the walls of Troy, in the same wind Hector heard."
  ---
  ```

### 8b. Shortcode conversion table (the important part)

These six shortcodes appear in the content. Convert **every** occurrence.

**1. `sidenote` → inline footnote** (auto-renders as a numbered sidenote):
```text
Hugo:    text{{< sidenote >}}the note{{< /sidenote >}} more
Quarto:  text^[the note] more
```

**2. `marginnote` → `.column-margin` inline span** (unnumbered margin note).
Markdown inside the span is preserved; keep the `lang` attribute if present:
```text
Hugo:    word{{< marginnote lang="tr" >}}**İlyada** ve **Odysseia** — the two poems.{{< /marginnote >}}
Quarto:  word[**İlyada** ve **Odysseia** — the two poems.]{.column-margin lang="tr"}
```
If a marginnote's content is long/multi-paragraph, use a block form placed right
after the sentence instead:
```text
::: {.column-margin lang="tr"}
**İlyada** ve **Odysseia** — the two poems.
:::
```

**3. `newthought` → `.newthought` span** (styled in tufte.scss):
```text
Hugo:    {{< newthought >}}It started with something embarrassing.{{< /newthought >}} I could not...
Quarto:  [It started with something embarrassing.]{.newthought} I could not...
```

**4. `figure` → Markdown image** (alt text becomes the caption; center by default):
```text
Hugo:    {{< figure align=center src="/pics/rpi-watt.png" caption="Power Usage With 6 Containers Running" >}}
Quarto:  ![Power Usage With 6 Containers Running](/pics/rpi-watt.png){fig-align="center"}
```
Keep the `/pics/...` path unchanged (see Step 9). For a margin figure use
`{.column-margin}`; for full-bleed use `{.column-page}`.

**5. `blockquote` → Markdown blockquote:**
```text
Hugo:    {{< blockquote >}}
         Some quoted text.
         {{< /blockquote >}}
Quarto:  > Some quoted text.
```

**6. `epigraph` → `.epigraph` fenced div** (styled in tufte.scss). Two forms in
the content:

With attribution (`author` / `cite` / `detail`):
```text
Hugo:
{{< epigraph author="Homer" cite="The Iliad" detail="Book 3" >}}
…like the shrieking of cranes that flee the winter and its rain,
flying with clamour toward the streams of Ocean…
{{< /epigraph >}}

Quarto:
::: {.epigraph}
> …like the shrieking of cranes that flee the winter and its rain,
> flying with clamour toward the streams of Ocean…

[— Homer, *The Iliad*, Book 3]{.epigraph-source}
:::
```

Bare (no attribution):
```text
Hugo:
{{< epigraph >}}
A mother afraid for a child going to war...
{{< /epigraph >}}

Quarto:
::: {.epigraph}
> A mother afraid for a child going to war...
:::
```

> After converting, grep each `index.qmd` for a leftover `{{<` or `{{%` — there
> must be **zero** matches. Any leftover means a shortcode was missed.

---

## 9. Assets

```bash
mkdir -p pics
cp static/pics/*.png pics/
# Site icons referenced by _quarto.yml (favicon) and browsers:
cp static/favicon.ico static/favicon-16x16.png static/favicon-32x32.png \
   static/apple-touch-icon.png static/android-chrome-192x192.png \
   static/android-chrome-512x512.png ./
```

Images are referenced as root-absolute `/pics/xxx.png`. In a Quarto **website**
project these resolve from the project root, and `pics/` is copied to
`_site/pics/` (also listed under `project.resources`). **Verify** after the first
render that images load (Step 11 checklist); if any 404, the robust fallback is
to change that image to a path relative to the post,
e.g. `![cap](../../pics/xxx.png)`.

---

## 10. Custom domain (CNAME)

The domain must survive the switch. Create `CNAME` at the repo root:

```
okankonur.com
```

It is listed in `project.resources` (Step 3) so it is copied verbatim to
`_site/CNAME`. Do not add a trailing blank-line dependency — a single line is
fine. (There are stale copies at `static/CNAME` and `docs/CNAME` from the Hugo
setup; ignore them, they get removed at cutover.)

---

## 11. GitHub Actions deploy workflow

Replace the Hugo workflow. Create `.github/workflows/publish.yml`:

```yaml
name: Publish (Quarto) to Pages
on:
  push:
    branches: ["master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Quarto
        uses: quarto-dev/quarto-actions/setup@v2
        with:
          version: release
      - name: Render site
        run: quarto render
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

No Node/R/Python setup is needed (no executable cells). Leave GitHub Pages set to
"GitHub Actions" as the source (unchanged from the Hugo setup).

---

## 12. Local verification (do BEFORE cutover)

```bash
quarto render
```

Then check every item — all must pass:

- [ ] Render exits 0, no template/YAML errors.
- [ ] `_site/index.html` lists callhome, selfhost, test-post (NOT windy-ilion — it's a draft).
- [ ] `ls _site/posts/callhome/index.html _site/posts/selfhost/index.html _site/posts/test-post/index.html` all exist (URLs preserved).
- [ ] Open a post; footnotes appear as **numbered sidenotes in the right margin**, marginnotes appear **unnumbered in the margin**.
- [ ] Images load in `_site/posts/*/` (grep the HTML for `/pics/` and confirm files exist in `_site/pics/`).
- [ ] `grep -RIl '{{[<%]' posts *.qmd` returns nothing (no leftover Hugo shortcodes).
- [ ] `cat _site/CNAME` prints `okankonur.com`.
- [ ] `_site/index.xml` exists (RSS).
- [ ] `_site/about.html` exists and `_site/about/me/index.html` redirect stub exists (from `aliases`).
- [ ] `windy-ilion` renders when previewed with drafts (`quarto preview` shows it), but is absent from the production listing.

Use `quarto preview` for an interactive check of the Tufte look (margins,
et-book font, epigraph styling, newthought small-caps).

---

## 13. Cutover (only after Step 12 fully passes)

Remove the Hugo stack in one commit:

```bash
git rm -r config.yml go.mod go.sum Makefile content docs public resources archetypes \
         static .github/workflows/*hugo* 2>/dev/null || true
# also remove the pinned-Hugo bits if present:
rm -rf bin .hugo_build.lock
```
Keep/verify these remain: `_quarto.yml`, `index.qmd`, `about.qmd`, `posts/`,
`pics/`, `styles/`, `CNAME`, favicon files, `.github/workflows/publish.yml`.

Update `.gitignore` to:
```
/_site/
/.quarto/
```

Then:
```bash
quarto render          # final sanity build
git add -A
git commit -m "Migrate site from Hugo (hugo-tufte) to Quarto Tufte"
```

Do **not** merge to `master` or push automatically — stop here and hand back to
the user with a summary of what changed and the verification results. The user
merges/pushes, which triggers the Pages deploy.

---

## 14. Known deltas to report to the user

State these explicitly in the final report:
- **About URL**: `/about/me` → `/about.html` (redirect added via `aliases`; old link still works).
- **Category pages**: Hugo `/categories/networking/` becomes a listing filter on the
  home page rather than a standalone page. Add per-category aliases only if the
  user wants the old URLs preserved.
- **Search**: the Hugo `search.md` page is dropped; Quarto's built-in navbar
  search (`search: true`) replaces it.
- **Pagination**: Hugo `pagerSize: 5` → Quarto listing default pagination.
- **et-book font**: bundled only if the woff files were downloaded (Step 4);
  otherwise a Palatino/Georgia serif fallback is used — note which happened.
- **Anything that didn't convert cleanly** (empty about body, an ambiguous
  marginnote placement, an image that needed a relative-path fallback).
```
