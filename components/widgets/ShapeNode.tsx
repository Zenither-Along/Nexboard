import React, { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { useTheme } from 'next-themes';

const ShapeNode = memo(({ data, selected, width, height }: NodeProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const shapeType = (data.type as string) || 'rectangle';
  const fill = (data.fill as string) || (isDark ? '#2d2d2d' : '#ffffff');
  const stroke = (data.stroke as string) || (isDark ? '#e5e5e5' : '#000000');
  const strokeWidth = (data.strokeWidth as number) || 2;
  
  // Default dimensions if not provided
  const w = parseInt(String(width ?? 100));
  const h = parseInt(String(height ?? 100));

  const renderShape = () => {
    switch (shapeType) {
      case 'ellipse':
        return (
          <ellipse 
            cx="50%" 
            cy="50%" 
            rx="49%" 
            ry="49%" 
            fill={fill} 
            stroke={stroke} 
            strokeWidth={strokeWidth} 
          />
        );
      case 'polygon': // Triangle
        return (
          <polygon 
            points="50,0 100,100 0,100" 
            transform={`scale(${w/100}, ${h/100})`}
            fill={fill} 
            stroke={stroke} 
            strokeWidth={strokeWidth} 
            vectorEffect="non-scaling-stroke"
          />
        );
      case 'star':
        return (
          <polygon 
            points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
            transform={`scale(${w/100}, ${h/100})`}
            fill={fill} 
            stroke={stroke} 
            strokeWidth={strokeWidth} 
            vectorEffect="non-scaling-stroke"
          />
        );
      case 'line':
        return (
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );
      case 'arrow':
        return (
          <>
            <defs>
              <marker
                id={`arrowhead-${stroke.replace('#', '')}`}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={stroke} />
              </marker>
            </defs>
            <line
              x1="0"
              y1="50%"
              x2="95%" // Leave room for arrowhead
              y2="50%"
              stroke={stroke}
              strokeWidth={strokeWidth}
              markerEnd={`url(#arrowhead-${stroke.replace('#', '')})`}
            />
          </>
        );
      case 'rectangle':
      default:
        return (
          <rect 
            x="0" 
            y="0" 
            width="100%" 
            height="100%" 
            rx="4" 
            fill={fill} 
            stroke={stroke} 
            strokeWidth={strokeWidth} 
          />
        );
    }
  };

  return (
    <div className="relative group w-full h-full">
      <NodeResizer 
        minWidth={50}
        minHeight={50}
        isVisible={selected}
        lineClassName="!border-blue-500"
        handleClassName="!w-2 !h-2 !bg-white !border-2 !border-blue-500 !rounded-sm"
      />
      
      <svg 
        width="100%" 
        height="100%" 
        style={{ overflow: 'visible' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderShape()}
      </svg>

      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-2 !h-2 !bg-blue-500 !border-0 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-2 !h-2 !bg-blue-500 !border-0 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-2 !h-2 !bg-blue-500 !border-0 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-2 !h-2 !bg-blue-500 !border-0 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
});

ShapeNode.displayName = 'ShapeNode';
export default ShapeNode;
