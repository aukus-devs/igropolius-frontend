#!/bin/bash
set -e

if [ ! -f "public/fav.svg" ]; then
    echo "public/fav.svg not found"
    exit 1
fi

if ! command -v convert &> /dev/null; then
    echo "ImageMagick not installed"
    exit 1
fi

mkdir -p public

echo "favicon-16x16.png..."
convert public/fav.svg -background none -resize 16x16 public/favicon-16x16.png

echo "favicon-32x32.png..."
convert public/fav.svg -background none -resize 32x32 public/favicon-32x32.png

echo "apple-touch-icon.png..."
convert public/fav.svg -background none -resize 180x180 public/apple-touch-icon.png

echo "android-chrome-192x192.png..."
convert public/fav.svg -background none -resize 192x192 public/android-chrome-192x192.png

echo "android-chrome-512x512.png..."
convert public/fav.svg -background none -resize 512x512 public/android-chrome-512x512.png

convert public/fav.svg -resize 1200x630 -background white -gravity center -extent 1200x630 public/og-image.png

echo "Done, public/:"
echo "   - favicon-16x16.png"
echo "   - favicon-32x32.png"
echo "   - apple-touch-icon.png"
echo "   - android-chrome-192x192.png"
echo "   - android-chrome-512x512.png"
echo "   - og-image.png"

