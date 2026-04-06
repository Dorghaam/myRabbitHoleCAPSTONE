"use client";

// create new rabbit hole page
// user types a topic and clicks explore to start a new concept map
// suggestion topics are generated fresh by gemini every time the page loads

import { useState, useEffect } from "react";
import { Search, Sparkles, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

// fallback suggestions in case the llm call fails
const FALLBACK_SUGGESTIONS = [
  "The Psychology of Dreams",
  "How Encryption Works",
  "History of the Silk Road",
  "Quantum Entanglement",
  "The Science of Memory",
  "Ocean Ecosystems",
];

export default function CreatePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const { user } = useAuth();

  // fetch fresh topic suggestions from gemini when the page loads
  const loadSuggestions = async () => {
    setSuggestionsLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: `Generate 6 interesting and diverse topic suggestions for someone who wants to learn something new. Cover a mix of science, history, philosophy, technology, psychology, and nature. Return ONLY a valid JSON array of 6 short topic strings (3 to 6 words each). No numbering, no extra text, just the JSON array. Example: ["Topic One", "Topic Two"]`,
          userContent: "give me 6 random interesting topics to explore",
        }),
      });

      if (!res.ok) throw new Error("failed to fetch suggestions");

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSuggestions(parsed.map((s: string) => String(s).trim()));
          setSuggestionsLoading(false);
          return;
        }
      }
      throw new Error("could not parse suggestions");
    } catch {
      setSuggestions(FALLBACK_SUGGESTIONS);
    }
    setSuggestionsLoading(false);
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  // creates a new rabbit hole in supabase and redirects to the map page
  const handleExplore = async (topicText: string) => {
    if (!topicText.trim()) return;

    // if not logged in, send to login
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);

    // insert a new rabbit hole into supabase
    const { data, error } = await supabase
      .from("rabbit_holes")
      .insert({
        title: topicText.trim(),
        owner_id: user.id,
        is_public: false,
        is_featured: false,
        color: "purple",
      })
      .select("id")
      .single();

    if (error) {
      console.error("failed to create rabbit hole:", error);
      setLoading(false);
      return;
    }

    // redirect to the map page for this new rabbit hole
    window.location.href = `/map/${data.id}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExplore(topic);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 min-h-[80vh]">
      <div className="max-w-xl w-full">
        {/* title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="text-primary-pink" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Explore any topic...
          </h1>
          <p className="text-text-secondary">
            Enter a topic to create an interactive concept map
          </p>
        </div>

        {/* search form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
              size={20}
            />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic to explore..."
              className="w-full pl-12 pr-28 py-4 text-lg border-2 border-node-border rounded-xl focus:outline-none focus:border-primary-pink transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={!topic.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary-pink text-white rounded-lg font-medium hover:bg-primary-pink-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating..." : "Explore"}
            </button>
          </div>
        </form>

        {/* suggestion pills generated by gemini */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <p className="text-sm text-text-muted">Try exploring:</p>
            {/* refresh button to get new suggestions */}
            <button
              onClick={loadSuggestions}
              disabled={suggestionsLoading}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="get new suggestions"
            >
              <RefreshCw
                size={14}
                className={`text-text-muted ${suggestionsLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {suggestionsLoading ? (
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-8 w-28 bg-gray-100 rounded-full animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleExplore(suggestion)}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm bg-white border border-node-border rounded-full hover:border-primary-pink hover:text-primary-pink transition-colors disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
