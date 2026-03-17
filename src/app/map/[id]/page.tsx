"use client";

// the map page that shows the interactive graph view for a rabbit hole
// loads data from supabase, handles ai generation, and saves back to supabase

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
import {
  ConceptNodeData,
  ConceptEdgeData,
  NodeType,
  NodeColor,
  PromptType,
} from "@/types";
import {
  createTopicNode,
  createContentNode,
  createTermNode,
  createEdge,
  getNodeLabel,
  getNodeText,
  calculateChildPosition,
  calculateTermNodesPositions,
  getDirectChildren,
  getAllDescendantIds,
} from "@/utils/nodeUtils";
import { getPromptConfig } from "@/config/prompts";
import { parseTermsFromResponse, stripMarkdown } from "@/utils/parseUtils";

export default function MapPage() {
  const params = useParams();
  const mapId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  // state for the graph
  const [nodes, setNodes] = useState<Node<ConceptNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge<ConceptEdgeData>[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [mapTitle, setMapTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // load the rabbit hole data from supabase
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const loadMap = async () => {
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

      const { data: dbNodes } = await supabase
        .from("nodes")
        .select("*")
        .eq("rabbit_hole_id", mapId);

      const { data: dbEdges } = await supabase
        .from("edges")
        .select("*")
        .eq("rabbit_hole_id", mapId);

      if (dbNodes && dbNodes.length > 0) {
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
        const topicNode = createTopicNode(rabbitHole.title, { x: 400, y: 100 });
        setNodes([topicNode]);

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

  // calls the gemini api through our server route
  const callGemini = async (
    systemPrompt: string,
    userContent: string
  ): Promise<string> => {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, userContent }),
    });

    if (!response.ok) {
      throw new Error("failed to generate response");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  };

  // handles when a prompt button is clicked in the sidebar
  const handlePromptClick = useCallback(
    async (type: PromptType, customPrompt?: string) => {
      if (!selectedNodeId || generating) return;

      const selectedNode = nodes.find((n) => n.id === selectedNodeId);
      if (!selectedNode) return;

      const config = getPromptConfig(type);
      if (!config) return;

      setGenerating(true);

      try {
        const nodeText = getNodeText(selectedNode);
        let prompt = config.systemPrompt;

        // if custom prompt, append the users question
        if (type === PromptType.CUSTOM && customPrompt) {
          prompt = `${config.systemPrompt}\n\nUser's question: ${customPrompt}`;
        }

        const response = await callGemini(prompt, nodeText);
        const cleanResponse = stripMarkdown(response);

        if (config.generatesTerms) {
          // parse the json response into term nodes
          const terms = parseTermsFromResponse(cleanResponse);
          if (terms.length === 0) return;

          const positions = calculateTermNodesPositions(
            selectedNode,
            terms.length
          );

          const newNodes = terms.map((term, index) =>
            createTermNode(
              term.name,
              term.description,
              selectedNodeId,
              type,
              positions[index]
            )
          );

          const newEdges = newNodes.map((node) =>
            createEdge(selectedNodeId, node.id)
          );

          setNodes((prev) => [...prev, ...newNodes]);
          setEdges((prev) => [...prev, ...newEdges]);
        } else {
          // create a single content node with the response
          const existingChildren = getDirectChildren(
            selectedNodeId,
            nodes,
            edges
          );
          const position = calculateChildPosition(
            selectedNode,
            existingChildren,
            "content"
          );

          const newNode = createContentNode(
            config.label,
            cleanResponse,
            selectedNodeId,
            type,
            position
          );

          // give content nodes a grey tint
          newNode.data.color = NodeColor.GREY;

          const newEdge = createEdge(selectedNodeId, newNode.id);

          setNodes((prev) => [...prev, newNode]);
          setEdges((prev) => [...prev, newEdge]);
        }
      } catch (error) {
        console.error("generation error:", error);
      } finally {
        setGenerating(false);
      }
    },
    [selectedNodeId, nodes, edges, generating]
  );

  // saves all nodes and edges to supabase
  const handleSave = async () => {
    setSaving(true);

    try {
      // delete existing nodes and edges for this map first
      await supabase.from("edges").delete().eq("rabbit_hole_id", mapId);
      await supabase.from("nodes").delete().eq("rabbit_hole_id", mapId);

      // insert all current nodes
      const nodeRows = nodes.map((n) => ({
        id: n.id,
        rabbit_hole_id: mapId,
        label: getNodeLabel(n),
        type: n.data.type,
        content:
          n.data.type === "content"
            ? (n.data as any).content // eslint-disable-line @typescript-eslint/no-explicit-any
            : n.data.type === "term"
              ? (n.data as any).definition // eslint-disable-line @typescript-eslint/no-explicit-any
              : null,
        url:
          n.data.type === "wikipedia"
            ? (n.data as any).pageUrl // eslint-disable-line @typescript-eslint/no-explicit-any
            : null,
        x: n.position.x,
        y: n.position.y,
      }));

      if (nodeRows.length > 0) {
        await supabase.from("nodes").insert(nodeRows);
      }

      // insert all current edges
      // we dont send the id because supabase auto generates a uuid for it
      const edgeRows = edges.map((e) => ({
        rabbit_hole_id: mapId,
        source_node_id: e.source,
        target_node_id: e.target,
      }));

      if (edgeRows.length > 0) {
        await supabase.from("edges").insert(edgeRows);
      }

      alert("map saved!");
    } catch (error) {
      console.error("save error:", error);
      alert("failed to save map");
    } finally {
      setSaving(false);
    }
  };

  // deletes the selected node and all its children from the graph
  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId) return;

    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return;

    // cant delete the root topic node
    if (node.data.type === NodeType.TOPIC) return;

    // find all child nodes that need to be deleted too
    const descendants = getAllDescendantIds(selectedNodeId, edges);
    const toDelete = new Set([selectedNodeId]);
    descendants.forEach((id) => toDelete.add(id));

    setNodes((prev) => prev.filter((n) => !toDelete.has(n.id)));
    setEdges((prev) =>
      prev.filter((e) => !toDelete.has(e.source) && !toDelete.has(e.target))
    );
    setSelectedNodeId(null);
  }, [selectedNodeId, nodes, edges]);

  // get info about the selected node for the sidebar
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedNodeLabel = selectedNode ? getNodeLabel(selectedNode) : "";
  const isTopicNode = selectedNode?.data.type === NodeType.TOPIC;

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
        {/* save map button at the top */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
          <span className="text-lg font-bold">{mapTitle}</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-bold text-primary-pink hover:text-primary-pink-hover disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Map"}
          </button>
        </div>

        {/* generating indicator */}
        {generating && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
            generating...
          </div>
        )}

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
              isTopicNode={isTopicNode}
              onClose={() => handleSelectNode(null)}
              onPromptClick={handlePromptClick}
              onDeleteNode={handleDeleteNode}
            />
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
}
