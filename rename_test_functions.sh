#!/bin/bash

# Script to rename all testCheckStatement* functions to testCheckObligation*

echo "🔄 Renaming test function names from testCheckStatement* to testCheckObligation*..."

# Find all Solidity files and rename testCheckStatement* to testCheckObligation*
find . -name "*.sol" -type f -exec sed -i '' 's/function testCheckStatement/function testCheckObligation/g' {} +

echo "✅ Successfully renamed all test function names!"

# Count the number of files that were affected
echo "📊 Files that contained testCheckStatement functions:"
grep -r "function testCheckObligation" . --include="*.sol" | cut -d: -f1 | sort | uniq | wc -l | xargs echo "Total files affected:"

echo "🔍 Summary of renamed functions:"
grep -r "function testCheckObligation" . --include="*.sol" | wc -l | xargs echo "Total functions renamed:"
