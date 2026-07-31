import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const utils = new MarkdownIt().utils

export const markdownRenderer = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight(code, language) {
    return `<div class="custom-code-block" data-lang="${utils.escapeHtml(language || '')}" data-code="${utils.escapeHtml(code)}"></div>`
  },
}).use(texmath, { engine: katex, delimiters: 'dollars' })

export function renderMarkdown(source = '') {
  return markdownRenderer.render(source)
}
