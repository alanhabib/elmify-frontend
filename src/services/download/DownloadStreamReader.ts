/**
 * DownloadStreamReader - Handles reading download streams with progress tracking
 * Separated from DownloadService following SRP
 */

import { DownloadProgress } from '../DownloadService';

export type StreamReadResult = {
  data: ArrayBuffer;
  totalBytes: number;
};

export class DownloadStreamReader {
  /**
   * Read entire stream with progress tracking
   */
  static async readStream(
    response: Response,
    lectureId: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<StreamReadResult> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const totalBytes = parseInt(response.headers.get('content-length') || '0', 10);
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;
    let lastReportedProgress = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedBytes += value.length;

      // Report progress (throttled to avoid excessive updates)
      const currentProgress = totalBytes > 0 ? (receivedBytes / totalBytes) * 100 : 0;
      if (Math.abs(currentProgress - lastReportedProgress) >= 1) {
        lastReportedProgress = currentProgress;
        onProgress?.({
          lectureId,
          totalBytes,
          bytesWritten: receivedBytes,
          progress: Math.round(currentProgress),
        });
      }
    }

    // Combine all chunks
    const completeData = new Uint8Array(receivedBytes);
    let position = 0;
    for (const chunk of chunks) {
      completeData.set(chunk, position);
      position += chunk.length;
    }

    return {
      data: completeData.buffer,
      totalBytes: receivedBytes,
    };
  }
}
