# Import World English Bible - Simple Guide

## ✅ Using the BibleWorks VPL+SQL Format

This is the **recommended method** since it's directly from eBible.org!

### Step 1: Download the Bible Data (1 minute)

1. Go to: **https://ebible.org/find/show.php?id=engwebp**
2. Find the row that says "**BibleWorks import (VPL) + SQL**"
3. Click the link: **engwebp_vpl.zip**
4. Save the file to your computer

### Step 2: Extract the ZIP File (1 minute)

1. Unzip **engwebp_vpl.zip**
2. Look inside the extracted folder
3. Find the **.sql** file (might be named something like `engwebp.sql` or `web.sql`)

### Step 3: Convert to Supabase Format (2 minutes)

1. Open Terminal (Mac/Linux) or Command Prompt (Windows)
2. Navigate to where you saved the Bible study app files
3. Run this command:

```bash
python3 convert_vpl_sql.py path/to/extracted/file.sql bible_import.sql
```

For example:
```bash
python3 convert_vpl_sql.py ~/Downloads/engwebp_vpl/engwebp_vpl.sql bible_import.sql
```

You should see:
```
Converting engwebp.sql...
  Converted 1000 verses...
  Converted 2000 verses...
  ...
  Converted 31000 verses...
✅ Conversion complete!
   Converted: 31102 verses
   Output: bible_import.sql
```

### Step 4: Import to Supabase (2 minutes)

1. Open your Supabase project
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open the generated `bible_import.sql` file in a text editor
5. Copy ALL the contents
6. Paste into Supabase SQL Editor
7. Click **Run** (bottom right)
8. Wait 1-2 minutes - you'll see "Success. No rows returned"

### Step 5: Verify the Import (30 seconds)

In the same SQL Editor, run this:

```sql
-- Should return ~31,102
SELECT COUNT(*) FROM bible_verses;

-- Test John 3:16
SELECT * FROM bible_verses 
WHERE book_name = 'John' AND chapter = 3 AND verse = 16;

-- Test Genesis 1:1
SELECT * FROM bible_verses 
WHERE book_name = 'Genesis' AND chapter = 1 AND verse = 1;
```

If you see the verses, you're done! 🎉

---

## Troubleshooting

### "python3 not found"
Try `python` instead of `python3`:
```bash
python convert_vpl_sql.py input.sql bible_import.sql
```

### "File not found"
Make sure you're using the correct path. Try:
```bash
# Mac/Linux
ls ~/Downloads/engwebp_vpl/
# Windows
dir C:\Users\YourName\Downloads\engwebp_vpl\
```

### "Can't find the .sql file"
Look for files with these names in the extracted folder:
- `engwebp.sql`
- `web.sql`  
- `verses.sql`
- Any file ending in `.sql`

### Import takes too long
This is normal! 31,000+ verses takes time. Wait 2-3 minutes.

### "Syntax error" during import
The converter should handle this. If you see errors:
1. Check that you copied the ENTIRE bible_import.sql file
2. Make sure you included the `BEGIN;` at the start and `COMMIT;` at the end
3. Try importing in smaller batches (see below)

---

## Alternative: Import in Smaller Batches

If the full import fails, you can import one book at a time:

### Option 1: Modify the converter to output one book

Edit `convert_vpl_sql.py` and add this function:

```python
def convert_single_book(input_file, book_name, output_file):
    """Convert just one book"""
    # Add filtering logic
    pass
```

### Option 2: Split the generated SQL

After running the converter:
1. Open `bible_import.sql`
2. Find the sections for different books
3. Copy one book at a time to Supabase
4. Run each separately

---

## What the Converter Does

The `convert_vpl_sql.py` script:
1. Reads the BibleWorks SQL file
2. Finds all INSERT statements
3. Converts book abbreviations to full names (GEN → Genesis)
4. Reformats for your database schema
5. Batches inserts for better performance
6. Adds BEGIN/COMMIT for transaction safety

---

## Expected Results

After successful import, you should have:
- **66 books** of the Bible
- **31,102 verses** total
- **Old Testament**: Genesis through Malachi (39 books)
- **New Testament**: Matthew through Revelation (27 books)

You can verify book counts with:
```sql
SELECT book_name, COUNT(*) as verses
FROM bible_verses
GROUP BY book_name
ORDER BY MIN(id);
```

---

## Success! What's Next?

Once your Bible is imported:
1. Go back to the app
2. Login with your shared password
3. Access the Admin Panel
4. Schedule your first reading!
5. Invite your group members

The complete World English Bible is now available for your group to study together! 📖✨
