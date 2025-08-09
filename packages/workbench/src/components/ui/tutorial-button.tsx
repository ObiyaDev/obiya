import { MotiaTutorial, TutorialConfig } from '@motiadev/tutorial'
import { Button } from '@motiadev/ui'
import { Book } from 'lucide-react'
import { useStreamItem } from '@motiadev/stream-client-react'
import { FlowConfigResponse } from '@/types/flow'
import { useEffect } from 'react'
import { useFlowStore } from '@/stores/use-flow-store'

export const TutorialButton: React.FC = () => {
  const selectFlowId = useFlowStore((state) => state.selectFlowId)
  const { data: flowConfig } = useStreamItem<FlowConfigResponse>({
    streamName: '__motia.flowsConfig',
    groupId: 'default',
    id: 'basic-tutorial',
  })

  const kickStartTutorial = (resetState = false) => {
    const tutorialStepIndex = new URLSearchParams(window.location.search).get('tutorialStepIndex')
    const config: TutorialConfig = {
      resetSkipState: resetState,
    }
    if (tutorialStepIndex && !resetState) {
      config.initialStepIndex = Number(tutorialStepIndex)
    }
    selectFlowId('basic-tutorial')
    setTimeout(() => {
      MotiaTutorial.start(config)
    }, 300)

    if (resetState) {
      const url = new URL(window.location.href)
      url.searchParams.delete('tutorialStepIndex')
      window.history.replaceState(null, '', url)
    }
  }

  useEffect(() => {
    if (import.meta.env.MOTIA_TUTORIAL_DISABLED || !flowConfig) {
      console.log('Tutorial disabled or flow not found')
      return
    }

    kickStartTutorial()

    return () => MotiaTutorial.close()
  }, [import.meta.env.MOTIA_TUTORIAL_DISABLED, flowConfig])

  if (import.meta.env.MOTIA_TUTORIAL_DISABLED) {
    return null
  }

  return (
    <Button variant="accent" size="sm" onClick={() => kickStartTutorial(true)}>
      <Book className="h-4 w-4" />
      <span>Tutorial</span>
    </Button>
  )
}
