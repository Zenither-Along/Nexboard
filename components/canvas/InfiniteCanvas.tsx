"use client"

import React, { useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Panel,
  ReactFlowProvider,
  Node,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useStore from '@/store/useStore';
import { useTheme } from 'next-themes';
import PomodoroNode from '@/components/widgets/PomodoroNode';
import AmbienceNode from '@/components/widgets/AmbienceNode';
import StickyNoteNode from '@/components/widgets/StickyNoteNode';
import { Toolbar } from '@/components/ui/Toolbar';

// Register custom node types
const nodeTypes = {
  pomodoro: PomodoroNode,
  ambience: AmbienceNode,
  stickyNote: StickyNoteNode,
};

function Flow() {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const onConnect = useStore((state) => state.onConnect);
  const setNodes = useStore((state) => state.setNodes);
  const { theme } = useTheme();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const idCounter = useRef(0);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${idCounter.current++}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes([...nodes, newNode]);
    },
    [screenToFlowPosition, nodes, setNodes]
  );

  return (
    <div className="w-full h-screen bg-background text-foreground transition-colors duration-300" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        minZoom={0.1}
        maxZoom={4}
      >
        <Background 
            color={theme === 'dark' ? '#333' : '#ccc'} 
            gap={20} 
        />
        <Controls 
            position="bottom-right"
            className="!right-6 !bottom-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg" 
        />
        <MiniMap 
            className="bg-card border border-border" 
            nodeColor={theme === 'dark' ? '#fff' : '#000'}
            maskColor={theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'}
        />
        
        <Panel position="top-right" className="m-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flow Canvas</h1>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function InfiniteCanvas() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    )
}
