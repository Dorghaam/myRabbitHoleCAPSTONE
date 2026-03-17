// utility functions for creating nodes, edges, and calculating positions
// used throughout the app for graph operations

import { v4 as uuidv4 } from "uuid";
import type { Node, Edge } from "@xyflow/react";
import {
  NodeType,
  NodeColor,
  PromptType,
  TopicNodeData,
  ContentNodeData,
  TermNodeData,
  WikipediaNodeData,
  BookNodeData,
  ConceptNodeData,
  ConceptEdgeData,
} from "@/types";

// node creation functions

export function createTopicNode(
  topic: string,
  position = { x: 0, y: 0 }
): Node<TopicNodeData> {
  const id = uuidv4();
  return {
    id,
    type: "topic",
    position,
    data: {
      id,
      type: NodeType.TOPIC,
      topic,
      color: NodeColor.DEFAULT,
      parentId: null,
      childIds: [],
      createdAt: new Date().toISOString(),
      promptType: null,
    },
  };
}

export function createContentNode(
  title: string,
  content: string,
  parentId: string,
  promptType: PromptType,
  position = { x: 0, y: 0 }
): Node<ContentNodeData> {
  const id = uuidv4();
  return {
    id,
    type: "content",
    position,
    data: {
      id,
      type: NodeType.CONTENT,
      title,
      content,
      color: NodeColor.DEFAULT,
      parentId,
      childIds: [],
      createdAt: new Date().toISOString(),
      promptType,
    },
  };
}

export function createTermNode(
  term: string,
  definition: string | undefined,
  parentId: string,
  promptType: PromptType,
  position = { x: 0, y: 0 }
): Node<TermNodeData> {
  const id = uuidv4();
  return {
    id,
    type: "term",
    position,
    data: {
      id,
      type: NodeType.TERM,
      term,
      definition,
      color: NodeColor.DEFAULT,
      parentId,
      childIds: [],
      createdAt: new Date().toISOString(),
      promptType,
    },
  };
}

export function createWikipediaNode(
  title: string,
  extract: string,
  pageUrl: string,
  parentId: string,
  position = { x: 0, y: 0 }
): Node<WikipediaNodeData> {
  const id = uuidv4();
  return {
    id,
    type: "wikipedia",
    position,
    data: {
      id,
      type: NodeType.WIKIPEDIA,
      title,
      extract,
      pageUrl,
      color: NodeColor.DEFAULT,
      parentId,
      childIds: [],
      createdAt: new Date().toISOString(),
      promptType: null,
    },
  };
}

export function createBookNode(
  title: string,
  author: string,
  coverUrl: string | null,
  description: string,
  parentId: string,
  position = { x: 0, y: 0 }
): Node<BookNodeData> {
  const id = uuidv4();
  return {
    id,
    type: "book",
    position,
    data: {
      id,
      type: NodeType.BOOK,
      title,
      author,
      coverUrl,
      description,
      color: NodeColor.DEFAULT,
      parentId,
      childIds: [],
      createdAt: new Date().toISOString(),
      promptType: PromptType.BOOKS,
    },
  };
}

// edge creation

export function createEdge(
  sourceId: string,
  targetId: string
): Edge<ConceptEdgeData> {
  const id = `edge-${sourceId}-${targetId}`;
  return {
    id,
    source: sourceId,
    target: targetId,
    sourceHandle: "bottom",
    targetHandle: "top",
    type: "bezier",
    data: {
      id,
      source: sourceId,
      target: targetId,
      sourceHandle: "bottom",
      targetHandle: "top",
    },
  };
}

// positioning constants

const CONTENT_NODE_WIDTH = 280;
const CONTENT_NODE_HEIGHT = 200;
const TERM_NODE_WIDTH = 240;
const TERM_NODE_HEIGHT = 80;
const BOOK_NODE_WIDTH = 220;
const VERTICAL_GAP = 80;
const HORIZONTAL_GAP = 30;

export function calculateChildPosition(
  parentNode: Node<ConceptNodeData>,
  existingChildren: Node<ConceptNodeData>[],
  _nodeType: "content" | "term" // eslint-disable-line @typescript-eslint/no-unused-vars
): { x: number; y: number } {
  const parentX = parentNode.position.x;
  const parentY = parentNode.position.y;

  // figure out the parent height
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const measuredHeight = (parentNode as any).measured?.height;
  let parentHeight: number;
  if (measuredHeight) {
    parentHeight = measuredHeight;
  } else if (parentNode.type === "content") {
    parentHeight = CONTENT_NODE_HEIGHT;
  } else if (parentNode.type === "term") {
    parentHeight = TERM_NODE_HEIGHT;
  } else {
    parentHeight = 50;
  }

  const y = parentY + parentHeight + VERTICAL_GAP;
  const childCount = existingChildren.length;

  if (childCount === 0) {
    return { x: parentX, y };
  }

  const lastChild = existingChildren[existingChildren.length - 1];
  const lastChildWidth =
    lastChild.type === "content" ? CONTENT_NODE_WIDTH : TERM_NODE_WIDTH;
  const x = lastChild.position.x + lastChildWidth + HORIZONTAL_GAP;

  return { x, y };
}

export function calculateTermNodesPositions(
  parentNode: Node<ConceptNodeData>,
  termCount: number
): { x: number; y: number }[] {
  const parentX = parentNode.position.x;
  const parentY = parentNode.position.y;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const measuredHeight = (parentNode as any).measured?.height;
  let parentHeight: number;
  if (measuredHeight) {
    parentHeight = measuredHeight;
  } else if (parentNode.type === "content") {
    parentHeight = CONTENT_NODE_HEIGHT;
  } else if (parentNode.type === "term") {
    parentHeight = TERM_NODE_HEIGHT;
  } else {
    parentHeight = 50;
  }

  const y = parentY + parentHeight + VERTICAL_GAP;
  const totalWidth =
    termCount * TERM_NODE_WIDTH + (termCount - 1) * HORIZONTAL_GAP;
  const startX = parentX - totalWidth / 2 + TERM_NODE_WIDTH / 2;

  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < termCount; i++) {
    positions.push({
      x: startX + i * (TERM_NODE_WIDTH + HORIZONTAL_GAP),
      y,
    });
  }

  return positions;
}

export function calculateContentNodesPositions(
  parentNode: Node<ConceptNodeData>,
  contentCount: number
): { x: number; y: number }[] {
  const parentX = parentNode.position.x;
  const parentY = parentNode.position.y;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const measuredHeight = (parentNode as any).measured?.height;
  let parentHeight: number;
  if (measuredHeight) {
    parentHeight = measuredHeight;
  } else if (parentNode.type === "content") {
    parentHeight = CONTENT_NODE_HEIGHT;
  } else if (parentNode.type === "term") {
    parentHeight = TERM_NODE_HEIGHT;
  } else {
    parentHeight = 50;
  }

  const y = parentY + parentHeight + VERTICAL_GAP;
  const totalWidth =
    contentCount * CONTENT_NODE_WIDTH + (contentCount - 1) * HORIZONTAL_GAP;
  const startX = parentX - totalWidth / 2 + CONTENT_NODE_WIDTH / 2;

  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < contentCount; i++) {
    positions.push({
      x: startX + i * (CONTENT_NODE_WIDTH + HORIZONTAL_GAP),
      y,
    });
  }

  return positions;
}

export function calculateBookNodesPositions(
  parentNode: Node<ConceptNodeData>,
  bookCount: number
): { x: number; y: number }[] {
  const parentX = parentNode.position.x;
  const parentY = parentNode.position.y;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const measuredHeight = (parentNode as any).measured?.height;
  let parentHeight: number;
  if (measuredHeight) {
    parentHeight = measuredHeight;
  } else if (parentNode.type === "content") {
    parentHeight = CONTENT_NODE_HEIGHT;
  } else if (parentNode.type === "term") {
    parentHeight = TERM_NODE_HEIGHT;
  } else {
    parentHeight = 50;
  }

  const y = parentY + parentHeight + VERTICAL_GAP;
  const totalWidth =
    bookCount * BOOK_NODE_WIDTH + (bookCount - 1) * HORIZONTAL_GAP;
  const startX = parentX - totalWidth / 2 + BOOK_NODE_WIDTH / 2;

  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < bookCount; i++) {
    positions.push({
      x: startX + i * (BOOK_NODE_WIDTH + HORIZONTAL_GAP),
      y,
    });
  }

  return positions;
}

// get text content from a node (used for ai prompts)

export function getNodeText(node: Node<ConceptNodeData>): string {
  const data = node.data;
  switch (data.type) {
    case NodeType.TOPIC:
      return data.topic;
    case NodeType.CONTENT:
      return `${data.title}: ${data.content}`;
    case NodeType.TERM:
      return data.definition ? `${data.term}: ${data.definition}` : data.term;
    case NodeType.WIKIPEDIA:
      return `${data.title}: ${data.extract}`;
    case NodeType.BOOK:
      return `${data.title} by ${data.author}: ${data.description}`;
    default:
      return "";
  }
}

export function getNodeLabel(node: Node<ConceptNodeData>): string {
  const data = node.data;
  switch (data.type) {
    case NodeType.TOPIC:
      return data.topic;
    case NodeType.CONTENT:
      return data.title;
    case NodeType.TERM:
      return data.term;
    case NodeType.WIKIPEDIA:
      return data.title;
    case NodeType.BOOK:
      return data.title;
    default:
      return "";
  }
}

// find all nodes that are children of a given node (recursively)

export function getAllDescendantIds(
  nodeId: string,
  edges: Edge<ConceptEdgeData>[]
): Set<string> {
  const descendants = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = edges
      .filter((e) => e.source === current)
      .map((e) => e.target);

    children.forEach((child) => {
      if (!descendants.has(child)) {
        descendants.add(child);
        queue.push(child);
      }
    });
  }

  return descendants;
}

export function getDirectChildren(
  nodeId: string,
  nodes: Node<ConceptNodeData>[],
  edges: Edge<ConceptEdgeData>[]
): Node<ConceptNodeData>[] {
  const childIds = edges
    .filter((e) => e.source === nodeId)
    .map((e) => e.target);
  return nodes.filter((n) => childIds.includes(n.id));
}
