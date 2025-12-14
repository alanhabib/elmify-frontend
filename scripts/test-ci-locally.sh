#!/bin/bash

#
# Local CI Script Tester
# Tests the Xcode Cloud ci_scripts locally before pushing to GitHub
#
# Usage:
#   ./scripts/test-ci-locally.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${BLUE}ℹ️  [INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}✅ [SUCCESS]${NC} $1"
}

log_error() {
  echo -e "${RED}❌ [ERROR]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠️  [WARNING]${NC} $1"
}

log_section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# ============================================================================
# Setup Test Environment
# ============================================================================

setup_test_environment() {
  log_section "🔧 Setting Up Test Environment"

  # Get project root (parent of scripts directory)
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

  log_info "Project root: $PROJECT_ROOT"

  # Simulate Xcode Cloud environment variables
  export CI_WORKSPACE="$PROJECT_ROOT"
  export CI_BRANCH="$(git branch --show-current 2>/dev/null || echo 'main')"
  export CI_COMMIT="$(git rev-parse HEAD 2>/dev/null || echo 'unknown')"

  log_info "CI_WORKSPACE: $CI_WORKSPACE"
  log_info "CI_BRANCH: $CI_BRANCH"
  log_info "CI_COMMIT: ${CI_COMMIT:0:8}"

  # Load environment variables from .env if it exists
  if [ -f "$PROJECT_ROOT/.env" ]; then
    log_info "Loading environment variables from .env..."
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
    log_success "Environment variables loaded from .env"
  else
    log_error ".env file not found at $PROJECT_ROOT/.env"
    log_error "CI script requires environment variables to be set"
    exit 1
  fi
}

# ============================================================================
# Pre-Test Checks
# ============================================================================

run_pre_checks() {
  log_section "🔍 Running Pre-Test Checks"

  # Check if ci_post_clone.sh exists
  if [ ! -f "$PROJECT_ROOT/ios/ci_scripts/ci_post_clone.sh" ]; then
    log_error "ci_post_clone.sh not found"
    exit 1
  fi

  log_success "ci_post_clone.sh found"

  # Check if script is executable
  if [ ! -x "$PROJECT_ROOT/ios/ci_scripts/ci_post_clone.sh" ]; then
    log_warning "ci_post_clone.sh is not executable, fixing..."
    chmod +x "$PROJECT_ROOT/ios/ci_scripts/ci_post_clone.sh"
    log_success "Made script executable"
  fi

  # Check required tools
  local missing_tools=()

  if ! command -v node >/dev/null 2>&1; then
    missing_tools+=("node")
  fi

  if ! command -v npm >/dev/null 2>&1; then
    missing_tools+=("npm")
  fi

  if ! command -v pod >/dev/null 2>&1; then
    missing_tools+=("pod (CocoaPods)")
  fi

  if [ ${#missing_tools[@]} -gt 0 ]; then
    log_error "Missing required tools: ${missing_tools[*]}"
    exit 1
  fi

  log_success "All required tools are installed"
}

# ============================================================================
# Clean Previous Test
# ============================================================================

clean_test_artifacts() {
  log_section "🧹 Cleaning Previous Test Artifacts"

  cd "$PROJECT_ROOT"

  # Ask user if they want to clean
  log_warning "This will remove node_modules and ios/Pods"
  read -p "Do you want to continue? (y/N): " -n 1 -r
  echo

  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Skipping clean step"
    return 0
  fi

  # Remove node_modules
  if [ -d "node_modules" ]; then
    log_info "Removing node_modules..."
    rm -rf node_modules
  fi

  # Remove iOS pods
  if [ -d "ios/Pods" ]; then
    log_info "Removing ios/Pods..."
    rm -rf ios/Pods
  fi

  # Remove Podfile.lock (optional)
  # if [ -f "ios/Podfile.lock" ]; then
  #   log_info "Removing ios/Podfile.lock..."
  #   rm -f ios/Podfile.lock
  # fi

  log_success "Test artifacts cleaned"
}

# ============================================================================
# Run CI Script
# ============================================================================

run_ci_script() {
  log_section "🚀 Running CI Script"

  cd "$PROJECT_ROOT"

  log_info "Executing ci_post_clone.sh..."
  echo ""

  # Run the CI script
  if bash ios/ci_scripts/ci_post_clone.sh; then
    log_success "CI script completed successfully"
    return 0
  else
    log_error "CI script failed"
    return 1
  fi
}

# ============================================================================
# Verify Results
# ============================================================================

verify_results() {
  log_section "✓ Verifying Results"

  cd "$PROJECT_ROOT"

  local errors=0

  # Check node_modules
  if [ ! -d "node_modules" ]; then
    log_error "node_modules was not created"
    errors=$((errors + 1))
  else
    log_success "node_modules exists"
  fi

  # Check iOS pods
  if [ ! -d "ios/Pods" ]; then
    log_error "ios/Pods was not created"
    errors=$((errors + 1))
  else
    log_success "ios/Pods exists"
  fi

  # Check workspace
  if [ ! -f "ios/Elmify.xcworkspace" ]; then
    log_error "ios/Elmify.xcworkspace was not created"
    errors=$((errors + 1))
  else
    log_success "ios/Elmify.xcworkspace exists"
  fi

  # Check if workspace can be opened
  if command -v xcodebuild >/dev/null 2>&1; then
    log_info "Verifying workspace can be loaded by Xcode..."
    if xcodebuild -workspace ios/Elmify.xcworkspace -scheme Elmify -showBuildSettings >/dev/null 2>&1; then
      log_success "Workspace is valid and can be loaded"
    else
      log_error "Workspace cannot be loaded by Xcode"
      errors=$((errors + 1))
    fi
  fi

  if [ $errors -gt 0 ]; then
    log_error "Verification failed with $errors error(s)"
    return 1
  fi

  log_success "All verifications passed"
  return 0
}

# ============================================================================
# Print Summary
# ============================================================================

print_test_summary() {
  log_section "📊 Test Summary"

  log_info "✅ CI script test completed successfully"
  log_info ""
  log_info "Next steps:"
  log_info "  1. Commit ci_scripts to git:"
  log_info "     git add ios/ci_scripts/"
  log_info "     git commit -m 'Add Xcode Cloud CI scripts'"
  log_info ""
  log_info "  2. Push to GitHub:"
  log_info "     git push origin ${CI_BRANCH}"
  log_info ""
  log_info "  3. Trigger Xcode Cloud build in App Store Connect"
  log_info ""
  log_info "  4. Monitor build logs for any issues"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
  log_section "🧪 Local CI Script Test"

  setup_test_environment
  run_pre_checks
  clean_test_artifacts

  if run_ci_script; then
    if verify_results; then
      print_test_summary
      exit 0
    else
      log_error "CI script ran but verification failed"
      exit 1
    fi
  else
    log_error "CI script failed to run"
    exit 1
  fi
}

# Run main
main "$@"
