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
          className="text-white mb-4 max-w-md font-dm-mono"
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
        <div className="w-[342px] rounded-md [background:linear-gradient(180deg,rgb(52.65,21.36,119.16)_0%,rgba(53,21,119,0)_100%)] h-8 mb-8 relative">
          <p className="absolute top-2.5 left-[38px] font-mono font-normal text-[#cdbcf0] text-[11px] text-center tracking-[-0.99px] leading-[13.2px] whitespace-nowrap">
            npx motia create -t default -n new-project
          </p>
          
          <button 
            onClick={onCopy}
            aria-label={copied ? "Copied" : "Copy to clipboard"}
            className="absolute w-5 h-5 top-1 left-1.5 bg-[#050013] rounded-[3.93px] shadow-[0px_0.71px_1.43px_#000000fa,0px_2.86px_2.86px_#000000d9,0px_6.43px_3.93px_#00000080,0px_11.43px_4.64px_#00000026,0px_17.86px_5px_#00000005] flex items-center justify-center"
          >
            {copied ? 
              <FaCheck className="w-2 h-2" /> : 
              <FaClipboard className="w-2 h-2" />
            }
          </button>
        </div>

        {/* CTAs */}
        <div className="flex gap-4">
          <Link
            href="/start-building"
            className="bg-white text-purple-900 py-3 px-6 rounded-md hover:bg-gray-100 transition font-dm-mono"
          >
            Start building
          </Link>
          <Link
            href="/docs"
            className="bg-transparent border border-purple-500 text-white py-3 px-6 rounded-md hover:bg-purple-900 transition font-dm-mono"
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