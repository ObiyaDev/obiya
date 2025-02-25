import React from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackThemeProvider,
  SandpackPredefinedTemplate,
} from "@codesandbox/sandpack-react";
import type { SandpackTheme } from "@codesandbox/sandpack-react";
import Image from 'next/image';

const darkTheme: SandpackTheme = {
  colors: {
    surface1: '#0f0d19', // Darker background
    surface2: '#12111a', // Slightly lighter for contrast
    surface3: '#1a1828',
    clickable: '#6f6c81',
    base: '#d4d2dc',
    disabled: '#3a3550',
    hover: '#4a445f',
    accent: '#6c59ff',
    error: '#ff453a',
    errorSurface: '#2a1c1c',
  },
  syntax: {
    plain: '#d4d2dc',
    comment: '#6c7d9c',
    keyword: '#c678dd', // Purple for keywords
    tag: '#a5d6ff',
    punctuation: '#d4d2dc',
    definition: '#4bbee3', // Blue for functions
    property: '#4bbee3',
    static: '#d4b860',
    string: '#98c379', // Green for strings
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    mono: '"JetBrains Mono", "Fira Mono", "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    size: '13px',
    lineHeight: '20px',
  },
};

// Sample OpenAI code to match the screenshot
const openaiSampleCode = `import { OpenAI } from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  type: 'event',
  name: 'Auto-Reply to Support Emails',
  subscribers: ['email.received'],
  emits: ['email.send'],
  flows: ['email-support'],
  input: z.object({ subject: z.string(), body: z.string(), from: z.string() }),
};

export const handler = async (inputData, context) => {
  const { subject, body, from } = inputData;
  const { emit, logger } = context;
  
  const sentimentResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: 
      \`Analyze the sentiment of the following text: \${body}\`}],
  });
`;

interface CodeEditorProps {
  code?: string;
  language?: string;
  title?: string;
  height?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code = openaiSampleCode,
  language = 'typescript',
  title = 'JavaScript',
  height = '300px'
}) => {
  return (
    <div className="w-full h-full rounded-md overflow-hidden border border-gray-800 bg-[#0f0d19]">
      <div className="w-full h-full overflow-hidden">
        <div className="bg-[#12111a] p-1 px-3 flex items-center justify-between border-b border-gray-800">
          <div className="flex gap-1">
            <button className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md transition-colors ${language === 'javascript' ? 'bg-[#1a1828] text-white' : 'text-gray-400 hover:text-white'}`}>
              <Image src="/icons/javascript.svg" alt="JavaScript" width={14} height={14} />
              <span className="ml-1">JavaScript</span>
            </button>
            <button className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md transition-colors ${language === 'typescript' ? 'bg-[#1a1828] text-white' : 'text-gray-400 hover:text-white'}`}>
              <Image src="/icons/typescript.svg" alt="TypeScript" width={14} height={14} />
              <span className="ml-1">TypeScript</span>
            </button>
            <button className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md transition-colors ${language === 'python' ? 'bg-[#1a1828] text-white' : 'text-gray-400 hover:text-white'}`}>
              <Image src="/icons/python.svg" alt="Python" width={14} height={14} />
              <span className="ml-1">Python</span>
            </button>
            <button className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md transition-colors ${language === 'ruby' ? 'bg-[#1a1828] text-white' : 'text-gray-400 hover:text-white'}`}>
              <Image src="/icons/ruby.svg" alt="Ruby" width={14} height={14} />
              <span className="ml-1">Ruby</span>
            </button>
            <button className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md transition-colors ${language === 'java' ? 'bg-[#1a1828] text-white' : 'text-gray-400 hover:text-white'}`}>
              <Image src="/icons/java.svg" alt="Java" width={13} height={14} />
              <span className="ml-1">Java</span>
            </button>
          </div>
          <button className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#1a1828] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
        <div style={{ height, position: 'relative' }}>
          <SandpackProvider 
            template={language === 'typescript' ? "react-ts" : "react" as SandpackPredefinedTemplate}
            customSetup={{
              entry: `index.${language === 'typescript' ? 'ts' : 'js'}`,
              dependencies: {
                "openai": "latest",
                "zod": "latest"
              }
            }}
            files={{
              [`index.${language === 'typescript' ? 'ts' : 'js'}`]: {
                code,
                active: true
              }
            }}
          >
            <SandpackThemeProvider theme={darkTheme}>
              <SandpackLayout>
                <SandpackCodeEditor
                  showLineNumbers={true}
                  showInlineErrors
                  readOnly={true}
                  wrapContent
                  style={{ height: "100%", width: "100%" }}
                />
              </SandpackLayout>
            </SandpackThemeProvider>
          </SandpackProvider>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;