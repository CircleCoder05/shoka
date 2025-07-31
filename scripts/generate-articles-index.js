import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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
  // 更宽松的正则表达式，处理可能的换行符差异
  const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
  const match = content.match(frontMatterRegex)

  if (!match) {
    console.log('No front matter found in content')
    return {
      frontMatter: {},
      content: content,
    }
  }

  const frontMatterText = match[1]
  const markdownContent = match[2]

  const frontMatter = {}
  let currentKey = null
  let currentValue = []

  frontMatterText.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':')

    if (colonIndex > 0 && !line.startsWith(' ')) {
      // 新的键值对
      if (currentKey) {
        // 处理特殊字段
        let finalValue = currentValue.length === 1 ? currentValue[0] : currentValue

        // 处理 tags 字段：如果是字符串形式的数组，转换为数组
        if (
          currentKey === 'tags' &&
          typeof finalValue === 'string' &&
          finalValue.startsWith('[') &&
          finalValue.endsWith(']')
        ) {
          finalValue = finalValue
            .slice(1, -1)
            .split(',')
            .map((item) => item.trim())
        }

        // 处理 categories 字段：如果是字符串形式的数组，转换为数组
        if (
          currentKey === 'categories' &&
          typeof finalValue === 'string' &&
          finalValue.startsWith('[') &&
          finalValue.endsWith(']')
        ) {
          finalValue = finalValue
            .slice(1, -1)
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item !== '') // 过滤掉空字符串
        }

        frontMatter[currentKey] = finalValue
      }

      const key = line.substring(0, colonIndex).trim()
      let value = line.substring(colonIndex + 1).trim()

      // 处理带引号的值
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      }

      currentKey = key
      // 如果值是空的，不要添加到 currentValue 中
      currentValue = value ? [value] : []
    } else if (line.startsWith('-') && currentKey) {
      // 数组项
      const item = line.substring(1).trim()
      if (item.startsWith('[') && item.endsWith(']')) {
        // 处理嵌套数组
        const nestedArray = item
          .slice(1, -1)
          .split(',')
          .map((item) => item.trim().replace(/['"]/g, ''))
        currentValue.push(...nestedArray)
      } else {
        currentValue.push(item)
      }
    } else if (line.trim() && currentKey) {
      // 多行值
      currentValue.push(line.trim())
    }
  })

  // 处理最后一个键值对
  if (currentKey) {
    // 处理特殊字段
    let finalValue = currentValue.length === 1 ? currentValue[0] : currentValue

    // 处理 tags 字段：如果是字符串形式的数组，转换为数组
    if (
      currentKey === 'tags' &&
      typeof finalValue === 'string' &&
      finalValue.startsWith('[') &&
      finalValue.endsWith(']')
    ) {
      finalValue = finalValue
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim())
    }

    // 处理 categories 字段：如果是字符串形式的数组，转换为数组
    if (
      currentKey === 'categories' &&
      typeof finalValue === 'string' &&
      finalValue.startsWith('[') &&
      finalValue.endsWith(']')
    ) {
      finalValue = finalValue
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== '') // 过滤掉空字符串
    }

    frontMatter[currentKey] = finalValue
  }

  return {
    frontMatter,
    content: markdownContent,
  }
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
