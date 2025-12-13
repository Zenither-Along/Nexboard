"use client"

import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Node,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useStore from '@/store/useStore';
import { useTheme } from 'next-themes';
import PolaroidNode from '@/components/widgets/PolaroidNode';
import StickyNote from '@/components/widgets/StickyNote';
import FrameNode from '@/components/widgets/FrameNode';
import RectangleNode from '@/components/widgets/RectangleNode';
import TextNode from '@/components/widgets/TextNode';
import StringEdge from '@/components/canvas/StringEdge';

const nodeTypes = { 
  polaroidNode: PolaroidNode, 
  stickyNote: StickyNote,
  frameNode: FrameNode,
  rectangleNode: RectangleNode,
  textNode: TextNode,
};
const edgeTypes = { string: StringEdge };
const defaultEdgeOptions = { type: 'string', animated: false };
const generateId = () => `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

function Flow() {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const onConnect = useStore((state) => state.onConnect);
  const addNode = useStore((state) => state.addNode);
  const activeTool = useStore((state) => state.activeTool);
  const setActiveTool = useStore((state) => state.setActiveTool);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, setViewport, getViewport } = useReactFlow();
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Space key for hand tool
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') setIsSpacePressed(false); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // FIGMA TRACKPAD CONTROLS:
  // - Two-finger swipe = PAN (deltaX, deltaY without ctrlKey)
  // - Pinch = ZOOM (deltaY with ctrlKey - browser sends ctrlKey=true for pinch)
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const vp = getViewport();

      if (e.ctrlKey || e.metaKey) {
        // PINCH TO ZOOM
        // Browser sends ctrlKey=true for pinch gestures
        // deltaY is positive for pinch-in (zoom out), negative for pinch-out (zoom in)
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        // Very smooth zoom - small factor for gentle response
        const zoomSpeed = 0.008;
        const zoomDelta = 1 - e.deltaY * zoomSpeed;
        const newZoom = Math.max(0.1, Math.min(4, vp.zoom * zoomDelta));
        
        // Zoom toward cursor position
        const scaleChange = newZoom / vp.zoom;
        const newX = mx - (mx - vp.x) * scaleChange;
        const newY = my - (my - vp.y) * scaleChange;
        
        setViewport({ x: newX, y: newY, zoom: newZoom });
        setZoomLevel(Math.round(newZoom * 100));
      } else {
        // TWO-FINGER SWIPE TO PAN
        // Direct 1:1 mapping for natural feel
        setViewport({
          x: vp.x - e.deltaX,
          y: vp.y - e.deltaY,
          zoom: vp.zoom
        });
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [getViewport, setViewport]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNode({ id: generateId(), type, position: pos, data: { label: type } });
  }, [screenToFlowPosition, addNode]);

  // Click on canvas to create element based on active tool
  const onPaneClick = useCallback((e: React.MouseEvent) => {
    if (['select', 'hand', 'comment'].includes(activeTool)) return;
    
    const toolToNodeType: Record<string, string> = {
      frame: 'frameNode',
      rectangle: 'rectangleNode',
      text: 'textNode',
      polaroid: 'polaroidNode',
      sticky: 'stickyNote',
    };
    
    const nodeType = toolToNodeType[activeTool];
    if (!nodeType) return;
    
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNode({ id: generateId(), type: nodeType, position: pos, data: { label: nodeType } });
    
    // Switch back to select tool after creating
    setActiveTool('select');
  }, [activeTool, screenToFlowPosition, addNode, setActiveTool]);

  // Get cursor based on active tool
  const getCursor = () => {
    if (isSpacePressed || activeTool === 'hand') return 'grab';
    if (['frame', 'rectangle', 'text', 'polaroid', 'sticky'].includes(activeTool)) return 'crosshair';
    return 'default';
  };

  return (
    <div 
      ref={wrapperRef}
      className="h-screen w-screen relative"
      style={{
        backgroundColor: isDark ? '#1e1e1e' : '#e5e5e5',
        cursor: getCursor(),
      }}
    >
      {/* Zoom percentage display - like Figma */}
      <div 
        className="absolute top-4 right-4 z-50 px-2 py-1 rounded text-xs font-medium"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
        }}
      >
        {zoomLevel}%
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        minZoom={0.1}
        maxZoom={4}
        proOptions={{ hideAttribution: true }}
        snapToGrid={false}
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        // Panning when space pressed OR hand tool active
        panOnDrag={isSpacePressed || activeTool === 'hand'}
        // Selection only when in select mode
        selectionOnDrag={activeTool === 'select' && !isSpacePressed}
        selectionMode={"partial" as any}
        zoomOnScroll={false}
        zoomOnPinch={false}
        panOnScroll={false}
        zoomOnDoubleClick={true}
      >
      </ReactFlow>
    </div>
  );
}

export default function InfiniteCanvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
