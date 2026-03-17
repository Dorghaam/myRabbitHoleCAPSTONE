"use client";

// a content node that shows a title and a block of text
// shows a title and a block of text with expand/collapse

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ContentNodeData } from "@/types";
import { getNodeColors } from "@/config/colors";

type ContentNodeProps = NodeProps & {
  data: ContentNodeData;
};

const CONTENT_CHAR_LIMIT = 800;

export const ContentNode = memo(function ContentNode({
  data,
  selected,
}: ContentNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = getNodeColors(data.color);

  return (
    <div className="relative">
      <div
        className="flex rounded-2xl transition-all duration-150"
        style={{
          backgroundColor: colors.bg,
          border: `2px solid ${selected ? "#EC4899" : colors.border}`,
          boxShadow: selected
            ? "6px 6px 0 0 #EC4899, 0 0 0 3px rgba(236, 72, 153, 0.3)"
            : `6px 6px 0 0 ${colors.border}`,
        }}
      >
        <div
          className="p-4 flex-1"
          style={{ width: "350px", maxWidth: "380px" }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3">{data.title}</h3>
          <div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {!expanded && data.content.length > CONTENT_CHAR_LIMIT
                ? data.content.slice(0, CONTENT_CHAR_LIMIT) + "..."
                : data.content}
            </p>
            {data.content.length > CONTENT_CHAR_LIMIT && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="mt-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors nodrag"
              >
                {expanded ? "See Less" : "See More..."}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          width: 14,
          height: 14,
          background: "white",
          border: "2px solid #9ca3af",
          top: -7,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          width: 14,
          height: 14,
          background: "white",
          border: "2px solid #9ca3af",
          bottom: -13,
        }}
      />
    </div>
  );
});
