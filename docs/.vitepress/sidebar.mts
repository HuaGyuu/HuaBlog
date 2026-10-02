import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * 目录名 → 侧边栏显示名映射。
 * 未在此字典中注册的目录名会原样显示。
 * 如需调整展示文案，直接改这里即可，无需改动目录结构。
 */
const DIR_TITLES: Record<string, string> = {
  // java: '☕ Java',
  // base: 'Java 基础',
  // concurrent: '并发',
  // project: '🛠️ 项目实战',
  // misc: '📝 随笔',
}

/**
 * 侧边栏根分组入口名。`note` 下的 `index.md` 作为该分组的置顶导读项。
 */
const NOTE_TITLE = '博客笔记'
const NOTE_ROOT = 'note'

/** 展开/折叠配置：按目录相对根目录的路径（/）设定。默认展开。 */
const COLLAPSED_DIRS = new Set<string>(['project', 'misc'])

/**
 * 扫描时跳过的目录名（例如存放图片等资源的 `assets`），
 * 这些目录不会出现在侧边栏里，里面的 Markdown 也不会被收录。
 */
const IGNORED_DIRS = new Set<string>(['assets'])

interface SidebarItem {
  text: string
  link?: string
  collapsed?: boolean
  items?: SidebarItem[]
}

/** 去除 Markdown 转义与标记，得到用于显示标题的纯文本。 */
function stripMarkdown(text: string): string {
  return text
    // 去掉行内代码符与加粗/斜体星号（下划线 `_` 常见于技术标题，予以保留）
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*(?=\S)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim()
}

/** 读取 .md 文件的第一个 `# 一级标题`，未找到则回退为文件名。 */
function titleOf(filePath: string, fallback: string): string {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const match = /^#\s+(.+)$/m.exec(content)
    if (match && match[1].trim()) {
      return stripMarkdown(match[1])
    }
  } catch {
    // 忽略读取失败，回退到文件名
  }
  return fallback
}

/** 对目录下的 .md 文件/子目录排序：目录在前，文件按名称排序。 */
function compare(a: PathInfo, b: PathInfo): number {
  if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
  return a.name.localeCompare(b.name, 'zh-CN')
}

interface PathInfo {
  name: string
  full: string
  rel: string
  isDir: boolean
}

/** 递归扫描 note 目录，构建多级侧边栏树。 */
function buildForDir(absDir: string, relDir: string): SidebarItem[] {
  const entries = readdirSync(absDir)
    .filter((name) => !name.startsWith('.') && !name.endsWith('.js'))
    .filter((name) => !(relDir === NOTE_ROOT && name === 'index.md'))
    .filter((name) => !IGNORED_DIRS.has(name))
    .map((name): PathInfo => {
      const full = join(absDir, name)
      const rel = join(relDir, name)
      const isDir = statSync(full).isDirectory()
      if (!isDir && !name.endsWith('.md')) return null as unknown as PathInfo
      return { name, full, rel, isDir }
    })
    .filter(Boolean) as PathInfo[]

  entries.sort(compare)

  const items: SidebarItem[] = []
  for (const entry of entries) {
    if (entry.isDir) {
      const children = buildForDir(entry.full, entry.rel).filter((c) => 'items' in c || 'link' in c)
      items.push({
        text: DIR_TITLES[entry.name] ?? entry.name,
        collapsed: COLLAPSED_DIRS.has(entry.name),
        items: children,
      })
    } else {
      const relWithoutExt = entry.rel.replace(/\.md$/, '')
      items.push({
        text: titleOf(entry.full, entry.name.replace(/\.md$/, '')),
        link: '/' + relWithoutExt.replace(/\\/g, '/'),
      })
    }
  }

  return items
}

/**
 * 生成 `/note/` 侧边栏。
 * 顶层 `note/index.md` 作为导读项置顶，其余内容递归扫描。
 */
export function noteSidebar(): SidebarItem[] {
  const noteDir = join(process.cwd(), 'docs', NOTE_ROOT)

  // 顶层 index.md（若有）作为「笔记导读」置顶
  const indexFile = join(noteDir, 'index.md')
  const intro: SidebarItem[] = []
  try {
    if (statSync(indexFile).isFile()) {
      intro.push({
        text: '📄 笔记导读',
        link: `/${NOTE_ROOT}/`,
      })
    }
  } catch {
    // note 目录不存在或无 index.md，忽略
  }

  // 顶层 index.md 已在 buildForDir 中排除（作为导读项置顶）
  const children = buildForDir(noteDir, NOTE_ROOT)

  return [
    {
      text: NOTE_TITLE,
      items: [...intro, ...children],
    },
  ]
}
