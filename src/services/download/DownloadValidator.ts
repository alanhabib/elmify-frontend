/**
 * DownloadValidator - Validates download preconditions
 * Separated from DownloadService following SRP
 */

import { DownloadService } from '../DownloadService';
import { DOWNLOAD_ERRORS } from '../DownloadService.constants';

export class DownloadValidator {
  /**
   * Validate if download can proceed
   */
  static async validateDownload(
    lectureId: string,
    activeDownloads: Map<string, AbortController>
  ): Promise<{ canProceed: true } | { canProceed: false; reason: string }> {
    // Check if already downloaded
    const existing = await DownloadService.getDownloadedLecture(lectureId);
    if (existing) {
      return { canProceed: false, reason: DOWNLOAD_ERRORS.ALREADY_DOWNLOADED };
    }

    // Check if already downloading
    if (activeDownloads.has(lectureId)) {
      return { canProceed: false, reason: DOWNLOAD_ERRORS.ALREADY_DOWNLOADING };
    }

    return { canProceed: true };
  }
}
