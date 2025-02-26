'use client';

import Link from 'next/link';
import { FaGithub, FaUsers } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import Typography from '@/components/Typography';
import CommandDisplay from './CommandDisplay';

export default function GetStartedSection() {
  const [copied, setCopied] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("npx motia create -t default -n new-project");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const glowElement = glowRef.current;
    if (!section || !glowElement) return;

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      requestAnimationFrame(() => {
        glowElement.style.left = `${x}px`;
        glowElement.style.top = `${y}px`;
      });
      
      setMousePosition({ x, y });
    };

    section.addEventListener('mouseenter', handleMouseEnter);
    section.addEventListener('mouseleave', handleMouseLeave);
    section.addEventListener('mousemove', handleMouseMove);

    return () => {
      section.removeEventListener('mouseenter', handleMouseEnter);
      section.removeEventListener('mouseleave', handleMouseLeave);
      section.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="w-full max-w-7xl mx-auto py-10 px-4 flex flex-col items-center relative overflow-hidden"
    >
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
          isHovering ? 'opacity-20' : 'opacity-0'
        }`}
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          transform: isHovering ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 1000ms ease, transform 1000ms ease',
        }}
      />

      <div 
        ref={glowRef}
        className={`absolute pointer-events-none ${isHovering ? 'opacity-100' : 'opacity-0'}`}
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          transition: 'opacity 0.5s ease',
          mixBlendMode: 'soft-light',
          filter: 'blur(8px)',
          willChange: 'left, top',
        }}
      />

      <div className="text-center mb-12 relative z-10">
        <Typography 
          variant="title" 
          as="h2" 
          className="text-6xl text-white mb-6"
        >
          Get started
        </Typography>
        <Typography 
          variant="description" 
          as="p" 
          className="text-white/70 max-w-2xl mx-auto"
        >
          Write in any language. Automate anything. From AI agents to backend automation, 
          Motia runs event-driven workflows with zero overhead.
        </Typography>
      </div>

      <div className="mb-12 relative z-10 flex justify-center">
        <CommandDisplay
          command="npx motia create -t default -n new-project"
          copied={copied}
          onCopy={handleCopy}
        />
      </div>

      <div className="flex gap-4 mb-16 relative z-10">
        <Link
          href="/start-building"
          className="bg-white text-purple-900 py-3 px-6 rounded-md font-semibold hover:bg-gray-100 transition"
        >
          Start building
        </Link>
        <Link
          href="/docs"
          className="bg-transparent border border-purple-500 text-white py-3 px-6 rounded-md font-semibold hover:bg-purple-900/30 transition"
        >
          Developer docs
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full relative z-10">
        <Link 
          href="https://github.com/motiaai/motia" 
          target="_blank"
          rel="noopener noreferrer"
          className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 flex flex-col h-full border border-purple-800/20 hover:border-purple-700/40 transition-all group"
        >
          <div className="flex items-center mb-4">
            <div className="bg-purple-900/40 p-3 rounded-lg mr-4 flex items-center justify-center w-12 h-12">
              <FaGithub className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-white">Contribute to Github</h3>
          </div>
          <p className="text-white/70 mb-6 text-sm">Share flows and debug together</p>
          <div className="mt-auto flex justify-end">
            <div className="text-white/60 group-hover:text-white transition-colors">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14 5l7 7m0 0l-7 7m7-7H3" 
                />
              </svg>
            </div>
          </div>
        </Link>

        <Link 
          href="/community" 
          className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 flex flex-col h-full border border-purple-800/20 hover:border-purple-700/40 transition-all group"
        >
          <div className="flex items-center mb-4">
            <div className="bg-purple-900/40 p-3 rounded-lg mr-4 flex items-center justify-center w-12 h-12">
              <FaUsers className="text-white text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-white">Join the community</h3>
          </div>
          <p className="text-white/70 mb-6 text-sm">Share flows and debug together</p>
          <div className="mt-auto flex justify-end">
            <div className="text-white/60 group-hover:text-white transition-colors">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14 5l7 7m0 0l-7 7m7-7H3" 
                />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 