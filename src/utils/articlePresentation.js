const FALLBACK_BANNER =
  'https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202503311943773.jpg'

let bannerPoolPromise

function hashString(value) {
  let hash = 2166136261
  for (const character of value) {
    hash ^= character.codePointAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export async function loadBannerPool() {
  if (!bannerPoolPromise) {
    bannerPoolPromise = fetch('/img/images.yml')
      .then((response) => {
        if (!response.ok) throw new Error(`Banner list request failed: ${response.status}`)
        return response.text()
      })
      .then((text) =>
        text
          .split(/\r?\n/)
          .map((line) => line.trim().replace(/^-\s*/, ''))
          .filter((line) => /^https?:\/\//.test(line)),
      )
      .then((images) => (images.length ? images : [FALLBACK_BANNER]))
      .catch(() => [FALLBACK_BANNER])
  }
  return bannerPoolPromise
}

export function selectArticleCover(article, bannerPool) {
  if (article.cover_url || article.cover) return article.cover_url || article.cover
  const key = article.slug || article.title || ''
  return bannerPool[hashString(key) % bannerPool.length]
}

export function createArticleExcerpt(content, limit = 120) {
  if (!content) return ''
  const plainText = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return plainText.length > limit ? `${plainText.slice(0, limit).trim()}…` : plainText
}
