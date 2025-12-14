"use client"

import React from 'react';
import useStore from '@/store/useStore';
import { useTheme } from 'next-themes';

export default function PropertiesPanel() {
  const nodes = useStore((state) => state.nodes);
  const setNodes = useStore((state) => state.setNodes);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const selectedNode = nodes.find((node) => node.selected);

  if (!selectedNode) {
    return null;
  }

  const handleChange = (key: string, value: any) => {
    setNodes(nodes.map((node) => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          data: {
            ...node.data,
            [key]: value,
          },
        };
      }
      return node;
    }));
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    setNodes(nodes.map((node) => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          position: {
            ...node.position,
            [axis]: value,
          },
        };
      }
      return node;
    }));
  };

  return (
    <div 
      className="absolute right-4 top-20 w-64 p-4 rounded-lg backdrop-blur-md border shadow-lg z-50"
      style={{
        backgroundColor: isDark ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.8)',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        color: isDark ? '#fff' : '#000'
      }}
    >
      <h3 className="font-medium mb-4 text-xs uppercase tracking-wider opacity-60">Properties</h3>
      
      <div className="space-y-4">
        {/* Type Display */}
        <div className="text-xs opacity-50 mb-2">
          Type: {selectedNode.type}
        </div>

        {/* Label Input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs opacity-70">Label</label>
          <input
            type="text"
            value={(selectedNode.data.label as string) || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-2 py-1 rounded text-sm border bg-transparent"
            style={{
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            }}
          />
        </div>

        {/* Position Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs opacity-70">X</label>
            <input
              type="number"
              value={Math.round(selectedNode.position.x)}
              onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 rounded text-sm border bg-transparent"
              style={{
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs opacity-70">Y</label>
            <input
              type="number"
              value={Math.round(selectedNode.position.y)}
              onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 rounded text-sm border bg-transparent"
              style={{
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
