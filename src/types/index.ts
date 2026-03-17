// all the typescript types used across the app
// shared across all components in the app

export enum NodeType {
  TOPIC = "topic",
  CONTENT = "content",
  TERM = "term",
  WIKIPEDIA = "wikipedia",
  BOOK = "book",
}

export enum PromptType {
  WHAT = "what",
  HOW = "how",
  WHO = "who",
  ORIGIN = "origin",
  ELABORATE = "elaborate",
  PROS = "pros",
  CONS = "cons",
  EXAMPLE = "example",
  RESEARCH = "research",
  EXTRACT = "extract",
  CONCEPTS = "concepts",
  COMPARE = "compare",
  ANALOGY = "analogy",
  CONTROVERSY = "controversy",
  IMPLICATIONS = "implications",
  SIGNIFICANCE = "significance",
  INTERESTING = "interesting",
  EXPLAIN = "explain",
  QUESTIONS = "questions",
  SPLIT = "split",
  JOIN = "join",
  FIGURES = "figures",
  BOOKS = "books",
  CUSTOM = "custom",
}

export enum NodeColor {
  DEFAULT = "default",
  GREY = "grey",
  PINK = "pink",
  PURPLE = "purple",
  BLUE = "blue",
  CYAN = "cyan",
  YELLOW = "yellow",
  CREAM = "cream",
  ORANGE = "orange",
  LAVENDER = "lavender",
  LIGHT_PINK = "light_pink",
  LIGHT_BLUE = "light_blue",
  MINT = "mint",
}

// base data that all nodes share
export interface BaseNodeData {
  [key: string]: unknown;
  id: string;
  type: NodeType;
  color: NodeColor;
  parentId: string | null;
  childIds: string[];
  createdAt: string;
  promptType: PromptType | null;
}

export interface TopicNodeData extends BaseNodeData {
  type: NodeType.TOPIC;
  topic: string;
  parentId: null;
}

export interface ContentNodeData extends BaseNodeData {
  type: NodeType.CONTENT;
  title: string;
  content: string;
}

export interface TermNodeData extends BaseNodeData {
  type: NodeType.TERM;
  term: string;
  definition?: string;
}

export interface WikipediaNodeData extends BaseNodeData {
  type: NodeType.WIKIPEDIA;
  title: string;
  extract: string;
  pageUrl: string;
}

export interface BookNodeData extends BaseNodeData {
  type: NodeType.BOOK;
  title: string;
  author: string;
  coverUrl: string | null;
  description: string;
}

// union of all possible node data types
export type ConceptNodeData =
  | TopicNodeData
  | ContentNodeData
  | TermNodeData
  | WikipediaNodeData
  | BookNodeData;

export interface ConceptEdgeData {
  [key: string]: unknown;
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

// config shape for each prompt button in the sidebar
export interface PromptConfig {
  type: PromptType;
  label: string;
  description: string;
  generatesTerms: boolean;
  generatesContentFromTerms?: boolean;
  generatesBookNodes?: boolean;
  systemPrompt: string;
}
