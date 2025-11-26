import * as React from "react";
import { useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import { ClerkAPIError } from "@clerk/types";

export default function ResetPassword() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [errors, setErrors] = React.useState<ClerkAPIError[]>([]);

  const onResetPasswordPress = React.useCallback(async () => {
    if (!isLoaded) return;
    setErrors([]);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });

      setPendingVerification(true);
    } catch (err) {
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
      console.error(JSON.stringify(err, null, 2));
    }
  }, [isLoaded, emailAddress, signIn]);

  const onVerifyPress = React.useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
      console.error(JSON.stringify(err, null, 2));
    }
  }, [isLoaded, code, password, signIn, setActive, router]);

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
              <Text className="text-xs text-muted-foreground mb-2">
                We sent a code to {emailAddress}
              </Text>
              <TextInput
                className="w-full p-4 border border-border rounded-lg bg-card text-foreground"
                value={code}
                placeholder="Enter verification code"
                placeholderTextColor="#6b7280"
                onChangeText={setCode}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-muted-foreground mb-1">
                New Password
              </Text>
              <TextInput
                className="w-full p-4 border border-border rounded-lg bg-card text-foreground"
                value={password}
                placeholder="Enter new password"
                placeholderTextColor="#6b7280"
                secureTextEntry
                onChangeText={setPassword}
              />
            </View>

            {errors.map((error) => (
              <Text key={error.longMessage} className="text-red-500 text-sm">
                {error.longMessage}
              </Text>
            ))}

            <TouchableOpacity
              className="w-full bg-primary p-4 rounded-lg mt-6"
              onPress={onVerifyPress}
              disabled={!code || !password}
            >
              <Text className="text-primary-foreground text-center font-semibold">
                Reset Password
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="mt-6"
            onPress={() => setPendingVerification(false)}
          >
            <Text className="text-muted-foreground text-center">
              Back to email entry
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-6">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-center mb-8 text-foreground">
          Reset Password
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
              placeholder="Enter your email"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              onChangeText={setEmailAddress}
            />
          </View>

          {errors.map((error) => (
            <Text key={error.longMessage} className="text-red-500 text-sm">
              {error.longMessage}
            </Text>
          ))}

          <TouchableOpacity
            className="w-full bg-primary p-4 rounded-lg mt-6"
            onPress={onResetPasswordPress}
            disabled={!emailAddress}
          >
            <Text className="text-primary-foreground text-center font-semibold">
              Continue
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center items-center mt-6 gap-2">
          <Text className="text-muted-foreground">Remember your password?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold ml-1">Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
