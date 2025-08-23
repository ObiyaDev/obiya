import type { ChokidarOptions } from 'chokidar'

export interface WatcherConfig {
  usePolling?: boolean
  maxDepth?: number
  additionalIgnorePatterns?: string[]
}

export const defaultWatcherConfig: WatcherConfig = {
  usePolling: false,
  maxDepth: 10,
  additionalIgnorePatterns: [],
}

export const getWatcherOptions = (config: WatcherConfig, ignoredPaths: Array<string | RegExp>): ChokidarOptions => {
  const allIgnoredPaths = [...ignoredPaths, ...(config.additionalIgnorePatterns || [])]

  return {
    ignoreInitial: true,
    persistent: true,
    ignored: allIgnoredPaths,
    usePolling: config.usePolling || false,
    interval: config.usePolling ? 1000 : undefined,
    binaryInterval: config.usePolling ? 3000 : undefined,
    atomic: true,
    depth: config.maxDepth || 10,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
    alwaysStat: false,
    followSymlinks: false,
  }
}
