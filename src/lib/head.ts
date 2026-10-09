import { useEffect } from 'react'

const setMeta = (sel: string, attr: 'content', value: string) => {
  const el = document.head.querySelector<HTMLMetaElement>(sel)
  if (el) el.setAttribute(attr, value)
}

/** Keeps <title> and social tags in sync during client-side navigation. Crawlers get the same values from the prerendered HTML. */
export function useHead(title: string, description?: string) {
  useEffect(() => {
    document.title = title
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[name="twitter:title"]', 'content', title)
    if (description) {
      setMeta('meta[name="description"]', 'content', description)
      setMeta('meta[property="og:description"]', 'content', description)
      setMeta('meta[name="twitter:description"]', 'content', description)
    }
  }, [title, description])
}
