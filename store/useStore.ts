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

export type Tool = 'select' | 'hand' | 'frame' | 'rectangle' | 'text' | 'polaroid' | 'sticky' | 'comment';

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
}));

export default useStore;
