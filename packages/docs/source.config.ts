import { defineDocs, defineConfig } from 'fumadocs-mdx/config'
import { remarkInstall } from 'fumadocs-docgen'
import mdxMermaid from 'mdx-mermaid'

export const { docs, meta } = defineDocs({
  dir: 'content/docs',
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      [mdxMermaid, { output: 'svg' }],
      [
        remarkInstall,
        {
          packageManagers: [
            {
              name: 'pnpm',
              command: (cmd: string) => cmd.replace('npm install', 'pnpm add'),
            },
            {
              name: 'yarn',
              command: (cmd: string) => cmd.replace('npm install', 'yarn add'),
            },
            {
              name: 'npm',
              command: (cmd: string) => cmd,
            },
            {
              name: 'bun',
              command: (cmd: string) => cmd.replace('npm install', 'bun add').replace('-D', '--dev'),
            },
          ],
        },
      ],
    ],
  },
})
