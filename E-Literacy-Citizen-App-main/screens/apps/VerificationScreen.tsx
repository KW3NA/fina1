// VerificationScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import { useNavigation } from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/types';  


import type { StackNavigationProp } from '@react-navigation/stack';


type VerificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home Screen'
>;

interface VerificationScreenProps {
  navigation: VerificationScreenNavigationProp;
}

export default function VerificationScreen({ navigation }: VerificationScreenProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Request OTP
  const sendOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://172.16.2.2:8000/api/email/send-otp",
        {},
        {
          headers: {
            Authorization: `Bearer YOUR_USER_TOKEN`,
          },
        }
      );
      Alert.alert("Success", response.data.message);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://172.16.2.2:8000/api/email/verify-otp",
        { otp },
        {
          headers: {
            Authorization: `Bearer YOUR_USER_TOKEN`,
          },
        }
      );
      Alert.alert("Success", response.data.message);
      navigation.replace("Home Screen"); // redirect to dashboard/home
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Verification failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
        Verify Your Email
      </Text>

      <TextInput
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          marginBottom: 20,
          borderRadius: 8,
        }}
      />

      <TouchableOpacity
        onPress={verifyOtp}
        style={{ backgroundColor: "blue", padding: 15, borderRadius: 8 }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
          Verify OTP
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={sendOtp}
        style={{ marginTop: 15, padding: 12, borderRadius: 8, borderWidth: 1 }}
      >
        <Text style={{ textAlign: "center" }}>
          {loading ? "Sending..." : "Resend OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
