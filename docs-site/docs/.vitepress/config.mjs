import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Mind Cursor',
  description: 'Navigate the web with your eyes and voice',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Install', link: '/install' }
    ],
    sidebar: [
      {
        text: 'Documentation',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Installation Guide', link: '/install' }
        ]
      }
    ]
  }
})
