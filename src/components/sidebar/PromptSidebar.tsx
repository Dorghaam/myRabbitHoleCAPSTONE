"use client";

// the right side toolbar with all the prompt buttons
// shows when a node is selected on the canvas
// ported from the original myRabbitHole app

import { useState, useRef, useEffect } from "react";
import {
  X,
  MessageSquare,
  Sparkles,
  Undo,
  Redo,
  ChevronDown,
  Globe,
  Trash2,
} from "lucide-react";
import { PromptType } from "@/types";

// difficulty level labels for the dropdown
const DIFFICULTY_LABELS = [
  "ELI5",
  "Middle School",
  "High School",
  "Undergrad",
  "Expert",
];

// all the prompt buttons that show in the sidebar grid
const PROMPT_BUTTONS = [
  { type: PromptType.WHAT, label: "What" },
  { type: PromptType.HOW, label: "How" },
  { type: PromptType.WHO, label: "Who" },
  { type: PromptType.ORIGIN, label: "Origin" },
  { type: PromptType.ELABORATE, label: "Elaborate" },
  { type: PromptType.PROS, label: "Pros" },
  { type: PromptType.CONS, label: "Cons" },
  { type: PromptType.EXAMPLE, label: "Example" },
  { type: PromptType.RESEARCH, label: "Research" },
  { type: PromptType.EXTRACT, label: "Extract" },
  { type: PromptType.CONCEPTS, label: "Concepts" },
  { type: PromptType.COMPARE, label: "Compare" },
  { type: PromptType.ANALOGY, label: "Analogy" },
  { type: PromptType.CONTROVERSY, label: "Controversy" },
  { type: PromptType.IMPLICATIONS, label: "Implications" },
  { type: PromptType.SIGNIFICANCE, label: "Significance" },
  { type: PromptType.INTERESTING, label: "Interesting" },
  { type: PromptType.EXPLAIN, label: "Explain" },
  { type: PromptType.QUESTIONS, label: "Questions" },
  { type: PromptType.FIGURES, label: "Key Figures" },
  { type: PromptType.BOOKS, label: "Books" },
];

// props the sidebar needs from its parent
interface PromptSidebarProps {
  selectedNodeLabel: string;
  isTopicNode?: boolean;
  onClose: () => void;
  onPromptClick: (type: PromptType, customPrompt?: string) => void;
  onDeleteNode?: () => void;
}

export function PromptSidebar({
  selectedNodeLabel,
  isTopicNode = false,
  onClose,
  onPromptClick,
  onDeleteNode,
}: PromptSidebarProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState(2);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const difficultyRef = useRef<HTMLDivElement>(null);

  // close the difficulty dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        difficultyRef.current &&
        !difficultyRef.current.contains(e.target as Node)
      ) {
        setShowDifficultyDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // truncate long node labels
  const truncatedLabel =
    selectedNodeLabel.length > 25
      ? selectedNodeLabel.slice(0, 25) + "..."
      : selectedNodeLabel;

  const handleCustomSubmit = () => {
    if (!customPrompt.trim()) return;
    onPromptClick(PromptType.CUSTOM, customPrompt);
    setShowCustomInput(false);
    setCustomPrompt("");
  };

  // 3d pill button style used for all the prompt buttons
  const pillButtonStyle = `
    px-2.5 py-1.5 text-xs font-medium rounded-full
    bg-white border-2 border-gray-800
    shadow-[0_3px_0_0_#1e3a5f]
    hover:shadow-[0_2px_0_0_#1e3a5f] hover:translate-y-[1px]
    active:shadow-none active:translate-y-[3px]
    transition-all duration-100
    text-gray-700
  `;

  return (
    <aside className="w-[250px] flex flex-col h-full bg-transparent">
      {/* header with node label and close button */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-transparent">
        <span className="text-sm font-medium text-gray-600">
          &quot;{truncatedLabel}&quot;
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-200 text-gray-500"
        >
          <X size={16} />
        </button>
      </div>

      {/* scrollable content area */}
      <div className="flex-1 overflow-y-auto px-3 py-1 bg-transparent">
        {showCustomInput ? (
          // custom prompt input mode
          <div className="space-y-1.5">
            <p className="text-xs text-gray-600">
              ask about &quot;{truncatedLabel}&quot;:
            </p>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="enter your question..."
              className="w-full px-2.5 py-1.5 border-2 border-gray-800 rounded-xl text-xs focus:outline-none focus:border-pink-500 resize-none bg-white"
              rows={3}
              autoFocus
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowCustomInput(false)}
                className={`flex-1 ${pillButtonStyle}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCustomSubmit}
                disabled={!customPrompt.trim()}
                className="flex-1 px-2.5 py-1.5 text-xs font-medium rounded-full bg-pink-500 text-white border-2 border-pink-600 shadow-[0_3px_0_0_#9d174d] hover:shadow-[0_2px_0_0_#9d174d] hover:translate-y-[1px] active:shadow-none active:translate-y-[3px] transition-all duration-100 disabled:opacity-50"
              >
                Generate
              </button>
            </div>
          </div>
        ) : (
          // normal mode with all the buttons
          <div className="space-y-1.5">
            {/* difficulty dropdown */}
            <div className="relative" ref={difficultyRef}>
              <button
                onClick={() =>
                  setShowDifficultyDropdown(!showDifficultyDropdown)
                }
                className={`${pillButtonStyle} w-full flex items-center justify-between`}
              >
                <span>{DIFFICULTY_LABELS[difficultyLevel]}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showDifficultyDropdown ? "rotate-180" : ""}`}
                />
              </button>
              {showDifficultyDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border-2 border-gray-800 rounded-xl overflow-hidden shadow-[0_3px_0_0_#1e3a5f]">
                  {DIFFICULTY_LABELS.map((label, index) => (
                    <button
                      key={label}
                      onClick={() => {
                        setDifficultyLevel(index);
                        setShowDifficultyDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 text-xs font-medium text-left hover:bg-gray-100 transition-colors ${
                        index === difficultyLevel
                          ? "text-pink-600 bg-pink-50"
                          : "text-gray-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* prompt buttons grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {PROMPT_BUTTONS.map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => onPromptClick(btn.type)}
                  className={pillButtonStyle}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* custom prompt button */}
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full px-2.5 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border-2 border-gray-800 shadow-[0_3px_0_0_#1e3a5f] hover:shadow-[0_2px_0_0_#1e3a5f] hover:translate-y-[1px] active:shadow-none active:translate-y-[3px] transition-all duration-100 flex items-center justify-center gap-1.5"
            >
              <Sparkles size={12} />
              Custom Prompt
            </button>

            {/* wikipedia button */}
            <button
              onClick={() => onPromptClick(PromptType.RESEARCH)}
              className="w-full px-2.5 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border-2 border-gray-800 shadow-[0_3px_0_0_#1e3a5f] hover:shadow-[0_2px_0_0_#1e3a5f] hover:translate-y-[1px] active:shadow-none active:translate-y-[3px] transition-all duration-100 flex items-center justify-center gap-1.5"
            >
              <Globe size={12} />
              Wikipedia
            </button>

            {/* undo / redo row */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                className={`${pillButtonStyle} flex items-center justify-center gap-1`}
              >
                <Undo size={12} />
                Undo
              </button>
              <button
                className={`${pillButtonStyle} flex items-center justify-center gap-1`}
              >
                <Redo size={12} />
                Redo
              </button>
            </div>

            {/* delete node button, cant delete the root topic node */}
            {!isTopicNode && onDeleteNode && (
              <button
                onClick={onDeleteNode}
                className="w-full px-2.5 py-1.5 text-xs font-medium rounded-full bg-red-50 text-red-600 border-2 border-red-300 shadow-[0_3px_0_0_#dc2626] hover:shadow-[0_2px_0_0_#dc2626] hover:translate-y-[1px] active:shadow-none active:translate-y-[3px] transition-all duration-100 flex items-center justify-center gap-1.5"
              >
                <Trash2 size={12} />
                Delete Node
              </button>
            )}

            {/* chat button */}
            <button className="w-full px-2.5 py-2 bg-blue-500 text-white rounded-full font-medium border-2 border-blue-600 shadow-[0_3px_0_0_#1e40af] hover:shadow-[0_2px_0_0_#1e40af] hover:translate-y-[1px] active:shadow-none active:translate-y-[3px] transition-all duration-100 flex items-center justify-center gap-2 text-xs">
              <MessageSquare size={14} />
              Chat with Concept Map
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
