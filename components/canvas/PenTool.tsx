"use client"

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useTheme } from 'next-themes';
import useStore from '@/store/useStore';

// ============================================
// DATA STRUCTURES
// ============================================

export interface PenNode {
  position: { x: number; y: number };
  handleIn: { x: number; y: number };   // Relative to position
  handleOut: { x: number; y: number };  // Relative to position
  type: 'corner' | 'smooth' | 'symmetric';
}

export interface PenPath {
  nodes: PenNode[];
  closed: boolean;
}

// ============================================
// MATH HELPERS
// ============================================

function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getAngle(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function constrainAngle(angle: number): number {
  // Constrain to 45° increments (0, 45, 90, 135, 180, -135, -90, -45)
  const snap = Math.PI / 4; // 45 degrees
  return Math.round(angle / snap) * snap;
}

function polarToCartesian(angle: number, distance: number): { x: number; y: number } {
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
}

// ============================================
// PATH TO SVG
// ============================================

function pathToSvgD(nodes: PenNode[], closed: boolean): string {
  if (nodes.length === 0) return '';
  
  let d = `M ${nodes[0].position.x} ${nodes[0].position.y}`;
  
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    
    // Control point 1: previous node's handleOut
    const cp1x = prev.position.x + prev.handleOut.x;
    const cp1y = prev.position.y + prev.handleOut.y;
    
    // Control point 2: current node's handleIn
    const cp2x = curr.position.x + curr.handleIn.x;
    const cp2y = curr.position.y + curr.handleIn.y;
    
    // Check if we have any handles
    const hasHandles = prev.handleOut.x !== 0 || prev.handleOut.y !== 0 ||
                       curr.handleIn.x !== 0 || curr.handleIn.y !== 0;
    
    if (hasHandles) {
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.position.x} ${curr.position.y}`;
    } else {
      d += ` L ${curr.position.x} ${curr.position.y}`;
    }
  }
  
  if (closed && nodes.length > 2) {
    const last = nodes[nodes.length - 1];
    const first = nodes[0];
    
    const cp1x = last.position.x + last.handleOut.x;
    const cp1y = last.position.y + last.handleOut.y;
    const cp2x = first.position.x + first.handleIn.x;
    const cp2y = first.position.y + first.handleIn.y;
    
    const hasHandles = last.handleOut.x !== 0 || last.handleOut.y !== 0 ||
                       first.handleIn.x !== 0 || first.handleIn.y !== 0;
    
    if (hasHandles) {
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${first.position.x} ${first.position.y}`;
    } else {
      d += ' Z';
    }
  }
  
  return d;
}

// ============================================
// PEN TOOL COMPONENT
// ============================================

type PenState = 'idle' | 'drawing' | 'dragging';

interface PenToolProps {
  onPathComplete: (path: PenPath) => void;
  onCancel: () => void;
}

const generateId = () => `pen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function PenTool({ onPathComplete, onCancel }: PenToolProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { screenToFlowPosition, getViewport } = useReactFlow();
  const activeTool = useStore((state) => state.activeTool);
  
  // State
  const [penState, setPenState] = useState<PenState>('idle');
  const [nodes, setNodes] = useState<PenNode[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false);
  
  // Ref for the node being dragged
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  
  // Colors
  const strokeColor = isDark ? '#ffffff' : '#000000';
  const handleColor = '#3b82f6';
  const phantomColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  
  // Close detection distance
  const CLOSE_DISTANCE = 15;

  // ============================================
  // KEYBOARD HANDLERS
  // ============================================
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
      if (e.key === 'Alt') setIsAltPressed(true);
      
      if (e.key === 'Enter' && nodes.length >= 2) {
        onPathComplete({ nodes, closed: false });
        setNodes([]);
        setPenState('idle');
      } else if (e.key === 'Escape') {
        onCancel();
        setNodes([]);
        setPenState('idle');
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
      if (e.key === 'Alt') setIsAltPressed(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nodes, onPathComplete, onCancel]);

  // ============================================
  // MOUSE HANDLERS
  // ============================================

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    let pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    
    // Apply angle constraint if shift is pressed and we have nodes
    if (isShiftPressed && nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const angle = getAngle(lastNode.position, pos);
      const constrainedAngle = constrainAngle(angle);
      const distance = getDistance(lastNode.position, pos);
      const delta = polarToCartesian(constrainedAngle, distance);
      pos = {
        x: lastNode.position.x + delta.x,
        y: lastNode.position.y + delta.y,
      };
    }
    
    setMousePos(pos);
    
    // If dragging, update the current node's handles
    if (penState === 'dragging' && dragStartRef.current && nodes.length > 0) {
      const currentNode = nodes[nodes.length - 1];
      let handleOut = {
        x: pos.x - currentNode.position.x,
        y: pos.y - currentNode.position.y,
      };
      
      // Apply angle constraint to handle if shift pressed
      if (isShiftPressed) {
        const angle = getAngle({ x: 0, y: 0 }, handleOut);
        const constrainedAngle = constrainAngle(angle);
        const distance = getDistance({ x: 0, y: 0 }, handleOut);
        handleOut = polarToCartesian(constrainedAngle, distance);
      }
      
      // Mirror handleIn (unless Alt is pressed)
      const handleIn = isAltPressed 
        ? currentNode.handleIn 
        : { x: -handleOut.x, y: -handleOut.y };
      
      setNodes(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...currentNode,
          handleIn,
          handleOut,
          type: isAltPressed ? 'corner' : 'smooth',
        };
        return updated;
      });
    }
  }, [screenToFlowPosition, penState, nodes, isShiftPressed, isAltPressed]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    
    let pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    
    // Apply angle constraint if shift is pressed and we have nodes
    if (isShiftPressed && nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const angle = getAngle(lastNode.position, pos);
      const constrainedAngle = constrainAngle(angle);
      const distance = getDistance(lastNode.position, pos);
      const delta = polarToCartesian(constrainedAngle, distance);
      pos = {
        x: lastNode.position.x + delta.x,
        y: lastNode.position.y + delta.y,
      };
    }
    
    // Check if clicking on start node to close path
    if (nodes.length >= 2) {
      const startNode = nodes[0];
      const zoom = getViewport().zoom;
      const dist = getDistance(pos, startNode.position);
      
      if (dist < CLOSE_DISTANCE / zoom) {
        // Close the path
        onPathComplete({ nodes, closed: true });
        setNodes([]);
        setPenState('idle');
        return;
      }
    }
    
    // Create new node
    const newNode: PenNode = {
      position: pos,
      handleIn: { x: 0, y: 0 },
      handleOut: { x: 0, y: 0 },
      type: 'corner',
    };
    
    setNodes(prev => [...prev, newNode]);
    setPenState('dragging');
    dragStartRef.current = pos;
  }, [screenToFlowPosition, nodes, getViewport, isShiftPressed, onPathComplete]);

  const handleMouseUp = useCallback(() => {
    if (penState === 'dragging') {
      setPenState('drawing');
      dragStartRef.current = null;
    }
  }, [penState]);

  // ============================================
  // RENDER
  // ============================================

  const vp = getViewport();
  
  if (activeTool !== 'pen') return null;
  
  // Check if mouse is near start node (for close indicator)
  const isNearStart = mousePos && nodes.length >= 2 && 
    getDistance(mousePos, nodes[0].position) < CLOSE_DISTANCE / vp.zoom;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        cursor: isNearStart ? 'crosshair' : 'crosshair',
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <g transform={`translate(${vp.x}, ${vp.y}) scale(${vp.zoom})`}>
          {/* Completed path segments */}
          {nodes.length > 0 && (
            <path
              d={pathToSvgD(nodes, false)}
              fill="none"
              stroke={strokeColor}
              strokeWidth={2 / vp.zoom}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* Rubber band line to cursor */}
          {nodes.length > 0 && mousePos && penState !== 'dragging' && (
            <line
              x1={nodes[nodes.length - 1].position.x}
              y1={nodes[nodes.length - 1].position.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke={strokeColor}
              strokeWidth={1 / vp.zoom}
              strokeDasharray={`${4 / vp.zoom} ${4 / vp.zoom}`}
              opacity={0.5}
            />
          )}
          
          {/* Preview curve while dragging */}
          {penState === 'dragging' && nodes.length >= 2 && (
            <path
              d={pathToSvgD(nodes.slice(-2), false)}
              fill="none"
              stroke={strokeColor}
              strokeWidth={2 / vp.zoom}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.7}
            />
          )}
          
          {/* Anchor points and handles */}
          {nodes.map((node, i) => (
            <g key={i}>
              {/* HandleIn line and circle (only if not zero) */}
              {(node.handleIn.x !== 0 || node.handleIn.y !== 0) && (
                <>
                  <line
                    x1={node.position.x}
                    y1={node.position.y}
                    x2={node.position.x + node.handleIn.x}
                    y2={node.position.y + node.handleIn.y}
                    stroke={handleColor}
                    strokeWidth={1 / vp.zoom}
                  />
                  <circle
                    cx={node.position.x + node.handleIn.x}
                    cy={node.position.y + node.handleIn.y}
                    r={4 / vp.zoom}
                    fill={handleColor}
                  />
                </>
              )}
              
              {/* HandleOut line and circle (only if not zero) */}
              {(node.handleOut.x !== 0 || node.handleOut.y !== 0) && (
                <>
                  <line
                    x1={node.position.x}
                    y1={node.position.y}
                    x2={node.position.x + node.handleOut.x}
                    y2={node.position.y + node.handleOut.y}
                    stroke={handleColor}
                    strokeWidth={1 / vp.zoom}
                  />
                  <circle
                    cx={node.position.x + node.handleOut.x}
                    cy={node.position.y + node.handleOut.y}
                    r={4 / vp.zoom}
                    fill={handleColor}
                  />
                </>
              )}
              
              {/* Anchor point */}
              <rect
                x={node.position.x - 4 / vp.zoom}
                y={node.position.y - 4 / vp.zoom}
                width={8 / vp.zoom}
                height={8 / vp.zoom}
                fill={i === 0 ? handleColor : 'white'}
                stroke={handleColor}
                strokeWidth={1.5 / vp.zoom}
              />
            </g>
          ))}
          
          {/* Phantom point at cursor */}
          {mousePos && penState !== 'dragging' && (
            <rect
              x={mousePos.x - 4 / vp.zoom}
              y={mousePos.y - 4 / vp.zoom}
              width={8 / vp.zoom}
              height={8 / vp.zoom}
              fill="transparent"
              stroke={phantomColor}
              strokeWidth={1.5 / vp.zoom}
              strokeDasharray={`${2 / vp.zoom} ${2 / vp.zoom}`}
            />
          )}
          
          {/* Close path indicator */}
          {isNearStart && nodes.length >= 2 && (
            <circle
              cx={nodes[0].position.x}
              cy={nodes[0].position.y}
              r={10 / vp.zoom}
              fill="none"
              stroke={handleColor}
              strokeWidth={2 / vp.zoom}
            />
          )}
        </g>
      </svg>
    </div>
  );
}
