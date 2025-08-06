import { TutorialStep } from '@/types/tutorial'
import { v4 as uuidv4 } from 'uuid'

export const introStep: TutorialStep = {
  elementXpath: 'body',
  segmentId: 'basic',
  title: 'Welcome to Workbench',
  description: `Workbench is a development tool provided by the Motia's ecosystem, from here you'll be able to visualize your flows and observe their behavior`,
  id: uuidv4(),
}
