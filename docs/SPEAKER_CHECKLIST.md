# Adding New Speakers - Checklist

Complete guide for adding new speakers, collections, and lectures to Elmify.

---

## 📋 Quick Checklist

When adding a new speaker, you need:

- [ ] **Speaker directory** with proper name (Title Case)
- [ ] **speaker.jpg** - Main speaker image (600x600 minimum)
- [ ] **speaker_small.jpg** - Thumbnail (300x300 minimum)
- [ ] **At least one collection directory**

For each collection:
- [ ] **collection.jpg** - Collection cover image (600x600 minimum)
- [ ] **collection_small.jpg** - Thumbnail (300x300 minimum)
- [ ] **At least one lecture file** in format: `NN - Title.ext`

---

## 📁 Required Directory Structure

### Minimum Structure

```
content/
└── Speaker Name/                    # ✅ Title Case (e.g., "Jordan Peterson")
    ├── speaker.jpg                  # ✅ Required: 600x600+ main image
    ├── speaker_small.jpg            # ✅ Required: 300x300+ thumbnail
    └── Collection Name/             # ✅ At least one collection
        ├── collection.jpg           # ✅ Required: 600x600+ cover
        ├── collection_small.jpg     # ✅ Required: 300x300+ thumbnail
        ├── 01 - First Lecture.mp3   # ✅ Required: At least one lecture
        └── 02 - Second Lecture.mp3  # ✅ Optional: More lectures
```

### Example Structure

```
content/
└── Jordan Peterson/
    ├── speaker.jpg                  # 600x600 or larger
    ├── speaker_small.jpg            # 300x300 or larger
    ├── Maps of Meaning/
    │   ├── collection.jpg
    │   ├── collection_small.jpg
    │   ├── 01 - Introduction.mp3
    │   ├── 02 - The Problem of Evil.mp3
    │   └── 03 - The Dragon of Chaos.mp3
    └── Personality Lectures/
        ├── collection.jpg
        ├── collection_small.jpg
        ├── 01 - Intro to Personality.mp3
        └── 02 - Trait Theory.mp3
```

---

## 🎯 Step-by-Step: Adding a New Speaker

### **Step 1: Create Speaker Directory**

```bash
# Navigate to your content directory
cd ~/Desktop/hobby_projects/batch/content

# Create speaker directory (use Title Case!)
mkdir "Jordan Peterson"
```

**Naming Rules:**
- ✅ Use Title Case: "Jordan Peterson"
- ✅ Use spaces (not underscores): "Jordan Peterson" NOT "jordan_peterson"
- ✅ Use full names: "Jordan Peterson" NOT "JP"
- ❌ Avoid special characters: No `!@#$%^&*()`
- ❌ Avoid numbers in names (unless part of actual name)

---

### **Step 2: Add Speaker Images**

You need TWO images for the speaker:

#### **2.1: speaker.jpg (Main Image)**

Requirements:
- **Minimum size:** 600x600 pixels (square)
- **Recommended:** 1000x1000 or 1200x1200
- **Format:** JPG or PNG (will be converted to JPG)
- **Content:** Clear photo of the speaker's face
- **Quality:** High resolution, well-lit, professional

```bash
# Copy your image
cp /path/to/speaker-photo.jpg "Jordan Peterson/speaker.jpg"

# Or download from URL
curl -o "Jordan Peterson/speaker.jpg" "https://example.com/speaker-photo.jpg"
```

#### **2.2: speaker_small.jpg (Thumbnail)**

**Option A: Generate automatically** (recommended)
```bash
# The fix_content.sh script will generate this
./scripts/fix_content.sh "Jordan Peterson"
```

**Option B: Create manually**
```bash
# Resize using ImageMagick
convert "Jordan Peterson/speaker.jpg" \
  -resize 300x300^ \
  -gravity center \
  -extent 300x300 \
  "Jordan Peterson/speaker_small.jpg"
```

**Option C: Use a different thumbnail image**
```bash
# If you have a separate thumbnail
cp /path/to/thumbnail.jpg "Jordan Peterson/speaker_small.jpg"
```

---

### **Step 3: Create Collection Directory**

```bash
# Create at least one collection
mkdir "Jordan Peterson/Maps of Meaning"
```

**Naming Rules (same as speaker):**
- ✅ Title Case: "Maps of Meaning"
- ✅ Use spaces: "Maps of Meaning" NOT "maps_of_meaning"
- ✅ Descriptive names: "Introduction to Psychology" NOT "Intro"
- ❌ Avoid years at start: "Biblical Series" NOT "2017 Biblical Series"
- ❌ Avoid special characters

---

### **Step 4: Add Collection Images**

Similar to speaker images, you need TWO collection images:

#### **4.1: collection.jpg (Cover Image)**

Requirements:
- **Minimum size:** 600x600 pixels (square)
- **Recommended:** 1000x1000 or 1200x1200
- **Format:** JPG or PNG (will be converted to JPG)
- **Content:** Cover art, thumbnail, or related image
- **Quality:** High resolution, clear design

```bash
# Copy your cover image
cp /path/to/cover.jpg "Jordan Peterson/Maps of Meaning/collection.jpg"
```

**Tips for Collection Covers:**
- Use official course/series artwork if available
- Create simple text-based cover with speaker name + collection title
- Use a relevant photo from the lectures
- Keep it consistent with your brand/style

**Quick Text Cover with ImageMagick:**
```bash
convert -size 600x600 \
  gradient:'#2D3748-#1A202C' \
  -gravity center \
  -pointsize 48 \
  -fill white \
  -annotate +0-50 "Jordan Peterson" \
  -pointsize 36 \
  -annotate +0+50 "Maps of Meaning" \
  "Jordan Peterson/Maps of Meaning/collection.jpg"
```

#### **4.2: collection_small.jpg (Thumbnail)**

**Option A: Generate automatically** (recommended)
```bash
./scripts/fix_content.sh "Jordan Peterson/Maps of Meaning"
```

**Option B: Create manually**
```bash
convert "Jordan Peterson/Maps of Meaning/collection.jpg" \
  -resize 300x300^ \
  -gravity center \
  -extent 300x300 \
  "Jordan Peterson/Maps of Meaning/collection_small.jpg"
```

---

### **Step 5: Add Lecture Files**

#### **5.1: File Naming Convention**

**Required Format:** `NN - Title.ext`

Where:
- `NN` = Two-digit number (01-99)
- ` - ` = Space, hyphen, space (literal: ` - `)
- `Title` = Descriptive lecture title
- `.ext` = File extension (mp3, m4a, wav, etc.)

**Examples:**
- ✅ `01 - Introduction to Maps of Meaning.mp3`
- ✅ `02 - The Problem of Evil.mp3`
- ✅ `15 - Dragons and the Terrible Mother.mp3`
- ❌ `1-Introduction.mp3` (missing zero padding and spaces)
- ❌ `01-Introduction.mp3` (missing spaces around hyphen)
- ❌ `01 Introduction.mp3` (missing hyphen)
- ❌ `Introduction 01.mp3` (number at wrong position)

#### **5.2: Adding Lectures**

```bash
# Copy lectures with correct naming
cp /path/to/lecture1.mp3 "Jordan Peterson/Maps of Meaning/01 - Introduction.mp3"
cp /path/to/lecture2.mp3 "Jordan Peterson/Maps of Meaning/02 - The Problem of Evil.mp3"
cp /path/to/lecture3.mp3 "Jordan Peterson/Maps of Meaning/03 - Chaos and Order.mp3"
```

#### **5.3: Bulk Rename Existing Files**

If you have files with wrong naming:

```bash
# Let the fix script rename them
./scripts/fix_content.sh "Jordan Peterson/Maps of Meaning"
```

Or manually:
```bash
cd "Jordan Peterson/Maps of Meaning"

# Add numbers to files without them
num=1
for file in *.mp3; do
  mv "$file" "$(printf "%02d - %s" $num "$file")"
  ((num++))
done
```

---

### **Step 6: Validate New Content**

**Always validate before uploading!**

```bash
# Validate the new speaker
./scripts/validate_content.sh -v -f "Jordan Peterson"
```

**Expected output:**
```
[INFO] Validating speaker: Jordan Peterson
[SUCCESS] Found speaker image
[SUCCESS] Found speaker thumbnail
[INFO]   Validating collection: Maps of Meaning
[SUCCESS] Found collection cover
[SUCCESS] Found collection thumbnail
[INFO]     Found 3 lectures
[SUCCESS] ✅ All validations passed!
```

**If you see errors:**
```bash
# Preview automatic fixes
./scripts/fix_content.sh --dry-run "Jordan Peterson"

# Apply fixes
./scripts/fix_content.sh "Jordan Peterson"

# Re-validate
./scripts/validate_content.sh "Jordan Peterson"
```

---

### **Step 7: Upload to R2 (Optional)**

If you're adding to existing content:

```bash
# Upload just the new speaker (resume mode to skip existing)
./scripts/upload_to_r2.sh --resume ~/Desktop/hobby_projects/batch/content
```

Or upload everything fresh:

```bash
./scripts/upload_to_r2.sh ~/Desktop/hobby_projects/batch/content
```

---

## 🎨 Image Guidelines

### **Speaker Images**

**What makes a good speaker image:**
- ✅ Clear, professional headshot
- ✅ High resolution (min 600x600, recommended 1200x1200)
- ✅ Good lighting, sharp focus
- ✅ Neutral or simple background
- ✅ Speaker facing camera
- ❌ Avoid: Blurry, dark, busy backgrounds
- ❌ Avoid: Multiple people in photo
- ❌ Avoid: Watermarks or logos

**Where to find speaker images:**
- Official website or social media
- YouTube channel avatars
- Publisher/author pages
- Wikipedia (check license)
- Google Images (filter: "Labeled for reuse")

**If no image available:**
- Generate placeholder with fix script
- Use solid color + text (speaker name)
- Use brand logo if speaker is organization

### **Collection Images**

**What makes a good collection cover:**
- ✅ Visually distinct from other collections
- ✅ Easy to read text (if using text)
- ✅ Consistent style across your library
- ✅ Square format (600x600 minimum)
- ❌ Avoid: Tiny text that's hard to read
- ❌ Avoid: Too busy or cluttered
- ❌ Avoid: Very similar to other covers

**Design options:**
1. **Official artwork** - Use if available
2. **Text-based** - Speaker name + collection title on gradient
3. **Photo-based** - Relevant image + text overlay
4. **Minimalist** - Solid color + icon + title

---

## 📝 Audio File Guidelines

### **Supported Formats**

✅ **Recommended:**
- `mp3` - Best compatibility (recommended)
- `m4a` - Good quality, smaller files

✅ **Also supported:**
- `wav` - Lossless, very large files
- `flac` - Lossless, compressed
- `aac` - Good quality
- `ogg` - Open format

### **Audio Quality Guidelines**

**Recommended settings:**
- **Bitrate:** 128 kbps minimum, 192 kbps recommended
- **Sample Rate:** 44100 Hz (standard)
- **Channels:** Mono (for speech) or Stereo
- **Format:** MP3 CBR (Constant Bit Rate)

**File size estimates:**
- 1 hour lecture @ 128 kbps ≈ 55 MB
- 1 hour lecture @ 192 kbps ≈ 83 MB

### **Re-encoding Audio (If Needed)**

If audio quality is poor or format is wrong:

```bash
# Convert to MP3 @ 128 kbps
ffmpeg -i input.wav -c:a libmp3lame -b:a 128k output.mp3

# Convert to MP3 @ 192 kbps (higher quality)
ffmpeg -i input.m4a -c:a libmp3lame -b:a 192k output.mp3

# Normalize audio volume
ffmpeg -i input.mp3 -af "volume=1.5" output.mp3
```

---

## 🔧 Troubleshooting

### **Problem: Speaker already exists**

```bash
# Check if speaker exists
ls "Jordan Peterson" 2>/dev/null && echo "Exists" || echo "Doesn't exist"

# If adding more collections to existing speaker
mkdir "Jordan Peterson/New Collection"
# Add images and lectures...
```

### **Problem: Images are wrong size**

```bash
# Check image dimensions
identify "Jordan Peterson/speaker.jpg"

# Resize if needed
convert "Jordan Peterson/speaker.jpg" \
  -resize 1200x1200 \
  "Jordan Peterson/speaker.jpg"
```

### **Problem: Lectures have wrong naming**

```bash
# Use fix script to auto-rename
./scripts/fix_content.sh "Jordan Peterson/Maps of Meaning"
```

### **Problem: Missing thumbnails**

```bash
# Generate all missing thumbnails
./scripts/fix_content.sh "Jordan Peterson"
```

### **Problem: Validation fails**

```bash
# See what's wrong
./scripts/validate_content.sh -v -f "Jordan Peterson"

# Apply fixes
./scripts/fix_content.sh "Jordan Peterson"

# Re-validate
./scripts/validate_content.sh "Jordan Peterson"
```

---

## ✅ Final Checklist Before Upload

Before running `upload_to_r2.sh`, verify:

- [ ] Speaker directory name is Title Case
- [ ] `speaker.jpg` exists and is 600x600+ pixels
- [ ] `speaker_small.jpg` exists and is 300x300+ pixels
- [ ] At least one collection directory exists
- [ ] Collection directory name is Title Case
- [ ] `collection.jpg` exists in each collection
- [ ] `collection_small.jpg` exists in each collection
- [ ] All lectures follow `NN - Title.ext` format
- [ ] All lectures are valid audio files (not corrupted)
- [ ] Validation passes: `./scripts/validate_content.sh "Speaker Name"`

---

## 📚 Quick Reference Commands

```bash
# Create new speaker structure
mkdir -p "Speaker Name/Collection Name"

# Generate placeholder images (if needed)
./scripts/fix_content.sh "Speaker Name"

# Validate before upload
./scripts/validate_content.sh "Speaker Name"

# Upload to R2
./scripts/upload_to_r2.sh --resume ~/Desktop/hobby_projects/batch/content

# Bulk rename lectures
./scripts/fix_content.sh --skip-images "Speaker Name/Collection Name"
```

---

## 🎓 Example: Complete Workflow

**Adding "Naval Ravikant" with "Almanack" collection:**

```bash
# 1. Create structure
cd ~/Desktop/hobby_projects/batch/content
mkdir -p "Naval Ravikant/Almanack"

# 2. Add speaker images
cp ~/Downloads/naval-photo.jpg "Naval Ravikant/speaker.jpg"
convert "Naval Ravikant/speaker.jpg" -resize 300x300^ -gravity center -extent 300x300 "Naval Ravikant/speaker_small.jpg"

# 3. Add collection images
cp ~/Downloads/almanack-cover.jpg "Naval Ravikant/Almanack/collection.jpg"
convert "Naval Ravikant/Almanack/collection.jpg" -resize 300x300^ -gravity center -extent 300x300 "Naval Ravikant/Almanack/collection_small.jpg"

# 4. Add lectures
cp ~/Downloads/lecture1.mp3 "Naval Ravikant/Almanack/01 - How to Get Rich.mp3"
cp ~/Downloads/lecture2.mp3 "Naval Ravikant/Almanack/02 - Happiness is Peace.mp3"
cp ~/Downloads/lecture3.mp3 "Naval Ravikant/Almanack/03 - Build Leverage.mp3"

# 5. Validate
./scripts/validate_content.sh "Naval Ravikant"

# 6. Upload
./scripts/upload_to_r2.sh --resume ~/Desktop/hobby_projects/batch/content
```

---

## 🚀 You're Ready!

Now you know exactly what's needed to add new speakers. Follow this checklist every time and your content will always be properly structured and ready for upload!

**Key takeaway:** Structure is everything! If you follow the naming conventions and have the required images, the scripts will handle the rest.
