#!/bin/bash

# Script to rename all BaseStatement instances to BaseObligation

echo "Starting BaseStatement -> BaseObligation rename across the codebase..."

# Find all files that contain BaseStatement
files_with_basestatement=$(grep -r "BaseStatement" --include="*.sol" --include="*.rs" --include="*.ts" --include="*.js" --include="*.md" . | cut -d: -f1 | sort -u)

total_files=0
updated_files=0

for file in $files_with_basestatement; do
    if [ -f "$file" ]; then
        total_files=$((total_files + 1))
        
        # Check if file actually contains BaseStatement
        if grep -q "BaseStatement" "$file"; then
            echo "Updating: $file"
            
            # Use sed to replace BaseStatement with BaseObligation
            # On macOS, use different sed syntax
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' 's/BaseStatement/BaseObligation/g' "$file"
            else
                sed -i 's/BaseStatement/BaseObligation/g' "$file"
            fi
            
            updated_files=$((updated_files + 1))
        fi
    fi
done

echo "Rename complete!"
echo "Total files examined: $total_files"
echo "Files updated: $updated_files"

echo "Verifying changes..."
remaining_basestatement=$(grep -r "BaseStatement" --include="*.sol" --include="*.rs" --include="*.ts" --include="*.js" --include="*.md" . | wc -l)
echo "Remaining BaseStatement instances: $remaining_basestatement"

if [ $remaining_basestatement -eq 0 ]; then
    echo "✅ All BaseStatement instances successfully renamed to BaseObligation!"
else
    echo "⚠️  Some BaseStatement instances may remain. Please review manually."
fi
