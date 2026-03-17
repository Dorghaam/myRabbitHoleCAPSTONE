"use client";

// the root topic node that shows the main topic name
// ported from the original myRabbitHole app

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { TopicNodeData } from "@/types";
import { getNodeColors } from "@/config/colors";

type TopicNodeProps = NodeProps & {
  data: TopicNodeData;
};

export const TopicNode = memo(function TopicNode({
  data,
  selected,
}: TopicNodeProps) {
  const colors = getNodeColors(data.color);

  return (
    <div className="relative">
      <div
        className="flex items-center rounded-2xl transition-all duration-150"
        style={{
          backgroundColor: colors.bg,
          border: `2px solid ${selected ? "#EC4899" : colors.border}`,
          boxShadow: selected
            ? "6px 6px 0 0 #EC4899, 0 0 0 3px rgba(236, 72, 153, 0.3)"
            : `6px 6px 0 0 ${colors.border}`,
        }}
      >
        <div className="px-5 py-3">
          <h2 className="text-base font-bold text-gray-900 whitespace-nowrap">
            {data.topic}
          </h2>
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
