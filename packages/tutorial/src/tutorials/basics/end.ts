import { TutorialStep } from '@/types/tutorial'

const segmentId = 'basic'

export const endSteps: TutorialStep[] = [
  {
    elementXpath: 'div.rf__wrapper',
    segmentId,
    title: 'Congratulations 🎉',
    description: `You've completed our Motia basics tutorial. You've learned about Motia's primitives, how to navigate around Workbench, and how to use core features from the Motia framework (state management, logging, and tracing). We recommend you give our core concepts a read if you wish to learn further about Motia. Don't forget to join our Discord community or tag us in socials to show us what you've built with Motia. We are an open source project, so feel free to raise your issues or suggestions in our Github repo. Thanks for giving Motia a try!`,
    id: 'end',
  },
]
