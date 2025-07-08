#!/bin/bash

# Script to rename all StatementData instances to ObligationData

echo "Starting StatementData -> ObligationData rename across the codebase..."

# Find all files that contain StatementData
files_with_statementdata=$(grep -r "StatementData" --include="*.sol" --include="*.ts" --include="*.js" --include="*.md" . | cut -d: -f1 | sort -u)

total_files=0
updated_files=0

for file in $files_with_statementdata; do
    if [ -f "$file" ]; then
        total_files=$((total_files + 1))
        
        # Check if file actually contains StatementData
        if grep -q "StatementData" "$file"; then
            echo "Updating: $file"
            
            # Use sed to replace StatementData with ObligationData
            # On macOS, use different sed syntax
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' 's/StatementData/ObligationData/g' "$file"
            else
                sed -i 's/StatementData/ObligationData/g' "$file"
            fi
            
            updated_files=$((updated_files + 1))
        fi
    fi
done

echo "Rename complete!"
echo "Total files examined: $total_files"
echo "Files updated: $updated_files"

echo "Verifying changes..."
remaining_statementdata=$(grep -r "StatementData" --include="*.sol" --include="*.ts" --include="*.js" --include="*.md" . | wc -l)
echo "Remaining StatementData instances: $remaining_statementdata"

if [ $remaining_statementdata -eq 0 ]; then
    echo "✅ All StatementData instances successfully renamed to ObligationData!"
else
    echo "⚠️  Some StatementData instances may remain. Please review manually."
fi
