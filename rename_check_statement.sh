#!/bin/bash

# Script to rename all checkStatement instances to checkObligation

echo "Starting checkStatement -> checkObligation rename across the codebase..."

# Find all files that contain checkStatement
files_with_checkstatement=$(grep -r "checkStatement" --include="*.sol" --include="*.ts" --include="*.js" --include="*.md" . | cut -d: -f1 | sort -u)

total_files=0
updated_files=0

for file in $files_with_checkstatement; do
    if [ -f "$file" ]; then
        total_files=$((total_files + 1))
        
        # Check if file actually contains checkStatement
        if grep -q "checkStatement" "$file"; then
            echo "Updating: $file"
            
            # Use sed to replace checkStatement with checkObligation
            # On macOS, use different sed syntax
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' 's/checkStatement/checkObligation/g' "$file"
            else
                sed -i 's/checkStatement/checkObligation/g' "$file"
            fi
            
            updated_files=$((updated_files + 1))
        fi
    fi
done

echo "Rename complete!"
echo "Total files examined: $total_files"
echo "Files updated: $updated_files"

echo "Verifying changes..."
remaining_checkstatement=$(grep -r "checkStatement" --include="*.sol" --include="*.ts" --include="*.js" --include="*.md" . | wc -l)
echo "Remaining checkStatement instances: $remaining_checkstatement"

if [ $remaining_checkstatement -eq 0 ]; then
    echo "✅ All checkStatement instances successfully renamed to checkObligation!"
else
    echo "⚠️  Some checkStatement instances may remain. Please review manually."
fi
