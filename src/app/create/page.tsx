"use client";

// create new rabbit hole page
// user types a topic and clicks explore to start a new concept map
// ported from the original myRabbitHole TopicInput component

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

// these show as clickable suggestion pills below the search bar
const SUGGESTIONS = [
  "Emergent Properties of Complexity",
  "The History of Disinformation",
  "Cognitive Biases and Reality",
  "Information Theory and Meaning",
  "Symbiotic Relationships in Nature",
  "Limits of Computation/Knowledge",
];

export default function CreatePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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

        {/* suggestion pills */}
        <div className="text-center">
          <p className="text-sm text-text-muted mb-3">Try exploring:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((suggestion) => (
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
        </div>
      </div>
    </div>
  );
}
