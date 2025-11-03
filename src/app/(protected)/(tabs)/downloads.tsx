import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDownloads } from '@/hooks/useDownload';
import { usePlayer } from '@/providers/PlayerProvider';

export default function DownloadsScreen() {
  const {
    downloads,
    storageUsed,
    isLoading,
    refreshDownloads,
    deleteDownload,
    deleteAllDownloads,
    formatBytes,
  } = useDownloads();
  const { setLecture } = usePlayer();

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Downloads',
      'Are you sure you want to delete all downloaded lectures?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: deleteAllDownloads,
        },
      ]
    );
  };

  const handleDeleteSingle = (lectureId: string) => {
    Alert.alert(
      'Delete Download',
      'Are you sure you want to delete this downloaded lecture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteDownload(lectureId),
        },
      ]
    );
  };

  const handlePlayDownload = (download: any) => {
    setLecture({
      id: download.lectureId,
      title: download.title || `Lecture ${download.lectureId}`,
      author: download.speaker || 'Unknown Speaker',
      audio_url: download.filePath,
      thumbnail_url: download.thumbnail_url,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className='flex-1 bg-background justify-center items-center'>
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-background'>
      {/* Header */}
      <View className='px-4 py-6 border-b border-gray-800'>
        <Text className='text-white text-3xl font-bold mb-2'>Downloads</Text>
        <View className='flex-row justify-between items-center'>
          <Text className='text-gray-400'>
            {downloads.length} lecture{downloads.length !== 1 ? 's' : ''} • {formatBytes(storageUsed)}
          </Text>
          {downloads.length > 0 && (
            <Pressable
              onPress={handleDeleteAll}
              className='bg-red-600 px-4 py-2 rounded-lg'
            >
              <Text className='text-white font-semibold'>Delete All</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Downloads List */}
      <ScrollView className='flex-1 px-4 py-4'>
        {downloads.length === 0 ? (
          <View className='flex-1 justify-center items-center py-20'>
            <Ionicons name="download-outline" size={64} color="#6b7280" />
            <Text className='text-gray-400 text-lg mt-4 text-center'>
              No downloaded lectures yet
            </Text>
            <Text className='text-gray-500 text-sm mt-2 text-center'>
              Download lectures to listen offline
            </Text>
          </View>
        ) : (
          <View className='gap-4'>
            {downloads.map((download) => (
              <Pressable
                key={download.lectureId}
                onPress={() => handlePlayDownload(download)}
                className='bg-card border border-border rounded-xl overflow-hidden'
              >
                <View className='flex-row items-center p-4'>
                  {/* Thumbnail */}
                  <View className='w-16 h-16 rounded-lg overflow-hidden bg-muted mr-4'>
                    {download.thumbnail_url ? (
                      <Image
                        source={{ uri: download.thumbnail_url }}
                        className='w-full h-full'
                        resizeMode='cover'
                      />
                    ) : (
                      <View className='w-full h-full items-center justify-center'>
                        <Ionicons name="musical-notes" size={24} color="#6b7280" />
                      </View>
                    )}
                  </View>

                  {/* Info */}
                  <View className='flex-1'>
                    <Text className='text-foreground font-semibold mb-1' numberOfLines={2}>
                      {download.title || `Lecture ${download.lectureId}`}
                    </Text>
                    <Text className='text-muted-foreground text-sm mb-1' numberOfLines={1}>
                      {download.speaker || 'Unknown Speaker'}
                    </Text>
                    <Text className='text-muted-foreground text-xs'>
                      {formatBytes(download.fileSize)} • {new Date(download.downloadedAt).toLocaleDateString()}
                    </Text>
                  </View>

                  {/* Play and Delete buttons */}
                  <View className='flex-row items-center gap-2 ml-2'>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handlePlayDownload(download);
                      }}
                      className='w-10 h-10 rounded-full bg-primary items-center justify-center'
                    >
                      <Ionicons name="play" size={16} color="white" style={{ marginLeft: 2 }} />
                    </Pressable>

                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteSingle(download.lectureId);
                      }}
                    >
                      <Ionicons name="trash-outline" size={24} color="#ef4444" />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
