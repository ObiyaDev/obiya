import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { distDir, maxUploadSize } from '../constants'
import { cloudApi } from '../cloud-api'

export const upload = async (deploymentToken: string, fileName: string, onProgress: (progress: number) => void) => {
  const filePath = path.join(distDir, fileName)
  const fileStats = fs.statSync(filePath)

  // TODO [motia-deploy] use presigned url
  // const { presignedUrl } = await cloudApi.upload({
  await cloudApi.upload({
    deploymentToken,
    originalName: fileName,
    size: fileStats.size,
    mimetype: 'application/zip',
  })

  // TODO [motia-deploy] simulate upload
  await new Promise((resolve) => setTimeout(resolve, 2000))
  // await uploadToPresignedUrl(filePath, presignedUrl, fileStats.size, onProgress)
}

const uploadToPresignedUrl = async (
  filePath: string,
  presignedUrl: string,
  fileSize: number,
  onProgress: (progress: number) => void,
): Promise<void> => {
  const fileName = path.basename(filePath)
  const fileStream = fs.createReadStream(filePath)

  await axios.put(presignedUrl, fileStream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Length': fileSize,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
    maxContentLength: maxUploadSize,
    maxBodyLength: maxUploadSize,

    onUploadProgress(progressEvent) {
      const progress = progressEvent.progress ?? 0
      onProgress(Math.round(progress * 100))
    },
  })
}
