#!/bin/bash

# Script to rename Statement class instances/variables to Obligation
# This handles patterns like:
# - escrowStatement -> escrowObligation
# - paymentStatement -> paymentObligation
# - resultStatement -> resultObligation
# - testHappyPathWithStringStatementArbiter -> testHappyPathWithStringObligationArbiter

echo "Starting Statement class variables -> Obligation rename across the codebase..."

# Find all files that contain "Statement" in variable names
files_with_statement=$(grep -r "Statement" --include="*.sol" --include="*.rs" --include="*.ts" --include="*.js" . | cut -d: -f1 | sort -u)

total_files=0
processed_files=0

for file in $files_with_statement; do
    if [ -f "$file" ]; then
        total_files=$((total_files + 1))
        
        # Check if file actually contains Statement patterns (but not BaseStatement which is already handled)
        if grep -E "(escrowStatement|paymentStatement|resultStatement|StringStatement)" "$file" > /dev/null; then
            echo "Processing: $file"
            processed_files=$((processed_files + 1))
            
            # Use platform-appropriate sed
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                # Replace specific statement variable names
                sed -i '' 's/escrowStatement/escrowObligation/g' "$file"
                sed -i '' 's/paymentStatement/paymentObligation/g' "$file"
                sed -i '' 's/resultStatement/resultObligation/g' "$file"
                
                # Replace in function names
                sed -i '' 's/StringStatementArbiter/StringObligationArbiter/g' "$file"
                sed -i '' 's/StringStatement/StringObligation/g' "$file"
                
                # Replace in test function names 
                sed -i '' 's/testHappyPathWithStringStatement/testHappyPathWithStringObligation/g' "$file"
                sed -i '' 's/testMakeStatement/testMakeObligation/g' "$file"
                sed -i '' 's/makeStatement/makeObligation/g' "$file"
                sed -i '' 's/getStatement/getObligation/g' "$file"
                sed -i '' 's/reviseStatement/reviseObligation/g' "$file"
                
            else
                # Linux
                sed -i 's/escrowStatement/escrowObligation/g' "$file"
                sed -i 's/paymentStatement/paymentObligation/g' "$file"
                sed -i 's/resultStatement/resultObligation/g' "$file"
                sed -i 's/StringStatementArbiter/StringObligationArbiter/g' "$file"
                sed -i 's/StringStatement/StringObligation/g' "$file"
                sed -i 's/testHappyPathWithStringStatement/testHappyPathWithStringObligation/g' "$file"
                sed -i 's/testMakeStatement/testMakeObligation/g' "$file"
                sed -i 's/makeStatement/makeObligation/g' "$file"
                sed -i 's/getStatement/getObligation/g' "$file"
                sed -i 's/reviseStatement/reviseObligation/g' "$file"
            fi
        fi
    fi
done

echo "✅ Processed $processed_files out of $total_files files"

# Check remaining instances
remaining_statement_vars=$(grep -r "Statement" --include="*.sol" --include="*.rs" --include="*.ts" --include="*.js" . | grep -v "BaseStatement" | grep -v "// " | grep -v "/\*" | wc -l)
echo "Remaining Statement instances (excluding BaseStatement and comments): $remaining_statement_vars"

echo "✅ Statement class variable rename completed!"
