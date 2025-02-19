import fs from 'fs';
import path from 'path';
import { MotiaServer, StateAdapter } from '@motiadev/core'

export const stateEndpoints = (server: MotiaServer, stateAdapter: StateAdapter) => {
  const { app } = server;

  app.get('/motia/state', async (_, res) => {
    try {
      const traceIds = await stateAdapter.traceIds()
      res.json(traceIds)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  })

  app.get('/motia/state/:traceId', async (req, res) => {
    const { traceId } = req.params

    try {
      const keys = await stateAdapter.keys(traceId)
      res.json(keys)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  })

  app.get('/motia/state/:traceId/:key', async (req, res) => {
    const { traceId, key } = req.params

    try {
      const value = await stateAdapter.get(traceId, key)
      res.json(value)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  })
}

export const workflowConfigEndpoints = (server: MotiaServer, baseDir: string) => {
  const { app } = server;

  app.post('/flows/:id/config', async (req, res) => {
    const { id } = req.params;
    const config = req.body;
    const configPath = path.join(baseDir, '.motia', `${id}.workflow.config.json`);

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      res.status(200).send({ message: 'Workflow config saved' });
    } catch (error) {
      console.error("Error saving workflow config:", error);
      res.status(500).json({ error: 'Failed to save workflow config' });
    }
  });


};