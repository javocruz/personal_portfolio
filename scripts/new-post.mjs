import { writeFileSync, existsSync } from 'node:fs'
const title = process.argv.slice(2).join(' ').trim()
if (!title) { console.error('Usage: npm run new-post "My post title"'); process.exit(1) }
const slug = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const file = `content/posts/${slug}.md`
if (existsSync(file)) { console.error(`${file} already exists`); process.exit(1) }
const date = new Date().toISOString().slice(0, 10)
writeFileSync(file, `---\ntitle: ${title}\ndate: ${date}\nsummary: \ntags: \ndraft: true\n---\n\nWrite here.\n`)
console.log(`Created ${file}  (draft: true, delete that line to publish)`)
