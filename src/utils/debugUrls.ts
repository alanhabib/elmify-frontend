/**
 * Debug utility to test URL generation and accessibility
 */

export const debugImageUrl = async (url: string, description: string) => {
  try {
    // Test if the URL is accessible
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const debugAudioUrl = async (url: string, description: string) => {
  try {
    // Test if the URL is accessible
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const testCommonImagePaths = async (baseFilename: string) => {
  const baseUrl = "https://elmify.pages.dev";
  const testUrls = [
    // Root level
    `${baseUrl}/${baseFilename}`,

    // Common static asset paths for backend APIs
    `${baseUrl}/assets/${baseFilename}`,
    `${baseUrl}/images/${baseFilename}`,
    `${baseUrl}/static/${baseFilename}`,
    `${baseUrl}/public/${baseFilename}`,
    `${baseUrl}/uploads/${baseFilename}`,
    `${baseUrl}/media/${baseFilename}`,

    // Speaker-specific paths (likely structure for your backend)
    `${baseUrl}/assets/speakers/${baseFilename}`,
    `${baseUrl}/images/speakers/${baseFilename}`,
    `${baseUrl}/speakers/${baseFilename}`,
    `${baseUrl}/media/speakers/${baseFilename}`,
    `${baseUrl}/uploads/speakers/${baseFilename}`,

    // Common Cloudflare Workers/Pages backend patterns
    `${baseUrl}/files/${baseFilename}`,
    `${baseUrl}/storage/${baseFilename}`,
  ];

  for (const url of testUrls) {
    await debugImageUrl(url, `Path: ${url.replace(baseUrl, "")}`);
  }
};

export const testCommonAudioPaths = async (lectureId: string | number) => {
  const baseUrl = "https://elmify.pages.dev";
  const testUrls = [
    `${baseUrl}/api/streaming/${lectureId}`,
    `${baseUrl}/streaming/${lectureId}`,
    `${baseUrl}/audio/${lectureId}`,
    `${baseUrl}/api/audio/${lectureId}`,
    `${baseUrl}/stream/${lectureId}`,
  ];

  for (const url of testUrls) {
    await debugAudioUrl(url, `Path: ${url.replace(baseUrl, "")}`);
  }
};
