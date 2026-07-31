import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import hljs from 'highlight.js'
import 'katex/dist/katex.min.css'

const utils = new MarkdownIt().utils

export const markdownRenderer = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight(code, language) {
    const value = language && hljs.getLanguage(language)
      ? hljs.highlight(code, { language }).value
      : utils.escapeHtml(code)
    return `<pre><code class="hljs${language ? ` language-${language}` : ''}">${value}</code></pre>`
  },
}).use(texmath, { engine: katex, delimiters: 'dollars' })

export function renderMarkdown(source = '') {
  return markdownRenderer.render(source)
}
