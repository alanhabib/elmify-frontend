import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface DeleteAccountModalProps {
  isVisible: boolean;
  userEmail: string;
  onClose: () => void;
  onDelete: (confirmEmail: string) => void;
  isDeleting?: boolean;
  error?: string | null;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isVisible,
  userEmail,
  onClose,
  onDelete,
  isDeleting = false,
  error = null,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setEmailInput('');
      setIsValid(false);
    }
  }, [isVisible]);

  const handleEmailChange = (text: string) => {
    setEmailInput(text);
    setIsValid(text.trim().toLowerCase() === userEmail.toLowerCase());
  };

  const handleDelete = () => {
    if (isValid && !isDeleting) {
      onDelete(emailInput.trim());
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setEmailInput('');
      setIsValid(false);
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-card rounded-xl p-6 w-full max-w-sm">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center">
                <Feather name="alert-triangle" size={20} color="#ef4444" />
              </View>
              <Text className="text-xl font-semibold text-card-foreground">
                Delete Account
              </Text>
            </View>
            {!isDeleting && (
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 rounded-full bg-muted items-center justify-center"
                activeOpacity={0.7}
              >
                <Feather name="x" size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Warning */}
          <View className="bg-red-500/10 rounded-lg p-4 mb-6">
            <Text className="text-red-500 text-sm font-medium mb-2">
              This action cannot be undone
            </Text>
            <Text className="text-red-400 text-sm leading-5">
              All your data will be permanently deleted, including:
            </Text>
            <View className="mt-2 ml-2">
              <Text className="text-red-400 text-sm">• Favorites and playlists</Text>
              <Text className="text-red-400 text-sm">• Listening history and progress</Text>
              <Text className="text-red-400 text-sm">• Account settings and preferences</Text>
              <Text className="text-red-400 text-sm">• Downloaded content</Text>
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <Text className="text-red-500 text-sm">{error}</Text>
            </View>
          )}

          {/* Email Confirmation */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">
              Type your email to confirm
            </Text>
            <Text className="text-xs text-muted-foreground mb-3">
              {userEmail}
            </Text>
            <TextInput
              value={emailInput}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Enter your email"
              editable={!isDeleting}
              className={`
                border-2 rounded-lg px-3 py-3 text-base text-foreground bg-background
                ${isValid ? 'border-red-500' : 'border-border'}
              `}
              placeholderTextColor="#6b7280"
            />
            {emailInput.length > 0 && !isValid && (
              <Text className="text-muted-foreground text-xs mt-1">
                Email does not match
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClose}
              disabled={isDeleting}
              className={`flex-1 bg-muted rounded-lg py-3 items-center ${isDeleting ? 'opacity-50' : ''}`}
              activeOpacity={0.7}
            >
              <Text className="text-muted-foreground font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              disabled={!isValid || isDeleting}
              className={`
                flex-1 rounded-lg py-3 items-center flex-row justify-center gap-2
                ${isValid && !isDeleting ? 'bg-red-500' : 'bg-muted'}
              `}
              activeOpacity={0.7}
            >
              {isDeleting ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-white font-medium">Deleting...</Text>
                </>
              ) : (
                <Text
                  className={`
                    font-medium
                    ${isValid ? 'text-white' : 'text-muted-foreground'}
                  `}
                >
                  Delete Account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View className="mt-4 pt-4 border-t border-border">
            <Text className="text-xs text-muted-foreground text-center">
              Need help? Contact support@elmify.store
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};
