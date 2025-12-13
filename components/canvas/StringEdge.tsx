
import React, { useMemo } from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';

// Catenary curve calculation (sagging string effect)
function catenaryPath(
  sourceX: number, 
  sourceY: number, 
  targetX: number, 
  targetY: number,
  sag: number
): string {
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2 + sag;
  
  return `M ${sourceX} ${sourceY} Q ${midX} ${midY} ${targetX} ${targetY}`;
}

export default function StringEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
}: EdgeProps) {
  // Calculate distance between nodes
  const distance = Math.sqrt(
    Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2)
  );
  
  // Dynamic sag: More sag when close, less when far (like a real string)
  // Max sag of 60px when nodes are close, min sag of 10px when far apart
  const baseSag = Math.max(10, 60 - distance * 0.1);
  
  const path = useMemo(() => 
    catenaryPath(sourceX, sourceY, targetX, targetY, baseSag),
    [sourceX, sourceY, targetX, targetY, baseSag]
  );

  return (
    <g>
      {/* Shadow for depth */}
      <path
        d={path}
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={3}
        strokeLinecap="round"
        style={{ transform: 'translate(2px, 2px)' }}
      />
      
      {/* Main red string */}
      <path
        d={path}
        fill="none"
        stroke={selected ? '#dc2626' : '#b91c1c'}
        strokeWidth={2}
        strokeLinecap="round"
        style={{
          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))',
        }}
      />
      
      {/* Highlight for 3D effect */}
      <path
        d={path}
        fill="none"
        stroke="rgba(255,100,100,0.3)"
        strokeWidth={1}
        strokeLinecap="round"
        style={{ transform: 'translate(-0.5px, -0.5px)' }}
      />
    </g>
  );
}
