package com.elmify.api.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.time.Duration;

/**
 * R2 Signing Service - Cloudflare R2 pre-signed URL generation
 *
 * This service handles generating pre-signed URLs for Cloudflare R2 audio files.
 * R2 is S3-compatible, so we use AWS SDK with custom endpoint.
 *
 * Configuration:
 * - Uses AWS SDK S3 client with custom R2 endpoint
 * - Credentials from environment/application.yml
 * - Thread-safe and reusable S3Presigner instance
 *
 * Performance:
 * - URL signing is CPU-bound, very fast (~1-5ms per URL)
 * - Can sign 100 URLs in ~100-500ms using parallel processing
 *
 * @author Elmify Backend Team
 * @version 1.0.0
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class R2SigningService {

    @Value("${cloudflare.r2.account-id}")
    private String accountId;

    @Value("${cloudflare.r2.access-key-id}")
    private String accessKeyId;

    @Value("${cloudflare.r2.secret-access-key}")
    private String secretAccessKey;

    @Value("${cloudflare.r2.bucket-name}")
    private String bucketName;

    private S3Presigner presigner;

    /**
     * Initialize S3 presigner with R2 configuration
     */
    @PostConstruct
    public void init() {
        log.info("🔧 Initializing R2 signing service for bucket: {}", bucketName);

        // R2 endpoint format: https://<account-id>.r2.cloudflarestorage.com
        String r2Endpoint = String.format("https://%s.r2.cloudflarestorage.com", accountId);

        // Create AWS credentials
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);

        // Create S3 presigner with custom R2 endpoint
        this.presigner = S3Presigner.builder()
            .region(Region.of("auto")) // R2 uses "auto" region
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .endpointOverride(java.net.URI.create(r2Endpoint))
            .build();

        log.info("✅ R2 signing service initialized successfully");
    }

    /**
     * Generate pre-signed URL for R2 object
     *
     * @param objectKey R2 object key (file path)
     * @param expiry URL expiration duration
     * @return Pre-signed URL valid for specified duration
     */
    public String generatePresignedUrl(String objectKey, Duration expiry) {
        try {
            // Create GetObject request
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();

            // Create presign request with expiry
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(expiry)
                .getObjectRequest(getObjectRequest)
                .build();

            // Generate presigned URL
            PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);

            String url = presignedRequest.url().toString();

            log.debug("🔐 Signed URL for {}: expires in {} hours", objectKey, expiry.toHours());

            return url;

        } catch (Exception e) {
            log.error("❌ Failed to generate pre-signed URL for {}: {}", objectKey, e.getMessage(), e);
            throw new RuntimeException("Failed to generate pre-signed URL", e);
        }
    }

    /**
     * Generate pre-signed URL with custom public domain
     *
     * Some deployments may use a custom domain for R2 (e.g., cdn.elmify.com)
     * This method replaces the R2 domain with a custom domain after signing.
     *
     * @param objectKey R2 object key
     * @param expiry URL expiration duration
     * @param customDomain Custom domain to use (e.g., "cdn.elmify.com")
     * @return Pre-signed URL with custom domain
     */
    public String generatePresignedUrlWithCustomDomain(String objectKey, Duration expiry, String customDomain) {
        String url = generatePresignedUrl(objectKey, expiry);

        // Replace R2 domain with custom domain
        String r2Domain = String.format("%s.r2.cloudflarestorage.com", accountId);
        url = url.replace(r2Domain, customDomain);

        log.debug("🔐 Signed URL with custom domain: {}", customDomain);

        return url;
    }

    /**
     * Clean up resources
     */
    @PreDestroy
    public void cleanup() {
        if (presigner != null) {
            presigner.close();
            log.info("✅ R2 signing service closed");
        }
    }
}
