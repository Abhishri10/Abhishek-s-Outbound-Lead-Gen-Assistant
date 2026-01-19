import React from 'react';

export const BrainCircuitIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 13.5a.5.5 0 11-1 0 .5.5 0 011 0zm0-5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0zm0-5a.5.5 0 11-1 0 .5.5 0 011 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 12a8.5 8.5 0 1116.32 3.68c-.14-.23-.27-.47-.4-.71m-15.52 0c.13-.24.26-.48.4-.71M12 3.5v1m0 15v1m8.5-8.5h-1m-15 0h-1" />
  </svg>
);
