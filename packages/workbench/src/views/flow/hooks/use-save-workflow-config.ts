import { useCallback } from 'react';

export const useSaveWorkflowConfig = (flowId: string) => {
  const saveConfig = useCallback(async (config: any) => {
    await fetch(`/flows/${flowId}/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
  }, [flowId]);

  return { saveConfig };
};