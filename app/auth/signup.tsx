
// app/(auth)/SignUp.tsx
import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import CustomButton from "@/components/buttons";
import { supabase } from '@/src/supabaseClient';

const appleIcon = require("../../assets/icons/apple-logo.png");
const googleIcon = require("../../assets/icons/google-logo.png");
const facebookIcon = require("../../assets/icons/facebook-logo.png");

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>(""); // 👈 add this


  const router = useRouter();
  
  // const handleSignup = async (email: string, password: string) => {
  //   const { data, error } = await supabase.auth.signUp({ email, password });
  
  //   if (error) {
  //     console.error('Signup Error:', error.message);
  //   } else {
  //     console.log('User signed up:', data);
  //   }
  // };

//   const handleSignup = async () => {
//     console.log("📢 Attempting signup with email:", email);
  
//     if (!email || !password) {
//       alert("⚠️ Please enter both email and password.");
//       return;
//     }
  
//     try {
//       const { data, error } = await supabase.auth.signUp({ email, password });
//       const userId = data.user?.id;
// const userEmail = data.user?.email;

// if (userId && userEmail) {
//   const { error: insertError } = await supabase
//     .from('users')
//     .insert({ id: userId, email: userEmail });

//   if (insertError) {
//     console.error("❌ Failed to insert user to 'users' table:", insertError);
//   } else {
//     alert("🎉 Signup Successful! Please log in.");
//     router.replace("/auth/login");
//   }
// }

  
//       if (error) {
//         console.error("❌ Signup Error:", error.message);
//         alert("⚠️ Signup failed: " + error.message);
//       } else {
//         console.log("✅ Signup Successful:", data);
//         alert("🎉 Signup Successful! Please log in.");
//         router.replace("/auth/login"); // ✅ Redirect to login instead of home
//       }
//     } catch (err) {
//       console.error("🚨 Unexpected Error:", err);
//       alert("⚠️ An unexpected error occurred.");
//     }
//   };
  
const handleSignup = async () => {
  if (!email || !password) {
    alert("⚠️ Please enter both email and password.");
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert("Signup failed: " + error.message);
      return;
    }

    const userId = data.user?.id;
    const userEmail = data.user?.email;

    if (userId && userEmail) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({ id: userId, email: userEmail, username });

      if (insertError) {
        console.error("❌ Failed to insert user to 'users' table:", insertError);
      } else {
        alert("🎉 Signup Successful! Please log in.");
        router.replace("/auth/login");
      }
    }
  } catch (err) {
    alert("An unexpected error occurred.");
    console.error("🚨", err);
  }
};


  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>
          Hello, you must create a new account to be able to login to this app.
        </Text>
      </View>

      <View style={styles.inputContainer}>
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        value={username} // ✅ use username
        onChangeText={setUsername}
      />



        <Text style={[styles.label, { marginTop: 20 }]}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={[styles.label, { marginTop: 20 }]}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <CustomButton
        text="Sign Up"
        onPress={handleSignup}
        style={{
          backgroundColor: "#000",
          width: 200,
          marginTop: 20,
        }}
        textStyle={{ color: "#FFF" }}
      />

      <CustomButton
        text="Sign in With Apple"
        icon={appleIcon}
        onPress={() => alert("Apple login not implemented yet")}
        style={{
          backgroundColor: "#FFF",
          width: 400,
          marginTop: 40,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      />

      <CustomButton
        text="Sign in With Google"
        icon={googleIcon}
        onPress={() => alert("Google login not implemented yet")}
        style={{
          backgroundColor: "#FFF",
          width: 400,
          marginTop: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      />

      <CustomButton
        text="Sign in With Facebook"
        icon={facebookIcon}
        onPress={() => alert("Facebook login not implemented yet")}
        style={{
          backgroundColor: "#FFF",
          width: 400,
          marginTop: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b6b6b",
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    color: "#6b6b6b",
  },
  input: {
    backgroundColor: "#C9CFD2",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default SignUp;
