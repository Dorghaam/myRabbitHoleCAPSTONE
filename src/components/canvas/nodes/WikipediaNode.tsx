"use client";

// a wikipedia node that shows an article extract with a link to the full page
// ported from the original myRabbitHole app

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ExternalLink } from "lucide-react";
import { WikipediaNodeData } from "@/types";
import { getNodeColors } from "@/config/colors";

type WikipediaNodeProps = NodeProps & {
  data: WikipediaNodeData;
};

export const WikipediaNode = memo(function WikipediaNode({
  data,
  selected,
}: WikipediaNodeProps) {
  const colors = getNodeColors(data.color);
  const truncatedExtract =
    data.extract.length > 200
      ? data.extract.slice(0, 200) + "..."
      : data.extract;

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(data.pageUrl, "_blank", "noopener,noreferrer");
  };

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
          style={{ width: "300px", maxWidth: "320px" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Wikipedia
            </span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">
            {data.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            {truncatedExtract}
          </p>
          <button
            onClick={handleReadMore}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-full font-medium text-sm border-2 border-blue-600 hover:bg-blue-600 transition-all duration-100 nodrag"
          >
            <ExternalLink size={14} />
            Read More...
          </button>
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
