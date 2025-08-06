import { Tutorial } from '@/types/tutorial'
import { introStep } from './intro'
import { apiSteps } from './api-step'

export const basicTutorial: Tutorial = {
  id: 'basic',
  title: 'Getting Started with Motia',
  description: 'A quick tour of the Motia ecosystem, learn how to use Motia to build your first flow',
  steps: [
    introStep,
    ...apiSteps,
    // NOTE: ... import more steps here
  ],
}
