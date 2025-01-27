import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useAuth } from "@/components/AuthContext";
import { useState } from "react";
import { Link } from "expo-router";
import { PasswordInput } from "@/components/PasswordInput";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor="#aaa"
      />
      <PasswordInput placeholder="Password" value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      <Link href="/register" style={styles.registerLink}>
        Register instead
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "white",
    fontSize: 16,
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#f4511e",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerLink: {
    textAlign: "center",
    fontSize: 16,
    color: "#f4511e",
    fontWeight: "bold",
  },
});
