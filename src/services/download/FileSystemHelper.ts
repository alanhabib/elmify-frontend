/**
 * FileSystemHelper - Handles file system operations
 * Separated from DownloadService following SRP
 */

import { File, Directory } from 'expo-file-system';

export class FileSystemHelper {
  /**
   * Ensure directory exists, create if it doesn't
   */
  static async ensureDirectoryExists(directory: Directory): Promise<void> {
    try {
      // Try to create - if it exists, this will do nothing
      await directory.create();
    } catch (error) {
      // Directory might already exist, ignore error
    }
  }

  /**
   * Safely delete file if it exists
   */
  static async safeDelete(file: File): Promise<void> {
    try {
      // Just try to delete - if file doesn't exist, it will throw and we catch it
      await file.delete();
    } catch (error) {
      // Log but don't throw - cleanup is best effort (file might not exist)
      console.warn('Failed to delete file:', file.uri, error);
    }
  }

  /**
   * Write data to file
   */
  static async writeFile(file: File, data: ArrayBuffer): Promise<void> {
    await file.write(data);
  }

  /**
   * Get all files with specific extension in directory
   */
  static async getFilesByExtension(
    directory: Directory,
    extension: string
  ): Promise<string[]> {
    try {
      console.log('[FileSystemHelper] Listing files in:', directory.uri);
      const files = await directory.list();
      console.log('[FileSystemHelper] All files:', files);

      // directory.list() returns File objects, not strings
      // Extract just the filename from the URI
      const filtered = files
        .filter(file => file.uri.endsWith(extension))
        .map(file => {
          const parts = file.uri.split('/');
          return parts[parts.length - 1]; // Get just the filename
        });

      console.log('[FileSystemHelper] Filtered files with extension', extension, ':', filtered);
      return filtered;
    } catch (error) {
      // Directory doesn't exist or can't be read
      console.log('[FileSystemHelper] Error listing files:', error);
      return [];
    }
  }
}
