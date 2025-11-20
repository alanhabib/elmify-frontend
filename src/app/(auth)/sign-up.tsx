import * as React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        // router.replace('/');
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <View className="flex-1 bg-background p-6">
        <View className="flex-1 justify-center">
          <Text className="text-3xl font-bold text-center mb-8 text-foreground">
            Verify Your Email
          </Text>

          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-muted-foreground mb-1">
                Verification Code
              </Text>
              <TextInput
                className="w-full p-4 border border-border rounded-lg bg-card text-foreground"
                value={code}
                placeholder="Enter your verification code"
                placeholderTextColor="#6b7280"
                onChangeText={setCode}
              />
            </View>

            <TouchableOpacity
              className="w-full bg-primary p-4 rounded-lg mt-6"
              onPress={onVerifyPress}
            >
              <Text className="text-primary-foreground text-center font-semibold">
                Verify Email
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-6">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-center mb-8 text-foreground">
          Create Account
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
            onPress={onSignUpPress}
          >
            <Text className="text-primary-foreground text-center font-semibold">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center items-center mt-6 gap-2">
          <Text className="text-muted-foreground">Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace("/sign-in")}>
            <Text className="text-primary font-semibold ml-1">Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
