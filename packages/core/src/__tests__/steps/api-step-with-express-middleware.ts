import { ApiRequest, ApiResponse, ApiRouteConfig, ApiRouteHandler, FlowContext } from '../../types'
import express from 'express'
import { corsMiddleware, loggerMiddleware } from '../../middlewares'

// Example Express middleware
const expressJsonValidator = express.json({ strict: true })
const expressRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Simple rate limiting example
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  console.log(`Request from IP: ${ip}`)
  next()
}

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'api-with-express-middleware',
  emits: ['TEST_EVENT'],
  path: '/test-express-middleware',
  method: 'POST',
  middleware: [
    loggerMiddleware,
    corsMiddleware(['*']),
    // Use Express middleware directly
    expressJsonValidator,
    expressRateLimiter
  ]
}

export const handler: ApiRouteHandler = async (req: ApiRequest, ctx: FlowContext): Promise<ApiResponse> => {
  ctx.logger.info('Processing api-with-express-middleware', req)
  
  return {
    status: 200,
    body: { 
      message: 'Success',
      receivedData: req.body
    }
  }
} 