# Metadata Sync Guide

## Overview

This guide explains how to synchronize speaker, collection, and lecture metadata between:

- **Local content directory** (your working files)
- **Cloudflare R2** (audio files and images)
- **PostgreSQL on Railway** (metadata for the app)

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    ELMIFY DATA FLOW                          │
└──────────────────────────────────────────────────────────────┘

  LOCAL DIRECTORY          R2 STORAGE          POSTGRESQL
  ───────────────          ──────────          ──────────

  content/
  ├── Speaker/            speakers/{slug}/     speakers
  │   ├── speaker.json    ├── images/          ├── id
  │   ├── speaker.jpg     │   ├── *.jpg        ├── name
  │   └── Collection/     │   └── *_small.jpg  ├── bio
  │       ├── info.json   └── collections/     └── image_url
  │       ├── cover.jpg       └── {slug}/
  │       └── *.mp3           ├── images/      collections
  │                           └── lectures/    ├── id
  │                                            ├── speaker_id
          ▲                                    └── title
          │
          │                                    lectures
          └── manifest.json ──────────────────►├── id
              (intermediate)                   ├── collection_id
                                              ├── title
                                              └── file_path
```

## Best Practice Workflows

### 1. 📤 PUSH: Add New Content to Production

**Use this when:** You have new speakers/collections locally and want to deploy them.

```bash
# Step 1: Prepare your content
cd ~/Desktop/my_content
./create_speaker.sh "Nouman Ali Khan" "Ramadan Series 2025"

# Add audio files to the collection folder
# Add speaker.jpg, cover.jpg, etc.

# Step 2: Validate structure
cd /path/to/elmify-frontend/scripts
./validate_content.sh ~/Desktop/my_content

# Step 3: Push everything to production
DATABASE_URL="postgresql://postgres:xxx@switchback.proxy.rlwy.net:56230/railway" \
  ./sync_metadata.sh push --dir ~/Desktop/my_content
```

**What happens:**

1. ✅ Validates content structure
2. ✅ Uploads audio/images to R2
3. ✅ Generates manifest.json
4. ✅ Imports metadata to PostgreSQL
5. ✅ Content is immediately available in your app!

---

### 2. 📥 PULL: Download Current Production State

**Use this when:** You want to see what's currently in the database or backup metadata.

```bash
# Pull from Railway production
DATABASE_URL="postgresql://postgres:xxx@switchback.proxy.rlwy.net:56230/railway" \
  ./sync_metadata.sh pull

# Output: exported_manifest.json
```

**Use cases:**

- 📋 Backup current database state
- 🔍 Audit what's in production
- 📊 Compare local vs production
- 🛠️ Debugging missing content

---

### 3. 🔍 STATUS: Check Current State

```bash
./sync_metadata.sh status
```

Shows:

- R2 bucket file count
- Database connection status
- Local manifest info

---

### 4. 📊 DIFF: Compare Local vs Database

**Use this when:** You want to see differences before pushing.

```bash
./sync_metadata.sh diff --dir ~/Desktop/my_content
```

**Output:**

- `local_manifest.json` - What you have locally
- `db_manifest.json` - What's in the database
- Comparison summary

---

## Environment Setup

### Production (Railway)

Get your DATABASE_URL from Railway:

1. Go to Railway dashboard
2. Select your PostgreSQL service
3. Go to "Variables" tab
4. Copy `DATABASE_URL`

```bash
# Example
export DATABASE_URL="postgresql://postgres:password@host.railway.app:5432/railway"
```

### Local Development

If testing locally, update `export_from_db.js` and `import_manifest.js` with your local DB config:

```javascript
{
  host: 'localhost',
  port: 5432,
  database: 'elmify_db',
  user: 'your_user',
  password: 'your_password'
}
```

---

## Common Scenarios

### Scenario 1: New Speaker Added Locally

```bash
# 1. Create speaker
./create_speaker.sh "Speaker Name" "First Collection"

# 2. Add content (audio, images, metadata)

# 3. Push to production
DATABASE_URL="..." ./sync_metadata.sh push --dir ~/Desktop/content
```

---

### Scenario 2: Verify Production Database

```bash
# Export and inspect
DATABASE_URL="..." ./sync_metadata.sh pull

# Review exported_manifest.json
cat exported_manifest.json | jq '.speakers[].name'
```

---

### Scenario 3: Someone Modified Database Directly

If content was added via API or direct SQL:

```bash
# Pull latest from database
DATABASE_URL="..." ./sync_metadata.sh pull -o latest_db.json

# Use this as reference for local updates
```

---

### Scenario 4: Lost Local Files but Have Database

```bash
# 1. Export from database
DATABASE_URL="..." node export_from_db.js

# 2. Review exported_manifest.json
# 3. Reconstruct local directory structure
# 4. Re-download audio from R2 if needed (manual or create script)
```

---

## File Reference

### Scripts Created

| Script                 | Purpose                             |
| ---------------------- | ----------------------------------- |
| `sync_metadata.sh`     | Unified workflow manager            |
| `export_from_db.js`    | PostgreSQL → JSON export            |
| `import_manifest.js`   | JSON → PostgreSQL import (existing) |
| `generate_manifest.js` | Local files → JSON (existing)       |
| `upload_to_r2.sh`      | Local files → R2 (existing)         |

### Data Flow Commands

```bash
# Local → R2 + Database
./sync_metadata.sh push --dir <content>

# Database → Local JSON
./sync_metadata.sh pull

# Compare
./sync_metadata.sh diff --dir <content>
```

---

## Troubleshooting

### "DATABASE_URL not set"

```bash
export DATABASE_URL="postgresql://..."
# OR
DATABASE_URL="postgresql://..." ./sync_metadata.sh pull
```

### "Content validation failed"

```bash
./validate_content.sh ~/Desktop/content
# Fix reported issues
./fix_content.sh ~/Desktop/content
```

### "Speaker already exists"

The import script uses `ON CONFLICT` - it will UPDATE existing records instead of failing.

### "Files in R2 but not in database"

This means you uploaded to R2 but didn't import to database:

```bash
# Generate manifest from what's in R2 (if you have local copy)
node generate_manifest.js ~/Desktop/content

# Import to database
DATABASE_URL="..." node import_manifest.js manifest.json
```

---

## Migration from Old Workflow

**Before (Manual):**

```bash
./upload_to_r2.sh ~/content
node generate_manifest.js ~/content
node import_manifest.js manifest.json
```

**After (Automated):**

```bash
DATABASE_URL="..." ./sync_metadata.sh push --dir ~/content
```

Both workflows still work! Use whichever you prefer.

---

## Best Practices

### ✅ DO

- Always validate before pushing: `./validate_content.sh`
- Use `sync_metadata.sh` for common workflows
- Set `DATABASE_URL` as environment variable for security
- Pull database backups regularly
- Use `diff` to verify before pushing

### ❌ DON'T

- Don't push without validating
- Don't commit `DATABASE_URL` to git
- Don't modify R2 and database separately (use scripts)
- Don't delete from R2 without updating database

---

## Security Notes

### Never Commit:

- `DATABASE_URL`
- `manifest.json` (contains file paths)
- `exported_manifest.json`

### .gitignore Already Includes:

```
.env
.env.local
*.generated.*
manifest.json
exported_manifest.json
local_manifest.json
db_manifest.json
```

---

## Next Steps

1. **Test the export:**

   ```bash
   DATABASE_URL="..." node scripts/export_from_db.js
   ```

2. **Verify it works:**

   ```bash
   cat exported_manifest.json | jq '.speakers | length'
   ```

3. **Try the unified workflow:**

   ```bash
   ./scripts/sync_metadata.sh status
   ```

4. **Push new content when ready:**
   ```bash
   DATABASE_URL="..." ./scripts/sync_metadata.sh push --dir ~/content
   ```

---

## Questions?

- Check `scripts/README.md` for quick reference
- Run `./sync_metadata.sh --help` for command help
- Each script has `--help` flag for details
