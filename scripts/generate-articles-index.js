import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 扫描目录下的所有 markdown 文件
function scanMarkdownFiles(dir, basePath = '') {
  const files = []

  try {
    const items = fs.readdirSync(dir)

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const relativePath = path.join(basePath, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        // 递归扫描子目录
        const subFiles = scanMarkdownFiles(fullPath, relativePath)
        files.push(...subFiles)
      } else if (item.endsWith('.md')) {
        // 添加 markdown 文件
        files.push(relativePath.replace(/\\/g, '/')) // 统一使用正斜杠
      }
    }
  } catch (err) {
    console.warn(`Failed to scan directory ${dir}:`, err.message)
  }

  return files
}

// 解析 front matter
function parseFrontMatter(content) {
  const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
  const match = content.match(frontMatterRegex)
  if (!match) {
    return { frontMatter: {}, content }
  }
  const frontMatter = yaml.load(match[1])
  const markdownContent = match[2]
  return { frontMatter, content: markdownContent }
}

// 生成文章索引
function generateArticlesIndex() {
  const postsDir = path.join(__dirname, '../public/posts')
  const outputFile = path.join(__dirname, '../public/posts/articles-index.json')

  console.log('Scanning markdown files...')

  // 扫描所有 markdown 文件
  const markdownFiles = scanMarkdownFiles(postsDir)
  console.log(`Found ${markdownFiles.length} markdown files`)

  // 解析每个文件的前置信息
  const articlesIndex = []

  for (const filePath of markdownFiles) {
    try {
      const fullPath = path.join(postsDir, filePath)
      const content = fs.readFileSync(fullPath, 'utf-8')

      const { frontMatter } = parseFrontMatter(content)

      // 从文件路径提取分类
      const pathParts = filePath.split('/')
      const category = pathParts.length > 1 ? pathParts[0] : 'uncategorized'
      const slug = filePath.replace('.md', '')

      // 生成文章信息
      const articleInfo = {
        path: filePath,
        slug,
        category,
        title: frontMatter.title || path.basename(filePath, '.md'),
        date: frontMatter.date || '',
        tags: frontMatter.tags || [],
        categories: Array.isArray(frontMatter.categories)
          ? frontMatter.categories
          : [frontMatter.categories || category],
        author: frontMatter.author || 'CircleCoder',
        excerpt: frontMatter.excerpt || '',
        cover: frontMatter.cover || '',
        wordCount: frontMatter.wordCount || '',
        readTime: frontMatter.readTime || '',
      }

      articlesIndex.push(articleInfo)
      console.log(`Processed: ${filePath}`)
    } catch (err) {
      console.warn(`Failed to process ${filePath}:`, err.message)
    }
  }

  // 按日期排序
  articlesIndex.sort((a, b) => new Date(b.date) - new Date(a.date))

  // 写入索引文件
  try {
    fs.writeFileSync(outputFile, JSON.stringify(articlesIndex, null, 2), 'utf-8')
    console.log(`Articles index generated: ${outputFile}`)
    console.log(`Total articles: ${articlesIndex.length}`)
  } catch (err) {
    console.error('Failed to write articles index:', err.message)
  }
}

// 运行生成器
generateArticlesIndex()

export { generateArticlesIndex }
