#!/bin/bash

# Script to rename all getStatement to getObligation
echo "Starting getStatement -> getObligation rename across the codebase..."

# Find all files that contain getStatement
files_with_getstatement=$(grep -r "getStatement" --include="*.sol" --include="*.rs" --include="*.ts" --include="*.js" . | cut -d: -f1 | sort -u)

total_files=0
processed_files=0

for file in $files_with_getstatement; do
    if [ -f "$file" ]; then
        total_files=$((total_files + 1))
        
        # Check if file actually contains getStatement
        if grep -q "getStatement" "$file"; then
            echo "Processing: $file"
            processed_files=$((processed_files + 1))
            
            # Use platform-appropriate sed
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' 's/getStatement/getObligation/g' "$file"
            else
                # Linux
                sed -i 's/getStatement/getObligation/g' "$file"
            fi
        fi
    fi
done

echo "✅ Processed $processed_files out of $total_files files"

# Check remaining instances
remaining_getstatement=$(grep -r "getStatement" --include="*.sol" --include="*.rs" --include="*.ts" --include="*.js" . | wc -l)
echo "Remaining getStatement instances: $remaining_getstatement"

if [ $remaining_getstatement -eq 0 ]; then
    echo "✅ All getStatement instances successfully renamed to getObligation!"
else
    echo "⚠️  Some getStatement instances may remain. Please review manually."
fi
