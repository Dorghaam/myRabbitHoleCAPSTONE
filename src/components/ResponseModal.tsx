"use client";

// modal that shows ai responses with a live typing animation
// also used to view existing node content when double clicking a node

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

interface ResponseModalProps {
  isOpen: boolean;
  title: string;
  content: string;
  isTyping: boolean;
  onClose: () => void;
}

export function ResponseModal({
  isOpen,
  title,
  content,
  isTyping,
  onClose,
}: ResponseModalProps) {
  const [displayedText, setDisplayedText] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);

  // typing animation that reveals the content character by character
  useEffect(() => {
    if (!isOpen) {
      setDisplayedText("");
      indexRef.current = 0;
      return;
    }

    if (!isTyping) {
      setDisplayedText(content);
      return;
    }

    // reset when new content starts streaming in
    setDisplayedText("");
    indexRef.current = 0;

    intervalRef.current = setInterval(() => {
      indexRef.current += 4;
      if (indexRef.current >= content.length) {
        setDisplayedText(content);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setDisplayedText(content.slice(0, indexRef.current));
      }
    }, 8);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, content, isTyping]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* dark backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* modal card with 3d node style */}
      <div className="relative bg-white rounded-2xl border-2 border-gray-800 shadow-[6px_6px_0_0_#1e3a5f] w-full max-w-lg mx-4 max-h-[70vh] flex flex-col">
        {/* header with title and close button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* scrollable content area */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {displayedText ? (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {displayedText}
              {isTyping && indexRef.current < content.length && (
                <span className="inline-block w-1.5 h-4 bg-primary-pink ml-0.5 animate-pulse" />
              )}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-2 h-2 bg-primary-pink rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary-pink rounded-full animate-bounce [animation-delay:0.1s]" />
              <div className="w-2 h-2 bg-primary-pink rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="ml-1">thinking...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
