
// app/(auth)/LogIn.tsx
import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, StyleSheet, Pressable, Animated } from "react-native";
import { useRouter } from "expo-router";
import CustomButton from "@/components/buttons";
import { supabase } from '../../utils/supabaseClient';


const appleIcon = require("../../assets/icons/apple-logo.png");
const googleIcon = require("../../assets/icons/google-logo.png");
const facebookIcon = require("../../assets/icons/facebook-logo.png");

const handlePressAnimation = (scaleAnim: Animated.Value, toValue: number) => {
  Animated.timing(scaleAnim, {
    toValue,
    duration: 150,
    useNativeDriver: true,
  }).start();
};


const LogIn: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();

  // const handleLogin = async (email: string, password: string) => {
  //   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  //   if (error) {
  //     console.error('Login Error:', error.message);
  //   } else {
  //     console.log('User logged in:', data);
  //   }
  // };
  const handleLogin = async () => {
    console.log("📢 Attempting login with email:", email);
  
    if (!email || !password) {
      alert("⚠️ Please enter both email and password.");
      return;
    }
  
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
      if (error) {
        console.error("❌ Login Error:", error.message);
        alert("⚠️ Login failed: " + error.message);
      } else if (!data.user) {
        console.error("🚨 No user returned from Supabase!");
        alert("⚠️ Login failed: No user found in database.");
      } else {
        console.log("✅ Login Successful:", data.user);
        alert("🎉 Login Successful!");
        router.replace("/home"); // Redirect to home page
      }
    } catch (err) {
      console.error("🚨 Unexpected Error:", err);
      alert("⚠️ An unexpected error occurred.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.subtitle}>
          Hello, you must login first to be able to use all the features.
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={[styles.label, { marginTop: 20 }]}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Forgot Password */}

      <AnimatedPressable
        onPress={() => router.push("/auth/forgotPass")}
      >
        <Text style={styles.forgotPassword}>
          Forgot Password?
        </Text>
      </AnimatedPressable>
      </View>

      <CustomButton
        text="Login"
        onPress={handleLogin}
        style={{
          backgroundColor: "#000",
          width: 200,
          marginTop: 20,
        }}
        textStyle={{ color: "#FFF" }}
      />

      <CustomButton
        text="Continue With Apple"
        icon={appleIcon}
        onPress={() => router.push("/home")}
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
        text="Continue With Google"
        icon={googleIcon}
        onPress={() => router.push("/home")}
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
        text="Continue With Facebook"
        icon={facebookIcon}
        onPress={() => router.push("/home")}
        style={{
          backgroundColor: "#FFF",
          width: 400,
          marginTop: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      />
      
      {/* SIgn Up */}
      <View style ={styles.signupContainer}>
        <Text>Dont have an account?</Text>
        <AnimatedPressable
          onPress={() => router.push("/auth/signup")}
          >
            <Text style={styles.signupText}>
              Sign Up
            </Text>
          </AnimatedPressable>

        </View>
    </SafeAreaView>
  );
};


const AnimatedPressable: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
}> = ({ onPress, children }) => {
  const scaleAnim = useState(new Animated.Value(1))[0];

  return (
    <Pressable
      onPressIn={() => {
        handlePressAnimation(scaleAnim, 0.95); // Slight zoom-in on press
      }}
      onPressOut={() => {
        handlePressAnimation(scaleAnim, 1); // Reset scale
      }}
      onPress={onPress}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </Pressable>
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
  forgotPassword: {
    marginTop: 10,
    textAlign: "right", // Aligns text to the left below the input
    fontSize: 14,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },
  signupText: {
    color: "#007BFF",
    fontWeight: "bold",
  },
});

export default LogIn;
