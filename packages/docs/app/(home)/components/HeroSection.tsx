'use client';

import Link from 'next/link';
import styles from '../page.module.css';
import { FaClipboard, FaCheck } from 'react-icons/fa';

interface HeroSectionProps {
  copied: boolean;
  onCopy: () => Promise<void>;
}

export default function HeroSection({ copied, onCopy }: HeroSectionProps) {
  return (
    <div className={"w-full max-w-7xl mx-auto flex flex-col md:flex-row py-10 px-4 gap-12 items-start relative " + styles.firstSection}>
      
      {/* Left Section - Headings */}
      <div className="md:w-1/2 flex flex-col justify-center relative overflow-hidden z-10">
        <h1 
          className="text-white mb-6 relative z-10 font-gt-walsheim"
          style={{
            fontWeight: 500,
            fontSize: '54px',
            lineHeight: '54px',
            letterSpacing: '-0.04em',
          }}
        >
          Code-first framework
          <br />
          for intelligent workflows
        </h1>
      </div>

      {/* Right Section - Description and CTAs */}
      <div className="md:w-1/2 flex flex-col justify-center z-10">
        <p 
          className="text-white mb-8 max-w-md font-dm-mono"
          style={{
            fontWeight: 400,
            fontSize: '20px',
            lineHeight: '24px',
          }}
        >
          Write in any language. Automate
          anything. From AI agents to backend
          automation, Motia runs event-driven
          workflows with zero overhead.
        </p>

        {/* Command example */}
        <div className="bg-black rounded-lg p-3 mb-8 text-gray-300 font-mono text-sm flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">$</span>
            <span>npx motia create -t default -n new-project</span>
          </div>
          <button 
            onClick={onCopy} 
            className="ml-2 text-gray-400 hover:text-white transition-colors"
            aria-label={copied ? "Copied" : "Copy to clipboard"}
          >
            {copied ? <FaCheck /> : <FaClipboard />}
          </button>
        </div>

        {/* CTAs */}
        <div className="flex gap-4">
          <Link
            href="/start-building"
            className="bg-white text-purple-900 py-3 px-6 rounded-md font-semibold hover:bg-gray-100 transition"
          >
            Start building
          </Link>
          <Link
            href="/docs"
            className="bg-transparent border border-purple-500 text-white py-3 px-6 rounded-md font-semibold hover:bg-purple-900 transition"
          >
            Docs
          </Link>
        </div>

        {/* Workflow graphical elements */}
        <div className="mt-12 relative">
          {/* This is a placeholder for the workflow graphic elements shown */}
          {/* In a real implementation, you would use actual SVGs or components here */}
        </div>
      </div>
    </div>
  );
} 