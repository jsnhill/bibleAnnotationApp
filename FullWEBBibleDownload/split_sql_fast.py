#!/usr/bin/env python3
"""
Fast SQL file splitter - reads line by line (memory efficient)

Usage: python3 split_sql_fast.py bible_import.sql
"""

import sys
import os

def split_sql_fast(input_file, verses_per_file=5000):
    """Split SQL file by counting value rows"""
    
    print(f"Splitting {input_file}...")
    
    base_name = os.path.splitext(input_file)[0]
    
    current_part = 1
    verse_count = 0
    output_file = None
    outfile = None
    in_values = False
    
    with open(input_file, 'r', encoding='utf-8') as infile:
        for line in infile:
            
            # Start a new file if needed
            if output_file is None:
                output_file = f"{base_name}_part{current_part}.sql"
                outfile = open(output_file, 'w', encoding='utf-8')
                outfile.write(f"-- Part {current_part}\n\n")
                outfile.write("BEGIN;\n\n")
                print(f"Creating {output_file}...")
            
            # Check if this is a VALUES line
            if "INSERT INTO bible_verses" in line:
                in_values = True
                outfile.write(line)
                continue
            
            # Count verses (lines starting with parentheses)
            if in_values and line.strip().startswith('('):
                verse_count += 1
                outfile.write(line)
                
                # Check if we've reached the limit
                if verse_count >= verses_per_file:
                    # Close current file
                    outfile.write("\nCOMMIT;\n")
                    outfile.close()
                    print(f"  ✓ Completed part {current_part} ({verse_count} verses)")
                    
                    # Reset for next file
                    current_part += 1
                    verse_count = 0
                    output_file = None
                    in_values = False
            else:
                outfile.write(line)
    
    # Close final file
    if outfile and not outfile.closed:
        outfile.write("\nCOMMIT;\n")
        outfile.close()
        print(f"  ✓ Completed part {current_part} ({verse_count} verses)")
    
    print()
    print("=" * 60)
    print("✅ Split complete!")
    print(f"   Created {current_part} files")
    print("=" * 60)
    print()
    print("📝 Import each file in order in Supabase SQL Editor")

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python3 split_sql_fast.py bible_import.sql")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    if not os.path.exists(input_file):
        print(f"❌ Error: File not found: {input_file}")
        sys.exit(1)
    
    try:
        split_sql_fast(input_file)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
