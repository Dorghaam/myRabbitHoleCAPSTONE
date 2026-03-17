// color config for each node color option
// maps each NodeColor enum value to actual hex colors

import { NodeColor } from "@/types";

export interface ColorConfig {
  bg: string;
  border: string;
  name: string;
  accent: string;
}

export const NODE_COLORS: Record<NodeColor, ColorConfig> = {
  [NodeColor.DEFAULT]: {
    bg: "#FFFFFF",
    border: "#1e3a5f",
    name: "Default",
    accent: "#1e3a5f",
  },
  [NodeColor.GREY]: {
    bg: "#F5F5F7",
    border: "#1e3a5f",
    name: "Grey",
    accent: "#6B7280",
  },
  [NodeColor.PURPLE]: {
    bg: "#C4B5FD",
    border: "#1e3a5f",
    name: "Purple",
    accent: "#7C3AED",
  },
  [NodeColor.PINK]: {
    bg: "#F0ABFC",
    border: "#1e3a5f",
    name: "Pink",
    accent: "#D946EF",
  },
  [NodeColor.CYAN]: {
    bg: "#7DD3FC",
    border: "#1e3a5f",
    name: "Cyan",
    accent: "#0284C7",
  },
  [NodeColor.YELLOW]: {
    bg: "#FBBF24",
    border: "#1e3a5f",
    name: "Yellow",
    accent: "#D97706",
  },
  [NodeColor.MINT]: {
    bg: "#4ADE80",
    border: "#1e3a5f",
    name: "Mint",
    accent: "#16A34A",
  },
  [NodeColor.ORANGE]: {
    bg: "#FB923C",
    border: "#1e3a5f",
    name: "Orange",
    accent: "#EA580C",
  },
  [NodeColor.LIGHT_BLUE]: {
    bg: "#BCD8C8",
    border: "#1e3a5f",
    name: "Sage",
    accent: "#4D7C6A",
  },
  [NodeColor.CREAM]: {
    bg: "#FDE047",
    border: "#1e3a5f",
    name: "Lemon",
    accent: "#CA8A04",
  },
  [NodeColor.BLUE]: {
    bg: "#FEF3C7",
    border: "#1e3a5f",
    name: "Cream",
    accent: "#D97706",
  },
  [NodeColor.LAVENDER]: {
    bg: "#DDD6FE",
    border: "#1e3a5f",
    name: "Lavender",
    accent: "#7C3AED",
  },
  [NodeColor.LIGHT_PINK]: {
    bg: "#FBCFE8",
    border: "#1e3a5f",
    name: "Light Pink",
    accent: "#DB2777",
  },
};

export const getNodeColors = (color: NodeColor): ColorConfig => {
  return NODE_COLORS[color] || NODE_COLORS[NodeColor.DEFAULT];
};
