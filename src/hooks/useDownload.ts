import { useState, useCallback, useEffect } from "react";
import {
  DownloadService,
  DownloadProgress,
  DownloadedLecture,
} from "@/services/DownloadService";
import { UILecture } from "@/types/ui";
import { usePlaybackPosition } from "@/queries/hooks/playback";

type DownloadState = {
  isDownloading: boolean;
  progress: number;
  error: string | null;
};

/**
 * Hook to manage single lecture download
 */
export function useDownload(lectureId: string) {
  const [state, setState] = useState<DownloadState>({
    isDownloading: false,
    progress: 0,
    error: null,
  });
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Check if already downloaded on mount
  useEffect(() => {
    const checkDownloaded = async () => {
      const downloaded = await DownloadService.isDownloaded(lectureId);
      setIsDownloaded(downloaded);
    };
    checkDownloaded();
  }, [lectureId]);

  const startDownload = useCallback(async (lecture: UILecture) => {
    setState({ isDownloading: true, progress: 0, error: null });

    try {
      const result = await DownloadService.startDownload(
        lecture,
        (progress: DownloadProgress) => {
          setState((prev) => ({ ...prev, progress: progress.progress }));
        }
      );

      setIsDownloaded(true);
      setState({ isDownloading: false, progress: 100, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Download failed";
      console.error("[useDownload] Download error:", errorMessage, error);
      setState({ isDownloading: false, progress: 0, error: errorMessage });
    }
  }, []);

  const cancelDownload = useCallback(async () => {
    await DownloadService.cancelDownload(lectureId);
    setState({ isDownloading: false, progress: 0, error: null });
  }, [lectureId]);

  const deleteDownload = useCallback(async () => {
    try {
      await DownloadService.deleteDownload(lectureId);
      setIsDownloaded(false);
      setState({ isDownloading: false, progress: 0, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Delete failed";
      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  }, [lectureId]);

  return {
    isDownloaded,
    isDownloading: state.isDownloading,
    progress: state.progress,
    error: state.error,
    startDownload,
    cancelDownload,
    deleteDownload,
  };
}

/**
 * Hook to manage all downloads
 */
export function useDownloads() {
  const [downloads, setDownloads] = useState<DownloadedLecture[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Only true on initial load
  const [isRefreshing, setIsRefreshing] = useState(false); // True during refreshes

  const refreshDownloads = useCallback(async () => {
    // Only set isLoading on first load, use isRefreshing for subsequent calls
    setIsRefreshing(true);
    try {
      const allDownloads = await DownloadService.getAllDownloads();
      const totalStorage = await DownloadService.getTotalStorageUsed();

      setDownloads(allDownloads);
      setStorageUsed(totalStorage);
    } catch (error) {
      console.error("[useDownloads] Failed to refresh downloads:", error);
    } finally {
      setIsLoading(false); // Initial load complete
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshDownloads();
  }, [refreshDownloads]);

  const deleteDownload = useCallback(
    async (lectureId: string) => {
      await DownloadService.deleteDownload(lectureId);
      await refreshDownloads();
    },
    [refreshDownloads]
  );

  const deleteAllDownloads = useCallback(async () => {
    await Promise.all(
      downloads.map((d) => DownloadService.deleteDownload(d.lectureId))
    );
    await refreshDownloads();
  }, [downloads, refreshDownloads]);

  return {
    downloads,
    storageUsed,
    isLoading,
    isRefreshing,
    refreshDownloads,
    deleteDownload,
    deleteAllDownloads,
    formatBytes: DownloadService.formatBytes,
  };
}
