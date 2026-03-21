#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
IMAGE_NAME="${IMAGE_NAME:-backend}"
IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD)}"
ACR_NAME="${ACR_NAME:-jarvisacr1}"
CONTAINER_APP_NAME="${CONTAINER_APP_NAME:-jarvis-backend}"
RESOURCE_GROUP="${RESOURCE_GROUP:-jarvis}"
IMAGE_PLATFORM="${IMAGE_PLATFORM:-linux/amd64}"

if ! command -v az >/dev/null 2>&1; then
  echo "Azure CLI (az) is required but not installed."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required but not installed."
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE"
  exit 1
fi

# Collect env keys from .env (after normalizing "KEY = value" -> "KEY=value").
ENV_KEYS=()
while IFS= read -r key; do
  ENV_KEYS+=("$key")
done < <(
  sed -E \
    -e 's/\r$//' \
    -e 's/^[[:space:]]*//' \
    -e 's/[[:space:]]*=[[:space:]]*/=/' \
    "$ENV_FILE" \
    | awk -F= '
        /^$/ { next }
        /^[[:space:]]*#/ { next }
        { print $1 }
      '
)

# Load backend env vars from .env, including lines that may contain "KEY = value".
set -a
source <(
  sed -E \
    -e 's/\r$//' \
    -e 's/^[[:space:]]*//' \
    -e 's/[[:space:]]*=[[:space:]]*/=/' \
    "$ENV_FILE" \
    | awk '
        /^$/ { next }
        /^[[:space:]]*#/ { next }
        { print }
      '
)
set +a

REGISTRY="${ACR_NAME}.azurecr.io"
LOCAL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"
REMOTE_IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
ENV_VARS_ARGS=()
for key in "${ENV_KEYS[@]}"; do
  if [[ -v "$key" ]]; then
    ENV_VARS_ARGS+=("${key}=${!key}")
  fi
done

echo "Logging into Azure Container Registry: $ACR_NAME"
az acr login --name "$ACR_NAME"

echo "Building image: $LOCAL_IMAGE"
docker build --platform "$IMAGE_PLATFORM" -f "$SCRIPT_DIR/Dockerfile" -t "$LOCAL_IMAGE" "$SCRIPT_DIR"

echo "Tagging image: $REMOTE_IMAGE"
docker tag "$LOCAL_IMAGE" "$REMOTE_IMAGE"

echo "Pushing image to ACR: $REMOTE_IMAGE"
docker push "$REMOTE_IMAGE"

echo "Fetching ACR admin credentials for image pull..."
ACR_USERNAME="$(az acr credential show --name "$ACR_NAME" --query "username" -o tsv)"
ACR_PASSWORD="$(az acr credential show --name "$ACR_NAME" --query "passwords[0].value" -o tsv)"

if [[ -z "$ACR_USERNAME" || -z "$ACR_PASSWORD" ]]; then
  echo "Failed to read ACR credentials from $ACR_NAME."
  exit 1
fi

echo "Updating Container App image: $CONTAINER_APP_NAME"
echo "Setting Container App registry credentials: $REGISTRY"
az containerapp registry set \
  --name "$CONTAINER_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --server "$REGISTRY" \
  --username "$ACR_USERNAME" \
  --password "$ACR_PASSWORD" \
  --output table

echo "Updating Container App image and env vars: $CONTAINER_APP_NAME"
az containerapp update \
  --name "$CONTAINER_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --image "$REMOTE_IMAGE" \
  --set-env-vars "${ENV_VARS_ARGS[@]}" \
  --output table

echo "Done. Pushed and deployed: $REMOTE_IMAGE -> $CONTAINER_APP_NAME"
