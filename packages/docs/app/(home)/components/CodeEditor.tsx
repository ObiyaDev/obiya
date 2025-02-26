import React, { useEffect, useState } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeViewer,
  SandpackThemeProvider,
  SandpackPredefinedTemplate,
} from "@codesandbox/sandpack-react";
import type { SandpackTheme } from "@codesandbox/sandpack-react";
import Image from 'next/image';
import { codeExamples, CodeLanguage } from './codeExamples';

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
    lineHeight: '16px',
  },
};

interface CodeEditorProps {
  code?: string;
  language?: CodeLanguage;
  title?: string;
  height?: string;
  onLanguageChange?: (language: CodeLanguage) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language = 'typescript',
  height = '300px',
  onLanguageChange
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>(language);
  const [exampleCode, setExampleCode] = useState<string>(code || '');

  useEffect(() => {
    // Set the code based on the selected language
    if (!code) {
      setExampleCode(codeExamples[selectedLanguage] || codeExamples.typescript);
    } else {
      setExampleCode(code);
    }
  }, [selectedLanguage, code]);

  const handleLanguageChange = (lang: CodeLanguage) => {
    setSelectedLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  return (
    <div className="w-full h-full rounded-md rounded-t-[16px] overflow-hidden bg-[#0f0d19]">
      <div className="w-full h-full overflow-hidden">
        <div className="p-1 px-3 flex items-center justify-between min-h-[75px] rounded-t-[16px] border border-[#310E7F] bg-gradient-to-r from-[#160045] from-[57.54%] to-transparent to-[84.95%]">
          <div className="flex gap-1">
            <button 
              onClick={() => handleLanguageChange('javascript')}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 transition-colors ${selectedLanguage === 'javascript' ? 'rounded-[4px] bg-[#3B1296] shadow-[0px_71px_20px_0px_rgba(18,0,61,0.02),0px_46px_18px_0px_rgba(18,0,61,0.15),0px_26px_15px_0px_rgba(18,0,61,0.50),0px_11px_11px_0px_rgba(18,0,61,0.85),0px_3px_6px_0px_rgba(18,0,61,0.98)] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Image src="/icons/javascript.svg" alt="JavaScript" width={14} height={14} />
              <span className="ml-1">JavaScript</span>
            </button>
            <button 
              onClick={() => handleLanguageChange('typescript')}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 transition-colors ${selectedLanguage === 'typescript' ? 'rounded-[4px] bg-[#3B1296] shadow-[0px_71px_20px_0px_rgba(18,0,61,0.02),0px_46px_18px_0px_rgba(18,0,61,0.15),0px_26px_15px_0px_rgba(18,0,61,0.50),0px_11px_11px_0px_rgba(18,0,61,0.85),0px_3px_6px_0px_rgba(18,0,61,0.98)] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Image src="/icons/typescript.svg" alt="TypeScript" width={14} height={14} />
              <span className="ml-1">TypeScript</span>
            </button>
            <button 
              onClick={() => handleLanguageChange('python')}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 transition-colors ${selectedLanguage === 'python' ? 'rounded-[4px] bg-[#3B1296] shadow-[0px_71px_20px_0px_rgba(18,0,61,0.02),0px_46px_18px_0px_rgba(18,0,61,0.15),0px_26px_15px_0px_rgba(18,0,61,0.50),0px_11px_11px_0px_rgba(18,0,61,0.85),0px_3px_6px_0px_rgba(18,0,61,0.98)] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Image src="/icons/python.svg" alt="Python" width={14} height={14} />
              <span className="ml-1">Python</span>
            </button>
            <button 
              onClick={() => handleLanguageChange('ruby')}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 transition-colors ${selectedLanguage === 'ruby' ? 'rounded-[4px] bg-[#3B1296] shadow-[0px_71px_20px_0px_rgba(18,0,61,0.02),0px_46px_18px_0px_rgba(18,0,61,0.15),0px_26px_15px_0px_rgba(18,0,61,0.50),0px_11px_11px_0px_rgba(18,0,61,0.85),0px_3px_6px_0px_rgba(18,0,61,0.98)] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Image src="/icons/ruby.svg" alt="Ruby" width={14} height={14} />
              <span className="ml-1">Ruby</span>
            </button>
            <button 
              onClick={() => handleLanguageChange('java')}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 transition-colors ${selectedLanguage === 'java' ? 'rounded-[4px] bg-[#3B1296] shadow-[0px_71px_20px_0px_rgba(18,0,61,0.02),0px_46px_18px_0px_rgba(18,0,61,0.15),0px_26px_15px_0px_rgba(18,0,61,0.50),0px_11px_11px_0px_rgba(18,0,61,0.85),0px_3px_6px_0px_rgba(18,0,61,0.98)] text-white' : 'text-gray-400 hover:text-white'}`}
              disabled
            >
              <Image src="/icons/java.svg" alt="Java" width={13} height={14} />
              <span className="ml-1">Java (comming soon)</span>
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
            template={selectedLanguage === 'typescript' ? "react-ts" : "react" as SandpackPredefinedTemplate}
            customSetup={{
              entry: `index.${selectedLanguage === 'typescript' ? 'ts' : selectedLanguage === 'javascript' ? 'js' : selectedLanguage === 'python' ? 'py' : selectedLanguage === 'ruby' ? 'rb' : 'java'}`,
              dependencies: {
                "openai": "latest",
                "zod": "latest"
              }
            }}

          >
            <SandpackThemeProvider theme={darkTheme}>
              <SandpackLayout>
                <SandpackCodeViewer 
                  showLineNumbers
                  code={exampleCode}
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