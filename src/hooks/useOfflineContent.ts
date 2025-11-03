import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

interface OfflineContentStats {
  downloadedItemsCount: number;
  storageUsed: string;
  totalSizeBytes: number;
  isLoading: boolean;
}

export const useOfflineContent = (): OfflineContentStats => {
  const [stats, setStats] = useState<OfflineContentStats>({
    downloadedItemsCount: 0,
    storageUsed: '0.0% of 0.0 GB',
    totalSizeBytes: 0,
    isLoading: true,
  });

  useEffect(() => {
    calculateOfflineContent();
  }, []);

  const calculateOfflineContent = async () => {
    try {
      // Get document directory
      const directory = FileSystem.documentDirectory;
      if (!directory) {
        setStats({
          downloadedItemsCount: 0,
          storageUsed: 'N/A',
          totalSizeBytes: 0,
          isLoading: false,
        });
        return;
      }

      // Read all files in directory
      const files = await FileSystem.readDirectoryAsync(directory);

      // Filter for audio files (mp3)
      const audioFiles = files.filter(file => file.endsWith('.mp3'));

      // Calculate total size
      let totalBytes = 0;
      for (const file of audioFiles) {
        const fileInfo = await FileSystem.getInfoAsync(`${directory}${file}`);
        if (fileInfo.exists && 'size' in fileInfo) {
          totalBytes += fileInfo.size;
        }
      }

      // Get device storage info
      const totalDiskCapacity = await FileSystem.getTotalDiskCapacityAsync();
      const freeDiskStorage = await FileSystem.getFreeDiskStorageAsync();

      // Calculate percentage and format
      const totalGB = totalDiskCapacity / (1024 * 1024 * 1024);
      const usedGB = totalBytes / (1024 * 1024 * 1024);
      const percentage = (usedGB / totalGB) * 100;

      setStats({
        downloadedItemsCount: audioFiles.length,
        storageUsed: `${usedGB.toFixed(1)} GB (${percentage.toFixed(1)}% of ${totalGB.toFixed(1)} GB)`,
        totalSizeBytes: totalBytes,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error calculating offline content:', error);
      setStats({
        downloadedItemsCount: 0,
        storageUsed: 'Unable to calculate',
        totalSizeBytes: 0,
        isLoading: false,
      });
    }
  };

  return stats;
};
