import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/src/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// import React, { createContext, useState, useEffect } from "react";
// import { supabase } from "../utils/supabaseClient";

// interface AuthContextProps {
//   user: any;
//   logout: () => void;
// }

// export const AuthContext = createContext<AuthContextProps>({
//   user: null,
//   logout: () => {},
// });

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<any>(null);

//   useEffect(() => {
//     const checkUser = async () => {
//       const { data } = await supabase.auth.getUser();
//       setUser(data.user);
//       console.log("Auth State Changed: ", data.user);
//     };

//     checkUser();

//     const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user || null);
//       console.log("User Session Updated: ", session);
//     });

//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, []);

//   const logout = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//     console.log("User logged out.");
//   };

//   return (
//     <AuthContext.Provider value={{ user, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };