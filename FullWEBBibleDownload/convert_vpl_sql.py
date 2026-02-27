#!/usr/bin/env python3
"""
Convert BibleWorks VPL+SQL format to Supabase format

This script converts the World English Bible from the BibleWorks VPL+SQL format
downloaded from: https://eBible.org/Scriptures/engwebp_vpl.zip

Usage:
    1. Download engwebp_vpl.zip from the link above
    2. Extract the ZIP file
    3. Run: python3 convert_vpl_sql.py <path_to_sql_file> bible_import.sql

The VPL format typically includes:
    - A SQL file with INSERT statements
    - Book names may be abbreviated or use IDs
    - Format: INSERT INTO verses VALUES (book, chapter, verse, text);
"""

import sys
import re
import os

# Complete book name mapping for all Bible books
BOOK_NAMES = {
    # Old Testament - Full names
    'Genesis': 'Genesis', 'GEN': 'Genesis', 'Gen': 'Genesis',
    'Exodus': 'Exodus', 'EXO': 'Exodus', 'Exod': 'Exodus', 'Exo': 'Exodus',
    'Leviticus': 'Leviticus', 'LEV': 'Leviticus', 'Lev': 'Leviticus',
    'Numbers': 'Numbers', 'NUM': 'Numbers', 'Num': 'Numbers',
    'Deuteronomy': 'Deuteronomy', 'DEU': 'Deuteronomy', 'Deut': 'Deuteronomy',
    'Joshua': 'Joshua', 'JOS': 'Joshua', 'Josh': 'Joshua',
    'Judges': 'Judges', 'JDG': 'Judges', 'Judg': 'Judges',
    'Ruth': 'Ruth', 'RUT': 'Ruth',
    '1 Samuel': '1 Samuel', '1SA': '1 Samuel', '1Sam': '1 Samuel', '1 Sam': '1 Samuel',
    '2 Samuel': '2 Samuel', '2SA': '2 Samuel', '2Sam': '2 Samuel', '2 Sam': '2 Samuel',
    '1 Kings': '1 Kings', '1KI': '1 Kings', '1Kgs': '1 Kings', '1 Kgs': '1 Kings',
    '2 Kings': '2 Kings', '2KI': '2 Kings', '2Kgs': '2 Kings', '2 Kgs': '2 Kings',
    '1 Chronicles': '1 Chronicles', '1CH': '1 Chronicles', '1Chr': '1 Chronicles', '1 Chr': '1 Chronicles',
    '2 Chronicles': '2 Chronicles', '2CH': '2 Chronicles', '2Chr': '2 Chronicles', '2 Chr': '2 Chronicles',
    'Ezra': 'Ezra', 'EZR': 'Ezra',
    'Nehemiah': 'Nehemiah', 'NEH': 'Nehemiah', 'Neh': 'Nehemiah',
    'Esther': 'Esther', 'EST': 'Esther', 'Esth': 'Esther',
    'Job': 'Job', 'JOB': 'Job',
    'Psalms': 'Psalms', 'PSA': 'Psalms', 'Ps': 'Psalms', 'Psa': 'Psalms',
    'Proverbs': 'Proverbs', 'PRO': 'Proverbs', 'Prov': 'Proverbs',
    'Ecclesiastes': 'Ecclesiastes', 'ECC': 'Ecclesiastes', 'Eccl': 'Ecclesiastes',
    'Song of Solomon': 'Song of Solomon', 'SNG': 'Song of Solomon', 'Song': 'Song of Solomon', 'SOS': 'Song of Solomon',
    'Isaiah': 'Isaiah', 'ISA': 'Isaiah', 'Isa': 'Isaiah',
    'Jeremiah': 'Jeremiah', 'JER': 'Jeremiah', 'Jer': 'Jeremiah',
    'Lamentations': 'Lamentations', 'LAM': 'Lamentations', 'Lam': 'Lamentations',
    'Ezekiel': 'Ezekiel', 'EZK': 'Ezekiel', 'Ezek': 'Ezekiel',
    'Daniel': 'Daniel', 'DAN': 'Daniel', 'Dan': 'Daniel',
    'Hosea': 'Hosea', 'HOS': 'Hosea', 'Hos': 'Hosea',
    'Joel': 'Joel', 'JOL': 'Joel',
    'Amos': 'Amos', 'AMO': 'Amos',
    'Obadiah': 'Obadiah', 'OBA': 'Obadiah', 'Obad': 'Obadiah',
    'Jonah': 'Jonah', 'JON': 'Jonah', 'Jon': 'Jonah',
    'Micah': 'Micah', 'MIC': 'Micah', 'Mic': 'Micah',
    'Nahum': 'Nahum', 'NAM': 'Nahum', 'Nah': 'Nahum',
    'Habakkuk': 'Habakkuk', 'HAB': 'Habakkuk', 'Hab': 'Habakkuk',
    'Zephaniah': 'Zephaniah', 'ZEP': 'Zephaniah', 'Zeph': 'Zephaniah',
    'Haggai': 'Haggai', 'HAG': 'Haggai', 'Hag': 'Haggai',
    'Zechariah': 'Zechariah', 'ZEC': 'Zechariah', 'Zech': 'Zechariah',
    'Malachi': 'Malachi', 'MAL': 'Malachi', 'Mal': 'Malachi',
    # New Testament
    'Matthew': 'Matthew', 'MAT': 'Matthew', 'Matt': 'Matthew', 'Mt': 'Matthew',
    'Mark': 'Mark', 'MRK': 'Mark', 'Mrk': 'Mark', 'Mk': 'Mark',
    'Luke': 'Luke', 'LUK': 'Luke', 'Luk': 'Luke', 'Lk': 'Luke',
    'John': 'John', 'JHN': 'John', 'Jn': 'John',
    'Acts': 'Acts', 'ACT': 'Acts',
    'Romans': 'Romans', 'ROM': 'Romans', 'Rom': 'Romans',
    '1 Corinthians': '1 Corinthians', '1CO': '1 Corinthians', '1Cor': '1 Corinthians', '1 Cor': '1 Corinthians',
    '2 Corinthians': '2 Corinthians', '2CO': '2 Corinthians', '2Cor': '2 Corinthians', '2 Cor': '2 Corinthians',
    'Galatians': 'Galatians', 'GAL': 'Galatians', 'Gal': 'Galatians',
    'Ephesians': 'Ephesians', 'EPH': 'Ephesians', 'Eph': 'Ephesians',
    'Philippians': 'Philippians', 'PHP': 'Philippians', 'Phil': 'Philippians',
    'Colossians': 'Colossians', 'COL': 'Colossians', 'Col': 'Colossians',
    '1 Thessalonians': '1 Thessalonians', '1TH': '1 Thessalonians', '1Thess': '1 Thessalonians', '1 Thess': '1 Thessalonians',
    '2 Thessalonians': '2 Thessalonians', '2TH': '2 Thessalonians', '2Thess': '2 Thessalonians', '2 Thess': '2 Thessalonians',
    '1 Timothy': '1 Timothy', '1TI': '1 Timothy', '1Tim': '1 Timothy', '1 Tim': '1 Timothy',
    '2 Timothy': '2 Timothy', '2TI': '2 Timothy', '2Tim': '2 Timothy', '2 Tim': '2 Timothy',
    'Titus': 'Titus', 'TIT': 'Titus', 'Tit': 'Titus',
    'Philemon': 'Philemon', 'PHM': 'Philemon', 'Phlm': 'Philemon',
    'Hebrews': 'Hebrews', 'HEB': 'Hebrews', 'Heb': 'Hebrews',
    'James': 'James', 'JAS': 'James', 'Jas': 'James', 'Jas': 'James',
    '1 Peter': '1 Peter', '1PE': '1 Peter', '1Pet': '1 Peter', '1 Pet': '1 Peter',
    '2 Peter': '2 Peter', '2PE': '2 Peter', '2Pet': '2 Peter', '2 Pet': '2 Peter',
    '1 John': '1 John', '1JN': '1 John', '1Jn': '1 John', '1 Jn': '1 John',
    '2 John': '2 John', '2JN': '2 John', '2Jn': '2 John', '2 Jn': '2 John',
    '3 John': '3 John', '3JN': '3 John', '3Jn': '3 John', '3 Jn': '3 John',
    'Jude': 'Jude', 'JUD': 'Jude',
    'Revelation': 'Revelation', 'REV': 'Revelation', 'Rev': 'Revelation',
}

# Book ID to name mapping (in case the VPL uses numeric IDs)
BOOK_ID_MAP = {
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

def normalize_book_name(book):
    """Convert book abbreviation or ID to full name"""
    # Try direct lookup
    if book in BOOK_NAMES:
        return BOOK_NAMES[book]
    
    # Try as integer ID
    try:
        book_id = int(book)
        if book_id in BOOK_ID_MAP:
            return BOOK_ID_MAP[book_id]
    except ValueError:
        pass
    
    # Try case-insensitive lookup
    for key, value in BOOK_NAMES.items():
        if key.lower() == book.lower():
            return value
    
    return book  # Return as-is if not found

def clean_text(text):
    """Clean text for SQL"""
    # Remove leading/trailing quotes if present
    text = text.strip().strip('"').strip("'")
    # Escape single quotes
    text = text.replace("'", "''")
    return text

def parse_insert_line(line):
    """
    Parse various INSERT formats from VPL SQL files.
    Supports multiple formats:
    - INSERT INTO table VALUES (book, chapter, verse, 'text');
    - INSERT INTO table (book, chapter, verse, text) VALUES (...);
    - Book can be ID (1-66) or abbreviation ('GEN', 'MAT', etc.)
    """
    line = line.strip()
    
    # Pattern 1: INSERT INTO table VALUES (book, chapter, verse, text)
    pattern1 = r"INSERT\s+INTO\s+\w+\s+VALUES\s*\(\s*(['\"]?\w+['\"]?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*['\"](.*?)['\"]\s*\)"
    match = re.search(pattern1, line, re.IGNORECASE | re.DOTALL)
    
    if match:
        book = match.group(1).strip('\'"')
        chapter = match.group(2)
        verse = match.group(3)
        text = match.group(4)
        return book, chapter, verse, text
    
    # Pattern 2: INSERT INTO table (columns...) VALUES (...)
    pattern2 = r"INSERT\s+INTO\s+\w+\s*\([^)]+\)\s*VALUES\s*\(\s*(['\"]?\w+['\"]?)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*['\"](.*?)['\"]\s*\)"
    match = re.search(pattern2, line, re.IGNORECASE | re.DOTALL)
    
    if match:
        book = match.group(1).strip('\'"')
        chapter = match.group(2)
        verse = match.group(3)
        text = match.group(4)
        return book, chapter, verse, text
    
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
            outfile.write("-- Converted by convert_vpl_sql.py\n\n")
            outfile.write("BEGIN;\n\n")
            
            current_batch = []
            batch_size = 100
            
            for line_num, line in enumerate(infile, 1):
                line = line.strip()
                
                # Skip empty lines and comments
                if not line or line.startswith('--') or line.startswith('/*') or line.startswith('*/'):
                    continue
                
                # Skip DDL statements
                if re.match(r'^\s*(CREATE|DROP|ALTER|USE)\s', line, re.IGNORECASE):
                    continue
                
                # Process INSERT statements
                if re.match(r'^\s*INSERT\s', line, re.IGNORECASE):
                    result = parse_insert_line(line)
                    
                    if result:
                        book_raw, chapter, verse, text = result
                        book_name = normalize_book_name(book_raw)
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
                        if skipped <= 10:  # Only show first 10 errors
                            errors.append(f"Line {line_num}: Could not parse: {line[:100]}")
            
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
        print("\n⚠️  Some lines could not be parsed:")
        for error in errors[:5]:
            print(f"  {error}")
        if len(errors) > 5:
            print(f"  ... and {len(errors) - 5} more")
    
    print("\n📝 Next steps:")
    print("1. Open Supabase SQL Editor")
    print(f"2. Copy the contents of {output_file}")
    print("3. Paste and click 'Run'")
    print("4. Wait 1-2 minutes for import to complete")

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
        print("Usage: python3 convert_vpl_sql.py <input_sql_file> <output_sql_file>")
        print()
        print("Example:")
        print("  python3 convert_vpl_sql.py engwebp.sql bible_import.sql")
        print()
        print("Steps:")
        print("1. Download: https://eBible.org/Scriptures/engwebp_vpl.zip")
        print("2. Extract the ZIP file")
        print("3. Find the .sql file inside")
        print("4. Run this script to convert it")
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
