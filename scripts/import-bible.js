/**
 * Script to download and parse World English Bible data
 * 
 * This script downloads the World English Bible from eBible.org
 * and converts it into SQL INSERT statements for the bible_verses table.
 * 
 * Usage:
 * 1. Run: node scripts/import-bible.js
 * 2. This will create a file: bible-inserts.sql
 * 3. Run the SQL file in your Supabase SQL editor
 */

const https = require('https');
const fs = require('fs');

// World English Bible download URL (USFX format which is easier to parse)
const BIBLE_URL = 'https://ebible.org/Scriptures/engwebp_usfx.zip';

console.log('Bible Import Script');
console.log('==================');
console.log('');
console.log('To import the World English Bible:');
console.log('');
console.log('1. Download the Bible in a parseable format from:');
console.log('   https://ebible.org/find/show.php?id=engwebp');
console.log('');
console.log('2. Choose the "USFX XML" or "CSV" format for easier parsing');
console.log('');
console.log('3. Use the parse-bible-csv.js script (below) to convert to SQL');
console.log('');
console.log('Alternative: Manual Import via Supabase');
console.log('========================================');
console.log('If a CSV file is available, you can:');
console.log('1. Download the CSV file from eBible.org');
console.log('2. In Supabase dashboard, go to Table Editor');
console.log('3. Select bible_verses table');
console.log('4. Click "Insert" > "Import data from CSV"');
console.log('5. Map columns: book_name, chapter, verse, text');
console.log('');
console.log('Sample CSV format:');
console.log('book_name,chapter,verse,text');
console.log('Genesis,1,1,"In the beginning, God created the heavens and the earth."');
console.log('Genesis,1,2,"The earth was formless and empty..."');
console.log('');

// Create a simple CSV parser if user has downloaded the text
console.log('Or use this simple Node.js script if you have a text file:');
console.log('');

const sampleParserCode = `
// parse-bible-text.js
// Usage: node parse-bible-text.js bible.txt

const fs = require('fs');

const textFile = process.argv[2];
if (!textFile) {
  console.log('Usage: node parse-bible-text.js <bible-text-file>');
  process.exit(1);
}

const content = fs.readFileSync(textFile, 'utf8');
const lines = content.split('\\n');

let currentBook = '';
let currentChapter = 0;
let sqlStatements = [];

lines.forEach(line => {
  // Parse book names (usually in ALL CAPS or specific format)
  // Parse chapter numbers
  // Parse verse numbers and text
  // This will depend on the exact format from eBible.org
  
  // Example regex patterns (adjust based on actual format):
  const bookMatch = line.match(/^([A-Z][A-Za-z0-9 ]+)$/);
  const chapterMatch = line.match(/^Chapter (\\d+)$/);
  const verseMatch = line.match(/^(\\d+)\\s+(.+)$/);
  
  if (bookMatch) {
    currentBook = bookMatch[1].trim();
  } else if (chapterMatch) {
    currentChapter = parseInt(chapterMatch[1]);
  } else if (verseMatch && currentBook && currentChapter) {
    const verse = parseInt(verseMatch[1]);
    const text = verseMatch[2].replace(/'/g, "''"); // Escape single quotes
    
    sqlStatements.push(
      \`INSERT INTO bible_verses (book_name, chapter, verse, text) VALUES ('\${currentBook}', \${currentChapter}, \${verse}, '\${text}');\`
    );
  }
});

fs.writeFileSync('bible-inserts.sql', sqlStatements.join('\\n'));
console.log(\`Generated \${sqlStatements.length} INSERT statements in bible-inserts.sql\`);
`;

fs.writeFileSync('scripts/parse-bible-text.js', sampleParserCode);
console.log('Created scripts/parse-bible-text.js');
console.log('');
console.log('Next steps:');
console.log('1. Download Bible text from eBible.org');
console.log('2. Adjust the parser script to match the format');
console.log('3. Run: node scripts/parse-bible-text.js downloaded-bible.txt');
console.log('4. Import the generated SQL file into Supabase');
