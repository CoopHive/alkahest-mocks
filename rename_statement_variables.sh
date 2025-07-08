#!/bin/bash

# Script to rename statement variables/parameters to obligation
# This handles patterns like:
# - Attestation memory statement -> Attestation memory obligation
# - statement.property -> obligation.property
# - function parameters named statement
# - variable declarations named statement

echo "Starting statement variable/parameter -> obligation rename across the codebase..."

# Find all files that contain "statement" as variables or parameters
files_with_statement=$(grep -r "statement" --include="*.sol" --include="*.rs" --include="*.ts" --include="*.js" . | cut -d: -f1 | sort -u)

total_files=0
processed_files=0

for file in $files_with_statement; do
    if [ -f "$file" ]; then
        total_files=$((total_files + 1))
        
        # Check if file actually contains statement patterns
        if grep -E "(Attestation memory statement|statement\.|statement,|statement\)|statement\s|\(statement)" "$file" > /dev/null; then
            echo "Processing: $file"
            processed_files=$((processed_files + 1))
            
            # Use platform-appropriate sed
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                # Replace "Attestation memory statement" with "Attestation memory obligation"
                sed -i '' 's/Attestation memory statement/Attestation memory obligation/g' "$file"
                
                # Replace statement. with obligation. (property access)
                sed -i '' 's/statement\./obligation\./g' "$file"
                
                # Replace statement, with obligation, (in parameter lists)
                sed -i '' 's/statement,/obligation,/g' "$file"
                
                # Replace statement) with obligation) (end of parameter lists)
                sed -i '' 's/statement)/obligation)/g' "$file"
                
                # Replace (statement with (obligation (start of parameter lists)
                sed -i '' 's/(statement/(obligation/g' "$file"
                
                # Replace statement followed by whitespace with obligation (variable names)
                sed -i '' 's/statement\s/obligation /g' "$file"
                sed -i '' 's/statement\t/obligation\t/g' "$file"
                
                # Replace statement at end of line
                sed -i '' 's/statement$/obligation/g' "$file"
                
                # Replace statement followed by = (assignment)
                sed -i '' 's/statement =/obligation =/g' "$file"
                
                # Replace statement in function calls
                sed -i '' 's/getAttestation(statement/getAttestation(obligation/g' "$file"
                sed -i '' 's/checkObligation(statement/checkObligation(obligation/g' "$file"
                
                # Special cases for variable declarations
                sed -i '' 's/memory statement =/memory obligation =/g' "$file"
                sed -i '' 's/statement\[/obligation[/g' "$file"
                
                # Replace in specific contexts like eas.getAttestation(_statement)
                sed -i '' 's/_statement/_obligation/g' "$file"
                sed -i '' 's/statementUID/obligationUID/g' "$file"
                sed -i '' 's/statementId/obligationId/g' "$file"
                
            else
                # Linux
                sed -i 's/Attestation memory statement/Attestation memory obligation/g' "$file"
                sed -i 's/statement\./obligation\./g' "$file"
                sed -i 's/statement,/obligation,/g' "$file"
                sed -i 's/statement)/obligation)/g' "$file"
                sed -i 's/(statement/(obligation/g' "$file"
                sed -i 's/statement\s/obligation /g' "$file"
                sed -i 's/statement\t/obligation\t/g' "$file"
                sed -i 's/statement$/obligation/g' "$file"
                sed -i 's/statement =/obligation =/g' "$file"
                sed -i 's/getAttestation(statement/getAttestation(obligation/g' "$file"
                sed -i 's/checkObligation(statement/checkObligation(obligation/g' "$file"
                sed -i 's/memory statement =/memory obligation =/g' "$file"
                sed -i 's/statement\[/obligation[/g' "$file"
                sed -i 's/_statement/_obligation/g' "$file"
                sed -i 's/statementUID/obligationUID/g' "$file"
                sed -i 's/statementId/obligationId/g' "$file"
            fi
        fi
    fi
done

echo "✅ Processed $processed_files out of $total_files files"

# Check how many statement instances remain
remaining_statement=$(grep -r "statement" --include="*.sol" --include="*.rs" --include="*.ts" --include="*.js" . | grep -v "Statement" | grep -v "// " | grep -v "/\*" | wc -l)
echo "Remaining statement instances (excluding Statement class names and comments): $remaining_statement"

echo "✅ Statement variable/parameter rename completed!"
