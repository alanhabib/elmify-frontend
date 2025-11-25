# Elmify Playlist Manifest API - Backend Implementation

This directory contains the production-grade backend implementation for the Playlist Manifest API, designed to replace client-side URL batching with server-side bulk URL signing.

## Overview

The Playlist Manifest API follows the Apple Podcasts/Spotify architecture pattern where clients request complete playlist manifests with pre-signed URLs in a single API call, eliminating the need for multiple sequential requests.

## Architecture

```
┌─────────────┐
│   Client    │
│  (Mobile)   │
└──────┬──────┘
       │
       │ POST /playlists/manifest
       │ { collectionId: "123", lectureIds: [...] }
       │
       ▼
┌─────────────────────────────────────────┐
│  PlaylistManifestController             │
│  - Rate limiting (30 req/min)           │
│  - Request validation                    │
│  - Authentication check                  │
└──────┬────────────────────┬─────────────┘
       │                    │
       │                    │ Check cache
       │                    ▼
       │            ┌───────────────┐
       │            │  Redis Cache  │
       │            │  TTL: 3.5hrs  │
       │            └───────────────┘
       │                    │
       │ Cache MISS         │ Cache HIT
       │                    │
       ▼                    ▼
┌──────────────────┐   ┌──────────────┐
│ LectureService   │   │   Return     │
│ - Fetch lectures │   │   cached     │
│ - Validate access│   │   manifest   │
└────────┬─────────┘   └──────────────┘
         │
         │ Parallel processing
         ▼
┌────────────────────────────────────────┐
│  R2SigningService                      │
│  - Bulk sign URLs (4hr expiry)         │
│  - Uses virtual threads (Java 21)      │
│  - ~100 URLs in 100-500ms              │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Cloudflare R2                         │
│  - Audio storage                       │
│  - S3-compatible API                   │
└────────────────────────────────────────┘
```

## Files

### 1. `playlist-manifest-spec.yaml`
Complete OpenAPI 3.0 specification for the Playlist Manifest API.

**Key Features:**
- Request/response schemas
- Error handling specifications
- Authentication requirements
- Rate limiting documentation
- Example requests and responses

### 2. `PlaylistManifestController.java`
Spring Boot REST controller implementing the manifest endpoint.

**Key Features:**
- Redis caching with 3.5-hour TTL
- Parallel URL signing using virtual threads (Java 21)
- Request validation and error handling
- Premium access control
- Comprehensive logging

**Performance:**
- Cached response: < 50ms
- 25 tracks (uncached): ~500ms
- 100 tracks (uncached): ~2s

### 3. `R2SigningService.java`
Service for generating Cloudflare R2 pre-signed URLs.

**Key Features:**
- Thread-safe S3Presigner instance
- Custom endpoint configuration for R2
- 4-hour URL expiry (industry standard)
- Optional custom domain support
- Efficient URL signing (~1-5ms per URL)

### 4. `application.yml`
Spring Boot configuration for Redis and R2.

**Includes:**
- Redis connection settings
- R2 credentials configuration
- Rate limiting configuration (30 req/min)
- Logging configuration
- Server settings

## Setup Instructions

### 1. Dependencies

Add to `pom.xml`:

```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Spring Boot Starter Data Redis -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>

    <!-- AWS SDK S3 (for R2 compatibility) -->
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>s3</artifactId>
        <version>2.20.0</version>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- SpringDoc OpenAPI (for API documentation) -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.2.0</version>
    </dependency>

    <!-- Bucket4j (Rate Limiting) -->
    <dependency>
        <groupId>com.giffing.bucket4j.spring.boot.starter</groupId>
        <artifactId>bucket4j-spring-boot-starter</artifactId>
        <version>0.10.1</version>
    </dependency>
</dependencies>
```

### 2. Environment Variables

Create `.env` file or configure in your deployment:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=elmify-audio
R2_CUSTOM_DOMAIN=cdn.elmify.com  # Optional

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_SSL=false  # true for production
```

### 3. Redis Setup

**Local Development (Docker):**
```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

**Production:**
- Use managed Redis (AWS ElastiCache, Redis Cloud, etc.)
- Enable SSL/TLS
- Configure persistence and backups

### 4. DTOs (Data Transfer Objects)

Create the following DTOs:

```java
// PlaylistManifestRequest.java
@Data
@Builder
public class PlaylistManifestRequest {
    private String collectionId;
    private String playlistType;
    @NotNull @NotEmpty
    private List<String> lectureIds;
}

// PlaylistManifestResponse.java
@Data
@Builder
public class PlaylistManifestResponse implements Serializable {
    private String collectionId;
    private List<TrackManifest> tracks;
    private PlaylistMetadata metadata;
}

// TrackManifest.java
@Data
@Builder
public class TrackManifest implements Serializable {
    private String lectureId;
    private String audioUrl;
    private Instant expiresAt;
    private Long duration;
}

// PlaylistMetadata.java
@Data
@Builder
public class PlaylistMetadata implements Serializable {
    private Integer totalTracks;
    private Long totalDuration;
    private Instant generatedAt;
    private Instant expiresAt;
    private Boolean cached;
}
```

## Usage Example

### Client Request

```bash
curl -X POST https://api.elmify.com/v1/playlists/manifest \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collectionId": "123",
    "lectureIds": ["456", "457", "458"]
  }'
```

### Response

```json
{
  "collectionId": "123",
  "tracks": [
    {
      "lectureId": "456",
      "audioUrl": "https://r2.elmify.com/audio/lecture-456.m4a?X-Amz-Algorithm=...",
      "expiresAt": "2025-11-24T16:00:00Z",
      "duration": 3600
    },
    {
      "lectureId": "457",
      "audioUrl": "https://r2.elmify.com/audio/lecture-457.m4a?X-Amz-Algorithm=...",
      "expiresAt": "2025-11-24T16:00:00Z",
      "duration": 2400
    }
  ],
  "metadata": {
    "totalTracks": 2,
    "totalDuration": 6000,
    "generatedAt": "2025-11-24T12:00:00Z",
    "expiresAt": "2025-11-24T16:00:00Z",
    "cached": false
  }
}
```

## Performance Tuning

### 1. Redis Configuration

**Connection Pooling:**
```yaml
spring:
  data:
    redis:
      lettuce:
        pool:
          max-active: 16    # Increase for high traffic
          max-idle: 8
          min-idle: 4
          max-wait: 2000ms
```

**Serialization:**
Use fast serialization (Jackson binary or Protobuf):
```java
@Bean
public RedisTemplate<String, PlaylistManifestResponse> redisTemplate(
    RedisConnectionFactory connectionFactory) {
    RedisTemplate<String, PlaylistManifestResponse> template = new RedisTemplate<>();
    template.setConnectionFactory(connectionFactory);
    template.setKeySerializer(new StringRedisSerializer());
    template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
    return template;
}
```

### 2. Virtual Threads (Java 21+)

The controller uses virtual threads for parallel URL signing:
```java
private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
```

**For Java 17:**
```java
private final ExecutorService executor =
    Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());
```

### 3. Monitoring

Add metrics:
```java
@Timed(value = "playlist.manifest.generation", description = "Time to generate manifest")
public PlaylistManifestResponse generateManifest(...) {
    // ...
}
```

## Migration Strategy

### Phase 1: Parallel Operation
- Deploy backend with manifest endpoint
- Keep client-side PlaylistService as fallback
- Add feature flag to switch between implementations

### Phase 2: Gradual Rollout
- Enable manifest endpoint for 10% of users
- Monitor performance and errors
- Gradually increase to 100%

### Phase 3: Cleanup
- Remove client-side PlaylistService
- Remove old sequential URL fetching code

### Client-Side Integration

Update `PlaylistService.ts`:
```typescript
async getPlaylistUrls(
  collectionId: string,
  lectures: UILecture[],
  onProgress?: ProgressCallback
): Promise<Map<string, string>> {
  // Try backend manifest endpoint first
  try {
    const response = await fetch(`${API_URL}/playlists/manifest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        collectionId,
        lectureIds: lectures.map(l => l.id),
      }),
    });

    const manifest = await response.json();

    // Convert to Map
    return new Map(
      manifest.tracks.map(t => [t.lectureId, t.audioUrl])
    );
  } catch (error) {
    // Fallback to client-side batching
    console.warn('Manifest endpoint failed, falling back to client-side:', error);
    return this.fetchAndCache(collectionId, lectures, onProgress);
  }
}
```

## Security Considerations

1. **Authentication**: Always validate JWT tokens
2. **Rate Limiting**: 30 requests/minute per IP (adjust as needed)
3. **Premium Content**: Check user subscription before signing URLs
4. **URL Expiry**: 4-hour expiry prevents indefinite access
5. **Cache Keys**: Include userId for user-specific playlists

## Troubleshooting

### URLs Expire Too Quickly
- Increase `URL_EXPIRY` duration
- Adjust `CACHE_TTL` to be shorter than `URL_EXPIRY`

### Slow Manifest Generation
- Check R2 API response times
- Increase virtual thread pool size
- Enable Redis clustering for high traffic

### Cache Not Working
- Verify Redis connection
- Check serialization configuration
- Monitor cache hit rate with Redis MONITOR

## License

Proprietary - Elmify Backend Team
