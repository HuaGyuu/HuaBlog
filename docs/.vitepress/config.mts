import { defineConfig } from 'vitepress'

import { noteSidebar } from './sidebar.mts'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  base: '/HuaBlog/',
  title: "HuaBlog",
  description: "HuaBlog —— 专注 Java 后端技术的个人博客",

  // 更友好的 URL
  cleanUrls: true,

  // 本地搜索（无需任何配置即可在网页右上角出现搜索框）
  themeConfig: {
    // 站点头部导航
    nav: [
      { text: '首页', link: '/' },
      { text: '博客笔记', link: '/note/' },
      { text: '闲话', link: '/says/describe' },
      { text: '个人介绍', link: '/personal-introduction' }
    ],

    // 侧边栏（左侧目录），支持多级树形分组（可折叠）
    sidebar: {
      // `/note/` 侧边栏由 noteSidebar() 自动扫描 docs/note 目录生成
      '/note/': noteSidebar(),
      '/says': [
        {
          text: '闲话',
          items: [
            { text: '说明', link: '/says/describe' },
            { text: '人生的意义', link: '/says/人生的意义' },
            { text: '被爱的前提', link: '/says/被爱的前提' }
          ]
        }
      ],
      '/': [
        {
          text: '',
          items: [
            { text: '个人介绍', link: '/personal-introduction' }
          ]
        }
      ]
    },

    // 页面页脚（每个文档页底部显示的上一页/下一页）
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    // 页脚版权信息
    footer: {
      message: '基于 VitePress 构建 · 专注 Java 后端',
      copyright: 'Copyright © 2026 HuaBlog'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'medium'
      }
    },

    // 右上角的社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/HuaGyuu/HuaBlog' }
    ],

    // 本地全文搜索
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '找不到相关结果',
            resetButtonTitle: '清除查询',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },

    // 回到顶部
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  },

  // 开启“最后更新”时间戳（配合 git）
  lastUpdated: true
})