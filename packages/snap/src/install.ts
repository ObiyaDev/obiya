import path from 'path'
import fs from 'fs'
import { executeCommand } from './utils/executeCommand'
import { activatePythonVenv } from '@motiadev/core'

export const install = async (isVerbose: boolean = false): Promise<void> => {
  const baseDir = process.cwd()
  const venvPath = path.join(baseDir, 'python_modules')
  console.log('📦 Installing Python dependencies...', venvPath)
  const isWindows = process.platform === 'win32'
  const venvBinPath = path.join(venvPath, isWindows ? 'Scripts' : 'bin')

  try {
    // Check if virtual environment exists
    if (!fs.existsSync(venvPath)) {
      console.log('📦 Creating Python virtual environment...')
      await executeCommand('python3 -m venv python_modules', baseDir)
    }

    // Install requirements
    console.log('📥 Installing Python dependencies...')
    const pipPath = path.join(venvBinPath, isWindows ? 'pip.exe' : 'pip')

    activatePythonVenv({ baseDir, isVerbose })
    
    const coreRequirementsPath = path.join(baseDir, 'node_modules', 'motia', 'dist', 'requirements.txt')
    if (fs.existsSync(coreRequirementsPath)) {
      if (isVerbose) {
        console.log('📄 Using core requirements from:', coreRequirementsPath)
      }
      await executeCommand(`pip install -r "${coreRequirementsPath}"`, baseDir)
    } else {
      console.warn(`⚠️ Core requirements not found at: ${coreRequirementsPath}`)
    }

    // Check for project-specific requirements
    const localRequirements = path.join(baseDir, 'requirements.txt')
    if (fs.existsSync(localRequirements)) {
      if (isVerbose) {
        console.log('📄 Using project requirements from:', localRequirements)
      }
      await executeCommand(`pip install -r "${localRequirements}"`, baseDir)
    }

    console.info('✅ Installation completed successfully!')
  } catch (error) {
    console.error('❌ Installation failed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}
