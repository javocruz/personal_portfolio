# Writing a blog post

Posts live in `content/posts/` as Markdown files. The file name becomes the URL
(`my-post.md` → `javicruz.dev/blog/my-post`).

## Easiest: from the browser (no terminal)
1. Open https://github.com/javocruz/personal_portfolio/tree/main/content/posts
2. **Add file → Create new file**, name it `my-post.md`, paste the template below.
3. **Commit changes** to `main`. Cloudflare rebuilds and the post is live in about 1–2 minutes.

## From your computer
```bash
npm run new-post "My post title"   # creates a draft file
npm run dev                        # drafts are visible locally
```
Edit the file, delete the `draft: true` line, then commit and push to `main`.

## Template
```
---
title: My post title
date: 2026-10-08
summary: One sentence shown on the blog list.
tags: ai, notes
---

Your text in Markdown...
```

- `draft: true` hides the post from the live site (it still shows in `npm run dev`).
- `tags` are comma-separated and become filters on the blog page.
- Headings get link anchors, code blocks are syntax-highlighted (python, typescript, javascript, bash, json, css, html, sql, yaml).
- Images: put the file in `public/blog/` and use `![alt](/blog/photo.jpg)`.
- Every published post automatically gets its own link-preview image, an entry in the sitemap and in the RSS feed (`/rss.xml`).
