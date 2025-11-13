# Elmify Batch Upload Scripts

Bash scripts for uploading speaker/lecture content to Cloudflare R2 storage.

## 📁 Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `create_speaker.sh` | Create new speaker template | `./create_speaker.sh "Speaker" "Collection" [dir]` |
| `validate_content.sh` | Validate directory structure | `./validate_content.sh /path/to/content` |
| `fix_content.sh` | Auto-fix common issues | `./fix_content.sh /path/to/content` |
| `clear_r2_storage.sh` | Clear R2 bucket | `./clear_r2_storage.sh` |
| `upload_to_r2.sh` | Upload to R2 + generate manifest | `./upload_to_r2.sh /path/to/content` |
| `convert_existing_structure.sh` | Convert old structure to new | `./convert_existing_structure.sh /old /new` |

## 🚀 Quick Start

### Adding New Speaker
```bash
# Create speaker template
./create_speaker.sh "Speaker Name" "Collection Name" ~/Desktop/hobby_projects/batch/content

# Add lectures and validate
./validate_content.sh ~/Desktop/hobby_projects/batch/content
```

### Uploading Content
```bash
# 1. Validate content
./validate_content.sh ~/Desktop/hobby_projects/batch/content

# 2. Fix issues (if any)
./fix_content.sh ~/Desktop/hobby_projects/batch/content

# 3. Clear R2 (optional)
./clear_r2_storage.sh

# 4. Upload content
./upload_to_r2.sh ~/Desktop/hobby_projects/batch/content
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
