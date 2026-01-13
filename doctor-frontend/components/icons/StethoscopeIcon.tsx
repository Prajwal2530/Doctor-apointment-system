
import React from 'react';

export const StethoscopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 18a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V7a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v1" />
    <path d="M8 4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V3a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1Z" />
    <circle cx="12" cy="11" r="2" />
  </svg>
);