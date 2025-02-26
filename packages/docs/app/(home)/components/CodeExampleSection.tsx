'use client';

import React from 'react';
import CodeSandbox from '@/app/(home)/components/CodeSandbox';

export default function CodeExampleSection() {
  return (
    <div className="py-20 bg-gradient-to-b from-indigo-950/30 to-transparent">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 rounded-full bg-indigo-900 text-purple-300 text-sm font-mono mb-4">
            code-first
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, Powerful API
          </h2>
          <p className="text-gray-300 mx-auto max-w-2xl text-lg">
            Build automation workflows with TypeScript or JavaScript. 
            Define your workflow configuration and handlers with a clean, 
            intuitive API that feels natural to developers.
          </p>
        </div>

        {/* Code Example */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-8">
          <CodeSandbox 
            height="600px"
            repoPath="trello-flow"
          />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-gray-900/30 p-6 rounded-lg">
            <div className="text-indigo-400 text-2xl mb-3">🔄</div>
            <h3 className="text-xl font-semibold text-white mb-2">Type-Safe Workflows</h3>
            <p className="text-gray-400">
              Full TypeScript support with Zod validation ensures your data is always properly structured.
            </p>
          </div>
          <div className="bg-gray-900/30 p-6 rounded-lg">
            <div className="text-indigo-400 text-2xl mb-3">🧩</div>
            <h3 className="text-xl font-semibold text-white mb-2">Modular Architecture</h3>
            <p className="text-gray-400">
              Build complex workflows from simple, reusable components that are easy to test and maintain.
            </p>
          </div>
          <div className="bg-gray-900/30 p-6 rounded-lg">
            <div className="text-indigo-400 text-2xl mb-3">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-2">Async First</h3>
            <p className="text-gray-400">
              Built for modern JavaScript with full support for async/await and Promise-based operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 