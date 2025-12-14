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
import DrawingNode from '@/components/widgets/DrawingNode';
import StringEdge from '@/components/canvas/StringEdge';
import PenTool, { PenPath, PenNode } from '@/components/canvas/PenTool';

const nodeTypes = { 
  polaroidNode: PolaroidNode, 
  stickyNote: StickyNote,
  frameNode: FrameNode,
  rectangleNode: RectangleNode,
  textNode: TextNode,
  drawingNode: DrawingNode,
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
  const updateNodeData = useStore((state) => state.updateNodeData);
  const updateNode = useStore((state) => state.updateNode);
  const updateNodeFull = useStore((state) => state.updateNodeFull);
  const attachNodeToFrame = useStore((state) => state.attachNodeToFrame);
  const activeTool = useStore((state) => state.activeTool);
  const setActiveTool = useStore((state) => state.setActiveTool);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, setViewport, getViewport } = useReactFlow();
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // Drawing state - track current drawing node
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawingId, setCurrentDrawingId] = useState<string | null>(null);
  const drawingPointsRef = useRef<{ x: number; y: number }[]>([]);
  const drawingOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Frame drawing state
  const [isDrawingFrame, setIsDrawingFrame] = useState(false);
  const [frameStartPos, setFrameStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentFrameId, setCurrentFrameId] = useState<string | null>(null);

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
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        const zoomSpeed = 0.008;
        const zoomDelta = 1 - e.deltaY * zoomSpeed;
        const newZoom = Math.max(0.1, Math.min(4, vp.zoom * zoomDelta));
        
        const scaleChange = newZoom / vp.zoom;
        const newX = mx - (mx - vp.x) * scaleChange;
        const newY = my - (my - vp.y) * scaleChange;
        
        setViewport({ x: newX, y: newY, zoom: newZoom });
        setZoomLevel(Math.round(newZoom * 100));
      } else {
        // TWO-FINGER SWIPE TO PAN
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
    const nodeId = generateId();
    
    // Check if drop is inside any frame
    const frames = nodes.filter(n => n.type === 'frameNode');
    let parentFrame: Node | null = null;
    
    for (const frame of frames) {
      const frameWidth = (frame.style?.width as number) || (frame.data?.width as number) || 200;
      const frameHeight = (frame.style?.height as number) || (frame.data?.height as number) || 150;
      
      const isInside = 
        pos.x >= frame.position.x &&
        pos.x <= frame.position.x + frameWidth &&
        pos.y >= frame.position.y &&
        pos.y <= frame.position.y + frameHeight;
      
      if (isInside) {
        parentFrame = frame;
        break;
      }
    }
    
    // Create node with parent if inside a frame
    if (parentFrame) {
      addNode({
        id: nodeId,
        type,
        position: {
          x: pos.x - parentFrame.position.x,
          y: pos.y - parentFrame.position.y,
        },
        parentId: parentFrame.id,
        extent: 'parent' as const,
        data: { label: type },
      });
    } else {
      addNode({ id: nodeId, type, position: pos, data: { label: type } });
    }
  }, [screenToFlowPosition, addNode, nodes]);

  // Click on canvas to create element based on active tool
  const onPaneClick = useCallback((e: React.MouseEvent) => {
    // Frame uses drag-to-draw, not click
    if (['select', 'hand', 'comment', 'pencil', 'pen', 'frame'].includes(activeTool)) return;
    
    const toolToNodeType: Record<string, string> = {
      rectangle: 'rectangleNode',
      text: 'textNode',
      polaroid: 'polaroidNode',
      sticky: 'stickyNote',
    };
    
    const nodeType = toolToNodeType[activeTool];
    if (!nodeType) return;
    
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const nodeId = generateId();
    
    // Check if click is inside any frame
    const frames = nodes.filter(n => n.type === 'frameNode');
    let parentFrame: Node | null = null;
    
    for (const frame of frames) {
      const frameWidth = (frame.style?.width as number) || (frame.data?.width as number) || 200;
      const frameHeight = (frame.style?.height as number) || (frame.data?.height as number) || 150;
      
      const isInside = 
        pos.x >= frame.position.x &&
        pos.x <= frame.position.x + frameWidth &&
        pos.y >= frame.position.y &&
        pos.y <= frame.position.y + frameHeight;
      
      if (isInside) {
        parentFrame = frame;
        break;
      }
    }
    
    // Create node with parent if inside a frame
    if (parentFrame) {
      addNode({
        id: nodeId,
        type: nodeType,
        position: {
          x: pos.x - parentFrame.position.x,
          y: pos.y - parentFrame.position.y,
        },
        parentId: parentFrame.id,
        extent: 'parent' as const,
        data: { label: nodeType },
      });
    } else {
      addNode({
        id: nodeId,
        type: nodeType,
        position: pos,
        data: { label: nodeType },
      });
    }
    
    // Switch back to select tool after creating
    setActiveTool('select');
  }, [activeTool, screenToFlowPosition, addNode, setActiveTool, nodes]);

  // Drawing handlers - create drawing nodes
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!['pencil', 'pen'].includes(activeTool)) return;
    
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const nodeId = generateId();
    
    // Initialize drawing state
    setIsDrawing(true);
    setCurrentDrawingId(nodeId);
    // Store the origin point in ref for reliable access
    drawingOriginRef.current = pos;
    drawingPointsRef.current = [{ x: 0, y: 0 }];
    
    // Create initial drawing node at click position
    addNode({
      id: nodeId,
      type: 'drawingNode',
      position: pos,
      data: {
        points: [{ x: 0, y: 0 }],
        tool: activeTool,
        color: isDark ? '#ffffff' : '#000000',
        strokeWidth: activeTool === 'pencil' ? 2 : 3,
      },
    });
  }, [activeTool, screenToFlowPosition, addNode, isDark]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !currentDrawingId) return;
    
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const origin = drawingOriginRef.current;
    
    // Store point relative to origin
    const relativePoint = {
      x: pos.x - origin.x,
      y: pos.y - origin.y,
    };
    drawingPointsRef.current.push(relativePoint);
    
    // Update the drawing node with new relative points
    updateNodeData(currentDrawingId, {
      points: [...drawingPointsRef.current],
    });
  }, [isDrawing, currentDrawingId, screenToFlowPosition, updateNodeData]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentDrawingId) {
      const points = drawingPointsRef.current;
      const origin = drawingOriginRef.current;
      
      if (points.length >= 2) {
        // Calculate bounding box
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        
        // New position is at the top-left of the bounding box
        const newPosition = {
          x: origin.x + minX,
          y: origin.y + minY,
        };
        
        // Shift all points so they're relative to the new top-left position
        const shiftedPoints = points.map(p => ({
          x: p.x - minX,
          y: p.y - minY,
        }));
        
        // Check if drawing is inside any frame
        const frames = nodes.filter(n => n.type === 'frameNode');
        let parentFrame: Node | null = null;
        
        for (const frame of frames) {
          const frameWidth = (frame.style?.width as number) || (frame.data?.width as number) || 200;
          const frameHeight = (frame.style?.height as number) || (frame.data?.height as number) || 150;
          
          const isInside = 
            newPosition.x >= frame.position.x &&
            newPosition.x <= frame.position.x + frameWidth &&
            newPosition.y >= frame.position.y &&
            newPosition.y <= frame.position.y + frameHeight;
          
          if (isInside) {
            parentFrame = frame;
            break;
          }
        }
        
        // Update node with final position, shifted points, and parent if inside frame
        if (parentFrame) {
          // Make position relative to frame
          const relativePosition = {
            x: newPosition.x - parentFrame.position.x,
            y: newPosition.y - parentFrame.position.y,
          };
          
          // Update with parent
          updateNode(currentDrawingId, relativePosition, {
            points: shiftedPoints,
          });
          
          // Set parent after updating position
          attachNodeToFrame(currentDrawingId, parentFrame.id);
        } else {
          // Update normally without parent
          updateNode(currentDrawingId, newPosition, {
            points: shiftedPoints,
          });
        }
      }
      
      setIsDrawing(false);
      setCurrentDrawingId(null);
      drawingPointsRef.current = [];
    }
  }, [isDrawing, currentDrawingId, updateNode, nodes, attachNodeToFrame]);

  // Frame drawing handlers - drag to draw frame size
  const handleFrameMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'frame') return;
    
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const frameId = generateId();
    
    setIsDrawingFrame(true);
    setFrameStartPos(pos);
    setCurrentFrameId(frameId);
    
    // Create frame with minimum size initially
    addNode({
      id: frameId,
      type: 'frameNode',
      position: pos,
      zIndex: 0, // Frames should be below other nodes
      style: {
        width: 1,
        height: 1,
      },
      data: {
        label: 'Frame',
        width: 1,
        height: 1,
      },
    });
  }, [activeTool, screenToFlowPosition, addNode]);

  const handleFrameMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawingFrame || !frameStartPos || !currentFrameId) return;
    
    const currentPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    
    // Calculate width and height (can be negative if dragging left/up)
    const width = Math.abs(currentPos.x - frameStartPos.x);
    const height = Math.abs(currentPos.y - frameStartPos.y);
    
    // Get top-left corner
    const x = Math.min(currentPos.x, frameStartPos.x);
    const y = Math.min(currentPos.y, frameStartPos.y);
    
    // Update frame position and size (both style and data)
    const finalWidth = Math.max(width, 50);
    const finalHeight = Math.max(height, 50);
    
    updateNodeFull(
      currentFrameId, 
      { x, y }, 
      { width: finalWidth, height: finalHeight },
      { width: finalWidth, height: finalHeight }
    );
  }, [isDrawingFrame, frameStartPos, currentFrameId, screenToFlowPosition, updateNodeFull]);

  const handleFrameMouseUp = useCallback(() => {
    if (isDrawingFrame && currentFrameId && frameStartPos) {
      // Finalize the frame
      setIsDrawingFrame(false);
      setFrameStartPos(null);
      setCurrentFrameId(null);
      
      // Switch back to select tool
      setActiveTool('select');
    }
  }, [isDrawingFrame, currentFrameId, frameStartPos, setActiveTool]);

  // Auto-attach nodes to frames when dropped inside
  const handleNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
    // Don't auto-attach frames to other frames
    if (node.type === 'frameNode') return;
    
    // Calculate absolute position of the node
    // If node has a parent, its position is relative to parent
    let absoluteX = node.position.x;
    let absoluteY = node.position.y;
    
    if (node.parentId) {
      const parent = nodes.find(n => n.id === node.parentId);
      if (parent) {
        absoluteX = parent.position.x + node.position.x;
        absoluteY = parent.position.y + node.position.y;
      }
    }
    
    // Find all frame nodes
    const frames = nodes.filter(n => n.type === 'frameNode');
    
    // Check if node is inside any frame
    let foundFrame = false;
    for (const frame of frames) {
      const frameWidth = (frame.style?.width as number) || (frame.data?.width as number) || 200;
      const frameHeight = (frame.style?.height as number) || (frame.data?.height as number) || 150;
      
      // Check if node center is inside frame bounds (using absolute position)
      const isInside = 
        absoluteX >= frame.position.x &&
        absoluteX <= frame.position.x + frameWidth &&
        absoluteY >= frame.position.y &&
        absoluteY <= frame.position.y + frameHeight;
      
      if (isInside) {
        // Only attach if not already attached to this frame
        if (node.parentId !== frame.id) {
          attachNodeToFrame(node.id, frame.id);
        }
        foundFrame = true;
        break;
      }
    }
    
    // If not inside any frame but has a parent, detach it
    if (!foundFrame && node.parentId) {
      const detachFromFrame = useStore.getState().detachNodeFromFrame;
      detachFromFrame(node.id);
    }
  }, [nodes, attachNodeToFrame]);

  // Get cursor based on active tool
  const getCursor = () => {
    if (isSpacePressed || activeTool === 'hand') return 'grab';
    if (['pencil', 'pen'].includes(activeTool)) return 'crosshair';
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
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        minZoom={0.1}
        maxZoom={4}
        proOptions={{ hideAttribution: true }}
        snapToGrid={false}
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        elevateNodesOnSelect={false}
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

      {/* Pencil Drawing Overlay - only active when pencil tool selected */}
      {activeTool === 'pencil' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
            cursor: 'crosshair',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={(e) => {
            // Pass wheel events through to the wrapper for pan/zoom
            e.currentTarget.style.pointerEvents = 'none';
            setTimeout(() => {
              if (e.currentTarget) {
                e.currentTarget.style.pointerEvents = 'auto';
              }
            }, 0);
          }}
        />
      )}

      {/* Frame Drawing Overlay - only active when frame tool selected */}
      {activeTool === 'frame' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
            cursor: 'crosshair',
          }}
          onMouseDown={handleFrameMouseDown}
          onMouseMove={handleFrameMouseMove}
          onMouseUp={handleFrameMouseUp}
          onMouseLeave={handleFrameMouseUp}
          onWheel={(e) => {
            e.currentTarget.style.pointerEvents = 'none';
            setTimeout(() => {
              if (e.currentTarget) {
                e.currentTarget.style.pointerEvents = 'auto';
              }
            }, 0);
          }}
        />
      )}

      {/* Pen Tool - for vector paths with Bézier curves */}
      <PenTool
        onPathComplete={(path: PenPath) => {
          if (path.nodes.length >= 2) {
            // Calculate bounding box from node positions
            const xs = path.nodes.map(n => n.position.x);
            const ys = path.nodes.map(n => n.position.y);
            const minX = Math.min(...xs);
            const minY = Math.min(...ys);
            
            // Final position is top-left of bounding box
            const newPosition = { x: minX, y: minY };
            
            // Normalize nodes to top-left corner
            const normalizedNodes: PenNode[] = path.nodes.map(n => ({
              position: {
                x: n.position.x - minX,
                y: n.position.y - minY,
              },
              handleIn: n.handleIn,
              handleOut: n.handleOut,
              type: n.type,
            }));
            
            // Check if pen drawing is inside any frame
            const frames = nodes.filter(n => n.type === 'frameNode');
            let parentFrame: Node | null = null;
            
            for (const frame of frames) {
              const frameWidth = (frame.style?.width as number) || (frame.data?.width as number) || 200;
              const frameHeight = (frame.style?.height as number) || (frame.data?.height as number) || 150;
              
              const isInside = 
                newPosition.x >= frame.position.x &&
                newPosition.x <= frame.position.x + frameWidth &&
                newPosition.y >= frame.position.y &&
                newPosition.y <= frame.position.y + frameHeight;
              
              if (isInside) {
                parentFrame = frame;
                break;
              }
            }
            
            // Create drawing node with parent if inside frame
            if (parentFrame) {
              addNode({
                id: generateId(),
                type: 'drawingNode',
                position: {
                  x: newPosition.x - parentFrame.position.x,
                  y: newPosition.y - parentFrame.position.y,
                },
                parentId: parentFrame.id,
                extent: 'parent' as const,
                data: {
                  penNodes: normalizedNodes,
                  closed: path.closed,
                  tool: 'pen',
                  color: isDark ? '#ffffff' : '#000000',
                  strokeWidth: 2,
                },
              });
            } else {
              addNode({
                id: generateId(),
                type: 'drawingNode',
                position: newPosition,
                data: {
                  penNodes: normalizedNodes,
                  closed: path.closed,
                  tool: 'pen',
                  color: isDark ? '#ffffff' : '#000000',
                  strokeWidth: 2,
                },
              });
            }
          }
        }}
        onCancel={() => {
          // Just cancel, no action needed
        }}
      />
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

