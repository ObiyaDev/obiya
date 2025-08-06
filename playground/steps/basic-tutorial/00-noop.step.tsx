import React from 'react'
import { BaseHandle, Position } from 'motia/workbench'

export default function StartTestFlow() {
  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-600 text-white">
      <div className="text-sm font-medium mb-2">Test Flow</div>
      <button
        onClick={() => {
          fetch('/basic-tutorial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'test' }),
          })
        }}
        className="px-3 py-1 bg-blue-600 rounded text-sm cursor-pointer"
      >
        Trigger Flow
      </button>
      <BaseHandle type="source" position={Position.Bottom} />
    </div>
  )
}
