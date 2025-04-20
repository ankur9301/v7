
// app/(auth)/SignUp.tsx
import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import CustomButton from "@/components/buttons";
import { supabase } from '@/src/supabaseClient';
import { useUserStore } from "@/store/useUserStore";


const appleIcon = require("../../assets/icons/apple-logo.png");
const googleIcon = require("../../assets/icons/google-logo.png");
const facebookIcon = require("../../assets/icons/facebook-logo.png");

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>(""); // 👈 add this


  const router = useRouter();
  

  const handleSignup = async () => {
    if (!email || !password || !username) {
      alert("⚠️ Please fill all fields.");
      return;
    }
  
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  
      if (signUpError) {
        alert("Signup failed: " + signUpError.message);
        return;
      }
  
      const userId = signUpData.user?.id;
  
      if (userId) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: userId,
          email,
          username,
        });
  
        if (insertError) {
          alert("Profile save error: " + insertError.message);
          return;
        }
  
        // ✅ Zustand: store user
        useUserStore.getState().setUser({ id: userId, email, username });
  
        // ✅ Route to home
        router.replace("/home");
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
