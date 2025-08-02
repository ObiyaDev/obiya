export const cloudApiBaseUrl = process.env.MOTIACLOUD_API_BASE_URL || 'http://localhost:3000'
export const cloudApiWsUrl = process.env.MOTIACLOUD_API_WS_URL || 'ws://localhost:3000'
// TODO [motia-deploy] use production endpoints
// export const cloudApiBaseUrl = process.env.MOTIACLOUD_API_BASE_URL || 'https://motia-hub-api.motiahub.com'
// export const cloudApiWsUrl = process.env.MOTIACLOUD_API_WS_URL || 'wss://motia-hub-api.motiahub.com'

export const cloudEndpoints = {
  createDeployment: `${cloudApiBaseUrl}/deployments`,
  startDeployment: `${cloudApiBaseUrl}/deployments/start`,
  upload: `${cloudApiBaseUrl}/deployments/upload`,
}
