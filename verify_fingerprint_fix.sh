#!/bin/bash

echo "==================================================="
echo "Fingerprint System - Verification Script"
echo "==================================================="
echo ""

echo "1. Checking fingerprint database..."
if [ -f "web/public/dataset_fingerprints.json" ]; then
    SIZE=$(ls -lh web/public/dataset_fingerprints.json | awk '{print $5}')
    echo "   ✓ Database file exists: $SIZE"
    
    # Check metadata
    VERSION=$(grep -o '"version": "[^"]*"' web/public/dataset_fingerprints.json | cut -d'"' -f2)
    TOTAL=$(grep -o '"total_images": [0-9]*' web/public/dataset_fingerprints.json | cut -d: -f2)
    ALGO=$(grep -o '"algorithm": "[^"]*"' web/public/dataset_fingerprints.json | cut -d'"' -f2)
    
    echo "   Version: $VERSION"
    echo "   Total images: $TOTAL"
    echo "   Algorithm: $ALGO"
    
    if [ "$TOTAL" -eq 917 ]; then
        echo "   ✓ All 917 images fingerprinted"
    else
        echo "   ⚠ Warning: Expected 917 images, found $TOTAL"
    fi
else
    echo "   ✗ Database file NOT found"
    exit 1
fi

echo ""
echo "2. Checking web server..."
SERVER_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null)
if [ "$SERVER_CODE" = "200" ]; then
    echo "   ✓ Server is running (http://localhost:3001)"
else
    echo "   ⚠ Server not responding (code: $SERVER_CODE)"
    echo "   Start with: cd web && npm run dev"
fi

echo ""
echo "3. Testing hash consistency..."
cd backend
HASH_OUTPUT=$(python -c "
from PIL import Image
import numpy as np

def generate_custom_hashes(img_array):
    if len(img_array.shape) == 3:
        grayscale = np.mean(img_array, axis=2)
    else:
        grayscale = img_array
    grayscale_flat = grayscale.flatten()
    grayscale_256 = grayscale_flat[:256]
    average = np.mean(grayscale_256)
    phash = ''.join(['1' if grayscale_256[i] >= average else '0' for i in range(len(grayscale_256))])
    return {'phash': phash.ljust(64, '0')}

img = Image.open('dataset/infertil/20251101_190430.jpg')
img_resized = img.resize((224, 224), Image.LANCZOS)
img_array = np.array(img_resized)
hashes = generate_custom_hashes(img_array)
print('✓')
print(hashes['phash'][:30])
" 2>&1)

if echo "$HASH_OUTPUT" | grep -q "✓"; then
    echo "   ✓ Hash generation working"
    HASH=$(echo "$HASH_OUTPUT" | tail -1)
    echo "   Sample phash: $HASH..."
else
    echo "   ✗ Hash generation failed"
    echo "   $HASH_OUTPUT"
fi

echo ""
echo "==================================================="
echo "Verification Complete!"
echo "==================================================="
echo ""
echo "Next Steps:"
echo "1. Open http://localhost:3001 in browser"
echo "2. Upload dataset images (should match with Purple Badge)"
echo "3. Upload new images (should use Blue Badge)"
echo ""
echo "Test images to try:"
echo "  - backend/dataset/infertil/20251101_190430.jpg"
echo "  - backend/dataset/infertil/20251101_190431.jpg"
echo "  - backend/dataset/fertil/20251024_190127.jpg"
echo ""
