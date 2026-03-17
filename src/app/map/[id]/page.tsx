"use client";

// the map page that shows the interactive graph view for a rabbit hole
// loads the rabbit hole data from supabase and renders the reactflow canvas
// if the map is new (no nodes yet) it creates a root topic node automatically

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
} from "@xyflow/react";
import { Canvas } from "@/components/canvas/Canvas";
import { PromptSidebar } from "@/components/sidebar/PromptSidebar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { ConceptNodeData, ConceptEdgeData, NodeType, NodeColor, PromptType } from "@/types";
import { createTopicNode, getNodeLabel } from "@/utils/nodeUtils";

export default function MapPage() {
  const params = useParams();
  const mapId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  // state for the graph
  const [nodes, setNodes] = useState<Node<ConceptNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge<ConceptEdgeData>[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [mapTitle, setMapTitle] = useState(""); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);

  // load the rabbit hole data from supabase
  useEffect(() => {
    if (authLoading) return;

    // if not logged in, redirect to login
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const loadMap = async () => {
      // first get the rabbit hole info
      const { data: rabbitHole, error: rhError } = await supabase
        .from("rabbit_holes")
        .select("*")
        .eq("id", mapId)
        .single();

      if (rhError || !rabbitHole) {
        console.error("failed to load rabbit hole:", rhError);
        setLoading(false);
        return;
      }

      setMapTitle(rabbitHole.title);

      // load existing nodes from supabase
      const { data: dbNodes } = await supabase
        .from("nodes")
        .select("*")
        .eq("rabbit_hole_id", mapId);

      // load existing edges from supabase
      const { data: dbEdges } = await supabase
        .from("edges")
        .select("*")
        .eq("rabbit_hole_id", mapId);

      if (dbNodes && dbNodes.length > 0) {
        // convert database nodes to reactflow nodes
        const flowNodes: Node<ConceptNodeData>[] = dbNodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: { x: n.x || 0, y: n.y || 0 },
          data: {
            id: n.id,
            type: n.type as NodeType,
            color: NodeColor.DEFAULT,
            parentId: null,
            childIds: [],
            createdAt: n.created_at,
            promptType: null,
            // spread any extra fields based on node type
            ...(n.type === "topic" && { topic: n.label }),
            ...(n.type === "content" && {
              title: n.label,
              content: n.content || "",
            }),
            ...(n.type === "term" && {
              term: n.label,
              definition: n.content,
            }),
            ...(n.type === "wikipedia" && {
              title: n.label,
              extract: n.content || "",
              pageUrl: n.url || "",
            }),
            ...(n.type === "book" && {
              title: n.label,
              author: "",
              coverUrl: n.url,
              description: n.content || "",
            }),
          } as ConceptNodeData,
        }));

        // convert database edges to reactflow edges
        const flowEdges: Edge<ConceptEdgeData>[] = (dbEdges || []).map((e) => ({
          id: e.id,
          source: e.source_node_id,
          target: e.target_node_id,
          sourceHandle: "bottom",
          targetHandle: "top",
          type: "bezier",
          data: {
            id: e.id,
            source: e.source_node_id,
            target: e.target_node_id,
            sourceHandle: "bottom",
            targetHandle: "top",
          },
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
      } else {
        // no nodes yet, create a root topic node
        const topicNode = createTopicNode(rabbitHole.title, { x: 400, y: 100 });
        setNodes([topicNode]);

        // save the root node to supabase
        await supabase.from("nodes").insert({
          id: topicNode.id,
          rabbit_hole_id: mapId,
          label: rabbitHole.title,
          type: "topic",
          x: 400,
          y: 100,
        });
      }

      setLoading(false);
    };

    loadMap();
  }, [mapId, user, authLoading]);

  // reactflow change handlers
  const onNodesChange: OnNodesChange<Node<ConceptNodeData>> = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  const onEdgesChange: OnEdgesChange<Edge<ConceptEdgeData>> = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  const handleSelectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  // get the label of the currently selected node (for the sidebar header)
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedNodeLabel = selectedNode ? getNodeLabel(selectedNode) : "";

  // placeholder handler for when prompt buttons are clicked
  // this will be wired up to ai generation in a future commit
  const handlePromptClick = useCallback(
    (type: PromptType, customPrompt?: string) => { // eslint-disable-line @typescript-eslint/no-unused-vars
      console.log("prompt clicked:", type, customPrompt);
    },
    []
  );

  // show loading while we fetch
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-gray-500">loading map...</p>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="h-[calc(100vh-73px)] w-full bg-canvas-bg relative">
        <Canvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
        />

        {/* sidebar shows on the right when a node is selected */}
        {selectedNodeId && selectedNode && (
          <div className="absolute top-0 right-0 h-full z-10">
            <PromptSidebar
              selectedNodeLabel={selectedNodeLabel}
              onClose={() => handleSelectNode(null)}
              onPromptClick={handlePromptClick}
            />
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
}
