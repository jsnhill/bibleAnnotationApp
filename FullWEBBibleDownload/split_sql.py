#!/usr/bin/env python3
"""
Split large SQL file into smaller chunks for Supabase import

Usage: python3 split_sql.py bible_import.sql

This will create multiple files:
- bible_import_part1.sql (first 5,000 verses)
- bible_import_part2.sql (next 5,000 verses)
- etc.
"""

import sys
import os
import re

def split_sql_file(input_file, verses_per_file=5000):
    """Split SQL file into smaller chunks"""
    
    print(f"Splitting {input_file} into chunks of {verses_per_file} verses...")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract all INSERT statements
    insert_pattern = r"INSERT INTO bible_verses \(book_name, chapter, verse, text\) VALUES\s*\n((?:\s*\([^)]+\),?\n?)+);"
    
    matches = re.findall(insert_pattern, content, re.MULTILINE)
    
    if not matches:
        print("❌ Could not find INSERT statements. File format may be different.")
        return
    
    print(f"Found {len(matches)} INSERT batches")
    
    # Collect all individual verse inserts
    all_verses = []
    for match in matches:
        # Split by lines and extract each verse
        lines = match.strip().split('\n')
        for line in lines:
            line = line.strip().rstrip(',').rstrip(';')
            if line and line.startswith('('):
                all_verses.append(line)
    
    total_verses = len(all_verses)
    print(f"Total verses to split: {total_verses}")
    
    # Split into chunks
    num_files = (total_verses + verses_per_file - 1) // verses_per_file
    
    print(f"Creating {num_files} files...")
    
    base_name = os.path.splitext(input_file)[0]
    
    for i in range(num_files):
        start_idx = i * verses_per_file
        end_idx = min((i + 1) * verses_per_file, total_verses)
        
        chunk = all_verses[start_idx:end_idx]
        output_file = f"{base_name}_part{i+1}.sql"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"-- World English Bible - Part {i+1} of {num_files}\n")
            f.write(f"-- Verses {start_idx + 1} to {end_idx}\n\n")
            f.write("BEGIN;\n\n")
            f.write("INSERT INTO bible_verses (book_name, chapter, verse, text) VALUES\n")
            f.write(',\n'.join(chunk))
            f.write(';\n\n')
            f.write("COMMIT;\n")
        
        print(f"  ✓ Created {output_file} ({len(chunk)} verses)")
    
    print()
    print("=" * 60)
    print("✅ Split complete!")
    print(f"   Created {num_files} files")
    print("=" * 60)
    print()
    print("📝 Next steps:")
    print(f"1. Import {base_name}_part1.sql in Supabase")
    print(f"2. Then import {base_name}_part2.sql")
    print(f"3. Continue until part{num_files}.sql")
    print("4. Each file should import in 10-20 seconds")
    print()
    print("💡 Tip: After importing all files, verify with:")
    print("   SELECT COUNT(*) FROM bible_verses;")

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python3 split_sql.py bible_import.sql")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    if not os.path.exists(input_file):
        print(f"❌ Error: File not found: {input_file}")
        sys.exit(1)
    
    split_sql_file(input_file)
