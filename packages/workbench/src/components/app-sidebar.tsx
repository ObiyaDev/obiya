import { useListFlows } from '@/hooks/use-list-flows'
import { File, Logs, Workflow } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from './ui/sidebar'
import { Badge } from './ui/badge'
import { useLogs } from '../stores/use-logs'

export const AppSidebar = () => {
  const { flows } = useListFlows()
  const { pathname } = useLocation()
  const isActive = (flowId: string) => pathname.includes(`/flow/${flowId}`)
  const unreadLogsCount = useLogs((state) => state.unreadLogsCount)

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarGroup>
        <SidebarGroupLabel>Motia</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuButton asChild isActive={pathname === '/logs'}>
              <Link to="/logs">
                <Logs />
                <span className="text-lg">Logs</span>
                {pathname !== '/logs' && unreadLogsCount > 0 && <Badge variant="red-rounded">{unreadLogsCount}</Badge>}
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton asChild isActive={pathname === '/states'}>
              <Link to="/states">
                <File />
                <span className="text-lg">States</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarGroupContent>
        <SidebarGroupLabel>Flows</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {flows.map((flow) => (
              <SidebarMenuButton asChild isActive={isActive(flow.id)}>
                <Link to={`/flow/${flow.id}`} className="flex items-center gap-2" data-testid={`flow-link-${flow.id}`}>
                  <Workflow />
                  <span className="text-lg">{flow.name}</span>
                </Link>
              </SidebarMenuButton>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarFooter />
    </Sidebar>
  )
}
