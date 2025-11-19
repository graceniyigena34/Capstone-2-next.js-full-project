import { type ClassValue, clsx } from 'clsx'

const HTML_TAG_REGEX = /<[^>]*>/g

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function stripHtml(value: string) {
  return value.replace(HTML_TAG_REGEX, ' ').replace(/\s+/g, ' ').trim()
}

export function buildExcerpt(content: string, maxLength = 180) {
  const text = stripHtml(content)
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trim()}…`
}

export function calculateReadingTime(content: string) {
  const WORDS_PER_MINUTE = 200
  const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
}

export function normalizeTag(tag: string) {
  return tag.trim().toLowerCase()
}