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
import ShapeNode from '@/components/widgets/ShapeNode';
import TextNode from '@/components/widgets/TextNode';
import DrawingNode from '@/components/widgets/DrawingNode';
import StringEdge from '@/components/canvas/StringEdge';
import PenTool, { PenPath, PenNode } from '@/components/canvas/PenTool';

const nodeTypes = { 
  polaroidNode: PolaroidNode, 
  stickyNote: StickyNote,
  frameNode: FrameNode,
  rectangleNode: ShapeNode, // Map legacy rectangleNode to ShapeNode
  shapeNode: ShapeNode,     // New unified shape node
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
        data: { label: type },
      });
    } else {
      addNode({ id: nodeId, type, position: pos, data: { label: type } });
    }
  }, [screenToFlowPosition, addNode, nodes]);

  // Click on canvas to create element based on active tool
  const onPaneClick = useCallback((e: React.MouseEvent) => {
    // Frame, shapes, text, polaroid, and sticky use drag-to-draw, not click
    if (['select', 'hand', 'comment', 'pencil', 'pen', 'frame', 'rectangle', 'ellipse', 'polygon', 'star', 'line', 'arrow', 'text', 'polaroid', 'sticky'].includes(activeTool)) return;
    
    const toolToNodeType: Record<string, string> = {
      rectangle: 'shapeNode',
      ellipse: 'shapeNode',
      polygon: 'shapeNode',
      star: 'shapeNode',
      line: 'shapeNode',
      arrow: 'shapeNode',
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
    
    const nodeData = { 
      label: nodeType,
      // For shape nodes, pass the specific shape type (e.g. 'ellipse')
      type: nodeType === 'shapeNode' ? (activeTool === 'rectangle' ? 'rectangle' : activeTool) : undefined
    };

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
        data: nodeData,
      });
    } else {
      addNode({
        id: nodeId,
        type: nodeType,
        position: pos,
        data: nodeData,
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
    
    // Calculate current bounds to handle negative coordinates
    const xs = drawingPointsRef.current.map(p => p.x);
    const ys = drawingPointsRef.current.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    
    // Update node position to account for negative coordinates
    // This keeps the visual drawing under the cursor
    const currentPosition = {
      x: origin.x + minX,
      y: origin.y + minY,
    };
    
    // Shift points relative to current top-left
    const shiftedPoints = drawingPointsRef.current.map(p => ({
      x: p.x - minX,
      y: p.y - minY,
    }));
    
    // Update the drawing node with new position and shifted points
    updateNode(currentDrawingId, currentPosition, {
      points: shiftedPoints,
    });
  }, [isDrawing, currentDrawingId, screenToFlowPosition, updateNode]);

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

  // Shape drawing state
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStartPos, setShapeStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentShapeId, setCurrentShapeId] = useState<string | null>(null);

  // Text drawing state
  const [isDrawingText, setIsDrawingText] = useState(false);
  const [textStartPos, setTextStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);

  // Polaroid drawing state
  const [isDrawingPolaroid, setIsDrawingPolaroid] = useState(false);
  const [polaroidStartPos, setPolaroidStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPolaroidId, setCurrentPolaroidId] = useState<string | null>(null);

  // Sticky note drawing state
  const [isDrawingSticky, setIsDrawingSticky] = useState(false);
  const [stickyStartPos, setStickyStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentStickyId, setCurrentStickyId] = useState<string | null>(null);

  // Shape drawing handlers - drag to draw shape size
  const handleShapeMouseDown = useCallback((e: React.MouseEvent) => {
    if (!['rectangle', 'ellipse', 'polygon', 'star', 'line', 'arrow'].includes(activeTool)) return;
    
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const nodeId = generateId();
    
    setIsDrawingShape(true);
    setShapeStartPos(pos);
    setCurrentShapeId(nodeId);
    
    const nodeData = { 
      label: activeTool,
      type: activeTool === 'rectangle' ? 'rectangle' : activeTool,
      // Default styles for newly created shapes
      stroke: isDark ? '#e5e5e5' : '#000000',
      fill: isDark ? '#2d2d2d' : '#ffffff',
      strokeWidth: 2,
    };

    // Create shape with minimum size initially
    addNode({
      id: nodeId,
      type: 'shapeNode',
      position: pos,
      style: { width: 1, height: 1 }, // Start small
      data: nodeData,
    });
  }, [activeTool, screenToFlowPosition, addNode, isDark]);

  const handleShapeMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawingShape || !shapeStartPos || !currentShapeId) return;
    
    const currentPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    
    // Calculate width and height
    const width = Math.abs(currentPos.x - shapeStartPos.x);
    const height = Math.abs(currentPos.y - shapeStartPos.y);
    
    // Get top-left corner
    const x = Math.min(currentPos.x, shapeStartPos.x);
    const y = Math.min(currentPos.y, shapeStartPos.y);
    
    // Update shape position and size
    const finalWidth = Math.max(width, 10); // Minimum 10px to avoid accidental tiny shapes
    const finalHeight = Math.max(height, 10);
    
    // For Infinite Canvas shapes, we usually update dimensions via style or data (ShapeNode uses width/height props or style)
    // ShapeNode implementation uses `width` and `height` props if available, falling back to data? 
    // Let's update style width/height which is standard for sizing.
    updateNodeFull(
      currentShapeId, 
      { x, y }, 
      { width: finalWidth, height: finalHeight },
      { width: finalWidth, height: finalHeight }
    );
  }, [isDrawingShape, shapeStartPos, currentShapeId, screenToFlowPosition, updateNodeFull]);

  const handleShapeMouseUp = useCallback(() => {
    if (isDrawingShape && currentShapeId && shapeStartPos) {
      
      // Check if shape is inside any frame (auto-parenting)
      // Get the final node to check its position/size
      const node = useStore.getState().nodes.find(n => n.id === currentShapeId);
      if (node) {
        const shapeWidth = (node.style?.width as number) || 50;
        const shapeHeight = (node.style?.height as number) || 50;
        const shapeX = node.position.x;
        const shapeY = node.position.y;
        
        // Find frames
        const frames = useStore.getState().nodes.filter(n => n.type === 'frameNode');
        let parentFrame: Node | null = null;
        
        for (const frame of frames) {
          const frameWidth = (frame.style?.width as number) || (frame.data?.width as number) || 200;
          const frameHeight = (frame.style?.height as number) || (frame.data?.height as number) || 150;
          
          // Check if shape is inside frame
          // Using a simple center-point check or full containment check?
          // Let's use full containment for auto-parenting on creation
          const isInside = 
            shapeX >= frame.position.x &&
            shapeX + shapeWidth <= frame.position.x + frameWidth &&
            shapeY >= frame.position.y &&
            shapeY + shapeHeight <= frame.position.y + frameHeight;
            
          if (isInside) {
            parentFrame = frame;
            break;
          }
        }
        
        if (parentFrame) {
             const attachNodeToFrame = useStore.getState().attachNodeToFrame;
             attachNodeToFrame(currentShapeId, parentFrame.id);
        }
      }

      setIsDrawingShape(false);
      setShapeStartPos(null);
      setCurrentShapeId(null);
      
      // Switch back to select tool
      setActiveTool('select');
    }
  }, [isDrawingShape, currentShapeId, shapeStartPos, setActiveTool]);

  // Text drawing handlers - drag to draw text box size
  const handleTextMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'text') return;
    
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const nodeId = generateId();
    
    setIsDrawingText(true);
    setTextStartPos(pos);
    setCurrentTextId(nodeId);
    
    // Create initial text node with minimum size
    addNode({
      id: nodeId,
      type: 'textNode',
      position: pos,
      style: { width: 10, height: 10 },
      data: { text: 'Type something', label: 'textNode' },
    });
  }, [activeTool, screenToFlowPosition, addNode]);

  const handleTextMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawingText || !textStartPos || !currentTextId) return;
    
    const currentPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    
    // Calculate width and height
    const width = Math.abs(currentPos.x - textStartPos.x);
    const height = Math.abs(currentPos.y - textStartPos.y);
    
    // Minimum dimensions
    const finalWidth = Math.max(50, width);
    const finalHeight = Math.max(24, height);
    
    // Calculate position (top-left corner)
    const x = Math.min(textStartPos.x, currentPos.x);
    const y = Math.min(textStartPos.y, currentPos.y);
    
    // Update node position and size
    updateNodeFull(
      currentTextId,
      { x, y },
      { width: finalWidth, height: finalHeight },
      { width: finalWidth, height: finalHeight }
    );
  }, [isDrawingText, textStartPos, currentTextId, screenToFlowPosition, updateNodeFull]);

  const handleTextMouseUp = useCallback(() => {
    if (isDrawingText && currentTextId && textStartPos) {
      // Check for auto-parenting to frames
      const currentNode = useStore.getState().nodes.find(n => n.id === currentTextId);
      
      if (currentNode) {
        const textX = currentNode.position.x;
        const textY = currentNode.position.y;
        const textWidth = (currentNode.style?.width as number) || 50;
        const textHeight = (currentNode.style?.height as number) || 24;
        
        // Find frames
        const frames = useStore.getState().nodes.filter(n => n.type === 'frameNode');
        let parentFrame: Node | null = null;
        
        for (const frame of frames) {
          const frameWidth = (frame.style?.width as number) || (frame.data?.width as number) || 200;
          const frameHeight = (frame.style?.height as number) || (frame.data?.height as number) || 150;
          
          // Check if text is inside frame
          const isInside = 
            textX >= frame.position.x &&
            textX + textWidth <= frame.position.x + frameWidth &&
            textY >= frame.position.y &&
            textY + textHeight <= frame.position.y + frameHeight;
            
          if (isInside) {
            parentFrame = frame;
            break;
          }
        }
        
        if (parentFrame) {
          const attachNodeToFrame = useStore.getState().attachNodeToFrame;
          attachNodeToFrame(currentTextId, parentFrame.id);
        }
      }

      setIsDrawingText(false);
      setTextStartPos(null);
      setCurrentTextId(null);
      
      // Switch back to select tool
      setActiveTool('select');
    }
  }, [isDrawingText, currentTextId, textStartPos, setActiveTool]);

  // Polaroid drawing handlers - drag to draw polaroid size
  const handlePolaroidMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'polaroid') return;
    
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const nodeId = generateId();
    
    setIsDrawingPolaroid(true);
    setPolaroidStartPos(pos);
    setCurrentPolaroidId(nodeId);
    
    // Create initial polaroid node with minimum size
    addNode({
      id: nodeId,
      type: 'polaroidNode',
      position: pos,
      style: { width: 10, height: 10 },
      data: { label: 'polaroidNode' },
    });
  }, [activeTool, screenToFlowPosition, addNode]);

  const handlePolaroidMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawingPolaroid || !polaroidStartPos || !currentPolaroidId) return;
    
    const currentPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    
    const width = Math.abs(currentPos.x - polaroidStartPos.x);
    const height = Math.abs(currentPos.y - polaroidStartPos.y);
    
    // Minimum dimensions for polaroid (needs space for image + caption)
    const finalWidth = Math.max(200, width);
    const finalHeight = Math.max(250, height);
    
    const x = Math.min(polaroidStartPos.x, currentPos.x);
    const y = Math.min(polaroidStartPos.y, currentPos.y);
    
    updateNodeFull(
      currentPolaroidId,
      { x, y },
      { width: finalWidth, height: finalHeight },
      { width: finalWidth, height: finalHeight }
    );
  }, [isDrawingPolaroid, polaroidStartPos, currentPolaroidId, screenToFlowPosition, updateNodeFull]);

  const handlePolaroidMouseUp = useCallback(() => {
    if (isDrawingPolaroid && currentPolaroidId && polaroidStartPos) {
      // Check for auto-parenting to frames
      const currentNode = useStore.getState().nodes.find(n => n.id === currentPolaroidId);
      
      if (currentNode) {
        const nodeX = currentNode.position.x;
        const nodeY = currentNode.position.y;
        const nodeWidth = (currentNode.style?.width as number) || 200;
        const nodeHeight = (currentNode.style?.height as number) || 250;
        
        const frames = useStore.getState().nodes.filter(n => n.type === 'frameNode');
        let parentFrame: Node | null = null;
        
        for (const frame of frames) {
          const frameWidth = (frame.style?.width as number) || (frame.data?.width as number) || 200;
          const frameHeight = (frame.style?.height as number) || (frame.data?.height as number) || 150;
          
          const isInside = 
            nodeX >= frame.position.x &&
            nodeX + nodeWidth <= frame.position.x + frameWidth &&
            nodeY >= frame.position.y &&
            nodeY + nodeHeight <= frame.position.y + frameHeight;
            
          if (isInside) {
            parentFrame = frame;
            break;
          }
        }
        
        if (parentFrame) {
          const attachNodeToFrame = useStore.getState().attachNodeToFrame;
          attachNodeToFrame(currentPolaroidId, parentFrame.id);
        }
      }

      setIsDrawingPolaroid(false);
      setPolaroidStartPos(null);
      setCurrentPolaroidId(null);
      setActiveTool('select');
    }
  }, [isDrawingPolaroid, currentPolaroidId, polaroidStartPos, setActiveTool]);

  // Sticky note drawing handlers - drag to draw sticky size
  const handleStickyMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'sticky') return;
    
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const nodeId = generateId();
    
    setIsDrawingSticky(true);
    setStickyStartPos(pos);
    setCurrentStickyId(nodeId);
    
    // Create initial sticky note with minimum size
    addNode({
      id: nodeId,
      type: 'stickyNote',
      position: pos,
      style: { width: 10, height: 10 },
      data: { label: 'stickyNote' },
    });
  }, [activeTool, screenToFlowPosition, addNode]);

  const handleStickyMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawingSticky || !stickyStartPos || !currentStickyId) return;
    
    const currentPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    
    const width = Math.abs(currentPos.x - stickyStartPos.x);
    const height = Math.abs(currentPos.y - stickyStartPos.y);
    
    // Minimum dimensions for sticky note
    const finalWidth = Math.max(120, width);
    const finalHeight = Math.max(100, height);
    
    const x = Math.min(stickyStartPos.x, currentPos.x);
    const y = Math.min(stickyStartPos.y, currentPos.y);
    
    updateNodeFull(
      currentStickyId,
      { x, y },
      { width: finalWidth, height: finalHeight },
      { width: finalWidth, height: finalHeight }
    );
  }, [isDrawingSticky, stickyStartPos, currentStickyId, screenToFlowPosition, updateNodeFull]);

  const handleStickyMouseUp = useCallback(() => {
    if (isDrawingSticky && currentStickyId && stickyStartPos) {
      // Check for auto-parenting to frames
      const currentNode = useStore.getState().nodes.find(n => n.id === currentStickyId);
      
      if (currentNode) {
        const nodeX = currentNode.position.x;
        const nodeY = currentNode.position.y;
        const nodeWidth = (currentNode.style?.width as number) || 120;
        const nodeHeight = (currentNode.style?.height as number) || 100;
        
        const frames = useStore.getState().nodes.filter(n => n.type === 'frameNode');
        let parentFrame: Node | null = null;
        
        for (const frame of frames) {
          const frameWidth = (frame.style?.width as number) || (frame.data?.width as number) || 200;
          const frameHeight = (frame.style?.height as number) || (frame.data?.height as number) || 150;
          
          const isInside = 
            nodeX >= frame.position.x &&
            nodeX + nodeWidth <= frame.position.x + frameWidth &&
            nodeY >= frame.position.y &&
            nodeY + nodeHeight <= frame.position.y + frameHeight;
            
          if (isInside) {
            parentFrame = frame;
            break;
          }
        }
        
        if (parentFrame) {
          const attachNodeToFrame = useStore.getState().attachNodeToFrame;
          attachNodeToFrame(currentStickyId, parentFrame.id);
        }
      }

      setIsDrawingSticky(false);
      setStickyStartPos(null);
      setCurrentStickyId(null);
      setActiveTool('select');
    }
  }, [isDrawingSticky, currentStickyId, stickyStartPos, setActiveTool]);

  // Auto-attach nodes to frames when dropped inside
  const handleNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
    // Don't auto-attach frames to other frames
    if (node.type === 'frameNode') return;
    
    // Get FRESH nodes from store - important to avoid stale closure
    const currentNodes = useStore.getState().nodes;
        
    // The node parameter has the CURRENT position after drag
    // Calculate absolute position of the node
    let absoluteX = node.position.x;
    let absoluteY = node.position.y;
    
    if (node.parentId) {
      const parent = currentNodes.find(n => n.id === node.parentId);
      if (parent) {
        absoluteX = parent.position.x + node.position.x;
        absoluteY = parent.position.y + node.position.y;
      }
    }
    
    console.log('Absolute position:', absoluteX, absoluteY);
    
    // Find all frame nodes from FRESH nodes
    const frames = currentNodes.filter(n => n.type === 'frameNode');
    console.log('Frames found:', frames.length);
    
    // Check if node is inside any frame
    let foundFrame: Node | null = null;
    for (const frame of frames) {
      const frameWidth = (frame.style?.width as number) || (frame.data?.width as number) || 200;
      const frameHeight = (frame.style?.height as number) || (frame.data?.height as number) || 150;
      
      // Check if node position is inside frame bounds (using absolute position)
      const isInside = 
        absoluteX >= frame.position.x &&
        absoluteX <= frame.position.x + frameWidth &&
        absoluteY >= frame.position.y &&
        absoluteY <= frame.position.y + frameHeight;
      
      if (isInside) {
        foundFrame = frame;
        break;
      }
    }
    
    if (foundFrame) {
      // Only attach if not already attached to this frame
      if (node.parentId !== foundFrame.id) {
        // Calculate relative position for attachment
        const relativeX = absoluteX - foundFrame.position.x;
        const relativeY = absoluteY - foundFrame.position.y;
        
        // Update node with parent and relative position
        // IMPORTANT: Reorder nodes so parent (frame) comes BEFORE child
        const setNodes = useStore.getState().setNodes;
        
        const updatedNode = { 
          ...currentNodes.find(n => n.id === node.id)!, 
          parentId: foundFrame!.id, 
          position: { x: relativeX, y: relativeY } 
        };
        
        // Filter out the node being attached, then add it after its parent frame
        const otherNodes = currentNodes.filter(n => n.id !== node.id);
        const frameIndex = otherNodes.findIndex(n => n.id === foundFrame!.id);
        
        // Insert the child node right after the parent frame
        const reorderedNodes = [
          ...otherNodes.slice(0, frameIndex + 1),
          updatedNode,
          ...otherNodes.slice(frameIndex + 1)
        ];
        
        setNodes(reorderedNodes);
      }
    } else if (node.parentId) {
      // If not inside any frame but has a parent, detach it
      const detachFromFrame = useStore.getState().detachNodeFromFrame;
      detachFromFrame(node.id);
    }
  }, []); // No dependencies - we get fresh state inside

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
        // Performance optimizations
        onlyRenderVisibleElements={true}
        autoPanOnNodeDrag={false}
        deleteKeyCode="Delete" // Enable delete key for nodes
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

      {/* Shape Drawing Overlay - active when any shape tool is selected */}
      {['rectangle', 'ellipse', 'polygon', 'star', 'line', 'arrow'].includes(activeTool) && (
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
          onMouseDown={handleShapeMouseDown}
          onMouseMove={handleShapeMouseMove}
          onMouseUp={handleShapeMouseUp}
          onMouseLeave={handleShapeMouseUp}
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

      {/* Text Drawing Overlay - active when text tool is selected */}
      {activeTool === 'text' && (
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
          onMouseDown={handleTextMouseDown}
          onMouseMove={handleTextMouseMove}
          onMouseUp={handleTextMouseUp}
          onMouseLeave={handleTextMouseUp}
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

      {/* Polaroid Drawing Overlay - active when polaroid tool is selected */}
      {activeTool === 'polaroid' && (
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
          onMouseDown={handlePolaroidMouseDown}
          onMouseMove={handlePolaroidMouseMove}
          onMouseUp={handlePolaroidMouseUp}
          onMouseLeave={handlePolaroidMouseUp}
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

      {/* Sticky Note Drawing Overlay - active when sticky tool is selected */}
      {activeTool === 'sticky' && (
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
          onMouseDown={handleStickyMouseDown}
          onMouseMove={handleStickyMouseMove}
          onMouseUp={handleStickyMouseUp}
          onMouseLeave={handleStickyMouseUp}
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

