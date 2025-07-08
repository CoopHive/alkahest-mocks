#!/bin/bash

# Script to rename all statementData instances to obligationData

echo "Starting statementData -> obligationData rename across the codebase..."

# Find all files that contain statementData
files_with_statementdata=$(grep -r "statementData" --include="*.sol" --include="*.ts" --include="*.js" --include="*.md" . | cut -d: -f1 | sort -u)

total_files=0
updated_files=0

for file in $files_with_statementdata; do
    if [ -f "$file" ]; then
        total_files=$((total_files + 1))
        
        # Check if file actually contains statementData
        if grep -q "statementData" "$file"; then
            echo "Updating: $file"
            
            # Use sed to replace statementData with obligationData
            # On macOS, use different sed syntax
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' 's/statementData/obligationData/g' "$file"
            else
                sed -i 's/statementData/obligationData/g' "$file"
            fi
            
            updated_files=$((updated_files + 1))
        fi
    fi
done

echo "Rename complete!"
echo "Total files examined: $total_files"
echo "Files updated: $updated_files"

echo "Verifying changes..."
remaining_statementdata=$(grep -r "statementData" --include="*.sol" --include="*.ts" --include="*.js" --include="*.md" . | wc -l)
echo "Remaining statementData instances: $remaining_statementdata"

if [ $remaining_statementdata -eq 0 ]; then
    echo "✅ All statementData instances successfully renamed to obligationData!"
else
    echo "⚠️  Some statementData instances may remain. Please review manually."
fi
