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
import { ResponseModal } from "@/components/ResponseModal";
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
  createWikipediaNode,
  createBookNode,
  createEdge,
  getNodeLabel,
  getNodeText,
  calculateChildPosition,
  calculateTermNodesPositions,
  calculateBookNodesPositions,
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
  const [isFeatured, setIsFeatured] = useState(false);

  // state for the floating toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // shows a toast that auto disappears after 2 seconds
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  // state for the response modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalTyping, setModalTyping] = useState(false);

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
      setIsFeatured(rabbitHole.is_featured || false);

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

        // only save the topic node to the database if its not a featured map
        // featured maps have no owner so the insert would fail
        if (!rabbitHole.is_featured) {
          await supabase.from("nodes").insert({
            id: topicNode.id,
            rabbit_hole_id: mapId,
            label: rabbitHole.title,
            type: "topic",
            x: 400,
            y: 100,
          });
        }
      }

      setLoading(false);
    };

    loadMap();
    // we use user?.id instead of user so the effect doesnt rerun on token refresh
    // without this, switching tabs causes supabase to fire a token refresh event
    // which creates a new user object and reloads the whole map, wiping unsaved nodes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId, user?.id, authLoading]);

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

  // double clicking a node opens the modal to read its full content
  const handleNodeDoubleClick = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const data = node.data;
      if (data.type === NodeType.CONTENT) {
        setModalTitle(data.title);
        setModalContent(data.content);
        setModalTyping(false);
        setModalOpen(true);
      } else if (data.type === NodeType.WIKIPEDIA) {
        setModalTitle(data.title);
        setModalContent(data.extract);
        setModalTyping(false);
        setModalOpen(true);
      } else if (data.type === NodeType.TERM && data.definition) {
        setModalTitle(data.term);
        setModalContent(data.definition);
        setModalTyping(false);
        setModalOpen(true);
      }
    },
    [nodes]
  );

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

      setGenerating(true);

      try {
        const nodeLabel = getNodeLabel(selectedNode);

        // wikipedia uses the free wikipedia api instead of gemini
        if (type === PromptType.WIKIPEDIA) {
          const res = await fetch(`/api/wikipedia?q=${encodeURIComponent(nodeLabel)}`);
          if (!res.ok) throw new Error("wikipedia search failed");
          const wikiData = await res.json();

          const existingChildren = getDirectChildren(selectedNodeId, nodes, edges);
          const position = calculateChildPosition(selectedNode, existingChildren, "content");

          const wikiNode = createWikipediaNode(
            wikiData.title,
            wikiData.extract,
            wikiData.pageUrl,
            selectedNodeId,
            position
          );
          const wikiEdge = createEdge(selectedNodeId, wikiNode.id);
          setNodes((prev) => [...prev, wikiNode]);
          setEdges((prev) => [...prev, wikiEdge]);
          return;
        }

        // everything else uses gemini ai
        const config = getPromptConfig(type);
        if (!config) return;

        const nodeText = getNodeText(selectedNode);
        let prompt = config.systemPrompt;

        // if custom prompt, append the users question
        if (type === PromptType.CUSTOM && customPrompt) {
          prompt = `${config.systemPrompt}\n\nUser's question: ${customPrompt}`;
        }

        const response = await callGemini(prompt, nodeText);
        const cleanResponse = stripMarkdown(response);

        // show content responses in the live typing modal
        if (!config.generatesTerms) {
          setModalTitle(config.label);
          setModalContent("");
          setModalOpen(true);
          setModalTyping(true);

          // small delay so the modal opens before content appears
          await new Promise((r) => setTimeout(r, 100));
          setModalContent(cleanResponse);
        }

        if (config.generatesTerms) {
          // parse the json response into term nodes
          const terms = parseTermsFromResponse(cleanResponse);
          if (terms.length === 0) return;

          // books get special handling to create book nodes with covers from open library
          if (type === PromptType.BOOKS) {
            const positions = calculateBookNodesPositions(selectedNode, terms.length);

            // fetch a cover image for each book from open library
            const coverUrls = await Promise.all(
              terms.map(async (term) => {
                try {
                  const params = new URLSearchParams({ title: term.name, fields: "cover_i", limit: "1" });
                  if (term.author) params.set("author", term.author);
                  const res = await fetch(`https://openlibrary.org/search.json?${params}`);
                  if (!res.ok) return null;
                  const data = await res.json();
                  const coverId = data.docs?.[0]?.cover_i;
                  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null;
                } catch {
                  return null;
                }
              })
            );

            const newNodes = terms.map((term, index) =>
              createBookNode(
                term.name,
                term.author || "Unknown Author",
                coverUrls[index],
                term.description || "",
                selectedNodeId,
                positions[index]
              )
            );

            const newEdges = newNodes.map((node) => createEdge(selectedNodeId, node.id));
            setNodes((prev) => [...prev, ...newNodes]);
            setEdges((prev) => [...prev, ...newEdges]);
            return;
          }

          // everything else creates regular term nodes
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

      showToast("map saved!");
    } catch (error) {
      console.error("save error:", error);
      showToast("failed to save map", "error");
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
          {!isFeatured && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-bold text-primary-pink hover:text-primary-pink-hover disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Map"}
            </button>
          )}
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
          onNodeDoubleClick={handleNodeDoubleClick}
        />

        {/* sidebar shows on the right when a node is selected */}
        {!isFeatured && selectedNodeId && selectedNode && (
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
        {/* floating toast notification */}
        {toast && (
          <div
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full font-medium text-sm border-2 shadow-[3px_3px_0_0_#1e3a5f] animate-[fadeInUp_0.2s_ease-out] ${
              toast.type === "success"
                ? "bg-white text-gray-800 border-gray-800"
                : "bg-red-50 text-red-700 border-red-400 shadow-[3px_3px_0_0_#dc2626]"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* modal for live ai responses and reading node content */}
        <ResponseModal
          isOpen={modalOpen}
          title={modalTitle}
          content={modalContent}
          isTyping={modalTyping}
          onClose={() => {
            setModalOpen(false);
            setModalTyping(false);
          }}
        />
      </div>
    </ReactFlowProvider>
  );
}
