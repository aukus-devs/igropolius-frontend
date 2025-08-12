#!/bin/bash
set -e

if [ ! -f "public/fav.svg" ]; then
    echo "public/fav.svg not found"
    exit 1
fi

if ! command -v inkscape &> /dev/null; then
    echo "inkscape not installed"
    exit 1
fi

if ! command -v convert &> /dev/null; then
    echo "convert not installed"
    exit 1
fi

mkdir -p public

echo "favicon-16x16.png..."
inkscape -w 16 -h 16 public/fav.svg --export-png public/favicon-16x16.png --export-background-opacity=0

echo "favicon-32x32.png..."
inkscape -w 32 -h 32 public/fav.svg --export-png public/favicon-32x32.png --export-background-opacity=0

echo "favicon-48x48.png..."
inkscape -w 48 -h 48 public/fav.svg --export-png public/favicon-48x48.png --export-background-opacity=0

echo "favicon-64x64.png..."
inkscape -w 64 -h 64 public/fav.svg --export-png public/favicon-64x64.png --export-background-opacity=0

echo "favicon-96x96.png..."
inkscape -w 96 -h 96 public/fav.svg --export-png public/favicon-96x96.png --export-background-opacity=0

echo "favicon.ico..."
convert public/favicon-16x16.png public/favicon-32x32.png public/favicon-48x48.png public/favicon-64x64.png public/favicon-96x96.png public/favicon.ico

echo "apple-touch-icon.png..."
inkscape -w 180 -h 180 public/fav.svg --export-png public/apple-touch-icon.png --export-background-opacity=0

echo "android-chrome-192x192.png..."
inkscape -w 192 -h 192 public/fav.svg --export-png public/android-chrome-192x192.png --export-background-opacity=0

echo "android-chrome-512x512.png..."
inkscape -w 512 -h 512 public/fav.svg --export-png public/android-chrome-512x512.png --export-background-opacity=0
