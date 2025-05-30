import React, { PropsWithChildren } from 'react'
import { useLogListener } from '../hooks/use-log-listener'
import { useAnalytics } from '@/lib/analytics'

export const RootMotia: React.FC<PropsWithChildren> = ({ children }) => {
  useLogListener()
  useAnalytics()

  return children
}
