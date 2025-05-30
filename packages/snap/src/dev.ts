// packages/snap/src/dev.ts
import {
  createEventManager,
  createMermaidGenerator,
  createServer,
  createStateAdapter,
  createStepHandlers,
  globalLogger,
} from '@motiadev/core'
import path from 'path'
import { generateLockedData, getStepFiles } from './generate-locked-data'
import { FileStateAdapter } from '@motiadev/core/dist/src/state/adapters/default-state-adapter'
import { createDevWatchers } from './dev-watchers'
import { stateEndpoints } from './dev/state-endpoints'
import { activatePythonVenv } from './utils/activate-python-env'
import { getProjectIdentifier, trackEvent, identifyUser, getUserIdentifier } from './utils/analytics'

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

export const dev = async (port: number, isVerbose: boolean, enableMermaid: boolean): Promise<void> => {
  const baseDir = process.cwd()

  identifyUser()

  const stepFiles = getStepFiles(baseDir)
  const hasPythonFiles = stepFiles.some((file) => file.endsWith('.py'))
  
  trackEvent('dev_server_started', {
    port,
    verbose_mode: isVerbose,
    mermaid_enabled: enableMermaid,
    has_python_files: hasPythonFiles,
    total_step_files: stepFiles.length,
    project_name: getProjectIdentifier(baseDir)
  })

  if (hasPythonFiles) {
    console.log('⚙️ Activating Python environment...')
    activatePythonVenv({ baseDir, isVerbose })
    trackEvent('python_environment_activated')
  }

  const lockedData = await generateLockedData(baseDir)

  const eventManager = createEventManager()
  const state = createStateAdapter({
    adapter: 'default',
    filePath: path.join(baseDir, '.motia'),
  })
  await (state as FileStateAdapter).init()

  const config = { isVerbose }
  const motiaServer = await createServer(lockedData, eventManager, state, config)
  const motiaEventManager = createStepHandlers(lockedData, eventManager, state)
  const watcher = createDevWatchers(lockedData, motiaServer, motiaEventManager, motiaServer.cronManager)

  // Initialize mermaid generator
  if (enableMermaid) {
    const mermaidGenerator = createMermaidGenerator(baseDir)
    mermaidGenerator.initialize(lockedData)
    trackEvent('mermaid_generator_initialized')
  }

  watcher.init()

  stateEndpoints(motiaServer, state)
  
  // Add analytics endpoint for frontend
  motiaServer.app.get('/motia/analytics/user', (req, res) => {
    res.json({
      userId: getUserIdentifier(),
      projectId: getProjectIdentifier(baseDir),
      motiaVersion: process.env.npm_package_dependencies_motia || 'unknown',
      
    })
  })

  motiaServer.server.listen(port)
  console.log('🚀 Server ready and listening on port', port)
  console.log(`🔗 Open http://localhost:${port}/ to open workbench 🛠️`)
  
  trackEvent('dev_server_ready', {
    port,
    flows_count: lockedData.flows?.length || 0,
    steps_count: lockedData.activeSteps?.length || 0
  })

  const { applyMiddleware } = process.env.__MOTIA_DEV_MODE__
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@motiadev/workbench/middleware')
    : // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@motiadev/workbench/dist/middleware')
  await applyMiddleware(motiaServer.app)

  // 6) Gracefully shut down on SIGTERM
  process.on('SIGTERM', async () => {
    globalLogger.info('🛑 Shutting down...')
    trackEvent('dev_server_shutdown', { reason: 'SIGTERM' })
    motiaServer.server.close()
    await watcher.stop()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    globalLogger.info('🛑 Shutting down...')
    trackEvent('dev_server_shutdown', { reason: 'SIGINT' })
    motiaServer.server.close()
    await watcher.stop()
    process.exit(0)
  })
}
