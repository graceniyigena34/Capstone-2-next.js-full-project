import { type ClassValue, clsx } from 'clsx'

const HTML_TAG_REGEX = /<[^>]*>/g

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function slugify(value: string) {
  if (!value || typeof value !== 'string') {
    return ''
  }
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function stripHtml(value: string) {
  if (!value || typeof value !== 'string') {
    return ''
  }
  return value.replace(HTML_TAG_REGEX, ' ').replace(/\s+/g, ' ').trim()
}

export function buildExcerpt(content: string, maxLength = 180) {
  if (!content || typeof content !== 'string') {
    return ''
  }
  const text = stripHtml(content)
  if (text.length <= maxLength) {
    return text
  }

  const truncated = text.slice(0, maxLength).trim()
  const lastSpace = truncated.lastIndexOf(' ')
  const excerpt = lastSpace > maxLength * 0.8 ? truncated.slice(0, lastSpace) : truncated
  return `${excerpt}…`
}

export function calculateReadingTime(content: string) {
  if (!content || typeof content !== 'string') {
    return 1
  }
  const WORDS_PER_MINUTE = 200
  const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
}

export function normalizeTag(tag: string) {
  if (!tag || typeof tag !== 'string') {
    return ''
  }
  return tag.trim().toLowerCase().replace(/[^\w\s-]/g, '').slice(0, 50)
}