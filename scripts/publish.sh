#!/bin/bash

if [ -z "$1" ]; then
    read -p "Enter the version: " VERSION
else
    VERSION=$1
fi

npm run build

if [ $? -ne 0 ]; then
    echo "Error: Failed to build"
    exit 1
fi

node ./scripts/version-bump.mjs "$VERSION"

if [ $? -ne 0 ]; then
    echo "Error: Failed to bump version"
    exit 1
fi

git add package.json manifest.json versions.json &&
    git commit -m "Update version to $VERSION"

git tag -a "$VERSION" -m "$VERSION" &&
    git push &&
    git push origin "$VERSION" &&
    echo "Version $VERSION updated and pushed successfully"

if [ $? -ne 0 ]; then
    echo "Error: Failed to publish version"
    exit 1
fi
