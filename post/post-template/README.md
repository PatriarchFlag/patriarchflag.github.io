# Blog post template

Static Wix blog layout and assets for Patriarch Flag posts.

## Files

| File | Purpose |
|------|---------|
| `layout.html` | Full Wix post page shell with `@@PATRIARCH_*@@` placeholders |
| `render-post.js` | Browser script: reads simple `<article>` source, writes rendered page |
| `layout-bundle.js` | Embedded copy of `layout.html` (for opening posts via `file://` / double-click) |
| `bundle-layout.js` | Regenerates `layout-bundle.js` after layout changes |
| `patch-template.js` | Strips likes/comments/stats; sets dynamic copyright (runs after prepare) |
| `prepare-layout.js` | Rebuilds placeholders from `august-is-patriarch-month2.html` (one-time maintenance) |
| `*.download`, etc. | Wix runtime assets (from `august-is-patriarch-month2_files`) |

## Writing a new post

1. Copy `august-is-patriarch-month3.html` to `your-slug.html`.
2. Set `data-patriarch-slug="your-slug"` on `<html>` (used in canonical URLs).
3. Edit `<article>`: `<header>` (author, time, h1) and `<section>` (body HTML).
4. Put post images in `./your-slug-media/` next to the HTML file.
5. Include both scripts in the post `<head>` (see example below). `layout-bundle.js` lets you double-click the HTML file; over HTTP, `layout.html` is fetched instead when possible.

After editing `layout.html`, run `node post/post-template/bundle-layout.js` to refresh the bundle.

## Example source shape

```html
<!DOCTYPE html>
<html lang="en" data-patriarch-slug="my-post">
<head>
  <meta charset="utf-8">
  <title>My Post Title</title>
  <script src="./post-template/layout-bundle.js"></script>
  <script src="./post-template/render-post.js" defer data-patriarch-template="./post-template/layout.html"></script>
</head>
<body>
  <article id="patriarch-post">
    <header>
      <author>PatriarchFlag.com</author>
      <time datetime="2024-01-15">January 15, 2024</time>
      <h1>My Post Title</h1>
    </header>
    <section>
      <p>Paragraph text…</p>
    </section>
  </article>
</body>
</html>
```

## Regenerating `layout.html`

If you update `august-is-patriarch-month2.html` (nav fixes, CSS, etc.):

```bash
cp post/august-is-patriarch-month2.html post/post-template/layout.html
node post/post-template/prepare-layout.js
```

Then manually re-apply any title/meta placeholder tweaks if `prepare-layout.js` is not yet updated.
