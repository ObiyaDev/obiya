import path from 'path'
import fs from 'fs'
import { getPythonConfig } from './python/get-python-config'
import { WorkflowStep } from './config.types'
import { FlowConfig } from '../wistro.types'

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

export const parseWorkflowFolder = async (
  folderPath: string,
  nextWorkflows: WorkflowStep[],
): Promise<WorkflowStep[]> => {
  const workflowFolderItems = fs.readdirSync(folderPath, { withFileTypes: true })
  const workflowFiles = workflowFolderItems
    .filter(({ name }) => name.endsWith('.step.ts') || name.endsWith('.step.js') || name.endsWith('.step.py'))
    .map(({ name }) => name)
  const workflowRootFolders = workflowFolderItems.filter((item) => item.isDirectory())
  let workflows: WorkflowStep[] = [...nextWorkflows]

  console.log('[Workflows] Building workflows', workflowFiles)

  for (const file of workflowFiles) {
    const isPython = file.endsWith('.py')

    if (isPython) {
      console.log('[Workflows] Building Python workflow', file)
      const config = await getPythonConfig(path.join(folderPath, file))
      console.log('[Workflows] Python workflow config', config)
      workflows.push({ config, file, filePath: path.join(folderPath, file) })
    } else {
      console.log('[Workflows] Building Node workflow', file)
      const module = require(path.join(folderPath, file))
      if (!module.config) {
        console.log(`[Workflows] skipping file ${file} as it does not have a valid config`)
        continue
      }
      console.log(
        `[Workflows] processing component ${module.config.name} for workflow ${module.config.tags?.workflow ?? file}`,
      )
      const config = module.config as FlowConfig<any>
      workflows.push({ config, file, filePath: path.join(folderPath, file) })
    }
  }

  if (workflowRootFolders.length > 0) {
    for (const folder of workflowRootFolders) {
      console.log('[Workflows] Building nested workflows in path', path.join(folderPath, folder.name))
      const nestedWorkflows = await parseWorkflowFolder(path.join(folderPath, folder.name), [])
      workflows = [...workflows, ...nestedWorkflows]
    }
  }

  return workflows
}

export const buildWorkflows = async (): Promise<WorkflowStep[]> => {
  // Read all workflow folders under /flows directory
  const flowsDir = path.join(process.cwd(), 'steps')

  // Check if steps directory exists
  if (!fs.existsSync(flowsDir)) {
    console.log('No /steps directory found')
    return []
  }

  // Get all workflow folders
  return parseWorkflowFolder(flowsDir, [])
}
