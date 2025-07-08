#!/bin/bash

echo "Renaming all 'InvalidStatement' to 'InvalidObligation'..."

# Find all relevant files and rename InvalidStatement to InvalidObligation
find . -name "*.sol" -type f -exec sed -i '' 's/InvalidStatement/InvalidObligation/g' {} +

echo "Completed renaming InvalidStatement to InvalidObligation"
echo "Files affected:"
grep -r "InvalidObligation" --include="*.sol" . | cut -d: -f1 | sort | uniq
