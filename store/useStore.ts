import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';

export type Tool = 'select' | 'hand' | 'pencil' | 'pen' | 'frame' | 'rectangle' | 'line' | 'arrow' | 'ellipse' | 'polygon' | 'star' | 'text' | 'polaroid' | 'sticky' | 'comment';

type State = {
  nodes: Node[];
  edges: Edge[];
  activeTool: Tool;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setActiveTool: (tool: Tool) => void;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  updateNode: (nodeId: string, position: { x: number; y: number }, data: Record<string, unknown>) => void;
  updateNodeFull: (nodeId: string, position: { x: number; y: number }, style: Record<string, unknown>, data: Record<string, unknown>) => void;
  attachNodeToFrame: (nodeId: string, frameId: string) => void;
  detachNodeFromFrame: (nodeId: string) => void;
};

const useStore = create<State>((set, get) => ({
  nodes: [],
  edges: [],
  activeTool: 'select',
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes: Node[]) => {
    set({ nodes });
  },
  setEdges: (edges: Edge[]) => {
    set({ edges });
  },
  setActiveTool: (tool: Tool) => {
    set({ activeTool: tool });
  },
  addNode: (node: Node) => {
    set({ nodes: [...get().nodes, node] });
  },
  updateNodeData: (nodeId: string, newData: Record<string, unknown>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      ),
    });
  },
  updateNode: (nodeId: string, position: { x: number; y: number }, newData: Record<string, unknown>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, position, data: { ...node.data, ...newData } }
          : node
      ),
    });
  },
  updateNodeFull: (nodeId: string, position: { x: number; y: number }, newStyle: Record<string, unknown>, newData: Record<string, unknown>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { 
              ...node, 
              position, 
              style: { ...node.style, ...newStyle },
              data: { ...node.data, ...newData } 
            }
          : node
      ),
    });
  },
  attachNodeToFrame: (nodeId: string, frameId: string) => {
    const nodes = get().nodes;
    const node = nodes.find(n => n.id === nodeId);
    const frame = nodes.find(n => n.id === frameId);
    
    if (!node || !frame || node.id === frameId) return;
    
    // Convert absolute position to relative position within frame
    const relativeX = node.position.x - frame.position.x;
    const relativeY = node.position.y - frame.position.y;
    
    set({
      nodes: nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              parentId: frameId,
              position: { x: relativeX, y: relativeY },
            }
          : n
      ),
    });
  },
  detachNodeFromFrame: (nodeId: string) => {
    const nodes = get().nodes;
    const node = nodes.find(n => n.id === nodeId);
    
    if (!node || !node.parentId) return;
    
    const parent = nodes.find(n => n.id === node.parentId);
    if (!parent) return;
    
    // Convert relative position back to absolute
    const absoluteX = parent.position.x + node.position.x;
    const absoluteY = parent.position.y + node.position.y;
    
    set({
      nodes: nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              parentId: undefined,
              extent: undefined,
              position: { x: absoluteX, y: absoluteY },
            }
          : n
      ),
    });
  },
}));

export default useStore;
