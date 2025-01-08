import path from 'path'
import fs from 'fs'
import { parse } from 'yaml'
import { createServer } from './server'
import { createWorkflowHandlers } from './workflow-handlers'
import { createEventManager } from './event-manager'
import { Config } from './config.types'
import { buildWorkflows } from './flow-builder'

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

export const dev = async (): Promise<void> => {
  const configYaml = fs.readFileSync(path.join(process.cwd(), 'config.yml'), 'utf8')
  const config: Config = parse(configYaml)
  const workflowSteps = await buildWorkflows()
  const eventManager = createEventManager()
  const { server, socketServer } = await createServer(config, workflowSteps, eventManager)

  createWorkflowHandlers(workflowSteps, eventManager, config.state, socketServer)

  // 6) Gracefully shut down on SIGTERM
  process.on('SIGTERM', async () => {
    console.log('[playground/index] Shutting down...')
    server.close()
    process.exit(0)
  })
}
