const path = require('path')
const Redis = require('ioredis')

// Add ts-node registration before dynamic imports
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

function parseArgs(arg) {
  try {
    return JSON.parse(arg)
  } catch {
    return arg
  }
}

class StateAdapter {
  ttl = 300 // Default TTL in seconds

  constructor(traceId, stateConfig) {
    this.traceId = traceId
    this.client = new Redis(stateConfig)
    this.prefix = 'wistro:state'
    this.rootKey = this._makeRootKey()

    if (stateConfig.ttl) {
      this.ttl = stateConfig.ttl
    }
  }

  async get(path) {
    const fullPath = this._makePath(path)
    const value = await this.client.call('JSON.GET', this.rootKey, fullPath)

    if (typeof value === 'string') {
      return JSON.parse(value)[0]
    }
    return value ?? null
  }

  async preparePath(path) {
    const segments = path.split('.')
    let currentKey = ''

    for (const segment of segments) {
      currentKey = currentKey ? `${currentKey}.${segment}` : segment
      const exists = await this.client.call('JSON.GET', this.rootKey, currentKey)
      if (!exists) {
        await this.client.call('JSON.SET', this.rootKey, currentKey, '{}')
      }
    }
  }

  async set(path, value) {
    const nextPath = this._makePath(path)

    await this.preparePath(nextPath)

    await this.client
      .multi()
      .call('JSON.SET', this.rootKey, nextPath, JSON.stringify(value))
      .call('EXPIRE', this.rootKey, this.ttl)
      .exec()
  }

  async delete(path) {
    if (!path) {
      await this.client.del(this.rootKey)
      return
    }

    const fullPath = this._makePath(path)
    await this.client.call('JSON.DEL', this.rootKey, fullPath)
  }

  async clear() {
    await this.client.del(this.rootKey)
  }

  async cleanup() {
    await this.client.quit()
  }

  _makeRootKey() {
    return `${this.prefix}:${this.traceId}`
  }

  _makePath(path) {
    return `$${path ? '.' + path : ''}`
  }
}

async function runTypescriptModule(filePath, args) {
  try {
    // Remove pathToFileURL since we'll use require
    const module = require(path.resolve(filePath))

    // Check if the specified function exists in the module
    if (typeof module.executor !== 'function') {
      throw new Error(`Function executor not found in module ${filePath}`)
    } else if (!args?.stateConfig) {
      throw new Error('State adapter config is required')
    }

    const { stateConfig, ...event } = args
    const traceId = event.traceId
    const state = new StateAdapter(traceId, stateConfig)
    const context = { traceId, state }
    const emit = async (data) => {
      process.send?.(data)
    }

    // Call the function with provided arguments
    await module.executor(event.data, emit, context)
  } catch (error) {
    console.error('Error running TypeScript module:', error)
    process.exit(1)
  }
}

const [, , filePath, arg] = process.argv

if (!filePath) {
  console.error('Usage: node nodeRunner.js <file-path> <arg>')
  process.exit(1)
}

runTypescriptModule(filePath, parseArgs(arg)).catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
