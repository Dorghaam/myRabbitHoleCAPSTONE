"use client";

// a small term node that shows a keyword with a category badge
// displays a keyword with a colored category badge

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { TermNodeData, PromptType } from "@/types";
import { getNodeColors } from "@/config/colors";

const BADGE_CONFIG: Record<string, { label: string; color: string }> = {
  [PromptType.EXTRACT]: { label: "TERMS", color: "#EC4899" },
  [PromptType.CONCEPTS]: { label: "CONCEPTS", color: "#8B5CF6" },
  [PromptType.QUESTIONS]: { label: "QUESTIONS", color: "#F59E0B" },
  [PromptType.FIGURES]: { label: "KEY FIGURES", color: "#10B981" },
  [PromptType.SPLIT]: { label: "COMPONENTS", color: "#6366F1" },
};

function getBadge(promptType: PromptType | null) {
  if (promptType && BADGE_CONFIG[promptType]) {
    return BADGE_CONFIG[promptType];
  }
  return { label: "TERMS", color: "#EC4899" };
}

type TermNodeProps = NodeProps & {
  data: TermNodeData;
};

export const TermNode = memo(function TermNode({
  data,
  selected,
}: TermNodeProps) {
  const colors = getNodeColors(data.color);

  return (
    <div className="relative" style={{ width: 240 }}>
      <div
        className="flex items-stretch rounded-2xl transition-all duration-150"
        style={{
          backgroundColor: colors.bg,
          border: `2px solid ${selected ? "#EC4899" : colors.border}`,
          boxShadow: selected
            ? "6px 6px 0 0 #EC4899, 0 0 0 3px rgba(236, 72, 153, 0.3)"
            : `6px 6px 0 0 ${colors.border}`,
        }}
      >
        <div className="flex-1 min-w-0 px-4 py-3">
          {data.color === "default" ? (
            <span
              className="inline-block text-xs font-semibold uppercase px-2 py-0.5 rounded mb-1"
              style={{
                backgroundColor: getBadge(data.promptType).color,
                color: "white",
              }}
            >
              {getBadge(data.promptType).label}
            </span>
          ) : (
            <span className="inline-block text-xs font-bold uppercase mb-1 opacity-60">
              {getBadge(data.promptType).label}
            </span>
          )}
          <h4 className="text-sm font-bold text-gray-900 break-words">
            {data.term}
          </h4>
        </div>
      </div>

      {/* connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          width: 12,
          height: 12,
          background: "white",
          border: "2px solid #9ca3af",
          top: -6,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          width: 12,
          height: 12,
          background: "white",
          border: "2px solid #9ca3af",
          bottom: -12,
        }}
      />
    </div>
  );
});
