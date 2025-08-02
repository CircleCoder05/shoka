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

// 加载图片列表
function loadImagesList() {
  try {
    const imagesFile = path.join(__dirname, '../public/img/images.yml')
    const imagesContent = fs.readFileSync(imagesFile, 'utf-8')
    const images = yaml.load(imagesContent)
    return Array.isArray(images) ? images : []
  } catch (err) {
    console.warn('Failed to load images.yml:', err.message)
    return []
  }
}

// 随机选择图片
function getRandomImage(imagesList) {
  if (!imagesList || imagesList.length === 0) {
    return ''
  }
  const randomIndex = Math.floor(Math.random() * imagesList.length)
  return imagesList[randomIndex]
}

// 计算字数（中文字符 + 英文单词）
function calculateWordCount(content) {
  if (!content) return 0

  // 移除 markdown 语法和 hexo 特殊语法，但保留代码内容
  const cleanContent = content
    .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
    .replace(/#{1,6}\s+/g, '') // 移除标题
    .replace(/\*\*.*?\*\*/g, '') // 移除粗体
    .replace(/\*.*?\*/g, '') // 移除斜体
    .replace(/~~.*?~~/g, '') // 移除删除线
    .replace(/^\s*>\s+/gm, '') // 移除引用
    .replace(/^\s*\|.*\|.*$/gm, '') // 移除表格行
    .replace(/^\s*[-=]+\s*$/gm, '') // 移除分隔线
    .trim()

  // 计算中文字符数
  const chineseChars = (cleanContent.match(/[\u4e00-\u9fa5]/g) || []).length

  // 计算英文单词数（每4个字符算一个单词）
  const englishText = cleanContent
    .replace(/[\u4e00-\u9fa5]/g, ' ') // 将中文字符替换为空格
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim()

  // 计算英文字符总数，每4个字符算一个单词
  const englishChars = englishText
    ? englishText.replace(/\s/g, '').length // 移除所有空格，计算字符数
    : 0

  const englishWords = Math.ceil(englishChars / 4) // 每4个字符算一个单词

  return chineseChars + englishWords
}

// 计算阅读时间（基于字数）
function calculateReadTime(wordCount) {
  // 假设阅读速度：中文 300字/分钟，英文 200词/分钟
  // 这里简化处理，按 250字/分钟 计算
  const wordsPerMinute = 250
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return Math.max(1, minutes) // 最少1分钟
}

// 格式化日期（只保留日期部分）
function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0] // 只保留 YYYY-MM-DD 部分
  } catch {
    return dateStr
  }
}

// 生成文章摘要
function generateExcerpt(content) {
  if (!content) return ''

  // 移除 markdown 语法和 hexo 特殊语法
  const cleanContent = content
    .replace(/{%[\s\S]*?%}/g, '') // 移除 hexo 特殊语法
    .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
    .replace(/\[.*?\]\(.*?\)/g, '') // 移除链接
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`.*?`/g, '') // 移除行内代码
    .replace(/#{1,6}\s+/g, '') // 移除标题
    .replace(/\*\*.*?\*\*/g, '') // 移除粗体
    .replace(/\*.*?\*/g, '') // 移除斜体
    .replace(/~~.*?~~/g, '') // 移除删除线
    .replace(/^\s*[-*+]\s+/gm, '') // 移除列表标记
    .replace(/^\s*\d+\.\s+/gm, '') // 移除有序列表
    .replace(/^\s*>\s+/gm, '') // 移除引用
    .replace(/^\s*\|.*\|.*$/gm, '') // 移除表格行
    .replace(/^\s*[-=]+\s*$/gm, '') // 移除分隔线
    .replace(/^\s*!\[.*?\]\(.*?\)\s*$/gm, '') // 移除单独的图片行
    .replace(/^\s*https?:\/\/.*$/gm, '') // 移除单独的链接行
    .replace(/<[^>]*>/g, '') // 移除HTML标签
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim()

  // 提取前100个字符
  const excerpt = cleanContent.substring(0, 100)

  // 如果被截断，在最后一个完整字符处截断
  if (excerpt.length === 100 && cleanContent.length > 100) {
    const lastSpaceIndex = excerpt.lastIndexOf(' ')
    if (lastSpaceIndex > 50) {
      // 确保不会太短
      return excerpt.substring(0, lastSpaceIndex) + '...'
    }
  }

  return excerpt
}

// 生成文章索引
function generateArticlesIndex() {
  const postsDir = path.join(__dirname, '../public/posts')
  const outputFile = path.join(__dirname, '../public/posts/articles-index.json')

  console.log('Scanning markdown files...')

  // 加载图片列表
  const imagesList = loadImagesList()

  // 扫描所有 markdown 文件
  const markdownFiles = scanMarkdownFiles(postsDir)
  console.log(`Found ${markdownFiles.length} markdown files`)

  // 解析每个文件的前置信息
  const articlesIndex = []

  for (const filePath of markdownFiles) {
    try {
      const fullPath = path.join(postsDir, filePath)
      const content = fs.readFileSync(fullPath, 'utf-8')

      const { frontMatter, content: markdownContent } = parseFrontMatter(content)

      // 从文件路径提取分类
      const pathParts = filePath.split('/')
      const category = pathParts.length > 1 ? pathParts[0] : 'uncategorized'
      const slug = filePath.replace('.md', '')

      // 计算字数和阅读时间
      const wordCount = calculateWordCount(markdownContent)
      const readTime = calculateReadTime(wordCount)

      // 生成摘要
      const excerpt = frontMatter.excerpt || generateExcerpt(markdownContent)

      // 生成文章信息
      const articleInfo = {
        path: filePath,
        slug,
        category,
        title: frontMatter.title || path.basename(filePath, '.md'),
        date: formatDate(frontMatter.date || ''),
        tags: frontMatter.tags || [],
        categories: Array.isArray(frontMatter.categories)
          ? frontMatter.categories
          : [frontMatter.categories || category],
        author: frontMatter.author || 'CircleCoder',
        excerpt: excerpt,
        cover: frontMatter.cover || getRandomImage(imagesList),
        wordCount: wordCount,
        readTime: readTime,
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
