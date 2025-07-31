export const cloudApiBaseUrl = process.env.MOTIACLOUD_API_BASE_URL || 'https://motia-hub-api.motiahub.com'

export const cloudEndpoints = {
  createDeployment: `${cloudApiBaseUrl}/deployments`,
  startDeployment: `${cloudApiBaseUrl}/deployments/start`,
  upload: `${cloudApiBaseUrl}/deployments/upload`,
}
