import { Button } from '@motiadev/ui';
import { Loader2, Save } from 'lucide-react';
import React, { useState } from 'react';
import { JsonEditor } from '../endpoints/json-editor';
import { StateItem } from './hooks/states-hooks';

type Props = {
  state: StateItem
}

export const StateEditor: React.FC<Props> = ({ state }) => {
  const [isRequestLoading, setIsRequestLoading] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [jsonValue, setJsonValue] = useState(JSON.stringify(state.value, null, 2))

  const handleSave = async () => {
    if(isValid) {
    setIsRequestLoading(true)
    await fetch('/motia/state', {
      method: 'POST',
      body: JSON.stringify({ key: state.key, groupId: state.groupId, value: JSON.parse(jsonValue) }),
    })
    setIsRequestLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <JsonEditor value={jsonValue} onChange={(value) => {setJsonValue(value)}} onValidate={setIsValid} />
      <Button
        className="w-fit"
        onClick={handleSave}
        variant="accent"
        data-testid="endpoint-play-button"
        disabled={isRequestLoading || !isValid}
      >
        {isRequestLoading ? <Loader2 className="animate-spin" /> : <Save />} Save
      </Button>

    </div>
  )
}
