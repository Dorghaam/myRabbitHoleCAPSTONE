"use client";

// this provider wraps the whole app and keeps track of the logged in user
// any component can use the useAuth hook to check if someone is logged in

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// the shape of the auth context that components can read from
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// custom hook so components can easily access the auth state
// example: const { user } = useAuth()
export function useAuth() {
  return useContext(AuthContext);
}

// the provider component that wraps the app in layout.tsx
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // when the app first loads, check if there is already a session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // listen for login and logout events so the ui updates automatically
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // cleanup the listener when the component unmounts
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
