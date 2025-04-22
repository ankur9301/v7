// import { Redirect, Slot } from "expo-router";
// import { useAuth } from "../../context/AuthProvider";

// export default function ProtectedLayout() {
//   const auth = useAuth();

//   if (!auth) {
//     return null; // or handle the null case appropriately
//   }

//   const { session, loading } = auth;

//   if (loading) return null; // or splash screen

//   if (!session) {
//     return <Redirect href="/auth/login" />;
//   }

//   return <Slot />;
// }
