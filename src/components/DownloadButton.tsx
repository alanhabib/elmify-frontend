import { Pressable, View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { useDownload } from '@/hooks/useDownload';
import { UILecture } from '@/types/ui';
import { Toast } from '@/components/ui/Toast';

type DownloadButtonProps = {
  lecture: UILecture;
  size?: number;
  showProgress?: boolean;
};

type ToastState = {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
};

const initialToastState: ToastState = {
  visible: false,
  message: '',
  type: 'success',
};

export function DownloadButton({ lecture, size = 24, showProgress = false }: DownloadButtonProps) {
  const {
    isDownloaded,
    isDownloading,
    progress,
    startDownload,
    cancelDownload,
    deleteDownload,
  } = useDownload(lecture.id);

  const [toast, setToast] = useState<ToastState>(initialToastState);

  const showToast = useCallback((message: string, type: ToastState['type']) => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const handlePress = useCallback(async () => {
    try {
      if (isDownloading) {
        await cancelDownload();
        showToast('Download cancelled', 'info');
      } else if (isDownloaded) {
        await deleteDownload();
        showToast('Download removed', 'success');
      } else {
        await startDownload(lecture);
        showToast(`Downloaded successfully`, 'success');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      showToast(errorMessage, 'error');
    }
  }, [isDownloading, isDownloaded, lecture, startDownload, cancelDownload, deleteDownload, showToast]);

  const renderButton = () => {
    if (isDownloading) {
      return (
        <Pressable onPress={cancelDownload} className='relative'>
          <ActivityIndicator size={size} color="white" />
          {showProgress && (
            <Text className='text-white text-xs mt-1'>{progress}%</Text>
          )}
        </Pressable>
      );
    }

    return (
      <Pressable onPress={handlePress}>
        <Ionicons
          name={isDownloaded ? 'checkmark-circle' : 'download-outline'}
          size={size}
          color={isDownloaded ? '#22c55e' : 'white'}
        />
      </Pressable>
    );
  };

  return (
    <>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
      {renderButton()}
    </>
  );
}
