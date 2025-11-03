import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (isSignedIn) {
    return <Redirect href={"/(protected)/(tabs)"} />;
  }

  return <Stack />;
}
