import { init, track, identify, Identify, Types } from '@amplitude/analytics-node'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import os from 'os'

init('ab2408031a38aa5cb85587a27ecfc69c', {
  logLevel: Types.LogLevel.None,
})

const getProjectName = (baseDir: string): string => {
  const packageJsonPath = path.join(baseDir, 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    return packageJson.name || path.basename(baseDir)
  }

  return 'unknown'
}

export const getUserIdentifier = (): string => {
  const userInfo = `${os.userInfo().username}${os.hostname()}`
  return crypto.createHash('sha256').update(userInfo).digest('hex').substring(0, 16)
}

export const getProjectIdentifier = (baseDir: string): string => {
  try {
    const projectId = crypto.createHash('sha256').update(getProjectName(baseDir)).digest('hex').substring(0, 16)
    return projectId
  } catch (error) {
    const fallbackId = crypto.createHash('sha256').update(baseDir).digest('hex').substring(0, 16)
    return fallbackId
  }
}

export const getSessionIdentifier = (): string => {
  return `${getProjectName(process.cwd())}-${Date.now()}`
}

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    const baseDir = process.cwd()
    track(eventName, properties, {
      user_id: getUserIdentifier(),
      app_version: process.env.npm_package_version || 'unknown',
      extra: {
        project_id: getProjectIdentifier(baseDir),
        motia_version: process.env.npm_package_dependencies_motia || 'unknown',
        source: 'backend',
      }
    })
  } catch (error) {
    // Silently fail to not disrupt dev server
  }
}

export const identifyUser = () => {
  try {
    const identifyObj = new Identify()
    identify(identifyObj, {
      user_id: getUserIdentifier(),
      extra: {
          os_name: os.platform() === 'darwin' ? 'macOS' : os.platform() === 'win32' ? 'Windows' : 'Linux',
      },
      os_version: os.release(),
      platform: os.platform(),
      device_model: os.type(),
      device_manufacturer: os.machine(),
      device_brand: os.platform() === 'darwin' ? 'Apple' : os.platform() === 'win32' ? 'Microsoft' : 'Unknown',
    })
  } catch (error) {
    // Silently fail
  }
} 