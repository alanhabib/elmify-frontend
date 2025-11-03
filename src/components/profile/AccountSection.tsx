import React from 'react';
import { View, Text, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';

interface AccountSectionProps {
  email: string;
  displayName?: string;
  profileImageUrl?: string;
  createdAt?: string;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  email,
  displayName,
  profileImageUrl,
  createdAt,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex-row items-center gap-2">
          <AntDesign name="user" size={20} color="#a855f7" />
          <Text className="text-xl font-semibold text-card-foreground">Account</Text>
        </CardTitle>
        <CardDescription>Your account information and status</CardDescription>
      </CardHeader>
      <CardContent>
        <View className="gap-4">
          {/* Profile Image and Name */}
          {(profileImageUrl || displayName) && (
            <View className="flex-row items-center gap-3 pb-4 border-b border-border">
              {profileImageUrl ? (
                <Image
                  source={{ uri: profileImageUrl }}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center">
                  <AntDesign name="user" size={32} color="#a855f7" />
                </View>
              )}
              {displayName && (
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">
                    {displayName}
                  </Text>
                  <Text className="text-sm text-muted-foreground">Member</Text>
                </View>
              )}
            </View>
          )}

          {/* Email */}
          <View>
            <Text className="text-sm font-medium text-muted-foreground mb-1">
              Email
            </Text>
            <Text className="text-base text-foreground">{email || 'Not available'}</Text>
          </View>

          {/* Member Since */}
          {createdAt && (
            <View>
              <Text className="text-xs text-muted-foreground">
                Member since{' '}
                {new Date(createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>
      </CardContent>
    </Card>
  );
};