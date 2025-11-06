# Backend Integration Guide

## Overview

Your Elmify frontend is now configured to work with your Railway backend in both development and production environments.

## Architecture

```
┌─────────────────────┐
│  Frontend (Mobile)  │
│   - React Native    │
│   - Expo            │
│   - Clerk Auth      │
└──────────┬──────────┘
           │
           │ HTTPS/HTTP
           │
┌──────────▼──────────┐
│  Backend (Railway)  │
│   - Spring Boot     │
│   - PostgreSQL      │
│   - Clerk JWT       │
└──────────┬──────────┘
           │
           │ S3 Protocol
           │
┌──────────▼──────────┐
│   Cloudflare R2     │
│  - Audio Files      │
│  - Images           │
└─────────────────────┘
```

## Configuration Files

### 1. `.env.local` (Development)
Used for local development with local backend and MinIO.

```env
# Network IP for iOS simulator access
EXPO_PUBLIC_API_BASE_URL=http://192.168.39.138:8081/api/v1
EXPO_PUBLIC_MINIO_BASE_URL=http://192.168.39.138:9000/elmify-audio
```

### 2. `.env.production` (Production)
Used for Cloudflare deployment pointing to Railway backend.

```env
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_API_BASE_URL=https://elmify-backend-production.up.railway.app
EXPO_PUBLIC_API_VERSION=/api/v1
```

### 3. `src/config/env.ts`
Centralized configuration with environment-aware defaults.

- ✅ Type-safe configuration
- ✅ Environment-specific defaults
- ✅ Validation helpers
- ✅ Feature flags

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk authentication key | `pk_test_...` |
| `EXPO_PUBLIC_API_BASE_URL` | Backend base URL | `https://...railway.app` |

### Optional (with defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `EXPO_PUBLIC_ENVIRONMENT` | `development` | Environment name |
| `EXPO_PUBLIC_API_VERSION` | `/api/v1` | API version path |
| `EXPO_PUBLIC_API_TIMEOUT` | `10000` (dev) / `8000` (prod) | Request timeout (ms) |
| `EXPO_PUBLIC_DEBUG_API` | `true` (dev) / `false` (prod) | Enable API logging |

## API Endpoints

All endpoints are prefixed with `/api/v1`:

```typescript
// Example API calls
apiClient.get('/speakers')           // GET  /api/v1/speakers
apiClient.get('/collections')        // GET  /api/v1/collections
apiClient.get('/lectures/123')       // GET  /api/v1/lectures/123
apiClient.post('/favorites', data)   // POST /api/v1/favorites
```

## Authentication Flow

1. User signs in with Clerk
2. Frontend receives JWT token from Clerk
3. `AuthManager` stores and manages token
4. `APIClient` automatically adds token to requests:
   ```
   Authorization: Bearer <clerk-jwt-token>
   ```
5. Backend validates JWT with Clerk

## Storage/Media Access

### Development (Local MinIO)
- **Images**: Direct access to `http://localhost:9000/elmify-audio`
- **Audio Streaming**: Through backend API endpoints

### Production (Cloudflare R2)
- **Images**: Proxied through Railway backend
- **Audio Streaming**: Through backend API endpoints
- Frontend never accesses R2 directly

## Testing the Integration

### Local Development

1. Start your local backend:
   ```bash
   cd elmify-backend
   ./mvnw spring-boot:run
   ```

2. Start MinIO (if using locally)

3. Start the frontend:
   ```bash
   cd elmify-frontend
   npm start
   ```

4. Check console for configuration:
   ```
   ✅ Configuration loaded:
   - environment: development
   - apiUrl: http://192.168.39.138:8081/api/v1
   - minioUrl: http://192.168.39.138:9000/elmify-audio
   ```

### Production Testing

1. Build for production:
   ```bash
   npm run build
   ```

2. Deploy to Cloudflare

3. Check logs for:
   ```
   ✅ Configuration loaded:
   - environment: production
   - apiUrl: https://elmify-backend-production.up.railway.app/api/v1
   ```

## Common Issues & Solutions

### Issue: "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"
**Solution**: Ensure `.env.local` or `.env.production` has the Clerk key set.

### Issue: iOS Simulator can't reach backend
**Solution**: Use network IP (192.168.x.x) instead of localhost in `.env.local`.

### Issue: 401 Unauthorized errors
**Solution**:
1. Check Clerk authentication is working
2. Verify backend Clerk configuration matches frontend
3. Check JWT token in request headers

### Issue: Images not loading
**Development**: Check MinIO is running and accessible
**Production**: Check backend R2 configuration on Railway

## Backend Requirements

Your Railway backend must:

1. ✅ Accept requests from Cloudflare domain (CORS)
2. ✅ Validate Clerk JWT tokens
3. ✅ Have R2 credentials configured
4. ✅ Expose API at `/api/v1/*`

### CORS Configuration (Spring Boot)

```java
@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "http://localhost:8085",
                        "https://your-cloudflare-domain.pages.dev"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                    .allowCredentials(true);
            }
        };
    }
}
```

## Next Steps

1. **Test locally**: Verify all API calls work with local backend
2. **Update Cloudflare**: Set environment variables in Cloudflare Pages
3. **Deploy**: Push to Cloudflare and test production
4. **Monitor**: Check Railway logs for backend errors
5. **CORS**: Add your Cloudflare domain to backend CORS config

## Support

- Backend logs: Railway dashboard
- Frontend logs: React Native Debugger or console
- Network requests: React Native Debugger Network tab
