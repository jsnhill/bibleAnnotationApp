#!/usr/bin/env python3
"""
Convert BibleWorks VPL+SQL format (7-column version) to Supabase format

This handles the specific format from engwebp_vpl.sql:
INSERT INTO engwebp_vpl VALUES ("GN1_1","002_1_1","GEN","1","1","1","text");

Usage: python3 convert_vpl_7col.py engwebp_vpl.sql bible_import.sql
"""

import sys
import re
import os

# Book abbreviation to full name mapping
BOOK_NAMES = {
    'GEN': 'Genesis', 'EXO': 'Exodus', 'LEV': 'Leviticus', 'NUM': 'Numbers', 'DEU': 'Deuteronomy',
    'JOS': 'Joshua', 'JDG': 'Judges', 'RUT': 'Ruth', '1SA': '1 Samuel', '2SA': '2 Samuel',
    '1KI': '1 Kings', '2KI': '2 Kings', '1CH': '1 Chronicles', '2CH': '2 Chronicles',
    'EZR': 'Ezra', 'NEH': 'Nehemiah', 'EST': 'Esther', 'JOB': 'Job', 'PSA': 'Psalms', 'PRO': 'Proverbs',
    'ECC': 'Ecclesiastes', 'SNG': 'Song of Solomon', 'ISA': 'Isaiah', 'JER': 'Jeremiah', 'LAM': 'Lamentations',
    'EZK': 'Ezekiel', 'DAN': 'Daniel', 'HOS': 'Hosea', 'JOL': 'Joel', 'AMO': 'Amos', 'OBA': 'Obadiah',
    'JON': 'Jonah', 'MIC': 'Micah', 'NAM': 'Nahum', 'HAB': 'Habakkuk', 'ZEP': 'Zephaniah', 'HAG': 'Haggai',
    'ZEC': 'Zechariah', 'MAL': 'Malachi',
    'MAT': 'Matthew', 'MRK': 'Mark', 'LUK': 'Luke', 'JHN': 'John', 'ACT': 'Acts', 'ROM': 'Romans',
    '1CO': '1 Corinthians', '2CO': '2 Corinthians', 'GAL': 'Galatians', 'EPH': 'Ephesians',
    'PHP': 'Philippians', 'COL': 'Colossians', '1TH': '1 Thessalonians', '2TH': '2 Thessalonians',
    '1TI': '1 Timothy', '2TI': '2 Timothy', 'TIT': 'Titus', 'PHM': 'Philemon', 'HEB': 'Hebrews',
    'JAS': 'James', '1PE': '1 Peter', '2PE': '2 Peter', '1JN': '1 John', '2JN': '2 John', '3JN': '3 John',
    'JUD': 'Jude', 'REV': 'Revelation'
}

def clean_text(text):
    """Clean text for SQL"""
    # Remove leading/trailing quotes
    text = text.strip().strip('"').strip("'")
    # Escape single quotes for SQL
    text = text.replace("'", "''")
    # Handle escaped quotes from original
    text = text.replace('\\"', '"')
    return text

def parse_vpl_line(line):
    """
    Parse 7-column VPL format:
    INSERT INTO engwebp_vpl VALUES ("GN1_1","002_1_1","GEN","1","1","1","text");
    
    We need columns 3 (book), 4 (chapter), 5 (verse), 7 (text)
    """
    # Match: INSERT INTO table VALUES ("col1","col2","col3","col4","col5","col6","col7");
    pattern = r'INSERT\s+INTO\s+\w+\s+VALUES\s*\(\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"((?:[^"\\]|\\.)*)"\s*\)'
    
    match = re.search(pattern, line, re.IGNORECASE)
    if match:
        verse_id = match.group(1)    # col 1: e.g. "GN1_1"
        reference = match.group(2)   # col 2: e.g. "002_1_1"  
        book_abbr = match.group(3)   # col 3: e.g. "GEN" ← we need this
        chapter = match.group(4)     # col 4: e.g. "1" ← we need this
        verse = match.group(5)       # col 5: e.g. "1" ← we need this
        verse_dup = match.group(6)   # col 6: duplicate verse number
        text = match.group(7)        # col 7: text ← we need this
        
        return book_abbr, chapter, verse, text
    
    return None

def convert_file(input_file, output_file):
    """Convert VPL SQL file to Supabase format"""
    print(f"Converting {input_file}...")
    print(f"Output will be written to {output_file}")
    print()
    
    converted = 0
    skipped = 0
    errors = []
    
    with open(input_file, 'r', encoding='utf-8', errors='ignore') as infile:
        with open(output_file, 'w', encoding='utf-8') as outfile:
            # Write header
            outfile.write("-- World English Bible - Converted from VPL+SQL format\n")
            outfile.write("-- Source: https://eBible.org/Scriptures/engwebp_vpl.zip\n")
            outfile.write("-- Converted by convert_vpl_7col.py\n\n")
            outfile.write("BEGIN;\n\n")
            
            current_batch = []
            batch_size = 100
            
            for line_num, line in enumerate(infile, 1):
                line = line.strip()
                
                # Skip empty lines and comments
                if not line or line.startswith('--') or line.startswith('/*'):
                    continue
                
                # Skip DDL statements
                if re.match(r'^\s*(CREATE|DROP|ALTER|USE)\s', line, re.IGNORECASE):
                    continue
                
                # Process INSERT statements
                if re.match(r'^\s*INSERT\s', line, re.IGNORECASE):
                    result = parse_vpl_line(line)
                    
                    if result:
                        book_abbr, chapter, verse, text = result
                        book_name = BOOK_NAMES.get(book_abbr, book_abbr)
                        text_clean = clean_text(text)
                        
                        current_batch.append({
                            'book': book_name,
                            'chapter': chapter,
                            'verse': verse,
                            'text': text_clean
                        })
                        
                        converted += 1
                        
                        # Write batch when full
                        if len(current_batch) >= batch_size:
                            write_batch(outfile, current_batch)
                            current_batch = []
                        
                        # Progress indicator
                        if converted % 1000 == 0:
                            print(f"  Converted {converted} verses...")
                    else:
                        skipped += 1
                        if skipped <= 5:  # Only store first 5 errors
                            errors.append(f"Line {line_num}: {line[:100]}")
            
            # Write remaining batch
            if current_batch:
                write_batch(outfile, current_batch)
            
            outfile.write("\nCOMMIT;\n\n")
            outfile.write("-- Import complete!\n")
            outfile.write(f"-- Total verses imported: {converted}\n")
            outfile.write("-- Verify with: SELECT COUNT(*) FROM bible_verses;\n")
    
    print()
    print("=" * 60)
    print(f"✅ Conversion complete!")
    print(f"   Converted: {converted} verses")
    print(f"   Skipped: {skipped} lines")
    print(f"   Output: {output_file}")
    print("=" * 60)
    
    if errors:
        print("\n⚠️  Sample of lines that could not be parsed:")
        for error in errors:
            print(f"  {error}")
    
    print("\n📝 Next steps:")
    print("1. Open Supabase SQL Editor")
    print(f"2. Copy the contents of {output_file}")
    print("3. Paste and click 'Run'")
    print("4. Wait 1-2 minutes for import to complete")
    print("\n✨ You should have all 31,102 verses!")

def write_batch(outfile, batch):
    """Write a batch of verses as SQL INSERT"""
    if not batch:
        return
    
    outfile.write("INSERT INTO bible_verses (book_name, chapter, verse, text) VALUES\n")
    values = []
    for v in batch:
        values.append(f"  ('{v['book']}', {v['chapter']}, {v['verse']}, '{v['text']}')")
    outfile.write(',\n'.join(values))
    outfile.write(';\n\n')

def main():
    if len(sys.argv) != 3:
        print("Usage: python3 convert_vpl_7col.py <input_sql_file> <output_sql_file>")
        print()
        print("Example:")
        print("  python3 convert_vpl_7col.py engwebp_vpl.sql bible_import.sql")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"❌ Error: File not found: {input_file}")
        sys.exit(1)
    
    try:
        convert_file(input_file, output_file)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
