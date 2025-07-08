#!/bin/bash

# Script to rename all /*statement*/ to /*obligation*/ in commented parameters
echo "Starting /*statement*/ -> /*obligation*/ rename in commented parameters..."

# Find all files that contain /*statement*/
files_with_commented_statement=$(grep -r "/\*statement\*/" --include="*.sol" . | cut -d: -f1 | sort -u)

if [ -z "$files_with_commented_statement" ]; then
    echo "No files found with /*statement*/ comments"
    exit 0
fi

echo "Files to process:"
echo "$files_with_commented_statement"
echo

# Counter for processed files
processed=0
total=$(echo "$files_with_commented_statement" | wc -l)

# Process each file
for file in $files_with_commented_statement; do
    if [ -f "$file" ]; then
        # Check if file actually contains /*statement*/
        if grep -q "/\*statement\*/" "$file"; then
            echo "Processing: $file"
            
            # Detect OS and use appropriate sed syntax
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' 's|/\*statement\*/|/*obligation*/|g' "$file"
            else
                # Linux
                sed -i 's|/\*statement\*/|/*obligation*/|g' "$file"
            fi
            
            processed=$((processed + 1))
        fi
    fi
done

echo
echo "✅ Processed $processed out of $total files"

# Check for remaining /*statement*/ instances
remaining_commented_statement=$(grep -r "/\*statement\*/" --include="*.sol" . | wc -l)
echo "Remaining /*statement*/ instances: $remaining_commented_statement"

if [ $remaining_commented_statement -eq 0 ]; then
    echo "✅ All /*statement*/ instances successfully renamed to /*obligation*/!"
else
    echo "⚠️  Some /*statement*/ instances may remain. Please review manually."
fi
