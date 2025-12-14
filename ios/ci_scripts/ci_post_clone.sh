#!/bin/sh

#
# Xcode Cloud CI Script - Post Clone
# Runs after repository is cloned, before Xcode build starts
#
# This script:
# 1. Validates environment variables
# 2. Installs Node.js dependencies
# 3. Installs CocoaPods dependencies
# 4. Prepares the project for Xcode build
#

set -e  # Exit on any error
set -u  # Exit on undefined variables

# ============================================================================
# Configuration
# ============================================================================

REQUIRED_ENV_VARS=(
  "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "EXPO_PUBLIC_API_BASE_URL"
  "EXPO_PUBLIC_MEDIA_BASE_URL"
  "EXPO_PUBLIC_STREAM_BASE_URL"
  "EXPO_PUBLIC_MINIO_BASE_URL"
  "EXPO_PUBLIC_DEBUG_API"
  "EXPO_PUBLIC_ENVIRONMENT"
)

NODE_VERSION="20"  # Node.js version to use

# ============================================================================
# Logging Functions
# ============================================================================

log_info() {
  echo "ℹ️  [INFO] $1"
}

log_success() {
  echo "✅ [SUCCESS] $1"
}

log_error() {
  echo "❌ [ERROR] $1" >&2
}

log_warning() {
  echo "⚠️  [WARNING] $1"
}

log_section() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  $1"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
}

# ============================================================================
# Validation Functions
# ============================================================================

validate_environment_variables() {
  log_section "🔍 Validating Environment Variables"

  local missing_vars=()

  for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [ -z "${!var:-}" ]; then
      missing_vars+=("$var")
      log_error "Missing required environment variable: $var"
    else
      # Don't print full value for secrets, just confirm existence
      if [[ "$var" == *"KEY"* ]] || [[ "$var" == *"SECRET"* ]]; then
        log_info "$var is set (value hidden)"
      else
        log_info "$var = ${!var}"
      fi
    fi
  done

  if [ ${#missing_vars[@]} -gt 0 ]; then
    log_error "Missing ${#missing_vars[@]} required environment variable(s)"
    log_error "Please configure these in App Store Connect → Xcode Cloud → Environment"
    exit 1
  fi

  log_success "All required environment variables are present"
}

# ============================================================================
# Installation Functions
# ============================================================================

install_node() {
  log_section "📦 Installing Node.js v${NODE_VERSION}"

  # Check if Node is already installed
  if command -v node >/dev/null 2>&1; then
    local current_version=$(node --version)
    log_info "Node.js is already installed: $current_version"

    # Check if version matches
    if [[ "$current_version" == v${NODE_VERSION}.* ]]; then
      log_success "Node.js version matches required version v${NODE_VERSION}"
      return 0
    else
      log_warning "Node.js version mismatch. Required: v${NODE_VERSION}, Found: $current_version"
      log_info "Continuing with existing version..."
    fi
  else
    log_info "Node.js not found, installing via Homebrew..."

    # Install Homebrew if not present
    if ! command -v brew >/dev/null 2>&1; then
      log_info "Installing Homebrew..."
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi

    # Install Node.js
    brew install node@${NODE_VERSION}
    log_success "Node.js v${NODE_VERSION} installed"
  fi
}

install_npm_dependencies() {
  log_section "📦 Installing npm Dependencies"

  # Navigate to project root
  cd "$CI_WORKSPACE" || {
    log_error "Failed to navigate to CI_WORKSPACE: $CI_WORKSPACE"
    exit 1
  }

  log_info "Working directory: $(pwd)"
  log_info "Node version: $(node --version)"
  log_info "npm version: $(npm --version)"

  # Clean install to ensure reproducible builds
  log_info "Running npm ci (clean install)..."

  if [ -f "package-lock.json" ]; then
    npm ci || {
      log_warning "npm ci failed, falling back to npm install..."
      npm install
    }
  else
    log_warning "package-lock.json not found, using npm install..."
    npm install
  fi

  log_success "npm dependencies installed"
}

install_cocoapods() {
  log_section "🍫 Installing CocoaPods Dependencies"

  # Navigate to iOS directory
  cd "$CI_WORKSPACE/ios" || {
    log_error "Failed to navigate to iOS directory"
    exit 1
  }

  log_info "Working directory: $(pwd)"

  # Check if Podfile exists
  if [ ! -f "Podfile" ]; then
    log_error "Podfile not found in ios/ directory"
    exit 1
  fi

  # Check CocoaPods version
  if command -v pod >/dev/null 2>&1; then
    log_info "CocoaPods version: $(pod --version)"
  else
    log_error "CocoaPods not found"
    exit 1
  fi

  # Clean pods if they exist (for fresh install)
  if [ -d "Pods" ]; then
    log_info "Removing existing Pods directory..."
    rm -rf Pods
  fi

  if [ -f "Podfile.lock" ]; then
    log_info "Podfile.lock found, will use locked versions"
  else
    log_warning "Podfile.lock not found, will resolve dependencies from scratch"
  fi

  # Install pods
  log_info "Running pod install..."
  pod install --verbose || {
    log_error "pod install failed"
    exit 1
  }

  log_success "CocoaPods dependencies installed"

  # Verify installation
  if [ ! -d "Pods" ]; then
    log_error "Pods directory was not created"
    exit 1
  fi

  if [ ! -f "Elmify.xcworkspace" ]; then
    log_error "Workspace file was not created"
    exit 1
  fi

  log_success "Workspace verified: Elmify.xcworkspace"
}

# ============================================================================
# Cleanup Functions
# ============================================================================

cleanup_caches() {
  log_section "🧹 Cleaning Caches"

  cd "$CI_WORKSPACE" || exit 1

  # Clean Metro bundler cache
  if [ -d "node_modules/.cache" ]; then
    log_info "Removing Metro cache..."
    rm -rf node_modules/.cache
  fi

  # Clean temporary files
  if [ -d ".expo" ]; then
    log_info "Removing .expo cache..."
    rm -rf .expo
  fi

  log_success "Caches cleaned"
}

# ============================================================================
# Verification Functions
# ============================================================================

verify_setup() {
  log_section "✓ Verifying Setup"

  cd "$CI_WORKSPACE" || exit 1

  local errors=0

  # Check node_modules
  if [ ! -d "node_modules" ]; then
    log_error "node_modules directory not found"
    errors=$((errors + 1))
  else
    log_success "node_modules directory exists"
  fi

  # Check iOS pods
  if [ ! -d "ios/Pods" ]; then
    log_error "ios/Pods directory not found"
    errors=$((errors + 1))
  else
    log_success "ios/Pods directory exists"
  fi

  # Check workspace
  if [ ! -f "ios/Elmify.xcworkspace" ]; then
    log_error "ios/Elmify.xcworkspace not found"
    errors=$((errors + 1))
  else
    log_success "ios/Elmify.xcworkspace exists"
  fi

  if [ $errors -gt 0 ]; then
    log_error "Setup verification failed with $errors error(s)"
    exit 1
  fi

  log_success "All setup verifications passed"
}

print_summary() {
  log_section "📊 Build Summary"

  log_info "Environment: ${EXPO_PUBLIC_ENVIRONMENT}"
  log_info "API URL: ${EXPO_PUBLIC_API_BASE_URL}"
  log_info "Node.js: $(node --version)"
  log_info "npm: $(npm --version)"
  log_info "CocoaPods: $(pod --version)"
  log_info "Workspace: $(pwd)"

  log_success "Setup completed successfully"
  log_info "Xcode build will start next..."
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
  log_section "🚀 Xcode Cloud CI - Post Clone Setup"
  log_info "Repository: ${CI_WORKSPACE}"
  log_info "Branch: ${CI_BRANCH:-unknown}"
  log_info "Commit: ${CI_COMMIT:-unknown}"

  # Execute setup steps
  validate_environment_variables
  install_node
  install_npm_dependencies
  cleanup_caches
  install_cocoapods
  verify_setup
  print_summary

  log_section "✅ CI Setup Complete"

  exit 0
}

# Run main function
main "$@"
