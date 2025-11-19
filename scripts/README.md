# Elmify Batch Upload Scripts

Bash scripts for uploading speaker/lecture content to Cloudflare R2 storage and syncing with PostgreSQL.

## 📁 Scripts

| Script                          | Purpose                                | Usage                                                 |
| ------------------------------- | -------------------------------------- | ----------------------------------------------------- |
| `sync_metadata.sh`              | **🆕 Unified sync workflow**           | `./sync_metadata.sh [push\|pull\|scan\|status\|diff]` |
| `scan_legacy_r2_structure.js`   | **🆕 Scan LEGACY R2 → sync to DB**     | `node scan_legacy_r2_structure.js`                    |
| `scan_r2_and_sync.js`           | **🆕 Scan NEW R2 → generate metadata** | `node scan_r2_and_sync.js`                            |
| `export_from_db.js`             | **🆕 Export PostgreSQL → manifest**    | `DATABASE_URL="..." node export_from_db.js`           |
| `create_speaker.sh`             | Create new speaker template            | `./create_speaker.sh "Speaker" "Collection" [dir]`    |
| `validate_content.sh`           | Validate directory structure           | `./validate_content.sh /path/to/content`              |
| `fix_content.sh`                | Auto-fix common issues                 | `./fix_content.sh /path/to/content`                   |
| `clear_r2_storage.sh`           | Clear R2 bucket                        | `./clear_r2_storage.sh`                               |
| `upload_to_r2.sh`               | Upload to R2 + generate manifest       | `./upload_to_r2.sh /path/to/content`                  |
| `import_manifest.js`            | Import manifest → PostgreSQL           | `DATABASE_URL="..." node import_manifest.js`          |
| `generate_manifest.js`          | Generate manifest from local           | `node generate_manifest.js /path/to/content`          |
| `convert_existing_structure.sh` | Convert old structure to new           | `./convert_existing_structure.sh /old /new`           |

## 🚀 Quick Start

### Best Practice Workflows

#### 📤 **PUSH: Add New Speakers to Production**

```bash
# 1. Create speaker template locally
./create_speaker.sh "New Speaker" "Collection Name" ~/Desktop/content

# 2. Add audio files and metadata, then validate
./validate_content.sh ~/Desktop/content

# 3. Push everything to R2 + Railway database
DATABASE_URL="postgresql://user:pass@host:port/db" \
  ./sync_metadata.sh push --dir ~/Desktop/content
```

#### 📥 **PULL: Download Current Database State**

```bash
# Export what's currently in Railway database
DATABASE_URL="postgresql://user:pass@host:port/db" \
  ./sync_metadata.sh pull

# Creates: exported_manifest.json
```

#### 🔍 **STATUS: Check Current State**

```bash
./sync_metadata.sh status
```

#### 📊 **DIFF: Compare Local vs Database**

```bash
./sync_metadata.sh diff --dir ~/Desktop/content
```

#### 🔍 **SCAN: Recover Metadata from R2**

If files are in R2 but metadata is missing from database:

```bash
# Scan R2 bucket and generate metadata from file structure
./sync_metadata.sh scan

# Review the generated file
cat r2_scanned_manifest.json

# Edit to add bios, descriptions, etc.
nano r2_scanned_manifest.json

# Import to database
DATABASE_URL="postgresql://..." node import_manifest.js r2_scanned_manifest.json
```

#### 🔧 **LEGACY: Import Existing R2 Files (Flat Structure)**

**If your R2 bucket has the OLD structure:**

```
Abdul Rashid Sufi/
  Quran Hafs/
    01 - Al-Fatiha.mp3
    collection.jpg
  speaker.jpg
```

**Run this:**

```bash
cd scripts/

# Scan your legacy R2 structure
node scan_legacy_r2_structure.js

# This creates: r2_legacy_manifest.json

# Review it
cat r2_legacy_manifest.json

# Import to PostgreSQL
DATABASE_URL="postgresql://postgres:xxx@host:5432/railway" \
  node import_manifest.js r2_legacy_manifest.json
```

**What it does:**

- ✅ Scans your current R2 bucket structure
- ✅ Extracts speaker names, collection names, lecture titles
- ✅ Parses lecture numbers from filenames (e.g., "01 - Title")
- ✅ Generates manifest ready for database import
- ✅ **Your app will immediately see all speakers!**

### Legacy Manual Workflow

If you prefer step-by-step control:

### Legacy Manual Workflow

If you prefer step-by-step control:

```bash
# Create speaker template
./create_speaker.sh "Speaker Name" "Collection Name" ~/Desktop/content

# Add lectures and validate
./validate_content.sh ~/Desktop/content
```

### Manual Upload (Legacy)

### Manual Upload (Legacy)

```bash
# 1. Validate content
./validate_content.sh ~/Desktop/content

# 2. Fix issues (if any)
./fix_content.sh ~/Desktop/content

# 3. Upload to R2
./upload_to_r2.sh ~/Desktop/content

# 4. Import to Railway database
DATABASE_URL="postgresql://..." node import_manifest.js manifest.json
```

## 🔄 Data Flow

```
┌─────────────────┐
│ Local Content   │
│   Directory     │
└────────┬────────┘
         │
         │ sync_metadata.sh push
         ├─────────────────────────────┐
         │                             │
         ▼                             ▼
┌─────────────────┐           ┌─────────────────┐
│ Cloudflare R2   │           │   PostgreSQL    │
│ (Audio/Images)  │           │   (Metadata)    │
└─────────────────┘           └────────┬────────┘
                                       │
                              sync_metadata.sh pull
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ exported_       │
                              │ manifest.json   │
                              └─────────────────┘
```

## 📖 Full Documentation

See [`BATCH_UPLOAD.md`](../BATCH_UPLOAD.md) for complete documentation.

## 🔧 Dependencies

```bash
npm install -g wrangler
brew install ffmpeg imagemagick jq
```

## 💡 Help

Each script has a `--help` flag:

```bash
./validate_content.sh --help
./fix_content.sh --help
./clear_r2_storage.sh --help
./upload_to_r2.sh --help
```
