"use client";

// home page that shows featured rabbit hole maps in a 3 column grid
// the data is pulled from supabase, not hardcoded
// each card has a color, a heart icon, and a title with an arrow to open it

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// the shape of a rabbit hole from the database
interface RabbitHole {
  id: string;
  title: string;
  description: string;
  color: string;
}

// maps the color name from the database to tailwind background classes
const colorMap: Record<string, string> = {
  purple: "bg-purple-300",
  green: "bg-emerald-300",
  orange: "bg-orange-300",
};

export default function Home() {
  const [featuredMaps, setFeaturedMaps] = useState<RabbitHole[]>([]);
  const [loading, setLoading] = useState(true);

  // fetch the featured rabbit holes from supabase when the page loads
  useEffect(() => {
    const fetchFeatured = async () => {
      const { data, error } = await supabase
        .from("rabbit_holes")
        .select("id, title, description, color")
        .eq("is_featured", true)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("failed to fetch featured maps:", error);
      } else {
        setFeaturedMaps(data || []);
      }
      setLoading(false);
    };

    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col items-center py-12 px-8">
      <h1 className="text-5xl font-bold mb-12">Featured Maps</h1>

      {/* loading state */}
      {loading && <p className="text-gray-500">loading featured maps...</p>}

      {/* show message if no maps found */}
      {!loading && featuredMaps.length === 0 && (
        <p className="text-gray-500">no featured maps yet</p>
      )}

      {/* 3 column grid of featured map cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {featuredMaps.map((map) => (
          <Link
            key={map.id}
            href={`/map/${map.id}`}
            className="block rounded-xl border border-gray-300 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* colored top section with heart icon */}
            <div
              className={`${colorMap[map.color] || "bg-purple-300"} h-32 flex items-start p-4`}
            >
              {/* heart icon in a small box */}
              <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
            </div>

            {/* white bottom section with title and arrow */}
            <div className="bg-white px-4 py-3 flex items-center justify-between">
              <span className="text-lg font-medium">{map.title}</span>
              {/* arrow icon */}
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
