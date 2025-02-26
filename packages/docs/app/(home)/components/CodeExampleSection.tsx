'use client';

import React from 'react';
import CodeSandbox from '@/app/(home)/components/CodeSandbox';
import Typography from '@/components/Typography';

export default function CodeExampleSection() {
  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 rounded-full bg-indigo-900 text-purple-300 text-sm font-mono mb-4">
            code-first
          </div>
          <Typography 
            variant="title" 
            as="h2" 
            className="text-[54px] text-white mb-6"
          >
            Simple, Powerful API
          </Typography>
          <Typography 
            variant="description" 
            as="p" 
            className="text-gray-300 mx-auto max-w-2xl text-lg"
          >
            Build automation workflows with TypeScript or JavaScript. 
            Define your workflow configuration and handlers with a clean, 
            intuitive API that feels natural to developers.
          </Typography>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 mb-8">
          <CodeSandbox 
            height="600px"
            repoPath="trello-flow"
          />
        </div>
      </div>
    </div>
  );
} 