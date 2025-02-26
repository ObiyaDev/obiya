'use client';

import React from 'react';

interface CodeSandboxProps {
  code?: string;
  language?: 'typescript' | 'javascript';
  title?: string;
  height?: string;
  repoPath?: string;
}

const CodeSandbox: React.FC<CodeSandboxProps> = ({
  height = '400px',
  repoPath = 'trello-flow',
}) => {

  return (
    <div className="relative" style={{ height }}>
      <div className="absolute top-0 left-0 right-0 z-10 p-1 px-3 flex items-center justify-between min-h-[40px] border border-[#310E7F] bg-gradient-to-r from-[#160045] from-[57.54%] to-transparent to-[84.95%]">
        <div className="flex items-center">
          <img 
            src="/icons/typescript.svg"
            alt="TypeScript"
            width={14} 
            height={14} 
          />
          <span className="ml-2 text-gray-300 text-sm">
            {repoPath} example (CodeSandbox)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <a 
            href="https://github.com/MotiaDev/motia-examples/tree/main/examples/trello-flow" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#1a1828] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </a>
          <a 
            href="https://codesandbox.io/s/github/MotiaDev/motia-examples/tree/main/examples/trello-flow" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#1a1828] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1.5L1.5 7.5V16.5L12 22.5L22.5 16.5V7.5L12 1.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22.5V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22.5 7.5L12 12L1.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.5 16.5L12 12L22.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 1.5L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>

      <div className="pt-[40px] h-full">
        <iframe
          src="https://codesandbox.io/embed/github/MotiaDev/motia-examples/tree/main/examples/trello-flow?fontsize=14&hidenavigation=0&theme=dark"
          style={{
            width: '100%',
            height: `calc(${height} - 40px)`,
            border: 0,
            borderRadius: '4px',
            overflow: 'hidden',
          }}
          title="MotiaDev/motia-examples: trello-flow"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        ></iframe>
      </div>

      <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-950/30 to-transparent pointer-events-none flex items-center justify-center">
        <div className="text-white/50 font-medium">Render placeholder</div>
      </div>
    </div>
  );
};

export default CodeSandbox; 