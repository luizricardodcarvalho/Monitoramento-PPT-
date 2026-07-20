import React from 'react';

export const SmartFlowLogo: React.FC<{ className?: string }> = ({ className = "w-full h-auto" }) => (
  <svg viewBox="0 0 200 150" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="smartFlowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="50%" stopColor="#059669" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    
    <g transform="translate(100, 52) scale(1.05)">
      {/* Circle Arrows representing flow */}
      <path 
        d="M -25 -12 A 28 28 0 1 1 -25 12" 
        stroke="url(#smartFlowGrad)" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        fill="none" 
      />
      {/* Arrow Heads */}
      <path 
        d="M -29 -4 Q -25 -12 -17 -9" 
        stroke="url(#smartFlowGrad)" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        fill="none" 
      />
      <path 
        d="M -19 13 Q -25 12 -29 6" 
        stroke="url(#smartFlowGrad)" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        fill="none" 
      />
      
      {/* Truck profile container inside */}
      <g transform="translate(-16, -9) scale(0.95)">
        {/* Truck carriage and cab */}
        <path 
          d="M 2 18 L 2 10 A 1.5 1.5 0 0 1 3.5 8.5 L 16 8.5 A 1.5 1.5 0 0 1 17.5 10 L 17.5 14 L 24 14 A 1.5 1.5 0 0 1 25.5 15.5 L 27.5 21 A 1 1 0 0 1 26.5 22 L 2 22 Z" 
          fill="url(#smartFlowGrad)" 
        />
        {/* Wheels */}
        <circle cx="7" cy="22" r="3.2" fill="#ffffff" stroke="url(#smartFlowGrad)" strokeWidth="2.5" />
        <circle cx="20" cy="22" r="3.2" fill="#ffffff" stroke="url(#smartFlowGrad)" strokeWidth="2.5" />
        {/* Window */}
        <path d="M 18.5 10 L 22.5 10 L 23.5 13.5 L 18.5 13.5 Z" fill="#ffffff" opacity="0.9" />
        {/* Droplet/Leaf symbol on top */}
        <path d="M 12 8.5 Q 12 1.5 16 0.5 Q 18.5 4.5 13 8.5 Z" fill="url(#smartFlowGrad)" />
      </g>
      
      {/* Speed lines on the right representing 'flow' motion */}
      <line x1="16" y1="3" x2="25" y2="3" stroke="url(#smartFlowGrad)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="7.5" x2="23" y2="7.5" stroke="url(#smartFlowGrad)" strokeWidth="2.5" strokeLinecap="round" />
    </g>

    {/* Text matching typography */}
    <text x="100" y="118" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="22" fill="#0C2340" textAnchor="middle" letterSpacing="-0.03em">
      Smart<tspan fill="url(#smartFlowGrad)">Flow</tspan>
    </text>
    <text x="100" y="135" fontFamily="Inter, system-ui, sans-serif" fontWeight="850" fontSize="8.5" fill="#4A5568" textAnchor="middle" letterSpacing="0.14em">
      LOGÍSTICA DA VINHAÇA
    </text>
  </svg>
);

export const VinhacaLogo: React.FC<{ className?: string }> = ({ className = "w-full h-auto" }) => (
  <svg viewBox="0 0 200 150" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(100, 52) scale(1.05)">
      {/* Green leaf crescent swoosh */}
      <path 
        d="M -23 -8 C -33 7 -18 26 2 23 C 18 20 23 4 17 -6" 
        stroke="#00843D" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
        fill="none" 
      />
      <path 
        d="M -23 -8 C -19 -17 -6 -21 4 -14 Q -5 -9 -9 2" 
        stroke="#005B2B" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        fill="none" 
      />

      {/* Truck profile */}
      <g transform="translate(-16, -5)">
        {/* Solid Navy Blue Truck */}
        <path 
          d="M 1 13 L 13 13 L 13 7 L 1 7 Z" 
          fill="#0C2340" 
        />
        <path 
          d="M 13 9 L 22 9 L 24 13 L 24 16 L 1 16 L 13 13 Z" 
          fill="#0C2340" 
        />
        {/* Wheels */}
        <circle cx="6" cy="16" r="3.2" fill="#FAF6EE" stroke="#0C2340" strokeWidth="2.5" />
        <circle cx="18" cy="16" r="3.2" fill="#FAF6EE" stroke="#0C2340" strokeWidth="2.5" />
        {/* Cabin Window */}
        <path d="M 17 10 L 21 10 L 22 13 L 17 13 Z" fill="#ffffff" />
      </g>

      {/* Amber/Yellow Droplet floating above the truck bed */}
      <path 
        d="M -3 -14 C -3 -20 2 -20 2 -14 C 2 -10 -3 -7 -3 -7 C -3 -7 -8 -10 -8 -14 Z" 
        fill="url(#amberDropGrad)" 
      />
    </g>
    
    <defs>
      <linearGradient id="amberDropGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#DF9200" />
        <stop offset="100%" stopColor="#FBCE00" />
      </linearGradient>
    </defs>

    {/* Typography */}
    <text x="100" y="118" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="13.5" fill="#0C2340" textAnchor="middle" letterSpacing="0.08em">
      LOGÍSTICA DE
    </text>
    <text x="100" y="137" fontFamily="Inter, system-ui, sans-serif" fontWeight="950" fontSize="21" fill="#0C2340" textAnchor="middle" letterSpacing="0.12em">
      VINHAÇA
    </text>
  </svg>
);

export const ColomboLogo: React.FC<{ className?: string }> = ({ className = "w-full h-auto" }) => (
  <svg viewBox="0 0 200 150" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(100, 48) scale(1.05)">
      {/* Top Green sail-leaf (layered) */}
      <path d="M -8 -25 C -12 -38 4 -42 12 -42 C 14 -24 4 -14 -8 -25 Z" fill="#005B2B" />
      <path d="M -10 -23 C -13 -35 1 -37 8 -37 C 10 -21 1 -12 -10 -23 Z" fill="#00843D" />
      
      {/* Middle Blue triangle wedge pointing east-up */}
      <path d="M -15 -18 Q 12 -28 25 -24 Q 2 -10 -15 -18 Z" fill="#2563EB" />
      <path d="M -15 -18 Q 12 -28 25 -24 L 0 -9 Z" fill="#1D4ED8" />

      {/* Bottom Golden semi-circle textured crescent */}
      <path d="M -22 -12 C -31 4 -18 25 6 25 C 14 25 22 18 21 10 C 9 18 -10 14 -19 -9 Z" fill="#D97706" />
      <path d="M -20 -9 C -27 2 -16 22 4 22 C 9 22 16 17 16 11 C 7 15 -8 12 -16 -7 Z" fill="#FBBF24" opacity="0.8" />
    </g>

    {/* Brand Text */}
    <text x="100" y="118" fontFamily="Inter, system-ui, sans-serif" fontWeight="950" fontSize="24" fill="#0C2340" textAnchor="middle" letterSpacing="-0.01em">
      COLOMBO
    </text>
    <text x="100" y="135" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="8" fill="#4B5563" textAnchor="middle" letterSpacing="0.25em">
      AGROINDÚSTRIA
    </text>
  </svg>
);
