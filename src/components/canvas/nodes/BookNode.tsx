"use client";

// a book node that shows a book cover, title, author, and description
// ported from the original myRabbitHole app

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { BookOpen } from "lucide-react";
import { BookNodeData } from "@/types";
import { getNodeColors } from "@/config/colors";

type BookNodeProps = NodeProps & {
  data: BookNodeData;
};

export const BookNode = memo(function BookNode({
  data,
  selected,
}: BookNodeProps) {
  const [imgError, setImgError] = useState(false);
  const colors = getNodeColors(data.color);
  const showCover = data.coverUrl && !imgError;

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
        <div className="p-4 flex-1" style={{ width: "200px" }}>
          {showCover ? (
            <div className="flex justify-center mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.coverUrl!}
                alt={`Cover of ${data.title}`}
                className="rounded-lg shadow-sm"
                style={{ height: "140px", objectFit: "cover" }}
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center mb-3 rounded-lg mx-auto"
              style={{
                height: "140px",
                width: "100px",
                backgroundColor: "#E5E7EB",
              }}
            >
              <BookOpen size={32} className="text-gray-400" />
            </div>
          )}

          <span className="inline-block text-xs font-semibold uppercase px-2 py-0.5 rounded mb-2 bg-indigo-500 text-white">
            BOOK
          </span>

          <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">
            {data.title}
          </h3>
          <p className="text-xs text-gray-500 mb-2">{data.author}</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            {data.description}
          </p>
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
