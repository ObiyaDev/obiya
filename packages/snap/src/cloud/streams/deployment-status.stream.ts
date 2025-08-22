import { z } from 'zod'

const DeploymentStatusSchema = z.object({
  id: z.string().describe('Unique identifier for this deployment phase'),
  deploymentId: z.string().describe('Overall deployment identifier'),
  status: z.enum(['pending', 'building', 'uploading', 'deploying', 'completed', 'failed'])
    .describe('Current status of the deployment phase'),
  phase: z.enum(['build', 'upload', 'deploy'])
    .describe('Which phase of deployment this update relates to'),
  progress: z.number().min(0).max(100)
    .describe('Progress percentage (0-100) for current phase'),
  message: z.string()
    .describe('Human-readable status message'),
  logs: z.array(z.string()).optional()
    .describe('Array of log messages for this phase'),
  error: z.string().optional()
    .describe('Error message if status is failed'),
  timestamp: z.number()
    .describe('Unix timestamp when this update was created'),
  stepName: z.string().optional()
    .describe('Name of the specific step being processed'),
  stepProgress: z.number().min(0).max(100).optional()
    .describe('Progress within the current step'),
  totalSteps: z.number().optional()
    .describe('Total number of steps in this phase'),
  currentStep: z.number().optional()
    .describe('Current step number (1-based)'),
  metadata: z.record(z.any()).optional()
    .describe('Additional metadata for this deployment update')
})

export default {
  name: 'deployment-status',
  schema: DeploymentStatusSchema,
  baseConfig: { 
    storageType: 'default' as const 
  }
}

export type DeploymentStatusData = z.infer<typeof DeploymentStatusSchema>