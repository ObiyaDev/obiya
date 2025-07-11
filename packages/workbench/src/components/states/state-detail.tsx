import { Sidebar } from '@/components/sidebar/sidebar'
import { X } from 'lucide-react'
import React from 'react'
import JsonView from 'react18-json-view'
import { StateItem } from './hooks/states-hooks'
import { StateEditor } from './state-editor'

type Props = {
  state: StateItem
  onClose: () => void
}

export const StateDetail: React.FC<Props> = ({ state, onClose }) => {
  return (
    <Sidebar
      onClose={onClose}
      title="State details"
      subtitle={`${state.groupId} ${state.key}`}
      tabs={[
        {
          label: 'Details',
          content: <JsonView src={state.value} />,
        },
        {
          label: 'Editor',
          content: <StateEditor state={state} />,
        },
      ]}
      actions={[
        { icon: <X />, onClick: onClose, label: 'Close' },
      ]}
    />
  )
}
