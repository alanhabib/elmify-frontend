# Clean Folder Setup Guide

How to maintain a clean, organized content directory for Elmify speakers.

---

## 🎯 What You Need for a Clean Folder

A "clean folder" means your content directory is properly structured and ready for upload at any time.

### **Clean Folder Requirements:**

```
✅ Every speaker has:
   - speaker.jpg (600x600+ pixels)
   - speaker_small.jpg (300x300+ pixels)
   - At least one collection

✅ Every collection has:
   - collection.jpg (600x600+ pixels)
   - collection_small.jpg (300x300+ pixels)
   - At least one lecture

✅ Every lecture follows naming convention:
   - Format: NN - Title.ext
   - Example: 01 - Introduction.mp3

✅ No extra files:
   - No .DS_Store
   - No .json files
   - No temporary files
   - No backup files
```

---

## 📁 Template Structure

Copy this structure for every new speaker:

```
content/
└── [Speaker Name]/               # Replace with actual name
    ├── speaker.jpg               # 600x600+ main image
    ├── speaker_small.jpg         # 300x300+ thumbnail
    └── [Collection Name]/        # Replace with actual name
        ├── collection.jpg        # 600x600+ cover
        ├── collection_small.jpg  # 300x300+ thumbnail
        ├── 01 - [Lecture 1].mp3  # Replace with actual title
        ├── 02 - [Lecture 2].mp3
        └── 03 - [Lecture 3].mp3
```

---

## 🧹 Keeping Your Folder Clean

### **1. Regular Validation**

Run validation weekly or after adding new content:

```bash
# Validate entire content directory
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch/content

# Validate specific speaker
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch/content/Jordan\ Peterson
```

### **2. Remove Unwanted Files**

```bash
# Remove .DS_Store files (macOS system files)
find ~/Desktop/hobby_projects/batch/content -name ".DS_Store" -delete

# Remove .json files (not needed by scripts)
find ~/Desktop/hobby_projects/batch/content -name "*.json" -delete

# Remove backup files
find ~/Desktop/hobby_projects/batch/content -name "*~" -delete
find ~/Desktop/hobby_projects/batch/content -name "*.bak" -delete

# Remove hidden files
find ~/Desktop/hobby_projects/batch/content -name ".*" ! -name ".gitkeep" -delete
```

### **3. Auto-Fix Common Issues**

```bash
# Preview what will be fixed
./scripts/fix_content.sh --dry-run ~/Desktop/hobby_projects/batch/content

# Apply fixes automatically
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch/content

# This will:
# - Generate missing speaker/collection images
# - Generate missing thumbnails
# - Rename lectures to proper format
# - Remove special characters
```

### **4. Organize by Status**

Keep different states separate:

```
batch/
├── staging/          # New content being prepared
├── content/          # Clean, validated, ready to upload
├── uploaded/         # Already uploaded (archive)
└── problematic/      # Content with issues to fix
```

**Workflow:**
1. Add new speakers to `staging/`
2. Validate and fix in `staging/`
3. Move clean content to `content/`
4. Upload from `content/`
5. Archive to `uploaded/` after successful upload

---

## ✨ Creating a New Speaker Template

Create a helper script to generate the template structure:

```bash
#!/bin/bash
# create_speaker.sh - Quick speaker template creator

SPEAKER_NAME="$1"
COLLECTION_NAME="$2"
CONTENT_DIR="$3"

if [[ -z "$SPEAKER_NAME" ]] || [[ -z "$COLLECTION_NAME" ]]; then
    echo "Usage: ./create_speaker.sh \"Speaker Name\" \"Collection Name\" [content_dir]"
    exit 1
fi

CONTENT_DIR="${CONTENT_DIR:-./content}"

# Create directories
mkdir -p "$CONTENT_DIR/$SPEAKER_NAME/$COLLECTION_NAME"

# Create placeholder images
convert -size 600x600 \
    gradient:'#4A5568-#2D3748' \
    -gravity center \
    -pointsize 40 \
    -fill white \
    -annotate +0+0 "$SPEAKER_NAME" \
    "$CONTENT_DIR/$SPEAKER_NAME/speaker.jpg"

convert "$CONTENT_DIR/$SPEAKER_NAME/speaker.jpg" \
    -resize 300x300^ \
    -gravity center \
    -extent 300x300 \
    "$CONTENT_DIR/$SPEAKER_NAME/speaker_small.jpg"

convert -size 600x600 \
    gradient:'#4A5568-#2D3748' \
    -gravity center \
    -pointsize 40 \
    -fill white \
    -annotate +0+0 "$COLLECTION_NAME" \
    "$CONTENT_DIR/$SPEAKER_NAME/$COLLECTION_NAME/collection.jpg"

convert "$CONTENT_DIR/$SPEAKER_NAME/$COLLECTION_NAME/collection.jpg" \
    -resize 300x300^ \
    -gravity center \
    -extent 300x300 \
    "$CONTENT_DIR/$SPEAKER_NAME/$COLLECTION_NAME/collection_small.jpg"

echo "✅ Created template for: $SPEAKER_NAME / $COLLECTION_NAME"
echo "📁 Location: $CONTENT_DIR/$SPEAKER_NAME"
echo ""
echo "Next steps:"
echo "  1. Replace placeholder images with real images"
echo "  2. Add lecture files: NN - Title.mp3"
echo "  3. Validate: ./scripts/validate_content.sh \"$CONTENT_DIR/$SPEAKER_NAME\""
```

**Save as:** `scripts/create_speaker.sh`

**Usage:**
```bash
chmod +x scripts/create_speaker.sh

# Create new speaker with template
./scripts/create_speaker.sh "Naval Ravikant" "Almanack" ~/Desktop/hobby_projects/batch/content

# Now just add your images and lectures!
```

---

## 📋 Pre-Upload Checklist

Before running `upload_to_r2.sh`, ensure your folder is clean:

```bash
# 1. Remove system files
find ~/Desktop/hobby_projects/batch/content -name ".DS_Store" -delete

# 2. Validate all content
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch/content

# 3. Fix any issues
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch/content

# 4. Re-validate after fixes
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch/content

# 5. Count your content
echo "Speakers:" && find ~/Desktop/hobby_projects/batch/content -maxdepth 1 -type d | tail -n +2 | wc -l
echo "Lectures:" && find ~/Desktop/hobby_projects/batch/content -name "*.mp3" | wc -l

# 6. Ready to upload!
./scripts/upload_to_r2.sh ~/Desktop/hobby_projects/batch/content
```

---

## 🔍 Verification Commands

Use these to verify your folder is clean:

```bash
# List all speakers
ls -1 ~/Desktop/hobby_projects/batch/content

# Check specific speaker structure
tree ~/Desktop/hobby_projects/batch/content/Jordan\ Peterson

# Find speakers missing images
find ~/Desktop/hobby_projects/batch/content -maxdepth 1 -type d | while read speaker; do
    [[ -f "$speaker/speaker.jpg" ]] || echo "Missing speaker.jpg: $speaker"
    [[ -f "$speaker/speaker_small.jpg" ]] || echo "Missing speaker_small.jpg: $speaker"
done

# Find collections missing images
find ~/Desktop/hobby_projects/batch/content -maxdepth 2 -mindepth 2 -type d | while read collection; do
    [[ -f "$collection/collection.jpg" ]] || echo "Missing collection.jpg: $collection"
    [[ -f "$collection/collection_small.jpg" ]] || echo "Missing collection_small.jpg: $collection"
done

# Find lectures with wrong naming
find ~/Desktop/hobby_projects/batch/content -name "*.mp3" | while read file; do
    filename=$(basename "$file")
    if [[ ! "$filename" =~ ^[0-9]{2}\ -\  ]]; then
        echo "Wrong format: $file"
    fi
done
```

---

## 🎨 Image Management Tips

### **Batch Image Generation**

If you have many speakers without images:

```bash
# Generate all missing speaker images
for speaker_dir in ~/Desktop/hobby_projects/batch/content/*/; do
    speaker_name=$(basename "$speaker_dir")

    if [[ ! -f "$speaker_dir/speaker.jpg" ]]; then
        convert -size 600x600 \
            gradient:'#4A5568-#2D3748' \
            -gravity center \
            -pointsize 40 \
            -fill white \
            -annotate +0+0 "$speaker_name" \
            "$speaker_dir/speaker.jpg"

        convert "$speaker_dir/speaker.jpg" \
            -resize 300x300^ \
            -gravity center \
            -extent 300x300 \
            "$speaker_dir/speaker_small.jpg"

        echo "Generated images for: $speaker_name"
    fi
done
```

### **Bulk Image Download**

If you have a list of image URLs:

```bash
# Create images.csv with format: speaker_name,image_url
# Example:
# Jordan Peterson,https://example.com/jordan.jpg
# Naval Ravikant,https://example.com/naval.jpg

while IFS=, read -r speaker_name image_url; do
    curl -o "~/Desktop/hobby_projects/batch/content/$speaker_name/speaker.jpg" "$image_url"

    convert "~/Desktop/hobby_projects/batch/content/$speaker_name/speaker.jpg" \
        -resize 300x300^ \
        -gravity center \
        -extent 300x300 \
        "~/Desktop/hobby_projects/batch/content/$speaker_name/speaker_small.jpg"

    echo "Downloaded: $speaker_name"
done < images.csv
```

---

## 🚀 Automated Maintenance Script

Create a maintenance script that runs regularly:

```bash
#!/bin/bash
# maintain_content.sh - Automated content maintenance

CONTENT_DIR=~/Desktop/hobby_projects/batch/content

echo "🧹 Starting content maintenance..."

# 1. Remove unwanted files
echo "Removing system files..."
find "$CONTENT_DIR" -name ".DS_Store" -delete
find "$CONTENT_DIR" -name "*.json" -delete
find "$CONTENT_DIR" -name "*~" -delete

# 2. Generate missing images
echo "Generating missing images..."
./scripts/fix_content.sh --skip-rename "$CONTENT_DIR"

# 3. Validate content
echo "Validating content..."
./scripts/validate_content.sh "$CONTENT_DIR"

# 4. Generate report
echo ""
echo "📊 Content Summary:"
echo "Speakers: $(find "$CONTENT_DIR" -maxdepth 1 -type d | tail -n +2 | wc -l)"
echo "Collections: $(find "$CONTENT_DIR" -maxdepth 2 -mindepth 2 -type d | wc -l)"
echo "Lectures: $(find "$CONTENT_DIR" -name "*.mp3" -o -name "*.m4a" | wc -l)"
echo ""
echo "✅ Maintenance complete!"
```

**Run weekly:**
```bash
chmod +x maintain_content.sh
./maintain_content.sh
```

---

## 📚 Summary: What Makes a Clean Folder

A clean content folder is:

✅ **Properly structured** - Follows naming conventions
✅ **Complete** - All required images present
✅ **Validated** - No errors when running validation script
✅ **Organized** - No extra/temporary files
✅ **Ready to upload** - Can run upload script anytime

**Golden Rule:** If `./scripts/validate_content.sh` passes with 0 errors, your folder is clean!

---

## 🎯 Quick Start for Clean Folder

```bash
# 1. Create your content directory
mkdir -p ~/Desktop/hobby_projects/batch/content

# 2. Add speakers (use template or manually)
# ... add your speakers ...

# 3. Clean up
find ~/Desktop/hobby_projects/batch/content -name ".DS_Store" -delete

# 4. Fix issues
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch/content

# 5. Validate
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch/content

# 6. If validation passes, you're ready!
./scripts/upload_to_r2.sh ~/Desktop/hobby_projects/batch/content
```

---

**Your folder is clean when you can run the upload script without any warnings or errors!** ✨
