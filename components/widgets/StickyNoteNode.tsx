"use client"

import { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export default function StickyNoteNode({ data }: NodeProps) {
  const initialText = typeof data?.text === 'string' ? data.text : "";
  const [text, setText] = useState(initialText);

  return (
    <div className="bg-gradient-to-br from-yellow-300 to-yellow-400 dark:from-yellow-700 dark:to-yellow-600 text-yellow-900 dark:text-yellow-50 border-2 border-yellow-400 dark:border-yellow-500 rounded-lg p-4 shadow-xl w-[240px] min-h-[200px] backdrop-blur-sm group relative">
      {/* Paper texture effect */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,0,0,0.03)_1px,rgba(0,0,0,0.03)_2px)] pointer-events-none rounded-lg"></div>
      
      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-full bg-transparent resize-none outline-none relative z-10 text-sm leading-relaxed placeholder:text-yellow-800/50 dark:placeholder:text-yellow-200/50 font-medium" 
        placeholder="Type your notes here..."
        style={{ fontFamily: 'inherit' }}
      />
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity bg-yellow-500" />
      <Handle type="target" position={Position.Top} className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity bg-yellow-500" />
    </div>
  );
}
