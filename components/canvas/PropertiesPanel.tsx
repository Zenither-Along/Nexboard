"use client"

import React from 'react';
import { useTheme } from 'next-themes';
import useStore from '@/store/useStore';

interface NodeData {
  label?: string;
  fill?: string;
  opacity?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  width?: number;
  height?: number;
  [key: string]: any;
}

const fontFamilies = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'];
const fontWeights = [
  { label: 'Regular', value: 400 },
  { label: 'Bold', value: 700 },
];

export default function PropertiesPanel() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const nodes = useStore((state) => state.nodes);
  const setNodes = useStore((state) => state.setNodes);
  
  const selectedNode = nodes.find(n => n.selected);

  const baseStyle = {
    backgroundColor: isDark ? '#252526' : '#f8f8f8',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
  };

  const containerStyle = {
    position: 'fixed' as const,
    right: 0,
    top: 0,
    height: '100vh',
    width: '256px',
    borderLeft: '1px solid ' + baseStyle.borderColor,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column' as const,
    ...baseStyle,
    boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
  };

  if (!selectedNode) {
    return null;
  }

  // Safe data access
  const safeData = (selectedNode.data || {}) as NodeData;
  const isText = selectedNode.type === 'textNode';
  const isSticky = selectedNode.type === 'stickyNote';
  const isShape = ['rectangleNode', 'frameNode', 'stickyNote'].includes(selectedNode.type || '');

  const updateNodeData = (key: string, value: any) => {
    setNodes(nodes.map(n => 
      n.id === selectedNode.id 
        ? { ...n, data: { ...n.data, [key]: value } }
        : n
    ));
  };

  const updateNodePosition = (axis: 'x' | 'y', value: number) => {
    setNodes(nodes.map(n => 
      n.id === selectedNode.id 
        ? { ...n, position: { ...n.position, [axis]: value } }
        : n
    ));
  };

  // Helper for inputs
  const inputClass = "w-full bg-black/5 dark:bg-white/5 rounded px-2 py-1 text-xs border-none outline-none";
  const labelClass = "text-[10px] uppercase tracking-wider font-semibold opacity-50 mb-2 block";

  return (
    <div style={containerStyle}>
       <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: baseStyle.borderColor }}>
          <span className="font-medium text-sm">Design</span>
          <span className="text-[10px] px-2 py-1 rounded bg-black/5 dark:bg-white/10 opacity-70">
            {selectedNode.type}
          </span>
       </div>

       <div className="p-4 space-y-6 overflow-y-auto">
          {/* Position */}
          <div>
            <label className={labelClass}>Position</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-50 w-2">X</span>
                <input 
                  type="number" 
                  value={Math.round(selectedNode.position.x)} 
                  onChange={e => updateNodePosition('x', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-50 w-2">Y</span>
                <input 
                  type="number" 
                  value={Math.round(selectedNode.position.y)} 
                  onChange={e => updateNodePosition('y', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Size (Only for shapes) */}
          {(isShape || selectedNode.measured) && (
             <div>
               <label className={labelClass}>Size</label>
               <div className="grid grid-cols-2 gap-2">
                 <div className="flex items-center gap-2">
                   <span className="text-xs opacity-50 w-2">W</span>
                   <input 
                     type="number" 
                     value={Math.round(selectedNode.measured?.width || 0)} 
                     disabled
                     className={inputClass + " opacity-50 cursor-not-allowed"}
                   />
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="text-xs opacity-50 w-2">H</span>
                   <input 
                     type="number" 
                     value={Math.round(selectedNode.measured?.height || 0)} 
                     disabled
                     className={inputClass + " opacity-50 cursor-not-allowed"}
                   />
                 </div>
               </div>
             </div>
          )}

          {/* Fill / Color */}
          {(isShape || isText) && (
            <div>
              <label className={labelClass}>{isText ? 'Color' : 'Fill'}</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={safeData.fill || (isSticky ? '#fef3c7' : '#ffffff')}
                  onChange={e => updateNodeData('fill', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                />
                <input 
                  type="text" 
                  value={safeData.fill || (isSticky ? '#fef3c7' : '#ffffff')}
                  onChange={e => updateNodeData('fill', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Opacity */}
           <div>
            <label className={labelClass}>Opacity</label>
             <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={safeData.opacity ?? 100}
                  onChange={e => updateNodeData('opacity', Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs w-8 text-right font-mono">{safeData.opacity ?? 100}%</span>
             </div>
           </div>

          {/* Type Specific: Text */}
          {isText && (
            <div>
               <label className={labelClass}>Typography</label>
               <select 
                  value={safeData.fontFamily || 'Inter'}
                  onChange={e => updateNodeData('fontFamily', e.target.value)}
                  className={inputClass + " mb-2"}
                >
                  {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
               </select>
               <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    value={safeData.fontSize || 16} 
                    onChange={e => updateNodeData('fontSize', Number(e.target.value))}
                    className={inputClass}
                  />
                  <select 
                    value={safeData.fontWeight || 400}
                    onChange={e => updateNodeData('fontWeight', Number(e.target.value))}
                    className={inputClass}
                  >
                    {fontWeights.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                  </select>
               </div>
            </div>
          )}
       </div>
    </div>
  );
}
