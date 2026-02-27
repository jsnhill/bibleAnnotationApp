# 🚀 Bible Import - Quick Reference

## Need the Full Bible? Choose ONE method:

### ⭐ EASIEST: Pre-Parsed Database (5 min)
```bash
# 1. Download from GitHub
Visit: https://github.com/scrollmapper/bible_databases
Download the WEB (World English Bible) SQL file

# 2. Convert format
python3 convert_bible_sql.py downloaded.sql bible_import.sql

# 3. Import to Supabase
Copy bible_import.sql contents into Supabase SQL Editor → Run
```

### 🐍 Python Script (10 min)
```bash
# Run the automated script
python3 import_bible.py

# Import the generated file
# Copy bible_import.sql into Supabase SQL Editor → Run
```

### 📦 Already Have Sample Data?
You're good to go! The app works great with:
- ✅ James 1
- ✅ John 3  
- ✅ Psalm 23

Add more books later as your group needs them.

---

## Verification Commands

Run these in Supabase SQL Editor after import:

```sql
-- Total verses (should be ~31,102)
SELECT COUNT(*) FROM bible_verses;

-- Verses per book
SELECT book_name, COUNT(*) as verses
FROM bible_verses
GROUP BY book_name
ORDER BY MIN(id);

-- Test specific verses
SELECT * FROM bible_verses 
WHERE book_name = 'John' AND chapter = 3 AND verse = 16;
```

---

## Quick Troubleshooting

**"Too many rows" error**
- Import in batches (one book at a time)

**Import is slow**
- Normal for 31K+ rows
- Wait 2-3 minutes
- Don't close the browser

**Apostrophe errors**
- Make sure quotes are escaped: `don't` → `don''t`

---

## 💡 Pro Tips

1. **Start small**: Use sample data, see if your group likes the app
2. **Import later**: Add full Bible only if you keep using it
3. **Batch by book**: Import books as you schedule them
4. **Verify often**: Check a few verses after each import

---

## Files Included

- `import_bible.py` - Python script (automated)
- `convert_bible_sql.py` - SQL converter (for pre-parsed DB)
- `lib/sample-data.sql` - Quick test data
- `BIBLE_IMPORT_GUIDE.md` - Complete instructions

---

## Need Help?

See **BIBLE_IMPORT_GUIDE.md** for:
- Detailed step-by-step for each method
- Complete book name mappings
- Troubleshooting guide
- Alternative approaches
