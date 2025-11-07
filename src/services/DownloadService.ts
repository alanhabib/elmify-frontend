import { File, Directory, Paths } from "expo-file-system";
import * as FileSystem from "expo-file-system";
import * as LegacyFileSystem from "expo-file-system/legacy";
import { StreamingService } from "./audio/StreamingService";
import { UILecture } from "@/types/ui";
import { DOWNLOAD_CONFIG, DOWNLOAD_ERRORS } from "./DownloadService.constants";
import { DownloadStreamReader } from "./download/DownloadStreamReader";
import { DownloadValidator } from "./download/DownloadValidator";
import { FileSystemHelper } from "./download/FileSystemHelper";

export type DownloadProgress = {
  lectureId: string;
  totalBytes: number;
  bytesWritten: number;
  progress: number; // 0-100
};

export type DownloadedLecture = {
  lectureId: string;
  filePath: string;
  downloadedAt: number;
  fileSize: number;
  // Metadata
  title?: string;
  speaker?: string;
  thumbnail_url?: string;
  duration?: number;
};

/**
 * Service to handle lecture downloads with proper separation of concerns
 */
export class DownloadService {
  private static DOWNLOAD_DIR = new Directory(
    Paths.document,
    DOWNLOAD_CONFIG.DIRECTORY_NAME
  );
  private static activeDownloads = new Map<string, AbortController>();

  /**
   * Get local file for a lecture
   */
  static getLocalFile(lectureId: string): File {
    return new File(
      this.DOWNLOAD_DIR,
      `${lectureId}${DOWNLOAD_CONFIG.FILE_EXTENSION}`
    );
  }

  /**
   * Get metadata file for a lecture
   */
  static getMetadataFile(lectureId: string): File {
    return new File(this.DOWNLOAD_DIR, `${lectureId}.json`);
  }

  /**
   * Save lecture metadata
   */
  static async saveMetadata(lecture: UILecture): Promise<void> {
    try {
      const metadata = {
        title: lecture.title,
        speaker: lecture.speaker || lecture.author,
        thumbnail_url: lecture.thumbnail_url,
        duration: lecture.duration || 0,
      };
      const metadataFile = this.getMetadataFile(lecture.id);
      await metadataFile.write(JSON.stringify(metadata));
    } catch (error) {
      // Metadata save failed - non-critical
    }
  }

  /**
   * Load lecture metadata
   */
  static async loadMetadata(
    lectureId: string
  ): Promise<Partial<UILecture> | null> {
    try {
      const metadataFile = this.getMetadataFile(lectureId);
      const content = await metadataFile.text();
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Check if lecture is downloaded
   */
  static async isDownloaded(lectureId: string): Promise<boolean> {
    try {
      const file = this.getLocalFile(lectureId);
      // Use legacy API to check if file exists
      const info = await LegacyFileSystem.getInfoAsync(file.uri);
      return info.exists;
    } catch {
      return false;
    }
  }

  /**
   * Get downloaded lecture info
   */
  static async getDownloadedLecture(
    lectureId: string,
    fileInfo?: any
  ): Promise<DownloadedLecture | null> {
    try {
      const file = this.getLocalFile(lectureId);

      // Use provided fileInfo if available (from directory.list()), otherwise use legacy FileSystem
      let fileSize = 0;
      if (fileInfo) {
        fileSize = fileInfo.size || 0;
      } else {
        // Fallback: use legacy API to check file
        const legacyInfo = await LegacyFileSystem.getInfoAsync(file.uri);
        if (!legacyInfo.exists) return null;
        fileSize = legacyInfo.size || 0;
      }

      // Load metadata
      const metadata = await this.loadMetadata(lectureId);

      return {
        lectureId,
        filePath: file.uri,
        downloadedAt: Date.now(), // New API doesn't expose modification time easily
        fileSize,
        title: metadata?.title,
        speaker: metadata?.speaker,
        thumbnail_url: metadata?.thumbnail_url,
        duration: metadata?.duration || 0,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Start downloading a lecture with progress tracking
   */
  static async startDownload(
    lecture: UILecture,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<DownloadedLecture> {
    const lectureId = lecture.id;

    // Validate download can proceed
    const validation = await DownloadValidator.validateDownload(
      lectureId,
      this.activeDownloads
    );
    if (!validation.canProceed) {
      throw new Error(validation.reason);
    }

    // Ensure directory exists
    await FileSystemHelper.ensureDirectoryExists(this.DOWNLOAD_DIR);

    // Get streaming URL
    const streamingUrl = await StreamingService.getStreamingUrl(lecture);
    if (!streamingUrl) {
      throw new Error(DOWNLOAD_ERRORS.NO_STREAMING_URL);
    }

    const file = this.getLocalFile(lectureId);
    const abortController = new AbortController();
    this.activeDownloads.set(lectureId, abortController);

    try {
      // Use legacy API for progress tracking support
      const downloadResumable = LegacyFileSystem.createDownloadResumable(
        streamingUrl,
        file.uri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          onProgress?.({
            lectureId,
            totalBytes: downloadProgress.totalBytesExpectedToWrite,
            bytesWritten: downloadProgress.totalBytesWritten,
            progress: Math.round(progress * 100),
          });
        }
      );

      // Start download
      const result = await downloadResumable.downloadAsync();

      if (!result) {
        throw new Error("Download failed - no result");
      }

      // Save metadata
      await this.saveMetadata(lecture);

      this.activeDownloads.delete(lectureId);

      // Get file size from download result headers (Content-Length)
      const fileSize = result.headers?.["Content-Length"]
        ? parseInt(result.headers["Content-Length"], 10)
        : 0;

      return {
        lectureId,
        filePath: result.uri,
        downloadedAt: Date.now(),
        fileSize,
        title: lecture.title,
        speaker: lecture.speaker || lecture.author,
        thumbnail_url: lecture.thumbnail_url,
      };
    } catch (error) {
      this.activeDownloads.delete(lectureId);
      await FileSystemHelper.safeDelete(file);
      throw error;
    }
  }

  /**
   * Cancel an active download
   */
  static async cancelDownload(lectureId: string): Promise<void> {
    const abortController = this.activeDownloads.get(lectureId);
    if (!abortController) return;

    abortController.abort();
    this.activeDownloads.delete(lectureId);

    const file = this.getLocalFile(lectureId);
    await FileSystemHelper.safeDelete(file);
  }

  /**
   * Delete a downloaded lecture
   */
  static async deleteDownload(lectureId: string): Promise<void> {
    const file = this.getLocalFile(lectureId);
    const metadataFile = this.getMetadataFile(lectureId);
    await FileSystemHelper.safeDelete(file);
    await FileSystemHelper.safeDelete(metadataFile);
  }

  /**
   * Get all downloaded lectures
   */
  static async getAllDownloads(): Promise<DownloadedLecture[]> {
    try {
      await FileSystemHelper.ensureDirectoryExists(this.DOWNLOAD_DIR);

      // Get full file info objects instead of just filenames
      const allFiles = await this.DOWNLOAD_DIR.list();
      const mp3Files = allFiles.filter((file) =>
        file.uri.endsWith(DOWNLOAD_CONFIG.FILE_EXTENSION)
      );

      const downloads = await Promise.all(
        mp3Files.map(async (fileInfo) => {
          const fileName = fileInfo.uri.split("/").pop() || "";
          const lectureId = fileName.replace(
            DOWNLOAD_CONFIG.FILE_EXTENSION,
            ""
          );
          return this.getDownloadedLecture(lectureId, fileInfo);
        })
      );

      const validDownloads = downloads.filter(
        (d): d is DownloadedLecture => d !== null
      );
      return validDownloads;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get total storage used by downloads
   */
  static async getTotalStorageUsed(): Promise<number> {
    const downloads = await this.getAllDownloads();
    return downloads.reduce((total, download) => total + download.fileSize, 0);
  }

  /**
   * Format bytes to human readable format
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}
