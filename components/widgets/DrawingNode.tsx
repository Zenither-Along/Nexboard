"use client"

import React, { memo } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { useTheme } from 'next-themes';

// Simple point for pencil tool
interface SimplePoint {
  x: number;
  y: number;
}

// Old anchor point format (for backwards compatibility)
interface OldAnchorPoint {
  x: number;
  y: number;
  handleIn?: { x: number; y: number };
  handleOut?: { x: number; y: number };
}

// New PenNode format from PenTool
interface PenNode {
  position: { x: number; y: number };
  handleIn: { x: number; y: number };
  handleOut: { x: number; y: number };
  type: 'corner' | 'smooth' | 'symmetric';
}

// Unified anchor point for rendering
interface UnifiedAnchor {
  x: number;
  y: number;
  handleIn: { x: number; y: number };
  handleOut: { x: number; y: number };
}

// Type for drawing path data stored in node.data
interface DrawingData {
  points?: SimplePoint[];           // For pencil tool
  anchors?: OldAnchorPoint[];       // Old pen tool format
  penNodes?: PenNode[];             // New pen tool format
  closed?: boolean;                  // Whether path is closed
  tool: 'pencil' | 'pen';
  color?: string;
  strokeWidth?: number;
}

// Convert PenNodes or OldAnchors to unified format
function toUnifiedAnchors(data: DrawingData): UnifiedAnchor[] {
  if (data.penNodes && data.penNodes.length > 0) {
    return data.penNodes.map(n => ({
      x: n.position.x,
      y: n.position.y,
      handleIn: n.handleIn,
      handleOut: n.handleOut,
    }));
  }
  if (data.anchors && data.anchors.length > 0) {
    return data.anchors.map(a => ({
      x: a.x,
      y: a.y,
      handleIn: a.handleIn || { x: 0, y: 0 },
      handleOut: a.handleOut || { x: 0, y: 0 },
    }));
  }
  return [];
}

// Convert pencil points to SVG path with smooth curves
function pencilPointsToPath(points: SimplePoint[], offsetX: number, offsetY: number): string {
  if (points.length < 2) return '';
  
  const padded = points.map(p => ({
    x: p.x + offsetX,
    y: p.y + offsetY,
  }));
  
  let path = `M ${padded[0].x} ${padded[0].y}`;
  
  for (let i = 1; i < padded.length - 1; i++) {
    const xc = (padded[i].x + padded[i + 1].x) / 2;
    const yc = (padded[i].y + padded[i + 1].y) / 2;
    path += ` Q ${padded[i].x} ${padded[i].y} ${xc} ${yc}`;
  }
  
  const last = padded[padded.length - 1];
  path += ` L ${last.x} ${last.y}`;
  
  return path;
}

// Convert pen anchor points to SVG path with Bézier curves
function penAnchorsToPath(anchors: UnifiedAnchor[], closed: boolean, offsetX: number, offsetY: number): string {
  if (anchors.length === 0) return '';
  
  const padded = anchors.map(a => ({
    x: a.x + offsetX,
    y: a.y + offsetY,
    handleIn: a.handleIn,
    handleOut: a.handleOut,
  }));
  
  let d = `M ${padded[0].x} ${padded[0].y}`;
  
  for (let i = 1; i < padded.length; i++) {
    const prev = padded[i - 1];
    const curr = padded[i];
    
    const hasHandles = prev.handleOut || curr.handleIn;
    
    if (hasHandles) {
      const cp1x = prev.x + (prev.handleOut?.x || 0);
      const cp1y = prev.y + (prev.handleOut?.y || 0);
      const cp2x = curr.x + (curr.handleIn?.x || 0);
      const cp2y = curr.y + (curr.handleIn?.y || 0);
      d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${curr.x} ${curr.y}`;
    } else {
      d += ` L ${curr.x} ${curr.y}`;
    }
  }
  
  if (closed && padded.length > 2) {
    const last = padded[padded.length - 1];
    const first = padded[0];
    const hasHandles = last.handleOut || first.handleIn;
    
    if (hasHandles) {
      const cp1x = last.x + (last.handleOut?.x || 0);
      const cp1y = last.y + (last.handleOut?.y || 0);
      const cp2x = first.x + (first.handleIn?.x || 0);
      const cp2y = first.y + (first.handleIn?.y || 0);
      d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${first.x} ${first.y}`;
    } else {
      d += ' Z';
    }
  }
  
  return d;
}

// Calculate bounding box - returns actual visible dimensions
function getBounds(points: { x: number; y: number }[], handles?: { handleIn?: { x: number; y: number }; handleOut?: { x: number; y: number } }[]) {
  if (points.length === 0) return { width: 0, height: 0, minX: 0, minY: 0 };
  
  let allX = points.map(p => p.x);
  let allY = points.map(p => p.y);
  
  // Include handle positions in bounds calculation (handles are relative offsets)
  if (handles) {
    handles.forEach((h, i) => {
      if (h.handleIn) {
        allX.push(points[i].x + h.handleIn.x);
        allY.push(points[i].y + h.handleIn.y);
      }
      if (h.handleOut) {
        allX.push(points[i].x + h.handleOut.x);
        allY.push(points[i].y + h.handleOut.y);
      }
    });
  }
  
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);
  
  return {
    width: maxX - minX,
    height: maxY - minY,
    minX,
    minY,
  };
}

const DrawingNode = memo(({ data, selected }: NodeProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const drawingData = data as unknown as DrawingData;
  const tool = drawingData.tool || 'pencil';
  const color = drawingData.color || (isDark ? '#ffffff' : '#000000');
  const strokeWidth = drawingData.strokeWidth || 2;
  const closed = drawingData.closed || false;
  
  const padding = strokeWidth * 2;
  
  // Get unified anchors for pen tool
  const unifiedAnchors = tool === 'pen' ? toUnifiedAnchors(drawingData) : [];
  const pencilPoints = tool === 'pencil' ? (drawingData.points || []) : [];
  
  // Check if we have enough points
  if (tool === 'pen' && unifiedAnchors.length < 2) return null;
  if (tool === 'pencil' && pencilPoints.length < 2) return null;
  
  // Get points for bounds calculation
  const pointsForBounds = tool === 'pen' 
    ? unifiedAnchors.map(a => ({ x: a.x, y: a.y }))
    : pencilPoints;
  
  // Always calculate bounds from actual points
  const bounds = getBounds(
    pointsForBounds,
    tool === 'pen' ? unifiedAnchors : undefined
  );
  
  // Node dimensions based on actual path size
  const nodeWidth = Math.max(bounds.width + padding * 2, 10);
  const nodeHeight = Math.max(bounds.height + padding * 2, 10);
  
  // Offset to shift path so minX/minY render at (padding, padding)
  const offsetX = -bounds.minX + padding;
  const offsetY = -bounds.minY + padding;
  
  // Generate path based on tool type with proper offsets
  const pathD = tool === 'pen'
    ? penAnchorsToPath(unifiedAnchors, closed, offsetX, offsetY)
    : pencilPointsToPath(pencilPoints, offsetX, offsetY);
  
  return (
    <div 
      className="relative"
      style={{
        width: nodeWidth,
        height: nodeHeight,
      }}
    >
      <svg
        width={nodeWidth}
        height={nodeHeight}
        style={{
          overflow: 'visible',
          display: 'block',
        }}
      >
        <path
          d={pathD}
          fill="none"
          stroke={selected ? '#3b82f6' : color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Hidden handles for potential connections */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ opacity: 0 }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ opacity: 0 }}
      />
    </div>
  );
});

DrawingNode.displayName = 'DrawingNode';
export default DrawingNode;

