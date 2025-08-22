import { Request, Response } from 'express'
import { MotiaServer } from '@motiadev/core'
import { buildValidation } from './build/build-validation'
import { StreamingDeploymentListener } from './new-deployment/listeners/streaming-deployment-listener'
import { build } from './new-deployment/build'
import { uploadArtifacts } from './new-deployment/upload-artifacts'
import { deploy } from './new-deployment/deploy'
import { CliContext } from './config-utils'
import { v4 as uuidv4 } from 'uuid'
import { DeploymentStreamManager } from './new-deployment/streams/deployment-stream'

export const deployEndpoints = (server: MotiaServer) => {
  const { app, lockedData } = server
  
  // Criar stream de deployment se não existir
  const deploymentStream = lockedData.createStream({
    filePath: '__deployment',
    hidden: true,
    config: {
      name: 'deployment-status',
      baseConfig: { storageType: 'default' },
      schema: null as never,
    },
  })()
  
  const deploymentManager = new DeploymentStreamManager(deploymentStream)

  // Start streaming deployment
  app.post('/cloud/deploy/start', async (req: Request, res: Response) => {
    try {
      const { deploymentToken, deploymentId, envs } = req.body

      // Validate required parameters
      if (!deploymentToken || !deploymentId) {
        return res.status(400).json({
          success: false,
          error: 'deploymentToken and deploymentId are required'
        })
      }

      // Generate unique deployment session ID
      const sessionId = deploymentId || uuidv4()
      
      // Create context for endpoint environment
      const context = new CliContext()
      
      // Reset deployment state for new deployment
      await deploymentManager.startDeployment(deploymentToken, sessionId)
      
      // Create streaming listener with Motia Stream
      const listener = new StreamingDeploymentListener(sessionId, deploymentStream)
      
      // Return immediately with stream info for client tracking
      res.json({
        success: true,
        message: 'Deployment started',
        deploymentId: sessionId,
        streamName: 'deployment-status',
        groupId: 'deployments',
        itemId: sessionId
      })
      
      // Execute deployment asynchronously
      setImmediate(async () => {
        try {
        // Start build phase
        await listener.startBuildPhase()
        
        const builder = await build(listener)
        const isValid = buildValidation(builder, listener)
        
        if (!isValid) {
          await listener.onBuildErrors(listener.getErrors())
          return
        }
        
        await listener.completeBuildPhase()
        
        // Start upload phase
        await listener.startUploadPhase()
        
        await uploadArtifacts(builder, deploymentToken, listener)
        
        await listener.completeUploadPhase()
        
        // Start deploy phase
        await listener.startDeployPhase()
        
        await deploy({
          envVars: envs,
          deploymentId: sessionId,
          deploymentToken: deploymentToken,
          builder,
          listener,
          context,
        })
        
        } catch (error: any) {
          console.error('Deployment failed:', error)
          
          // Update stream with error
          if (listener) {
            await listener.onDeployError(error.message)
          }
        }
      })
      
    } catch (error: any) {
      console.error('Failed to start deployment:', error)
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  })
  
  // Get deployment status by ID
  app.get('/cloud/deploy/status/:deploymentId', async (req: Request, res: Response) => {
    try {
      const { deploymentId } = req.params
      const deployment = await deploymentManager.getDeployment(deploymentId)
      
      if (!deployment) {
        return res.status(404).json({
          success: false,
          error: 'Deployment not found'
        })
      }
      
      res.json({
        success: true,
        deployment
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  })

}