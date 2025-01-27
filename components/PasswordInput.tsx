import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

export const PasswordInput = ({ placeholder, value, onChangeText }: { placeholder: string; value: string; onChangeText: (text: string) => void }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!isVisible}
        style={styles.input}
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity onPress={() => setIsVisible(!isVisible)} style={styles.icon}>
        {isVisible ? <EyeOff color="#666" size={20} /> : <Eye color="#666" size={20} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "white",
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: "#333",
  },
  icon: {
    marginLeft: 8,
  },
});
