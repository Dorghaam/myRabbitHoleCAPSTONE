"use client";

// the main graph canvas that renders all the nodes and edges
// uses reactflow to handle panning, zooming, and dragging
// handles panning, zooming, dragging, and node selection

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  TopicNode,
  ContentNode,
  TermNode,
  WikipediaNode,
  BookNode,
} from "./nodes";
import { ConceptNodeData, ConceptEdgeData } from "@/types";

// register our custom node types with reactflow
const nodeTypes: NodeTypes = {
  topic: TopicNode,
  content: ContentNode,
  term: TermNode,
  wikipedia: WikipediaNode,
  book: BookNode,
};

// props that the canvas needs from its parent
interface CanvasProps {
  nodes: Node<ConceptNodeData>[];
  edges: Edge<ConceptEdgeData>[];
  onNodesChange: OnNodesChange<Node<ConceptNodeData>>;
  onEdgesChange: OnEdgesChange<Edge<ConceptEdgeData>>;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
}

export function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  selectedNodeId,
  onSelectNode,
}: CanvasProps) {
  // clicking a node selects it and opens the sidebar
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<ConceptNodeData>) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  // clicking the background deselects any selected node
  const handlePaneClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  // default style for the lines connecting nodes
  const defaultEdgeOptions = useMemo(
    () => ({
      type: "bezier",
      style: {
        stroke: "#9CA3AF",
        strokeWidth: 2,
      },
    }),
    []
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        panOnScroll={false}
        zoomOnScroll
        zoomOnPinch
        selectNodesOnDrag={false}
        proOptions={{ hideAttribution: true }}
      >
        {/* dot grid background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#E2E8F0"
        />

        {/* zoom controls */}
        <Controls
          showInteractive={false}
          className="!bg-white !border !border-node-border !rounded-lg !shadow-sm"
        />

        {/* mini map in the corner */}
        <MiniMap
          nodeColor={(node) => {
            if (node.id === selectedNodeId) return "#EC4899";
            return "#E2E8F0";
          }}
          maskColor="rgba(248, 250, 252, 0.8)"
          className="!bg-white !border !border-node-border !rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}
