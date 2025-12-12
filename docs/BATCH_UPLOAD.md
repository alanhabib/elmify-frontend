# Elmify Batch Content Upload Guide

Complete guide for uploading speaker lectures and content to Cloudflare R2 storage.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Directory Structure](#directory-structure)
4. [R2 Path Structure](#r2-path-structure)
5. [Scripts Overview](#scripts-overview)
6. [Step-by-Step Process](#step-by-step-process)
7. [JSON Manifest Format](#json-manifest-format)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## 📖 Overview

The batch upload system consists of 4 bash scripts that work together to:

1. **Validate** content structure and files
2. **Fix** common issues automatically
3. **Clear** existing R2 storage (optional)
4. **Upload** content to R2 and generate database manifest

All scripts are designed to align with the `elmify-backend` entity structure and use Wrangler CLI for R2 operations.

---

## 🔧 Prerequisites

### Required Software

Install the following tools on macOS:

```bash
# Install Wrangler CLI (Cloudflare Workers)
npm install -g wrangler

# Install ffmpeg (for audio metadata extraction)
brew install ffmpeg

# Install ImageMagick (for generating placeholder images)
brew install imagemagick

# Install jq (JSON processor)
brew install jq
```

### Verify Installation

```bash
wrangler --version
ffmpeg -version
convert --version
jq --version
```

### Environment Variables

Set up your R2 credentials:

```bash
# Add to ~/.bashrc or ~/.zshrc
export R2_BUCKET_NAME="elmify-audio"
```

**Note:** Wrangler CLI will use your Cloudflare authentication. Login if needed:

```bash
wrangler login
```

---

## 📁 Directory Structure

Your content directory should follow this structure:

```
content/
├── Speaker Name/
│   ├── speaker.jpg (or .png)           # Required: 600x600 main image
│   ├── speaker_small.jpg (or .png)     # Required: 300x300 thumbnail
│   └── Collection Name/
│       ├── collection.jpg (or .png)     # Required: 600x600 cover
│       ├── collection_small.jpg (or .png) # Required: 300x300 thumbnail
│       ├── 01 - Lecture Title.mp3      # Required: NN - Title format
│       ├── 02 - Another Lecture.mp3
│       └── ...
```

### Naming Requirements

**Speaker/Collection Names:**
- Any valid directory name
- Will be slugified for R2 paths (e.g., "Jordan Peterson" → "jordan-peterson")

**Lecture Files:**
- Format: `NN - Title.ext` (e.g., `01 - Introduction.mp3`)
- Number: 01-99 (two digits, zero-padded)
- Separator: ` - ` (space, hyphen, space)
- Extension: mp3, m4a, wav, flac, aac, or ogg

**Image Files:**
- Main images: `speaker.jpg` or `collection.jpg`
- Thumbnails: `speaker_small.jpg` or `collection_small.jpg`
- Formats: jpg, jpeg, or png

---

## 🗂️ R2 Path Structure

Content is uploaded to R2 with the following path structure:

```
elmify-audio/
└── speakers/
    └── {speaker-slug}/
        ├── images/
        │   ├── speaker.jpg
        │   └── speaker_small.jpg
        └── collections/
            └── {collection-slug}/
                ├── images/
                │   ├── cover.jpg
                │   └── cover_small.jpg
                └── lectures/
                    ├── 01-{lecture-slug}.mp3
                    └── 02-{lecture-slug}.mp3
```

**Example:**

```
speakers/jordan-peterson/images/speaker.jpg
speakers/jordan-peterson/images/speaker_small.jpg
speakers/jordan-peterson/collections/maps-of-meaning/images/cover.jpg
speakers/jordan-peterson/collections/maps-of-meaning/images/cover_small.jpg
speakers/jordan-peterson/collections/maps-of-meaning/lectures/01-introduction.mp3
speakers/jordan-peterson/collections/maps-of-meaning/lectures/02-the-problem-of-evil.mp3
```

**These paths directly map to the backend entity fields:**
- `Speaker.imageUrl` → `speakers/{slug}/images/speaker.jpg`
- `Speaker.imageSmallUrl` → `speakers/{slug}/images/speaker_small.jpg`
- `Collection.coverImageUrl` → `speakers/{slug}/collections/{slug}/images/cover.jpg`
- `Collection.coverImageSmallUrl` → `speakers/{slug}/collections/{slug}/images/cover_small.jpg`
- `Lecture.filePath` → `speakers/{slug}/collections/{slug}/lectures/{file}.mp3`

---

## 🛠️ Scripts Overview

All scripts are located in: `scripts/`

### 1. `validate_content.sh`

**Purpose:** Validate directory structure and files before upload.

**Usage:**
```bash
./scripts/validate_content.sh [OPTIONS] <content_directory>
```

**Options:**
- `-v, --verbose` - Show detailed validation output
- `-f, --fix-suggestions` - Show suggestions for fixing issues
- `-s, --strict` - Treat warnings as errors
- `-h, --help` - Show help message

**What it checks:**
- Directory structure follows convention
- Required images exist (speaker.jpg, speaker_small.jpg, collection.jpg, collection_small.jpg)
- Lecture files match naming convention (NN - Title.ext)
- Audio files are valid and not corrupted
- Image files are valid

**Exit codes:**
- `0` - All validations passed
- `1` - Critical errors found
- `2` - Warnings found (only if --strict mode)

**Examples:**
```bash
# Basic validation
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch

# Verbose with fix suggestions
./scripts/validate_content.sh -v -f ~/Desktop/hobby_projects/batch

# Strict mode (warnings = errors)
./scripts/validate_content.sh --strict ~/Desktop/hobby_projects/batch
```

---

### 2. `fix_content.sh`

**Purpose:** Automatically fix common issues found during validation.

**Usage:**
```bash
./scripts/fix_content.sh [OPTIONS] <content_directory>
```

**Options:**
- `-d, --dry-run` - Preview changes without applying them
- `-b, --backup DIR` - Custom backup directory (default: ./backup_TIMESTAMP)
- `-s, --skip-backup` - Skip creating backup (dangerous!)
- `-i, --skip-images` - Skip generating missing images
- `-r, --skip-rename` - Skip renaming files
- `-v, --verbose` - Show detailed output
- `-h, --help` - Show help message

**What it fixes:**
- Generates missing placeholder images (speaker, collection covers)
- Generates thumbnails from main images
- Renames lecture files to match convention
- Removes special characters from filenames
- Normalizes spacing in filenames

**Examples:**
```bash
# Preview changes first (RECOMMENDED)
./scripts/fix_content.sh --dry-run ~/Desktop/hobby_projects/batch

# Apply fixes with backup
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch

# Only rename files, skip image generation
./scripts/fix_content.sh --skip-images ~/Desktop/hobby_projects/batch

# Custom backup location
./scripts/fix_content.sh --backup /path/to/backup ~/Desktop/hobby_projects/batch
```

---

### 3. `clear_r2_storage.sh`

**Purpose:** Clear all objects from R2 bucket before uploading new content.

**Usage:**
```bash
./scripts/clear_r2_storage.sh [OPTIONS]
```

**Options:**
- `-b, --bucket BUCKET` - R2 bucket name (default: from env or 'elmify-audio')
- `-y, --yes` - Skip confirmation prompt (dangerous!)
- `-v, --verbose` - Show detailed output
- `-h, --help` - Show help message

**⚠️ WARNING:** This permanently deletes ALL objects in the bucket!

**Examples:**
```bash
# Interactive mode (recommended - asks for confirmation)
./scripts/clear_r2_storage.sh

# Auto-confirm deletion (use with caution!)
./scripts/clear_r2_storage.sh --yes

# Specify different bucket
./scripts/clear_r2_storage.sh --bucket my-other-bucket
```

---

### 4. `upload_to_r2.sh`

**Purpose:** Upload validated content to R2 and generate JSON manifest for database import.

**Usage:**
```bash
./scripts/upload_to_r2.sh [OPTIONS] <content_directory>
```

**Options:**
- `-b, --bucket BUCKET` - R2 bucket name (default: elmify-audio)
- `-o, --output FILE` - Output manifest file (default: manifest.json)
- `-r, --resume` - Resume upload (skip existing files)
- `-f, --force` - Force re-upload all files
- `-v, --verbose` - Show detailed output
- `-h, --help` - Show help message

**What it does:**
- Uploads all images to R2
- Uploads all audio files to R2
- Extracts audio metadata (duration, bitrate, sample rate)
- Calculates file hashes (SHA-256)
- Generates JSON manifest for database import
- Supports resumable uploads (skip already uploaded files)

**Examples:**
```bash
# Upload content
./scripts/upload_to_r2.sh ~/Desktop/hobby_projects/batch

# Resume interrupted upload
./scripts/upload_to_r2.sh --resume ~/Desktop/hobby_projects/batch

# Custom bucket and output
./scripts/upload_to_r2.sh --bucket my-bucket --output data.json ~/Desktop/hobby_projects/batch

# Verbose mode
./scripts/upload_to_r2.sh -v ~/Desktop/hobby_projects/batch
```

---

## 🚀 Step-by-Step Process

### Complete Workflow

Follow these steps in order:

#### **Step 1: Prepare Content Directory**

```bash
# Set your content directory
CONTENT_DIR=~/Desktop/hobby_projects/batch

# Check structure
ls -la "$CONTENT_DIR"
```

#### **Step 2: Validate Content**

```bash
# Run validation with fix suggestions
./scripts/validate_content.sh -v -f "$CONTENT_DIR"
```

**Expected output:**
```
[INFO] ===========================================
[INFO]   Elmify Content Validator
[INFO] ===========================================

[SUCCESS] All dependencies are installed

[INFO] Validating speaker: Jordan Peterson
[INFO]   Validating collection: Maps of Meaning
[INFO]     Found 12 lectures

[INFO] ===========================================
[INFO]   Validation Summary
[INFO] ===========================================

[INFO] Total Speakers:    1
[INFO] Total Collections: 1
[INFO] Total Lectures:    12

[SUCCESS] ✅ All validations passed! Content is ready for upload.
```

**If errors found:** Proceed to Step 3.
**If no errors:** Skip to Step 4.

#### **Step 3: Fix Issues (If Needed)**

```bash
# Preview fixes first (dry-run)
./scripts/fix_content.sh --dry-run "$CONTENT_DIR"

# Apply fixes if preview looks good
./scripts/fix_content.sh "$CONTENT_DIR"

# Re-validate after fixes
./scripts/validate_content.sh "$CONTENT_DIR"
```

#### **Step 4: Clear Existing R2 Data (Optional)**

⚠️ **WARNING:** This permanently deletes all data in R2!

```bash
# Interactive mode (asks for confirmation)
./scripts/clear_r2_storage.sh

# Or auto-confirm (use with caution!)
./scripts/clear_r2_storage.sh --yes
```

**Expected output:**
```
[INFO] ===========================================
[INFO]   Elmify R2 Storage Cleaner
[INFO] ===========================================

[SUCCESS] All dependencies are installed

[INFO] Configuration:
[INFO]   Bucket: elmify-audio
[INFO]   Verbose: false
[INFO]   Auto-confirm: false

[INFO] Checking bucket contents...
[INFO] Found 1234 objects in bucket

[WARNING] ⚠️  WARNING: This will PERMANENTLY DELETE all objects from bucket: elmify-audio
[WARNING] ⚠️  Total objects to be deleted: 1234

Are you sure you want to continue? Type 'yes' to confirm: yes

[INFO] Starting deletion process...
[INFO] Progress: 10/1234 objects deleted
...
[SUCCESS] ✅ Bucket cleared successfully!
```

#### **Step 5: Upload Content**

```bash
# Upload all content and generate manifest
./scripts/upload_to_r2.sh -v "$CONTENT_DIR"

# Or use resume mode if upload was interrupted
./scripts/upload_to_r2.sh --resume "$CONTENT_DIR"
```

**Expected output:**
```
[INFO] ===========================================
[INFO]   Elmify R2 Uploader
[INFO] ===========================================

[SUCCESS] All dependencies are installed

[INFO] Configuration:
[INFO]   Content Dir: /Users/alanhabib/Desktop/hobby_projects/batch
[INFO]   Bucket:      elmify-audio
[INFO]   Output:      manifest.json
[INFO]   Resume:      false
[INFO]   Verbose:     true

[INFO] Starting upload process...

[INFO] Processing speaker: Jordan Peterson
[SUCCESS] Uploaded: speakers/jordan-peterson/images/speaker.jpg
[SUCCESS] Uploaded: speakers/jordan-peterson/images/speaker_small.jpg

[INFO]   Processing collection: Maps of Meaning
[SUCCESS] Uploaded: speakers/jordan-peterson/collections/maps-of-meaning/images/cover.jpg
[SUCCESS] Uploaded: speakers/jordan-peterson/collections/maps-of-meaning/images/cover_small.jpg

[INFO]     Uploading lecture: 01 - Introduction.mp3
[SUCCESS] Uploaded: speakers/jordan-peterson/collections/maps-of-meaning/lectures/01-introduction.mp3
...

[INFO] ===========================================
[INFO]   Upload Summary
[INFO] ===========================================

[INFO] Speakers Uploaded:    1
[INFO] Collections Uploaded: 1
[INFO] Lectures Uploaded:    12
[INFO] Files Skipped:        0
[INFO] Errors:               0

[SUCCESS] Manifest saved to: manifest.json

[SUCCESS] ✅ Upload completed successfully!
[INFO] Next steps:
[INFO]   1. Review the manifest file: manifest.json
[INFO]   2. Import data to database using the manifest
```

#### **Step 6: Review Manifest**

```bash
# View generated manifest
cat manifest.json | jq '.'

# Check speaker count
cat manifest.json | jq '.speakers | length'

# Check first speaker structure
cat manifest.json | jq '.speakers[0]'
```

#### **Step 7: Import to Database**

Use the generated `manifest.json` to bulk import data to PostgreSQL.

**Option A: Manual SQL import** (create your own import script)

**Option B: Use Spring Boot data seeder** (recommended)

Create a service in your backend:

```java
@Service
public class ContentImportService {

    @Transactional
    public void importFromManifest(String manifestPath) throws IOException {
        // Read manifest.json
        ObjectMapper mapper = new ObjectMapper();
        ManifestData manifest = mapper.readValue(new File(manifestPath), ManifestData.class);

        // Import speakers, collections, lectures
        for (SpeakerData speakerData : manifest.getSpeakers()) {
            Speaker speaker = new Speaker();
            speaker.setName(speakerData.getName());
            speaker.setImageUrl(speakerData.getImageUrl());
            speaker.setImageSmallUrl(speakerData.getImageSmallUrl());
            speaker.setIsPremium(speakerData.getIsPremium());

            speaker = speakerRepository.save(speaker);

            for (CollectionData collectionData : speakerData.getCollections()) {
                Collection collection = new Collection();
                collection.setSpeaker(speaker);
                collection.setTitle(collectionData.getTitle());
                collection.setCoverImageUrl(collectionData.getCoverImageUrl());
                collection.setCoverImageSmallUrl(collectionData.getCoverImageSmallUrl());

                collection = collectionRepository.save(collection);

                for (LectureData lectureData : collectionData.getLectures()) {
                    Lecture lecture = new Lecture();
                    lecture.setSpeaker(speaker);
                    lecture.setCollection(collection);
                    lecture.setTitle(lectureData.getTitle());
                    lecture.setLectureNumber(lectureData.getLectureNumber());
                    lecture.setFileName(lectureData.getFileName());
                    lecture.setFilePath(lectureData.getFilePath());
                    lecture.setDuration(lectureData.getDuration());
                    lecture.setFileSize(lectureData.getFileSize());
                    lecture.setFileFormat(lectureData.getFileFormat());
                    lecture.setBitrate(lectureData.getBitrate());
                    lecture.setSampleRate(lectureData.getSampleRate());
                    lecture.setFileHash(lectureData.getFileHash());

                    lectureRepository.save(lecture);
                }
            }
        }
    }
}
```

---

## 📄 JSON Manifest Format

The upload script generates a JSON manifest with all metadata for database import.

### Full Structure

```json
{
  "speakers": [
    {
      "name": "Jordan Peterson",
      "imageUrl": "speakers/jordan-peterson/images/speaker.jpg",
      "imageSmallUrl": "speakers/jordan-peterson/images/speaker_small.jpg",
      "isPremium": false,
      "collections": [
        {
          "title": "Maps of Meaning",
          "coverImageUrl": "speakers/jordan-peterson/collections/maps-of-meaning/images/cover.jpg",
          "coverImageSmallUrl": "speakers/jordan-peterson/collections/maps-of-meaning/images/cover_small.jpg",
          "lectures": [
            {
              "title": "Introduction to Maps of Meaning",
              "lectureNumber": 1,
              "fileName": "01-introduction-to-maps-of-meaning.mp3",
              "filePath": "speakers/jordan-peterson/collections/maps-of-meaning/lectures/01-introduction-to-maps-of-meaning.mp3",
              "duration": 3845,
              "fileSize": 55234567,
              "fileFormat": "mp3",
              "bitrate": 128000,
              "sampleRate": 44100,
              "fileHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            }
          ]
        }
      ]
    }
  ]
}
```

### Field Mappings to Backend Entities

**Speaker:**
- `name` → `Speaker.name` (String, unique)
- `imageUrl` → `Speaker.imageUrl` (String)
- `imageSmallUrl` → `Speaker.imageSmallUrl` (String)
- `isPremium` → `Speaker.isPremium` (Boolean, default false)

**Collection:**
- `title` → `Collection.title` (String)
- `coverImageUrl` → `Collection.coverImageUrl` (String)
- `coverImageSmallUrl` → `Collection.coverImageSmallUrl` (String)

**Lecture:**
- `title` → `Lecture.title` (String)
- `lectureNumber` → `Lecture.lectureNumber` (Integer, 1-99)
- `fileName` → `Lecture.fileName` (String)
- `filePath` → `Lecture.filePath` (String, R2 object key)
- `duration` → `Lecture.duration` (Integer, seconds)
- `fileSize` → `Lecture.fileSize` (Long, bytes)
- `fileFormat` → `Lecture.fileFormat` (String, mp3/m4a/wav/flac/aac/ogg)
- `bitrate` → `Lecture.bitrate` (Integer, bits per second)
- `sampleRate` → `Lecture.sampleRate` (Integer, Hz)
- `fileHash` → `Lecture.fileHash` (String, SHA-256)

---

## 🔧 Troubleshooting

### Common Issues

#### **1. Missing Dependencies**

**Error:**
```
[ERROR] Missing required dependencies: wrangler ffmpeg jq
```

**Solution:**
```bash
# Install missing dependencies
npm install -g wrangler
brew install ffmpeg imagemagick jq
```

---

#### **2. Wrangler Not Authenticated**

**Error:**
```
[ERROR] Failed to list objects in bucket: elmify-audio
```

**Solution:**
```bash
# Login to Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

---

#### **3. Invalid Audio Files**

**Error:**
```
[ERROR] Corrupted or invalid audio file: speaker/collection/01 - Lecture.mp3
```

**Solution:**
```bash
# Re-encode audio file
ffmpeg -i "01 - Lecture.mp3" -c:a libmp3lame -b:a 128k "01 - Lecture_fixed.mp3"
```

---

#### **4. Upload Interrupted**

**Error:** Upload stopped midway due to network issue or crash.

**Solution:**
```bash
# Resume upload (skips already uploaded files)
./scripts/upload_to_r2.sh --resume ~/Desktop/hobby_projects/batch
```

---

#### **5. Wrong Bucket**

**Error:** Uploading to wrong R2 bucket.

**Solution:**
```bash
# Specify correct bucket explicitly
./scripts/upload_to_r2.sh --bucket elmify-audio ~/Desktop/hobby_projects/batch
```

---

#### **6. Permission Denied**

**Error:**
```
bash: ./scripts/upload_to_r2.sh: Permission denied
```

**Solution:**
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

---

## ✅ Best Practices

### Before Upload

1. **Always validate first**
   ```bash
   ./scripts/validate_content.sh -v -f "$CONTENT_DIR"
   ```

2. **Preview fixes with dry-run**
   ```bash
   ./scripts/fix_content.sh --dry-run "$CONTENT_DIR"
   ```

3. **Backup your content directory**
   ```bash
   cp -r ~/Desktop/hobby_projects/batch ~/Desktop/hobby_projects/batch_backup
   ```

### During Upload

1. **Use verbose mode for debugging**
   ```bash
   ./scripts/upload_to_r2.sh -v "$CONTENT_DIR"
   ```

2. **Use resume mode if interrupted**
   ```bash
   ./scripts/upload_to_r2.sh --resume "$CONTENT_DIR"
   ```

3. **Monitor progress**
   - Watch for [SUCCESS] and [ERROR] messages
   - Check upload summary at the end

### After Upload

1. **Verify manifest**
   ```bash
   cat manifest.json | jq '.'
   ```

2. **Check R2 bucket**
   ```bash
   wrangler r2 object list elmify-audio | head -20
   ```

3. **Test database import**
   - Import manifest to staging database first
   - Verify all relationships are correct
   - Test API endpoints

### File Organization

1. **Use consistent naming**
   - Speaker names: Title Case (e.g., "Jordan Peterson")
   - Collection names: Title Case (e.g., "Maps of Meaning")
   - Lecture files: `NN - Title.mp3` format

2. **Image quality**
   - Main images: 600x600 minimum
   - Thumbnails: 300x300 minimum
   - Format: JPG for photos, PNG for graphics

3. **Audio quality**
   - Bitrate: 128kbps minimum (192kbps recommended)
   - Format: MP3 preferred (best compatibility)
   - Sample rate: 44100 Hz standard

---

## 📞 Support

### Useful Commands

```bash
# Check script help
./scripts/validate_content.sh --help
./scripts/fix_content.sh --help
./scripts/clear_r2_storage.sh --help
./scripts/upload_to_r2.sh --help

# List R2 objects
wrangler r2 object list elmify-audio

# Get object info
wrangler r2 object get elmify-audio/speakers/jordan-peterson/images/speaker.jpg --json

# Delete single object
wrangler r2 object delete elmify-audio/path/to/object.mp3

# Check audio file metadata
ffprobe -v error -show_format -show_streams file.mp3

# Generate test image
convert -size 600x600 gradient:'#4A5568-#2D3748' -gravity center -pointsize 40 -fill white -annotate +0+0 "Test" test.jpg
```

### Resources

- **Wrangler CLI Docs:** https://developers.cloudflare.com/workers/wrangler/
- **R2 Documentation:** https://developers.cloudflare.com/r2/
- **ffmpeg Documentation:** https://ffmpeg.org/documentation.html
- **ImageMagick Docs:** https://imagemagick.org/script/command-line-processing.php

---

## ✨ Summary

You now have a complete batch upload system that:

✅ Validates content structure and files
✅ Automatically fixes common issues
✅ Clears old R2 data safely
✅ Uploads content with resumable support
✅ Extracts all required metadata
✅ Generates database import manifest
✅ Aligns perfectly with backend entities

**Ready to upload?** Follow the [Step-by-Step Process](#step-by-step-process)!

Good luck! 🚀
