import { ApiMiddleware } from '../../types'

export const loggerMiddleware: ApiMiddleware = (req, res, next) => {
  console.log(`[Middleware] Request to ${req.path} with body:`, req.body)
  next()
}

export const authMiddleware = (requiredRole: string): ApiMiddleware => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header is required' })
      return
    }

    // Simple example - in real world, you'd validate the token
    // and check the user's role against the required role
    if (!authHeader.includes(requiredRole)) {
      res.status(403).json({ error: `Required role: ${requiredRole}` })
      return
    }

    next()
  }
}

export const rateLimitMiddleware = (limit: number, windowMs: number): ApiMiddleware => {
  const requests: Record<string, number[]> = {}

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || 'unknown-ip'
    const ipStr = Array.isArray(ip) ? ip[0] : ip

    const now = Date.now()
    if (!requests[ipStr]) {
      requests[ipStr] = []
    }

    requests[ipStr] = requests[ipStr].filter((time) => now - time < windowMs)

    if (requests[ipStr].length >= limit) {
      res.status(429).json({ error: 'Too many requests, please try again later' })
      return
    }

    requests[ipStr].push(now)
    next()
  }
}

export const corsMiddleware = (allowedOrigins: string[]): ApiMiddleware => {
  return (req, res, next) => {
    const origin = req.headers.origin

    if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin as string))) {
      res.setHeader('Access-Control-Allow-Origin', Array.isArray(origin) ? origin[0] : origin)
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    }

    next()
  }
}
