# Elmify Batch Upload - Quick Reference Card

## 🎯 One-Command Workflow

```bash
# Set your content directory
CONTENT_DIR=~/Desktop/hobby_projects/batch

# Run complete workflow
./scripts/validate_content.sh -v -f "$CONTENT_DIR" && \
./scripts/fix_content.sh --dry-run "$CONTENT_DIR" && \
read -p "Apply fixes? (y/n) " -n 1 -r && echo && \
[[ $REPLY =~ ^[Yy]$ ]] && ./scripts/fix_content.sh "$CONTENT_DIR" && \
./scripts/clear_r2_storage.sh && \
./scripts/upload_to_r2.sh -v "$CONTENT_DIR"
```

## 📋 Command Cheat Sheet

### Validation
```bash
# Basic validation
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch

# Verbose with fix suggestions
./scripts/validate_content.sh -v -f ~/Desktop/hobby_projects/batch

# Strict mode (warnings = errors)
./scripts/validate_content.sh --strict ~/Desktop/hobby_projects/batch
```

### Fixing
```bash
# Preview fixes (DRY-RUN - SAFE)
./scripts/fix_content.sh --dry-run ~/Desktop/hobby_projects/batch

# Apply fixes with backup
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch

# Only generate images (skip rename)
./scripts/fix_content.sh --skip-rename ~/Desktop/hobby_projects/batch

# Only rename files (skip images)
./scripts/fix_content.sh --skip-images ~/Desktop/hobby_projects/batch
```

### Clearing R2
```bash
# Interactive (asks for confirmation)
./scripts/clear_r2_storage.sh

# Auto-confirm (DANGEROUS!)
./scripts/clear_r2_storage.sh --yes

# Different bucket
./scripts/clear_r2_storage.sh --bucket my-bucket
```

### Uploading
```bash
# Basic upload
./scripts/upload_to_r2.sh ~/Desktop/hobby_projects/batch

# Verbose mode
./scripts/upload_to_r2.sh -v ~/Desktop/hobby_projects/batch

# Resume interrupted upload
./scripts/upload_to_r2.sh --resume ~/Desktop/hobby_projects/batch

# Custom output file
./scripts/upload_to_r2.sh --output data.json ~/Desktop/hobby_projects/batch

# Force re-upload all
./scripts/upload_to_r2.sh --force ~/Desktop/hobby_projects/batch
```

## 📂 Directory Structure Template

```
content/
├── Jordan Peterson/
│   ├── speaker.jpg              # 600x600 main image
│   ├── speaker_small.jpg        # 300x300 thumbnail
│   └── Maps of Meaning/
│       ├── collection.jpg        # 600x600 cover
│       ├── collection_small.jpg  # 300x300 thumbnail
│       ├── 01 - Introduction.mp3
│       ├── 02 - The Problem of Evil.mp3
│       └── ...
```

## 🔧 Prerequisites

```bash
# Install dependencies
npm install -g wrangler
brew install ffmpeg imagemagick jq

# Login to Wrangler
wrangler login

# Set environment variable
export R2_BUCKET_NAME="elmify-audio"
```

## 🎨 Expected Output Colors

- 🔵 **BLUE [INFO]** - Informational messages
- 🟢 **GREEN [SUCCESS]** - Operations succeeded
- 🟡 **YELLOW [WARNING]** - Non-critical issues
- 🔴 **RED [ERROR]** - Critical errors

## 📊 R2 Path Structure

```
speakers/{speaker-slug}/images/speaker.jpg
speakers/{speaker-slug}/images/speaker_small.jpg
speakers/{speaker-slug}/collections/{collection-slug}/images/cover.jpg
speakers/{speaker-slug}/collections/{collection-slug}/images/cover_small.jpg
speakers/{speaker-slug}/collections/{collection-slug}/lectures/01-title.mp3
```

## 🔍 Useful Checks

```bash
# Check script help
./scripts/validate_content.sh --help

# List R2 objects
wrangler r2 object list elmify-audio | head -20

# View manifest
cat manifest.json | jq '.speakers | length'

# Test audio file
ffprobe -v error -show_format file.mp3

# Verify dependencies
command -v wrangler ffprobe convert jq shasum
```

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Permission denied | `chmod +x scripts/*.sh` |
| Missing dependencies | See prerequisites above |
| Wrangler not authenticated | `wrangler login` |
| Upload interrupted | Use `--resume` flag |
| Wrong bucket | Use `--bucket` flag |
| Corrupted audio | Re-encode with ffmpeg |

## 📱 Quick Fixes

```bash
# Re-encode corrupted MP3
ffmpeg -i broken.mp3 -c:a libmp3lame -b:a 128k fixed.mp3

# Generate test image
convert -size 600x600 gradient:'#4A5568-#2D3748' \
  -gravity center -pointsize 40 -fill white \
  -annotate +0+0 "Test Speaker" speaker.jpg

# Resize image to thumbnail
convert speaker.jpg -resize 300x300^ -gravity center \
  -extent 300x300 speaker_small.jpg
```

## ✅ Pre-Upload Checklist

- [ ] Dependencies installed
- [ ] Wrangler authenticated
- [ ] Content directory organized
- [ ] Validation passed
- [ ] Fixes applied (if needed)
- [ ] Backup created
- [ ] R2 bucket confirmed

## 📖 Full Documentation

- **Complete Guide:** [`BATCH_UPLOAD.md`](./BATCH_UPLOAD.md)
- **Implementation:** [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md)
- **Scripts README:** [`scripts/README.md`](./scripts/README.md)

## 🆘 Emergency Commands

```bash
# Stop all uploads (if stuck)
killall wrangler

# Check R2 bucket size
wrangler r2 object list elmify-audio | wc -l

# Delete single object
wrangler r2 object delete elmify-audio/path/to/file.mp3

# Clear entire bucket
./scripts/clear_r2_storage.sh --yes
```

---

**Ready to upload?** Start with validation: `./scripts/validate_content.sh ~/Desktop/hobby_projects/batch`
