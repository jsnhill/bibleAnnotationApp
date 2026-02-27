# Complete Bible Import Guide

There are several ways to import the full World English Bible. Choose the method that works best for you.

## 🌟 RECOMMENDED: Pre-Parsed Database (Easiest - 5 minutes)

This is by far the easiest method - someone has already done the hard work!

### Step 1: Get the Pre-Parsed Data

Go to: **https://github.com/scrollmapper/bible_databases**

This repository has the entire World English Bible already parsed into database-ready formats.

### Step 2: Download the SQL File

1. Navigate to the `WEB` (World English Bible) folder
2. Download one of these files:
   - `web_complete.sql` - Full SQL dump (recommended)
   - Or use the CSV files if you prefer

### Step 3: Adapt the SQL for Supabase

The SQL file uses a slightly different schema. Here's how to adapt it:

**Original format:**
```sql
INSERT INTO verses (book_id, chapter, verse, text) VALUES (1, 1, 1, 'text...');
```

**What you need:**
```sql
INSERT INTO bible_verses (book_name, chapter, verse, text) VALUES ('Genesis', 1, 1, 'text...');
```

**Quick Fix Script:**
Create a file `convert_sql.py`:

```python
# Read the downloaded SQL
with open('web_complete.sql', 'r') as f:
    content = f.read()

# Book ID to name mapping
book_map = {
    1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', # ... add all 66 books
    # (see full mapping below)
}

# Convert book IDs to names
# (detailed conversion script provided below)

with open('bible_import_supabase.sql', 'w') as f:
    f.write(converted_content)
```

---

## 📦 METHOD 2: Use Python Script (Medium - 10 minutes)

If you have Python installed, use the provided script.

### Step 1: Run the Import Script

```bash
python3 import_bible.py
```

This will:
1. Download the USFX XML from eBible.org
2. Parse all 31,102 verses
3. Generate `bible_import.sql`

### Step 2: Import to Supabase

1. Open the generated `bible_import.sql` file
2. Go to Supabase SQL Editor
3. Copy and paste the entire file
4. Click "Run"
5. Wait 1-2 minutes for import to complete

---

## 🔧 METHOD 3: Manual CSV Creation (Advanced)

If you prefer working with spreadsheets:

### Step 1: Download Plain Text

Download: https://eBible.org/Scriptures/engwebp_readaloud.zip

### Step 2: Convert to CSV

The plain text files are organized by chapter. You'll need to:
1. Extract the ZIP
2. Parse each file to extract verses
3. Create CSV with columns: book_name, chapter, verse, text

**Example CSV format:**
```csv
book_name,chapter,verse,text
Genesis,1,1,"In the beginning, God created the heavens and the earth."
Genesis,1,2,"The earth was formless and empty..."
```

### Step 3: Import CSV to Supabase

1. In Supabase, go to **Table Editor**
2. Select **bible_verses** table
3. Click **Insert** → **Import data from CSV**
4. Upload your CSV file
5. Map columns appropriately

---

## 🎯 METHOD 4: Incremental Import (Pragmatic)

Start with what you need and add more later!

### Why This Makes Sense:

- Your group probably won't read all 66 books immediately
- You already have James 1, John 3, Psalm 23 from sample data
- Add books as you schedule them

### How to Add Books:

**Option A: Copy from Browser Bible**

1. Go to: https://eBible.org/study/?w1=bible&t1=local:engwebp&v1=GEN1_1
2. Navigate to the book/chapter you need
3. Copy the text
4. Use this quick script to format:

```javascript
// Paste this in browser console while viewing a chapter
const verses = document.querySelectorAll('.v');
let sql = '';
verses.forEach(v => {
  const num = v.querySelector('.label').textContent;
  const text = v.querySelector('.content').textContent.replace(/'/g, "''");
  sql += `INSERT INTO bible_verses (book_name, chapter, verse, text) VALUES ('Genesis', 1, ${num}, '${text}');\n`;
});
console.log(sql);
```

**Option B: Manual Entry**

For short books or chapters, you can manually add them in Supabase Table Editor:
1. Go to **bible_verses** table
2. Click **Insert row**
3. Fill in: book_name, chapter, verse, text
4. Repeat for each verse

---

## 📋 Complete Book ID to Name Mapping

For METHOD 1 conversion, here's the complete mapping:

```python
BOOK_MAP = {
    # Old Testament
    1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
    6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
    11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles',
    15: 'Ezra', 16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalms', 20: 'Proverbs',
    21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah', 24: 'Jeremiah', 25: 'Lamentations',
    26: 'Ezekiel', 27: 'Daniel', 28: 'Hosea', 29: 'Joel', 30: 'Amos',
    31: 'Obadiah', 32: 'Jonah', 33: 'Micah', 34: 'Nahum', 35: 'Habakkuk',
    36: 'Zephaniah', 37: 'Haggai', 38: 'Zechariah', 39: 'Malachi',
    # New Testament
    40: 'Matthew', 41: 'Mark', 42: 'Luke', 43: 'John', 44: 'Acts',
    45: 'Romans', 46: '1 Corinthians', 47: '2 Corinthians', 48: 'Galatians', 49: 'Ephesians',
    50: 'Philippians', 51: 'Colossians', 52: '1 Thessalonians', 53: '2 Thessalonians',
    54: '1 Timothy', 55: '2 Timothy', 56: 'Titus', 57: 'Philemon', 58: 'Hebrews',
    59: 'James', 60: '1 Peter', 61: '2 Peter', 62: '1 John', 63: '2 John',
    64: '3 John', 65: 'Jude', 66: 'Revelation'
}
```

---

## 🚀 Quick Start Recommendation

**For fastest setup (choose one):**

1. **Want it done now?** Use sample data (James 1, John 3, Psalm 23) and start your group
2. **Want complete Bible?** Use METHOD 1 with pre-parsed database (5 minutes)
3. **Tech-savvy?** Use METHOD 2 with Python script (10 minutes)

**My recommendation:** Start with sample data, see if your group likes the app, then import the full Bible if needed.

---

## 🔍 Verification After Import

Run this in Supabase SQL Editor to verify:

```sql
-- Count total verses
SELECT COUNT(*) as total_verses FROM bible_verses;
-- Should be around 31,102 for complete Bible

-- Count verses per book
SELECT book_name, COUNT(*) as verse_count
FROM bible_verses
GROUP BY book_name
ORDER BY MIN(id);

-- Test a few known verses
SELECT * FROM bible_verses 
WHERE book_name = 'John' AND chapter = 3 AND verse = 16;

SELECT * FROM bible_verses 
WHERE book_name = 'Psalms' AND chapter = 23 AND verse = 1;

SELECT * FROM bible_verses 
WHERE book_name = 'Genesis' AND chapter = 1 AND verse = 1;
```

---

## 💡 Tips

- **Batch imports** are faster than individual inserts
- **Test with one book first** before importing all 66
- **Backup your data** before running large imports
- **Use transactions** (BEGIN/COMMIT) to ensure all-or-nothing imports
- **Check for duplicates** if you're adding to existing data

---

## 🆘 Troubleshooting

**Import fails with "out of memory"**
- Break into smaller batches (one book at a time)
- Use the Supabase API instead of SQL Editor for large imports

**Quotes/apostrophes causing errors**
- Make sure all single quotes are escaped: `'` → `''`
- Example: `don't` → `don''t`

**Book names don't match**
- Use the exact names from BOOK_MAP above
- Capitalization matters!

**Performance is slow**
- Consider adding indexes after import (not before)
- Use batch inserts (100-1000 rows at a time)

---

## 📞 Need Help?

If you get stuck:
1. Start with the sample data and make sure the app works
2. Try METHOD 1 (pre-parsed database) - it's the most reliable
3. Check the Supabase logs for specific error messages
4. Verify your schema matches `lib/schema.sql` exactly

The app works great with just a few chapters loaded - you don't need the entire Bible on day one!
