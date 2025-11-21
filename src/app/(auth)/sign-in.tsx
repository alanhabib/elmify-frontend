import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import React from "react";
import { useGuestMode } from "@/hooks/useGuestMode";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { enableGuestMode } = useGuestMode();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        // router.replace('/');
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        Alert.alert("Error", "Invalid email or password");
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      const errorMessage = err.errors?.[0]?.message || "Invalid email or password";
      Alert.alert("Error", errorMessage);
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View className="flex-1 bg-background p-6">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-center mb-8 text-foreground">
          Welcome Back
        </Text>

        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-muted-foreground mb-1">
              Email
            </Text>
            <TextInput
              className="w-full p-4 border border-border rounded-lg bg-card text-foreground"
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter email"
              placeholderTextColor="#6b7280"
              onChangeText={setEmailAddress}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-muted-foreground mb-1">
              Password
            </Text>
            <TextInput
              className="w-full p-4 border border-border rounded-lg bg-card text-foreground"
              value={password}
              placeholder="Enter password"
              placeholderTextColor="#6b7280"
              secureTextEntry={true}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            className="w-full bg-primary p-4 rounded-lg mt-6"
            onPress={onSignInPress}
          >
            <Text className="text-primary-foreground text-center font-semibold">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center items-center mt-6 gap-2">
          <Text className="text-muted-foreground">Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.replace("/sign-up")}>
            <Text className="text-primary font-semibold ml-1">Sign up</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Mode Button */}
        <TouchableOpacity
          className="mt-8 py-3"
          onPress={enableGuestMode}
        >
          <Text className="text-muted-foreground text-center">
            Continue as Guest
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
