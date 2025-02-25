'use client';

import React, { useState } from 'react';
import CodeEditor from '@/app/(home)/components/CodeEditor';

export default function CodeExampleSection() {
  const [activeTab, setActiveTab] = useState<'workflow' | 'handler'>('workflow');

  const workflowCode = `import { z } from 'zod';

export const config = {
  type: 'event',
  name: 'Auto-Reply to Support Emails',
  subscribers: ['email.received'],
  emits: ['email.send'],
  flows: ['email-support'],
  input: z.object({ 
    subject: z.string(), 
    body: z.string(), 
    from: z.string() 
  }),
};`;

  const handlerCode = `export const handler = async (inputData, context) => {
  const { subject, body, from } = inputData;
  const { emit, logger } = context;
  
  // Analyze sentiment with OpenAI
  const sentimentResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ 
      role: "user", 
      content: \`Analyze the sentiment of the following text: \${body}\`
    }],
  });
  
  // Generate appropriate response based on sentiment
  const responseContent = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ 
      role: "user", 
      content: \`Write a helpful response to this support email: \${body}\`
    }],
  });
  
  // Send the response email
  await emit('email.send', {
    to: from,
    subject: \`Re: \${subject}\`,
    body: responseContent.choices[0].message.content
  });
  
  return { success: true };
};`;

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

        {/* Code Tabs */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-8">
          <div className="flex space-x-4 mb-4">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'workflow'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('workflow')}
            >
              Workflow Config
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'handler'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('handler')}
            >
              Handler Logic
            </button>
          </div>

          {/* Code Editor */}
          <div className="transition-all duration-300">
            {activeTab === 'workflow' ? (
              <CodeEditor 
                code={workflowCode} 
                language="typescript" 
                title="workflow.ts" 
                height="300px" 
              />
            ) : (
              <CodeEditor 
                code={handlerCode} 
                language="typescript" 
                title="handler.ts" 
                height="400px" 
              />
            )}
          </div>
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