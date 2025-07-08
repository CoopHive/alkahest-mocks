#!/bin/bash

# Script to reverse the commented parameter changes - change /*obligation*/ back to /*statement*/
echo "Reversing commented parameter changes: /*obligation*/ -> /*statement*/..."

# Find all Solidity files that contain /*obligation*/ in commented parameters
files_with_commented_obligation=$(grep -r "/\*obligation\*/" --include="*.sol" . | cut -d: -f1 | sort -u)

if [ -z "$files_with_commented_obligation" ]; then
    echo "No files found with /*obligation*/ in commented parameters."
    exit 0
fi

echo "Found files with /*obligation*/ in commented parameters:"
echo "$files_with_commented_obligation"
echo ""

# Process each file
processed=0
total=$(echo "$files_with_commented_obligation" | wc -l)

for file in $files_with_commented_obligation; do
    if [ -f "$file" ]; then
        # Check if file actually contains /*obligation*/
        if grep -q "/\*obligation\*/" "$file"; then
            echo "Processing: $file"
            # Use different sed syntax based on OS
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' 's|/\*obligation\*/|/*statement*/|g' "$file"
            else
                # Linux
                sed -i 's|/\*obligation\*/|/*statement*/|g' "$file"
            fi
            ((processed++))
        fi
    fi
done

echo ""
echo "✅ Processed $processed out of $total files"

# Check for any remaining /*obligation*/ instances
remaining_obligation=$(grep -r "/\*obligation\*/" --include="*.sol" . | wc -l)
echo "Remaining /*obligation*/ instances: $remaining_obligation"

if [ $remaining_obligation -eq 0 ]; then
    echo "✅ All /*obligation*/ instances successfully reversed to /*statement*/!"
else
    echo "⚠️  Some /*obligation*/ instances may remain. Please review manually."
fi
