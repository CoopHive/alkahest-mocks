#!/bin/bash

# Script to rename all comment instances of statement/statements to obligation/obligations
echo "Starting comment statement -> obligation rename across the codebase..."

# Find all files that contain statement in comments
files_with_statement_comments=$(grep -r -l "// .*statement\|// .*statements\|\* .*statement" --include="*.sol" --include="*.rs" --include="*.ts" --include="*.js" . | grep -v node_modules | grep -v lib/openzeppelin-contracts | grep -v lib/eas-contracts | sort -u)

echo "Found files with statement comments:"
echo "$files_with_statement_comments"

count=0
total=$(echo "$files_with_statement_comments" | wc -w)

for file in $files_with_statement_comments; do
    if [ -f "$file" ]; then
        echo "Processing: $file"
        
        # Check if file actually contains statement in comments
        if grep -q "// .*statement\|// .*statements\|\* .*statement" "$file"; then
            ((count++))
            
            # Handle different operating systems
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' 's|// \(.*\)statement contract\(.*\)|// \1obligation contract\2|g' "$file"
                sed -i '' 's|// \(.*\)statement\([^s]\)|// \1obligation\2|g' "$file"
                sed -i '' 's|// \(.*\)statements|// \1obligations|g' "$file"
                sed -i '' 's|// \(.*\)statement$|// \1obligation|g' "$file"
                sed -i '' 's|\* \(.*\)statement validations|* \1obligation validations|g' "$file"
                sed -i '' 's|// Create statement data|// Create obligation data|g' "$file"
                sed -i '' 's|// Make a statement|// Make an obligation|g' "$file"
                sed -i '' 's|// Deploy statements|// Deploy obligations|g' "$file"
                sed -i '' 's|// Check statement|// Check obligation|g' "$file"
                sed -i '' 's|// Create a new provision statement|// Create a new provision obligation|g' "$file"
                sed -i '' 's|// Update the provision statement|// Update the provision obligation|g' "$file"
                sed -i '' 's|// Then create the escrow statement|// Then create the escrow obligation|g' "$file"
                sed -i '' 's|// First check if the statement is confirmed|// First check if the obligation is confirmed|g' "$file"
                sed -i '' 's|// Check if the statement is intended|// Check if the obligation is intended|g' "$file"
            else
                # Linux
                sed -i 's|// \(.*\)statement contract\(.*\)|// \1obligation contract\2|g' "$file"
                sed -i 's|// \(.*\)statement\([^s]\)|// \1obligation\2|g' "$file"
                sed -i 's|// \(.*\)statements|// \1obligations|g' "$file"
                sed -i 's|// \(.*\)statement$|// \1obligation|g' "$file"
                sed -i 's|\* \(.*\)statement validations|* \1obligation validations|g' "$file"
                sed -i 's|// Create statement data|// Create obligation data|g' "$file"
                sed -i 's|// Make a statement|// Make an obligation|g' "$file"
                sed -i 's|// Deploy statements|// Deploy obligations|g' "$file"
                sed -i 's|// Check statement|// Check obligation|g' "$file"
                sed -i 's|// Create a new provision statement|// Create a new provision obligation|g' "$file"
                sed -i 's|// Update the provision statement|// Update the provision obligation|g' "$file"
                sed -i 's|// Then create the escrow statement|// Then create the escrow obligation|g' "$file"
                sed -i 's|// First check if the statement is confirmed|// First check if the obligation is confirmed|g' "$file"
                sed -i 's|// Check if the statement is intended|// Check if the obligation is intended|g' "$file"
            fi
            
            echo "✅ Updated $file"
        fi
    fi
done

echo "✅ Processed $count out of $total files"

# Check remaining instances
remaining_statement_comments=$(grep -r "// .*statement\|// .*statements\|\* .*statement" --include="*.sol" --include="*.rs" --include="*.ts" --include="*.js" . | grep -v node_modules | grep -v lib/openzeppelin-contracts | grep -v lib/eas-contracts | wc -l)
echo "Remaining statement instances in comments: $remaining_statement_comments"

if [ $remaining_statement_comments -eq 0 ]; then
    echo "✅ All statement instances in comments successfully renamed to obligation!"
else
    echo "⚠️  Some statement instances in comments may remain. Please review manually."
    grep -r "// .*statement\|// .*statements\|\* .*statement" --include="*.sol" --include="*.rs" --include="*.ts" --include="*.js" . | grep -v node_modules | grep -v lib/openzeppelin-contracts | grep -v lib/eas-contracts
fi
