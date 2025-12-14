#!/bin/bash

#
# GitHub Secrets Setup Helper
# Helps you prepare and encode certificates/profiles for GitHub Secrets
#
# Usage:
#   ./scripts/setup-github-secrets.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  GitHub Secrets Setup Helper${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================================
# STEP 1: Distribution Certificate
# ============================================================================

echo -e "${GREEN}STEP 1: Distribution Certificate${NC}"
echo ""
echo "Please export your distribution certificate from Keychain Access:"
echo "1. Open Keychain Access"
echo "2. Find 'Apple Distribution: <Your Name>'"
echo "3. Expand it to show the private key"
echo "4. Select BOTH the certificate AND private key"
echo "5. Right-click → Export 2 items..."
echo "6. Save as .p12 file"
echo "7. Set a password (remember it!)"
echo ""

read -p "Path to .p12 file: " P12_PATH

if [ ! -f "$P12_PATH" ]; then
  echo -e "${RED}Error: File not found: $P12_PATH${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}Encoding certificate to base64...${NC}"
CERT_BASE64=$(base64 -i "$P12_PATH")

echo -e "${GREEN}✓ Certificate encoded!${NC}"
echo ""
echo "GitHub Secret Name: IOS_DISTRIBUTION_CERTIFICATE_P12"
echo "Copy this value to GitHub Secrets:"
echo ""
echo -e "${BLUE}$CERT_BASE64${NC}"
echo ""

# Copy to clipboard if pbcopy is available
if command -v pbcopy >/dev/null 2>&1; then
  echo "$CERT_BASE64" | pbcopy
  echo -e "${GREEN}✓ Copied to clipboard!${NC}"
fi

read -p "Press Enter to continue..."

# ============================================================================
# STEP 2: Certificate Password
# ============================================================================

echo ""
echo -e "${GREEN}STEP 2: Certificate Password${NC}"
echo ""
read -sp "Enter the password you set for the .p12 file: " CERT_PASSWORD
echo ""
echo ""
echo "GitHub Secret Name: IOS_CERTIFICATE_PASSWORD"
echo "Value: [password is hidden for security]"
echo ""
read -p "Press Enter to continue..."

# ============================================================================
# STEP 3: Provisioning Profile
# ============================================================================

echo ""
echo -e "${GREEN}STEP 3: Provisioning Profile${NC}"
echo ""
echo "Provisioning profiles are located at:"
echo "~/Library/MobileDevice/Provisioning Profiles/"
echo ""
echo "Listing available profiles:"
ls -1 ~/Library/MobileDevice/Provisioning\ Profiles/ 2>/dev/null || echo "No profiles found"
echo ""

read -p "Enter profile filename (or full path): " PROFILE_INPUT

# Check if it's a full path or just filename
if [ -f "$PROFILE_INPUT" ]; then
  PROFILE_PATH="$PROFILE_INPUT"
elif [ -f "$HOME/Library/MobileDevice/Provisioning Profiles/$PROFILE_INPUT" ]; then
  PROFILE_PATH="$HOME/Library/MobileDevice/Provisioning Profiles/$PROFILE_INPUT"
else
  echo -e "${RED}Error: Profile not found${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}Encoding provisioning profile to base64...${NC}"
PROFILE_BASE64=$(base64 -i "$PROFILE_PATH")

echo -e "${GREEN}✓ Profile encoded!${NC}"
echo ""
echo "GitHub Secret Name: IOS_PROVISIONING_PROFILE"
echo "Copy this value to GitHub Secrets:"
echo ""
echo -e "${BLUE}${PROFILE_BASE64:0:100}...${NC} (truncated for display)"
echo ""

# Copy to clipboard
if command -v pbcopy >/dev/null 2>&1; then
  echo "$PROFILE_BASE64" | pbcopy
  echo -e "${GREEN}✓ Copied to clipboard!${NC}"
fi

read -p "Press Enter to continue..."

# ============================================================================
# STEP 4: App Store Connect API Key
# ============================================================================

echo ""
echo -e "${GREEN}STEP 4: App Store Connect API Key${NC}"
echo ""
echo "You need to create an API key in App Store Connect:"
echo "1. Go to: https://appstoreconnect.apple.com"
echo "2. Users and Access → Keys (under Integrations)"
echo "3. Click '+' to generate new key"
echo "4. Name: 'GitHub Actions'"
echo "5. Access: App Manager"
echo "6. Download the .p8 file"
echo ""

read -p "Path to .p8 file: " P8_PATH

if [ ! -f "$P8_PATH" ]; then
  echo -e "${RED}Error: File not found: $P8_PATH${NC}"
  exit 1
fi

API_KEY_CONTENT=$(cat "$P8_PATH")

echo ""
echo "GitHub Secret Name: APP_STORE_CONNECT_API_KEY"
echo "Copy this value to GitHub Secrets:"
echo ""
echo -e "${BLUE}$API_KEY_CONTENT${NC}"
echo ""

if command -v pbcopy >/dev/null 2>&1; then
  echo "$API_KEY_CONTENT" | pbcopy
  echo -e "${GREEN}✓ Copied to clipboard!${NC}"
fi

echo ""
read -p "Enter Key ID (from App Store Connect): " API_KEY_ID
read -p "Enter Issuer ID (from App Store Connect): " API_ISSUER_ID

echo ""
echo "GitHub Secret Name: APP_STORE_CONNECT_API_KEY_ID"
echo "Value: $API_KEY_ID"
echo ""
echo "GitHub Secret Name: APP_STORE_CONNECT_API_ISSUER_ID"
echo "Value: $API_ISSUER_ID"
echo ""

read -p "Press Enter to continue..."

# ============================================================================
# STEP 5: Summary
# ============================================================================

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  SUMMARY - Add These Secrets to GitHub${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Go to: GitHub Repository → Settings → Secrets and variables → Actions"
echo ""
echo "Add these secrets:"
echo ""
echo "1. IOS_DISTRIBUTION_CERTIFICATE_P12"
echo "   Value: (base64 encoded certificate - in clipboard)"
echo ""
echo "2. IOS_CERTIFICATE_PASSWORD"
echo "   Value: [the password you entered]"
echo ""
echo "3. IOS_PROVISIONING_PROFILE"
echo "   Value: (base64 encoded profile - in clipboard)"
echo ""
echo "4. KEYCHAIN_PASSWORD"
echo "   Value: (create a random password, min 8 characters)"
echo ""
echo "5. APPLE_TEAM_ID"
echo "   Value: (found in App Store Connect → Membership)"
echo ""
echo "6. APP_STORE_CONNECT_API_KEY_ID"
echo "   Value: $API_KEY_ID"
echo ""
echo "7. APP_STORE_CONNECT_API_ISSUER_ID"
echo "   Value: $API_ISSUER_ID"
echo ""
echo "8. APP_STORE_CONNECT_API_KEY"
echo "   Value: (contents of .p8 file - in clipboard)"
echo ""
echo -e "${YELLOW}Don't forget to also add your EXPO_PUBLIC_* environment variables!${NC}"
echo ""
echo "See docs/GITHUB_ACTIONS.md for complete list."
echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
