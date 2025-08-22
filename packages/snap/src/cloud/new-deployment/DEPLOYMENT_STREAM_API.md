# Deployment Stream API Documentation

## Overview
The deployment system uses Motia Streams for real-time updates during the deployment process. This replaces direct WebSocket connections with a unified streaming architecture.

## Stream Configuration

### Stream Name
`deployment-status`

### Stream Structure
- **Group ID**: `active` (always use this value)
- **Item ID**: `current` (single deployment at a time)

## Data Structure

```typescript
interface DeploymentData {
  id: string                    // Always "current"
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
  deploymentId?: string         // Unique deployment identifier
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
  "groupId": "active",
  "itemId": "current"
}
```

### Get Deployment Status
```http
GET /cloud/deploy/status
```

**Response:**
```json
{
  "success": true,
  "deployment": {
    "id": "current",
    "status": "building",
    "phase": "build",
    "progress": 45,
    "message": "Building step: api-handler",
    // ... rest of DeploymentData
  }
}
```

## Frontend Integration

### Using React Hook (Recommended)
```typescript
import { useStreamItem } from '@motiadev/stream-client-react'

const MyDeploymentComponent = () => {
  const { data: deployment } = useStreamItem<DeploymentData>({
    streamName: 'deployment-status',
    groupId: 'active',
    itemId: 'current'
  })

  // deployment will auto-update in real-time
  if (!deployment) return <div>No deployment in progress</div>
  
  return (
    <div>
      <p>Status: {deployment.status}</p>
      <p>Progress: {deployment.progress}%</p>
      <p>{deployment.message}</p>
    </div>
  )
}
```

### Using Stream Client Directly
```typescript
import { Stream } from '@motiadev/stream-client-browser'

const client = new Stream('ws://localhost:3000')
const subscription = client.subscribeItem<DeploymentData>(
  'deployment-status',
  'active', 
  'current'
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
  
  const { data: deployment } = useStreamItem<DeploymentData>({
    streamName: 'deployment-status',
    groupId: 'active',
    itemId: 'current'
  })

  const startDeployment = async () => {
    setIsDeploying(true)
    
    const response = await fetch('/cloud/deploy/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deploymentToken: 'token-123',
        deploymentId: `deploy-${Date.now()}`,
        envs: {}
      })
    })
    
    if (!response.ok) {
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

1. **Single Deployment**: Only one deployment can run at a time. The stream always uses `itemId: 'current'`.

2. **Real-time Updates**: The stream automatically provides real-time updates via WebSocket. No polling needed.

3. **Persistence**: Deployment state is persisted and will survive page refreshes.

4. **Logs**: Each phase has separate log arrays (`buildLogs`, `uploadLogs`, `deployLogs`) that accumulate during the process.

5. **Reset**: A new deployment automatically resets the previous state.

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
- **Empty deployment**: The stream returns `null` if no deployment exists yet
- **Stale data**: Check if the deployment completed/failed and needs to be restarted