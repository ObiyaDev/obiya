# Deployment Stream API Documentation

## Overview
The deployment system uses Motia Streams for real-time updates during the deployment process. This replaces direct WebSocket connections with a unified streaming architecture.

## Stream Configuration

### Stream Name
`deployment-status`

### Stream Structure
- **Group ID**: `deployments` (always use this value)
- **Item ID**: The unique `deploymentId` for each deployment

## Data Structure

```typescript
interface DeploymentData {
  id: string                    // Matches deploymentId
  status: 'idle' | 'building' | 'uploading' | 'deploying' | 'completed' | 'failed'
  phase: 'build' | 'upload' | 'deploy' | null
  progress: number               // 0-100
  message: string               // Current status message
  buildLogs: string[]           // Logs from build phase
  uploadLogs: string[]          // Logs from upload phase  
  deployLogs: string[]          // Logs from deploy phase
  error?: string                // Error message if failed
  startedAt?: number            // Unix timestamp
  completedAt?: number          // Unix timestamp
  deploymentToken?: string      // Token used for deployment
  deploymentId: string          // Unique deployment identifier (required)
  metadata?: {
    totalSteps: number
    completedSteps: number
    environment?: string
  }
}
```

## API Endpoints

### Start Deployment
```http
POST /cloud/deploy/start
Content-Type: application/json

{
  "deploymentToken": "your-token",
  "deploymentId": "unique-id",
  "envs": {
    "KEY": "value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deployment started",
  "deploymentId": "unique-id",
  "streamName": "deployment-status",
  "groupId": "deployments",
  "itemId": "unique-id"
}
```

### Get Deployment Status by ID
```http
GET /cloud/deploy/status/:deploymentId
```

### Get All Deployments History
```http
GET /cloud/deploy/history
```

**Response (Single Deployment):**
```json
{
  "success": true,
  "deployment": {
    "id": "deploy-123",
    "deploymentId": "deploy-123",
    "status": "building",
    "phase": "build",
    "progress": 45,
    "message": "Building step: api-handler",
    // ... rest of DeploymentData
  }
}
```

**Response (History):**
```json
{
  "success": true,
  "deployments": [
    {
      "id": "deploy-123",
      "deploymentId": "deploy-123",
      "status": "completed",
      "startedAt": 1234567890,
      "completedAt": 1234567990,
      // ... rest of DeploymentData
    },
    // ... more deployments
  ]
}
```

## Frontend Integration

### Using React Hook (Recommended)
```typescript
import { useStreamItem } from '@motiadev/stream-client-react'

const MyDeploymentComponent = ({ deploymentId }: { deploymentId: string }) => {
  const { data: deployment } = useStreamItem<DeploymentData>({
    streamName: 'deployment-status',
    groupId: 'deployments',
    itemId: deploymentId
  })

  // deployment will auto-update in real-time
  if (!deployment) return <div>Deployment not found</div>
  
  return (
    <div>
      <p>Deployment ID: {deployment.deploymentId}</p>
      <p>Status: {deployment.status}</p>
      <p>Progress: {deployment.progress}%</p>
      <p>{deployment.message}</p>
    </div>
  )
}
```

### Monitoring All Deployments
```typescript
import { useStreamGroup } from '@motiadev/stream-client-react'

const DeploymentsList = () => {
  const { data: deployments } = useStreamGroup<DeploymentData>({
    streamName: 'deployment-status',
    groupId: 'deployments'
  })

  return (
    <div>
      {deployments.map(deployment => (
        <div key={deployment.id}>
          <p>{deployment.deploymentId}: {deployment.status}</p>
        </div>
      ))}
    </div>
  )
}
```

### Using Stream Client Directly
```typescript
import { Stream } from '@motiadev/stream-client-browser'

const deploymentId = 'deploy-123' // Your deployment ID
const client = new Stream('ws://localhost:3000')
const subscription = client.subscribeItem<DeploymentData>(
  'deployment-status',
  'deployments', 
  deploymentId
)

subscription.addChangeListener((deployment) => {
  if (deployment) {
    console.log('Deployment updated:', deployment)
    // Update UI
  }
})

// Cleanup when done
client.close()
```

## Deployment Phases

### 1. Build Phase (`status: 'building'`)
- Compiles and bundles all steps
- Creates routers for different languages
- Progress: 0-33%

### 2. Upload Phase (`status: 'uploading'`)
- Uploads built artifacts to cloud
- Transfers step bundles and routers
- Progress: 34-66%

### 3. Deploy Phase (`status: 'deploying'`)
- Provisions cloud resources
- Configures endpoints and routes
- Progress: 67-99%

### 4. Completion (`status: 'completed' | 'failed'`)
- Final status with results
- Progress: 100%
- Check `error` field if failed

## Status Flow
```
idle → building → uploading → deploying → completed/failed
```

## Error Handling

Check the `error` field when `status === 'failed'`:
```typescript
if (deployment.status === 'failed') {
  console.error('Deployment failed:', deployment.error)
  // Show error to user
}
```

## Example: Complete Integration

```typescript
import { useState } from 'react'
import { useStreamItem } from '@motiadev/stream-client-react'

export const DeploymentUI = () => {
  const [isDeploying, setIsDeploying] = useState(false)
  const [currentDeploymentId, setCurrentDeploymentId] = useState<string | null>(null)
  
  const { data: deployment } = useStreamItem<DeploymentData>({
    streamName: 'deployment-status',
    groupId: 'deployments',
    itemId: currentDeploymentId || ''
  })

  const startDeployment = async () => {
    setIsDeploying(true)
    const deploymentId = `deploy-${Date.now()}`
    
    const response = await fetch('/cloud/deploy/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deploymentToken: 'token-123',
        deploymentId,
        envs: {}
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      setCurrentDeploymentId(data.deploymentId)
    } else {
      setIsDeploying(false)
      // Handle error
    }
  }

  // Auto-update isDeploying based on stream
  useEffect(() => {
    if (deployment?.status === 'completed' || deployment?.status === 'failed') {
      setIsDeploying(false)
    }
  }, [deployment?.status])

  return (
    <div>
      <button onClick={startDeployment} disabled={isDeploying}>
        Deploy
      </button>
      
      {deployment && deployment.status !== 'idle' && (
        <div>
          <h3>Deployment Progress</h3>
          <p>Phase: {deployment.phase}</p>
          <p>Status: {deployment.status}</p>
          <progress value={deployment.progress} max="100" />
          <p>{deployment.message}</p>
          
          {deployment.error && (
            <div className="error">{deployment.error}</div>
          )}
        </div>
      )}
    </div>
  )
}
```

## Important Notes

1. **Multiple Deployments**: Each deployment has a unique `deploymentId` that tracks its individual state and history.

2. **Real-time Updates**: The stream automatically provides real-time updates via WebSocket. No polling needed.

3. **Persistence**: Deployment states are persisted and will survive page refreshes. All deployments are kept in history.

4. **Logs**: Each phase has separate log arrays (`buildLogs`, `uploadLogs`, `deployLogs`) that accumulate during the process.

5. **History**: Access deployment history via `/cloud/deploy/history` endpoint or by subscribing to the entire `deployments` group.

## Testing

To test the stream connection:
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:3000')
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data.streamName === 'deployment-status') {
    console.log('Deployment update:', data)
  }
}
```

## Troubleshooting

- **No updates**: Ensure WebSocket connection is established (check Network tab)
- **Deployment not found**: The stream returns `null` if the deployment ID doesn't exist
- **Wrong deployment**: Make sure you're subscribing with the correct `deploymentId`
- **History**: Use `/cloud/deploy/history` to see all past deployments