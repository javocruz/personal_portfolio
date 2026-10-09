---
title: Building this site with WebGPU shaders
date: 2026-10-09
summary: How javicruz.dev is put together: React, WebGPU shader backgrounds, Cloudflare for hosting, DNS and email, and a blog that is just Markdown files.
tags: meta, web
draft: true
---

> **Draft written by Claude as a starting point.** Rewrite it in your own voice, then delete the `draft: true` line to publish.

This site is a small React app. The interesting part is what runs around it.

## The visuals

The backgrounds on the home page and on each project are real-time **WebGPU shaders** from the open-source [`shaders`](https://github.com/shader-effects-inc/shaders) library. Each project gets its own palette, and if a browser has no WebGPU the page falls back to a plain CSS gradient. The shader code is loaded only when a scene scrolls into view, which keeps the first load small.

## Hosting, DNS and email

Everything lives on Cloudflare: the code deploys from GitHub on every push to `main`, DNS and HTTPS are handled there too, and `contact@javicruz.dev` is an Email Routing address that forwards to my inbox. The contact form is a tiny Worker that validates a message and sends it through the same system.

## The blog

Posts are Markdown files in a folder. To publish one, I add a file and commit it:

```ts
// content/posts/my-post.md becomes /blog/my-post
const url = `/blog/${slug}`
```

That is the whole CMS.
