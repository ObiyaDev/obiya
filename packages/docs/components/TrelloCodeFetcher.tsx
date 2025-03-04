'use client'

import { useState, useEffect } from 'react'
import { GitHubCodeFetcher, GitHubCodeContent } from './GitHubCodeFetcher'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Tab } from 'fumadocs-ui/components/tabs'

interface TrelloCodeFetcherProps {
  fileName: string
}

const REPO = 'MotiaDev/motia-examples'
const BRANCH = 'main'
const BASE_PATH = 'examples/trello-flow/steps'

const customStyle = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: 'transparent',
    margin: 0,
    padding: '1em',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: 'transparent',
    border: 'none'
  },
}

export function TrelloCodeFetcher({ fileName }: TrelloCodeFetcherProps) {
  return <GitHubCodeFetcher repo={REPO} path={`${BASE_PATH}/${fileName}`} branch={BRANCH} />
}

export function TrelloCodeContent({ fileName }: TrelloCodeFetcherProps) {
  return <GitHubCodeContent repo={REPO} path={`${BASE_PATH}/${fileName}`} branch={BRANCH} />
}

export function TrelloTab({ value, tab }: { value: string; tab: string }) {
  const [code, setCode] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [copied, setCopied] = useState<boolean>(false)
  const fileName = `${value}.step.ts`

  useEffect(() => {
    const fetchCode = async () => {
      setLoading(true)
      try {
        const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${BASE_PATH}/${fileName}`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch code: ${response.status} ${response.statusText}`)
        }

        const text = await response.text()
        setCode(text)
      } catch (err) {
        console.error('Error fetching code from GitHub:', err)
        setCode('// Error fetching code from GitHub')
      } finally {
        setLoading(false)
      }
    }

    fetchCode()
  }, [fileName])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900/20 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2.5"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2.5"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2.5"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2.5"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    )
  }

  // Use SyntaxHighlighter with cleaner styling
  return (
    <Tab value={tab} className="p-0">
      <div className="max-h-[400px] overflow-auto relative group bg-gray-50 dark:bg-gray-900/10 rounded-md">
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 p-1.5 rounded-md bg-gray-200/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Copy code"
        >
          {copied ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
        <SyntaxHighlighter
          language="typescript"
          style={customStyle}
          showLineNumbers={true}
        wrapLines={true}
        wrapLongLines
        customStyle={{
            margin: 0,
            height: '100%',
            width: '100%',
            overflow: 'auto',
            background: '#0f0d19',
            scrollbarWidth: 'none',
        }}
        lineNumberStyle={{
            color: '#6f6c81',
            opacity: 0.5,
            paddingRight: '1em',
            textAlign: 'right',
            userSelect: 'none',
        }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </Tab>
  )
}

interface TrelloCodeTabsProps {
  items: string[]
  defaultTab?: string
}

export function TrelloCodeTabs({ items, defaultTab }: TrelloCodeTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || items[0])

  return (
    <div className="mt-6">
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => setActiveTab(item)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === item
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <TrelloCodeFetcher fileName={`${activeTab}.step.ts`} />
      </div>
    </div>
  )
}
