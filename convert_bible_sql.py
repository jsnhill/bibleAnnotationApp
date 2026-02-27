#!/usr/bin/env python3
"""
Convert bible_databases SQL to Supabase format

This script converts SQL from:
https://github.com/scrollmapper/bible_databases

From format: INSERT INTO verses (book_id, chapter, verse, text) VALUES (1, 1, 1, 'text');
To format: INSERT INTO bible_verses (book_name, chapter, verse, text) VALUES ('Genesis', 1, 1, 'text');

Usage:
    python3 convert_bible_sql.py input.sql output.sql
"""

import sys
import re

BOOK_MAP = {
    1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
    6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
    11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles',
    15: 'Ezra', 16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms', 20: 'Proverbs',
    21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah', 24: 'Jeremiah', 25: 'Lamentations',
    26: 'Ezekiel', 27: 'Daniel', 28: 'Hosea', 29: 'Joel', 30: 'Amos',
    31: 'Obadiah', 32: 'Jonah', 33: 'Micah', 34: 'Nahum', 35: 'Habakkuk',
    36: 'Zephaniah', 37: 'Haggai', 38: 'Zechariah', 39: 'Malachi',
    40: 'Matthew', 41: 'Mark', 42: 'Luke', 43: 'John', 44: 'Acts',
    45: 'Romans', 46: '1 Corinthians', 47: '2 Corinthians', 48: 'Galatians', 49: 'Ephesians',
    50: 'Philippians', 51: 'Colossians', 52: '1 Thessalonians', 53: '2 Thessalonians',
    54: '1 Timothy', 55: '2 Timothy', 56: 'Titus', 57: 'Philemon', 58: 'Hebrews',
    59: 'James', 60: '1 Peter', 61: '2 Peter', 62: '1 John', 63: '2 John',
    64: '3 John', 65: 'Jude', 66: 'Revelation'
}

def convert_line(line):
    """Convert a single INSERT line"""
    # Match pattern: INSERT INTO verses VALUES (book_id, chapter, verse, 'text');
    # or: INSERT INTO `verses` VALUES (book_id, chapter, verse, 'text');
    
    pattern = r"INSERT INTO `?verses`? VALUES \((\d+),\s*(\d+),\s*(\d+),\s*('.*?')\)"
    
    match = re.search(pattern, line)
    if not match:
        return line  # Return unchanged if doesn't match
    
    book_id = int(match.group(1))
    chapter = match.group(2)
    verse = match.group(3)
    text = match.group(4)  # Already includes quotes
    
    book_name = BOOK_MAP.get(book_id, f'Unknown_{book_id}')
    
    # Generate new INSERT statement
    new_line = f"INSERT INTO bible_verses (book_name, chapter, verse, text) VALUES ('{book_name}', {chapter}, {verse}, {text});"
    
    return new_line

def convert_file(input_file, output_file):
    """Convert entire SQL file"""
    print(f"Converting {input_file} to {output_file}...")
    
    converted = 0
    unchanged = 0
    
    with open(input_file, 'r', encoding='utf-8') as infile:
        with open(output_file, 'w', encoding='utf-8') as outfile:
            # Write header
            outfile.write("-- Converted World English Bible SQL for Supabase\n")
            outfile.write("-- Original source: https://github.com/scrollmapper/bible_databases\n")
            outfile.write("-- Converted by convert_bible_sql.py\n\n")
            outfile.write("BEGIN;\n\n")
            
            for line in infile:
                line = line.strip()
                
                # Skip comments and empty lines
                if not line or line.startswith('--') or line.startswith('/*'):
                    continue
                
                # Skip CREATE TABLE and other DDL
                if line.upper().startswith(('CREATE', 'DROP', 'ALTER')):
                    continue
                
                # Convert INSERT statements
                if line.upper().startswith('INSERT'):
                    new_line = convert_line(line)
                    if new_line != line:
                        converted += 1
                    else:
                        unchanged += 1
                    outfile.write(new_line + '\n')
                    
                    # Add progress indicator
                    if converted % 1000 == 0:
                        print(f"  Converted {converted} verses...")
            
            outfile.write("\nCOMMIT;\n")
            outfile.write("\n-- Import complete!\n")
            outfile.write("-- Verify with: SELECT COUNT(*) FROM bible_verses;\n")
    
    print(f"Done! Converted {converted} INSERT statements")
    print(f"Skipped {unchanged} lines")
    print(f"Output written to {output_file}")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python3 convert_bible_sql.py input.sql output.sql")
        print()
        print("Example:")
        print("  python3 convert_bible_sql.py web_verses.sql bible_import.sql")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    try:
        convert_file(input_file, output_file)
    except FileNotFoundError:
        print(f"Error: Could not find {input_file}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
