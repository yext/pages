#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR" || exit

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is required."
  exit 1
fi

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
fi

if ! command -v nvm >/dev/null 2>&1; then
  echo "Error: nvm is required to run the Node version matrix."
  exit 1
fi

DEFAULT_NODE_VERSIONS=("20" "22" "24")
DEFAULT_REACT_MAJORS=("18" "19")

NODE_VERSIONS=("${DEFAULT_NODE_VERSIONS[@]}")
REACT_MAJORS=("${DEFAULT_REACT_MAJORS[@]}")

PACKAGE_JSON_PATH="$ROOT_DIR/packages/pages/package.json"
LOCKFILE_PATH="$ROOT_DIR/pnpm-lock.yaml"
PACKAGE_JSON_BAK="$(mktemp)"
LOCKFILE_BAK="$(mktemp)"

cp "$PACKAGE_JSON_PATH" "$PACKAGE_JSON_BAK"
cp "$LOCKFILE_PATH" "$LOCKFILE_BAK"

INITIAL_NODE_VERSION=""
if command -v node >/dev/null 2>&1; then
  INITIAL_NODE_VERSION="$(node -v || true)"
fi

cleanup() {
  cp "$PACKAGE_JSON_BAK" "$PACKAGE_JSON_PATH"
  cp "$LOCKFILE_BAK" "$LOCKFILE_PATH"
  rm -f "$PACKAGE_JSON_BAK" "$LOCKFILE_BAK"

  if [ -n "$INITIAL_NODE_VERSION" ]; then
    nvm use "$INITIAL_NODE_VERSION" >/dev/null 2>&1 || true
  fi

  # Reinstall with restored lockfile/package settings so local deps are reset.
  pnpm i >/dev/null 2>&1 || true
}

trap cleanup EXIT

PASS_COUNT=0
FAIL_COUNT=0
MATRIX_RESULTS=()

set_react_versions() {
  local react_major="$1"
  if [ "$react_major" = "18" ]; then
    REACT_VERSION="^18.3.1"
    REACT_DOM_VERSION="^18.3.1"
    REACT_TYPES_VERSION="^18.3.12"
    REACT_DOM_TYPES_VERSION="^18.3.1"
  elif [ "$react_major" = "19" ]; then
    REACT_VERSION="^19.0.0"
    REACT_DOM_VERSION="^19.0.0"
    REACT_TYPES_VERSION="^19.0.0"
    REACT_DOM_TYPES_VERSION="^19.0.0"
  else
    echo "Error: unsupported react major '$react_major'. Expected 18 or 19."
    exit 1
  fi
}

for node_version in "${NODE_VERSIONS[@]}"; do
  echo "=== Node ${node_version} ==="
  if ! nvm install "$node_version"; then
    echo "Failed to install Node ${node_version}; skipping this Node version."
    continue
  fi

  if ! nvm use "$node_version"; then
    echo "Failed to switch to Node ${node_version}; skipping this Node version."
    continue
  fi

  if ! pnpm i; then
    echo "Dependency install failed on Node ${node_version}; skipping this Node version."
    continue
  fi

  for react_major in "${REACT_MAJORS[@]}"; do
    combo_label="Node ${node_version}, React ${react_major}"
    echo "--- ${combo_label} ---"
    set_react_versions "$react_major"

    failure_reason=""

    if ! pnpm --filter @yext/pages up \
      "react@${REACT_VERSION}" \
      "react-dom@${REACT_DOM_VERSION}" \
      "@types/react@${REACT_TYPES_VERSION}" \
      "@types/react-dom@${REACT_DOM_TYPES_VERSION}"; then
      failure_reason="failed to update React deps"
    elif ! pnpm --filter @yext/pages run build:js; then
      failure_reason="build:js failed"
    elif ! pnpm --filter @yext/pages run build:types; then
      failure_reason="build:types failed"
    elif ! pnpm --filter "./playground/*" run build-test-site; then
      failure_reason="playground build-test-site failed"
    fi

    if [ -z "$failure_reason" ]; then
      PASS_COUNT=$((PASS_COUNT + 1))
      MATRIX_RESULTS+=("PASS | ${combo_label}")
      echo "PASS: ${combo_label}"
    else
      FAIL_COUNT=$((FAIL_COUNT + 1))
      MATRIX_RESULTS+=("FAIL | ${combo_label} | ${failure_reason}")
      echo "FAIL: ${combo_label} (${failure_reason})"
    fi
  done
done

echo
echo "=== Matrix Summary ==="
if [ "${#MATRIX_RESULTS[@]}" -eq 0 ]; then
  echo "No matrix combinations were executed."
  exit 1
fi

for result in "${MATRIX_RESULTS[@]}"; do
  echo "$result"
done

TOTAL_COUNT=$((PASS_COUNT + FAIL_COUNT))
echo
echo "Total: ${TOTAL_COUNT} | Passed: ${PASS_COUNT} | Failed: ${FAIL_COUNT}"

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi

echo "Matrix run complete."
