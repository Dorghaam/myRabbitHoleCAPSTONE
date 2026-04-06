"use client";

// home page with hero, featured maps, value props, and signup cta
// when logged in it just shows featured maps and the users saved maps
// when not logged in it shows the full marketing landing page

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Trash2, Sparkles, Eye, Compass } from "lucide-react";

// the shape of a rabbit hole from the database
interface RabbitHole {
  id: string;
  title: string;
  description: string;
  color: string;
}

// maps the color name from the database to tailwind background classes
const colorMap: Record<string, string> = {
  purple: "bg-purple-400",
  green: "bg-emerald-400",
  orange: "bg-orange-400",
};

// 3d card style that matches the node design from the canvas
const cardBase = `
  rounded-2xl border-2 border-gray-800 overflow-hidden cursor-pointer bg-white
  shadow-[5px_5px_0_0_#1e3a5f]
  hover:shadow-[3px_3px_0_0_#1e3a5f] hover:translate-x-[1px] hover:translate-y-[1px]
  active:shadow-[0px_0px_0_0_#1e3a5f] active:translate-x-[2.5px] active:translate-y-[2.5px]
  transition-all duration-150
`;

export default function Home() {
  const [featuredMaps, setFeaturedMaps] = useState<RabbitHole[]>([]);
  const [myMaps, setMyMaps] = useState<RabbitHole[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // navigate to the map page, or login if not signed in
  const handleCardClick = (mapId: string) => {
    if (!user) {
      window.location.href = "/login";
    } else {
      window.location.href = `/map/${mapId}`;
    }
  };

  // delete a rabbit hole the user owns
  const handleDeleteMap = async (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation();
    if (!confirm("are you sure you want to delete this map?")) return;
    await supabase.from("rabbit_holes").delete().eq("id", mapId);
    setMyMaps((prev) => prev.filter((m) => m.id !== mapId));
  };

  // fetch featured maps and the users saved maps on load
  useEffect(() => {
    const fetchMaps = async () => {
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
    <div className="flex flex-col items-center">

      {/* hero section, only shows when not logged in */}
      {!user && !loading && (
        <section className="w-full max-w-4xl text-center pt-20 pb-14 px-8">
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-5">
            stop scrolling.
            <br />
            <span className="text-primary-pink">start exploring.</span>
          </h1>
          <p className="text-xl text-text-secondary mb-3">
            dive deep into topics that actually matter
          </p>
          <p className="text-text-muted text-sm">
            click a featured map below to start your journey
          </p>
        </section>
      )}

      {/* featured maps section */}
      <section className="w-full max-w-5xl px-8 pb-10">
        {/* only show the title when logged in since the hero replaces it */}
        {user && (
          <h2 className="text-4xl font-bold text-center mb-10 pt-12">
            Featured Maps
          </h2>
        )}

        {loading && (
          <p className="text-gray-500 text-center py-12">loading maps...</p>
        )}

        {!loading && featuredMaps.length === 0 && (
          <p className="text-gray-500 text-center">no featured maps yet</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {featuredMaps.map((map) => (
            <div
              key={map.id}
              onClick={() => handleCardClick(map.id)}
              className={cardBase}
            >
              {/* colored header area with the map title */}
              <div
                className={`${colorMap[map.color] || "bg-purple-400"} h-36 flex items-end p-5`}
              >
                <h3 className="text-white font-bold text-xl drop-shadow-sm">
                  {map.title}
                </h3>
              </div>

              {/* description and arrow at the bottom */}
              <div className="px-5 py-4 flex items-center justify-between gap-3">
                <p className="text-sm text-text-secondary leading-snug">
                  {map.description}
                </p>
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0"
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
      </section>

      {/* my maps section, only shows when logged in */}
      {user && (
        <section className="w-full max-w-5xl px-8 pb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">My Maps</h2>

          {!loading && myMaps.length === 0 && (
            <p className="text-gray-500 text-center">
              you havent created any maps yet.{" "}
              <a href="/create" className="text-primary-pink underline">
                create one
              </a>
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {myMaps.map((map) => (
              <div
                key={map.id}
                onClick={() => handleCardClick(map.id)}
                className={cardBase}
              >
                {/* colored header with delete button */}
                <div
                  className={`${colorMap[map.color] || "bg-purple-400"} h-28 flex items-start justify-between p-4`}
                >
                  <h3 className="text-white font-bold text-lg drop-shadow-sm mt-auto">
                    {map.title}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteMap(e, map.id)}
                    className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center hover:bg-white/80 transition-colors"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>

                {/* bottom bar with arrow */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    {map.description || "your concept map"}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0"
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
        </section>
      )}

      {/* value props section, only shows when not logged in */}
      {!user && !loading && (
        <section className="w-full max-w-5xl px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {/* ai powered card */}
            <div className="bg-white rounded-2xl border-2 border-gray-800 shadow-[5px_5px_0_0_#1e3a5f] p-7 text-center">
              <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-pink-300">
                <Sparkles className="text-pink-500" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">ai powered</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                gemini generates explanations, key terms, and connections for
                any topic you explore
              </p>
            </div>

            {/* visual learning card */}
            <div className="bg-white rounded-2xl border-2 border-gray-800 shadow-[5px_5px_0_0_#1e3a5f] p-7 text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-300">
                <Eye className="text-blue-500" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">visual learning</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                explore knowledge as interactive concept maps instead of boring
                walls of text
              </p>
            </div>

            {/* explore anything card */}
            <div className="bg-white rounded-2xl border-2 border-gray-800 shadow-[5px_5px_0_0_#1e3a5f] p-7 text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-300">
                <Compass className="text-emerald-500" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">explore anything</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                from quantum physics to ancient history, dive into any subject
                that sparks your curiosity
              </p>
            </div>
          </div>
        </section>
      )}

      {/* call to action section, only shows when not logged in */}
      {!user && !loading && (
        <section className="w-full text-center py-16 px-8 mb-8">
          <h2 className="text-3xl font-bold mb-3">
            ready to go down the rabbit hole?
          </h2>
          <p className="text-text-secondary mb-8">
            create your own concept maps and explore any topic
          </p>
          <a
            href="/signup"
            className="inline-block px-10 py-4 text-lg font-bold rounded-full bg-pink-500 text-white border-2 border-pink-700 shadow-[0_5px_0_0_#9d174d] hover:shadow-[0_3px_0_0_#9d174d] hover:translate-y-[2px] active:shadow-none active:translate-y-[5px] transition-all duration-100"
          >
            sign up free
          </a>
        </section>
      )}
    </div>
  );
}
