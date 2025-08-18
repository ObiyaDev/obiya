import { Step } from '../../types'

export const createCSharpEventStep = (config: Partial<Step['config']> = {}, filePath?: string): Step => ({
  id: 'test-csharp-event-step',
  filePath: filePath || 'test-csharp-event-step.cs',
  config: {
    type: 'event',
    name: 'Test C# Event Step',
    subscribes: ['test-topic'],
    flows: ['test-flow'],
    ...config,
  },
})

export const createCSharpApiStep = (config: Partial<Step['config']> = {}, filePath?: string): Step => ({
  id: 'test-csharp-api-step',
  filePath: filePath || 'test-csharp-api-step.cs',
  config: {
    type: 'api',
    name: 'Test C# API Step',
    path: '/test',
    method: 'POST',
    flows: ['test-flow'],
    ...config,
  },
})

export const createCSharpCronStep = (config: Partial<Step['config']> = {}, filePath?: string): Step => ({
  id: 'test-csharp-cron-step',
  filePath: filePath || 'test-csharp-cron-step.cs',
  config: {
    type: 'cron',
    name: 'Test C# Cron Step',
    cron: '* * * * *',
    flows: ['test-flow'],
    ...config,
  },
})

export const createCSharpUiStep = (config: Partial<Step['config']> = {}, filePath?: string): Step => ({
  id: 'test-csharp-ui-step',
  filePath: filePath || 'test-csharp-ui-step.cs',
  config: {
    type: 'ui',
    name: 'Test C# UI Step',
    flows: ['test-flow'],
    ...config,
  },
})
