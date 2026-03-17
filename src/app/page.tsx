"use client";

// home page that shows featured maps and the users saved maps
// featured maps are pulled from supabase and visible to everyone
// my maps only shows when logged in

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Trash2 } from "lucide-react";

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
  const [myMaps, setMyMaps] = useState<RabbitHole[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // if not logged in, send them to login when they click a card
  const handleCardClick = (mapId: string) => {
    if (!user) {
      window.location.href = "/login";
    } else {
      window.location.href = `/map/${mapId}`;
    }
  };

  // delete a rabbit hole the user owns
  const handleDeleteMap = async (
    e: React.MouseEvent,
    mapId: string
  ) => {
    // stop the click from also opening the map
    e.stopPropagation();

    if (!confirm("are you sure you want to delete this map?")) return;

    // supabase cascade delete will remove nodes and edges too
    await supabase.from("rabbit_holes").delete().eq("id", mapId);

    // remove it from the local state
    setMyMaps((prev) => prev.filter((m) => m.id !== mapId));
  };

  // fetch featured maps and the users saved maps
  useEffect(() => {
    const fetchMaps = async () => {
      // fetch featured maps (visible to everyone)
      const { data: featured, error: featuredError } = await supabase
        .from("rabbit_holes")
        .select("id, title, description, color")
        .eq("is_featured", true)
        .order("created_at", { ascending: true });

      if (featuredError) {
        console.error("failed to fetch featured maps:", featuredError);
      } else {
        setFeaturedMaps(featured || []);
      }

      // fetch the users own maps (only if logged in)
      if (user) {
        const { data: userMaps, error: userError } = await supabase
          .from("rabbit_holes")
          .select("id, title, description, color")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (userError) {
          console.error("failed to fetch user maps:", userError);
        } else {
          setMyMaps(userMaps || []);
        }
      }

      setLoading(false);
    };

    fetchMaps();
  }, [user]);

  return (
    <div className="flex flex-col items-center py-12 px-8">
      {/* featured maps section */}
      <h1 className="text-5xl font-bold mb-12">Featured Maps</h1>

      {loading && <p className="text-gray-500">loading maps...</p>}

      {!loading && featuredMaps.length === 0 && (
        <p className="text-gray-500">no featured maps yet</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {featuredMaps.map((map) => (
          <div
            key={map.id}
            onClick={() => handleCardClick(map.id)}
            className="block rounded-xl border border-gray-300 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div
              className={`${colorMap[map.color] || "bg-purple-300"} h-32 flex items-start p-4`}
            >
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
            <div className="bg-white px-4 py-3 flex items-center justify-between">
              <span className="text-lg font-medium">{map.title}</span>
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
          </div>
        ))}
      </div>

      {/* my maps section, only shows when logged in */}
      {user && (
        <div className="w-full max-w-5xl mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">My Maps</h2>

          {!loading && myMaps.length === 0 && (
            <p className="text-gray-500 text-center">
              you havent created any maps yet.{" "}
              <a href="/create" className="text-primary-pink underline">
                create one
              </a>
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myMaps.map((map) => (
              <div
                key={map.id}
                onClick={() => handleCardClick(map.id)}
                className="block rounded-xl border border-gray-300 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div
                  className={`${colorMap[map.color] || "bg-purple-300"} h-24 flex items-start justify-between p-4`}
                >
                  <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
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

                  {/* delete button */}
                  <button
                    onClick={(e) => handleDeleteMap(e, map.id)}
                    className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center hover:bg-white/80 transition-colors"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
                <div className="bg-white px-4 py-3 flex items-center justify-between">
                  <span className="text-lg font-medium">{map.title}</span>
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
