// hooks/useUserProfile.ts
import { useEffect, useState } from "react";
import { supabase } from "@/src/supabaseClient";

export function useUserProfile() {
  const [userData, setUserData] = useState<{ id: string; email: string; username?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setUserData(data);
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  return { userData, loading };
}
