// hooks/useUserProfile.ts
import { useEffect, useState } from "react";
import { supabase } from "@/src/supabaseClient";

export function useUserProfile() {
    const [userData, setUserData] = useState<{
      id: string;
      email: string;
      username?: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchUser = async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
  
        if (!user) {
          setUserData(null);
          setLoading(false);
          return;
        }
  
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
  
        if (profileData && !error) {
          setUserData(profileData);
        } else {
          console.error("❌ Failed to fetch user profile:", error?.message);
        }
  
        setLoading(false);
      };
  
      fetchUser();
    }, []);
  
    return { userData, loading };
  }
  