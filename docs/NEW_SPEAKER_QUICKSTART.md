# Adding New Speaker - Quick Start Guide

**Super simple guide to add a new speaker in under 5 minutes.**

---

## ⚡ TL;DR - 3 Commands

```bash
# 1. Create template (generates placeholder images)
./scripts/create_speaker.sh "Speaker Name" "Collection Name" ~/Desktop/hobby_projects/batch/content

# 2. Add lectures (copy your MP3 files)
cp /path/to/lectures/*.mp3 ~/Desktop/hobby_projects/batch/content/Speaker\ Name/Collection\ Name/

# 3. Fix and validate
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch/content/Speaker\ Name
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch/content/Speaker\ Name
```

**Done!** Ready to upload.

---

## 📋 Simple Checklist

When adding a new speaker, you need:

- [ ] **Speaker name** (Title Case, e.g., "Jordan Peterson")
- [ ] **Collection name** (Title Case, e.g., "Maps of Meaning")
- [ ] **Lecture files** (MP3, M4A, etc.)
- [ ] **Speaker image** (optional - placeholder generated if missing)
- [ ] **Collection cover** (optional - placeholder generated if missing)

That's it!

---

## 🚀 Method 1: Super Quick (With Template)

**Best for:** Quick setup with placeholder images

```bash
# Step 1: Create template
./scripts/create_speaker.sh "Naval Ravikant" "Almanack" ~/Desktop/hobby_projects/batch/content

# Step 2: Add your lectures
cp ~/Downloads/lecture1.mp3 ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant/Almanack/01\ -\ How\ to\ Get\ Rich.mp3
cp ~/Downloads/lecture2.mp3 ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant/Almanack/02\ -\ Build\ Leverage.mp3

# Or copy all at once (will be renamed automatically)
cp ~/Downloads/*.mp3 ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant/Almanack/

# Step 3: Fix and validate
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant
```

**Result:**
```
✅ Speaker created with placeholder images
✅ Lectures added and renamed to format: 01 - Title.mp3
✅ Ready to upload!
```

---

## 🎨 Method 2: With Real Images

**Best for:** Professional setup with actual photos

```bash
# Step 1: Create template
./scripts/create_speaker.sh "Jordan Peterson" "Personality" ~/Desktop/hobby_projects/batch/content

# Step 2: Replace placeholder images with real ones
cp ~/Downloads/jordan-peterson.jpg ~/Desktop/hobby_projects/batch/content/Jordan\ Peterson/speaker.jpg
cp ~/Downloads/personality-cover.jpg ~/Desktop/hobby_projects/batch/content/Jordan\ Peterson/Personality/collection.jpg

# Step 3: Generate thumbnails
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch/content/Jordan\ Peterson

# Step 4: Add lectures
cp ~/Downloads/*.mp3 ~/Desktop/hobby_projects/batch/content/Jordan\ Peterson/Personality/

# Step 5: Fix and validate
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch/content/Jordan\ Peterson
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch/content/Jordan\ Peterson
```

**Result:**
```
✅ Speaker with professional images
✅ Thumbnails generated automatically
✅ Lectures formatted correctly
✅ Ready to upload!
```

---

## 📂 Method 3: Manual (No Script)

**Best for:** Full control over structure

```bash
# Step 1: Create directories
mkdir -p ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant/Almanack

# Step 2: Add speaker images (600x600 and 300x300)
cp ~/Downloads/speaker.jpg ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant/speaker.jpg
cp ~/Downloads/speaker-thumb.jpg ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant/speaker_small.jpg

# Step 3: Add collection images (600x600 and 300x300)
cp ~/Downloads/collection.jpg ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant/Almanack/collection.jpg
cp ~/Downloads/collection-thumb.jpg ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant/Almanack/collection_small.jpg

# Step 4: Add lectures with proper naming
cp ~/Downloads/lecture1.mp3 ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant/Almanack/01\ -\ How\ to\ Get\ Rich.mp3
cp ~/Downloads/lecture2.mp3 ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant/Almanack/02\ -\ Build\ Leverage.mp3

# Step 5: Validate
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant
```

---

## 🔧 What If I Don't Have Images?

**No problem!** The scripts generate placeholder images automatically:

```bash
# Option 1: Use create_speaker.sh (generates placeholders)
./scripts/create_speaker.sh "Speaker Name" "Collection" ~/Desktop/hobby_projects/batch/content

# Option 2: Use fix_content.sh (generates missing images)
mkdir -p ~/Desktop/hobby_projects/batch/content/Speaker\ Name/Collection
cp *.mp3 ~/Desktop/hobby_projects/batch/content/Speaker\ Name/Collection/
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch/content/Speaker\ Name
```

**Placeholder images look like:**
- Gray gradient background
- White text with speaker/collection name
- Professional enough for testing
- Can replace later with real images

---

## 📁 File Naming Rules

### Speaker & Collection Names
- ✅ Use Title Case: "Jordan Peterson"
- ✅ Use spaces: "Jordan Peterson" (not "jordan_peterson")
- ❌ No special characters: No `!@#$%^&*()`

### Lecture Files
- ✅ Format: `NN - Title.ext`
- ✅ Example: `01 - Introduction.mp3`
- ✅ Number: 01-99 (two digits)
- ✅ Separator: ` - ` (space-hyphen-space)
- ❌ Wrong: `1-Intro.mp3`, `01-Intro.mp3`, `Intro 01.mp3`

**Don't worry about naming!** The `fix_content.sh` script auto-renames files to the correct format.

---

## ✅ Validation

Always validate before uploading:

```bash
# Validate specific speaker
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch/content/Speaker\ Name

# Validate entire content directory
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch/content
```

**Green output = Ready!**
**Red/Yellow = Run fix script**

```bash
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch/content/Speaker\ Name
```

---

## 🎯 Real Example - Start to Finish

**Goal:** Add Naval Ravikant with Almanack lectures

```bash
# 1. Create template (30 seconds)
./scripts/create_speaker.sh "Naval Ravikant" "Almanack" ~/Desktop/hobby_projects/batch/content

# 2. Copy lectures (1 minute)
cp ~/Downloads/naval-lectures/*.mp3 ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant/Almanack/

# 3. Fix lecture names (30 seconds)
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant

# 4. Validate (10 seconds)
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch/content/Naval\ Ravikant

# DONE! ✅
# Result: Naval Ravikant/
#         ├── speaker.jpg
#         ├── speaker_small.jpg
#         └── Almanack/
#             ├── collection.jpg
#             ├── collection_small.jpg
#             ├── 01 - How to Get Rich.mp3
#             ├── 02 - Build Leverage.mp3
#             └── 03 - Find Happiness.mp3
```

**Total time:** ~2 minutes

---

## 🔄 Adding More Collections to Existing Speaker

Already have a speaker? Just add another collection:

```bash
# Method 1: Create collection with fix script
mkdir ~/Desktop/hobby_projects/batch/content/Jordan\ Peterson/New\ Collection
cp ~/Downloads/*.mp3 ~/Desktop/hobby_projects/batch/content/Jordan\ Peterson/New\ Collection/
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch/content/Jordan\ Peterson/New\ Collection

# Method 2: Manual
mkdir ~/Desktop/hobby_projects/batch/content/Jordan\ Peterson/New\ Collection
# Add images and lectures manually...
```

---

## 🆘 Troubleshooting

### "Speaker already exists"

```bash
# Add a new collection instead
mkdir ~/Desktop/hobby_projects/batch/content/Existing\ Speaker/New\ Collection
```

### "Validation fails"

```bash
# Run fix script
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch/content/Speaker\ Name

# Re-validate
./scripts/validate_content.sh ~/Desktop/hobby_projects/batch/content/Speaker\ Name
```

### "Missing ImageMagick"

```bash
# Install on macOS
brew install imagemagick
```

### "Lectures have wrong names"

```bash
# Auto-rename with fix script
./scripts/fix_content.sh ~/Desktop/hobby_projects/batch/content/Speaker\ Name
```

---

## 📚 All Available Scripts

```bash
# Create new speaker template
./scripts/create_speaker.sh "Name" "Collection" [dir]

# Validate content
./scripts/validate_content.sh <directory>

# Fix common issues
./scripts/fix_content.sh <directory>

# Upload to R2
./scripts/upload_to_r2.sh <directory>

# Clear R2 storage
./scripts/clear_r2_storage.sh
```

---

## 🎓 Complete Documentation

- **This guide** - Quick start for adding speakers
- **SPEAKER_CHECKLIST.md** - Detailed checklist
- **CLEAN_FOLDER_GUIDE.md** - Maintaining clean folders
- **BATCH_UPLOAD.md** - Complete upload documentation

---

## 🚀 You're Ready!

Adding a new speaker is as simple as:

1. **Create template** with `create_speaker.sh`
2. **Add lectures** (copy MP3 files)
3. **Fix and validate** with provided scripts
4. **Upload** when ready!

**No manual image resizing. No manual renaming. Just add content and go!** ✨
