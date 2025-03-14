import { ApiRequest, ApiResponse, ApiRouteConfig, ApiRouteHandler, FlowContext } from '../../types'
import { authMiddleware, corsMiddleware, loggerMiddleware, rateLimitMiddleware } from '../../middlewares'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'api-step-with-middleware',
  emits: ['TEST_EVENT'],
  path: '/test-middleware',
  method: 'POST',
  middleware: [
    loggerMiddleware,
    corsMiddleware(['*']),
    rateLimitMiddleware(100, 60000), // 100 requests per minute
    authMiddleware('admin'),
  ],
}

export const handler: ApiRouteHandler = async (req: ApiRequest, ctx: FlowContext): Promise<ApiResponse> => {
  ctx.logger.info('Processing api-step-with-middleware', req)

  return {
    status: 200,
    body: {
      message: 'Success',
      receivedData: req.body,
    },
  }
}
