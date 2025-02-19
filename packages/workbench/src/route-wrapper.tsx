import React, { PropsWithChildren } from 'react';
import { AppSidebar } from './components/app-sidebar';
import { SidebarProvider } from './components/ui/sidebar';
import { ReactFlowProvider } from '@xyflow/react';

export const RouteWrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <SidebarProvider>
    <ReactFlowProvider>
      <AppSidebar />
      {children}
    </ReactFlowProvider>
  </SidebarProvider>
);