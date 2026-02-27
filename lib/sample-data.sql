-- Sample Bible Data for Testing
-- This includes James Chapter 1 so you can test the app immediately
-- Run this in Supabase SQL Editor after running schema.sql

-- Insert James Chapter 1
INSERT INTO bible_verses (book_name, chapter, verse, text) VALUES
('James', 1, 1, 'James, a servant of God and of the Lord Jesus Christ, to the twelve tribes which are scattered abroad: Greetings.'),
('James', 1, 2, 'Count it all joy, my brothers, when you fall into various temptations,'),
('James', 1, 3, 'knowing that the testing of your faith produces endurance.'),
('James', 1, 4, 'Let endurance have its perfect work, that you may be perfect and complete, lacking in nothing.'),
('James', 1, 5, 'But if any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach; and it will be given to him.'),
('James', 1, 6, 'But let him ask in faith, without any doubting, for he who doubts is like a wave of the sea, driven by the wind and tossed.'),
('James', 1, 7, 'For let that man not think that he will receive anything from the Lord.'),
('James', 1, 8, 'He is a double-minded man, unstable in all his ways.'),
('James', 1, 9, 'But let the brother in humble circumstances glory in his high position;'),
('James', 1, 10, 'and the rich, in that he is made humble, because like the flower in the grass, he will pass away.'),
('James', 1, 11, 'For the sun arises with the scorching wind, and withers the grass, and the flower in it falls, and the beauty of its appearance perishes. So also will the rich man fade away in his pursuits.'),
('James', 1, 12, 'Blessed is the man who endures temptation, for when he has been approved, he will receive the crown of life, which the Lord promised to those who love him.'),
('James', 1, 13, 'Let no man say when he is tempted, "I am tempted by God," for God can''t be tempted by evil, and he himself tempts no one.'),
('James', 1, 14, 'But each one is tempted, when he is drawn away by his own lust, and enticed.'),
('James', 1, 15, 'Then the lust, when it has conceived, bears sin; and the sin, when it is full grown, brings forth death.'),
('James', 1, 16, 'Don''t be deceived, my beloved brothers.'),
('James', 1, 17, 'Every good gift and every perfect gift is from above, coming down from the Father of lights, with whom can be no variation, nor turning shadow.'),
('James', 1, 18, 'Of his own will he brought us forth by the word of truth, that we should be a kind of first fruits of his creatures.'),
('James', 1, 19, 'So, then, my beloved brothers, let every man be swift to hear, slow to speak, and slow to anger;'),
('James', 1, 20, 'for the anger of man doesn''t produce the righteousness of God.'),
('James', 1, 21, 'Therefore, putting away all filthiness and overflowing of wickedness, receive with humility the implanted word, which is able to save your souls.'),
('James', 1, 22, 'But be doers of the word, and not only hearers, deluding your own selves.'),
('James', 1, 23, 'For if anyone is a hearer of the word and not a doer, he is like a man looking at his natural face in a mirror;'),
('James', 1, 24, 'for he sees himself, and goes away, and immediately forgets what kind of man he was.'),
('James', 1, 25, 'But he who looks into the perfect law of freedom, and continues, not being a hearer who forgets, but a doer of the work, this man will be blessed in what he does.'),
('James', 1, 26, 'If anyone among you thinks himself to be religious while he doesn''t bridle his tongue, but deceives his heart, this man''s religion is worthless.'),
('James', 1, 27, 'Pure religion and undefiled before our God and Father is this: to visit the fatherless and widows in their affliction, and to keep oneself unstained by the world.');

-- Insert a sample reading for James 1
-- Adjust the dates to be current for testing
INSERT INTO readings (book_name, chapter_number, start_date, end_date, order_index) VALUES
('James', 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 1);

-- Optional: Add a few more chapters for navigation testing

-- John 3 (For testing Previous/Next navigation)
INSERT INTO bible_verses (book_name, chapter, verse, text) VALUES
('John', 3, 1, 'Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.'),
('John', 3, 2, 'The same came to him by night, and said to him, "Rabbi, we know that you are a teacher come from God, for no one can do these signs that you do, unless God is with him."'),
('John', 3, 3, 'Jesus answered him, "Most certainly, I tell you, unless one is born anew, he can''t see God''s Kingdom."'),
('John', 3, 4, 'Nicodemus said to him, "How can a man be born when he is old? Can he enter a second time into his mother''s womb, and be born?"'),
('John', 3, 5, 'Jesus answered, "Most certainly I tell you, unless one is born of water and spirit, he can''t enter into God''s Kingdom.'),
('John', 3, 16, 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.');

-- Schedule John 3 for next week
INSERT INTO readings (book_name, chapter_number, start_date, end_date, order_index) VALUES
('John', 3, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '14 days', 2);

-- Psalm 23 (Short, familiar passage)
INSERT INTO bible_verses (book_name, chapter, verse, text) VALUES
('Psalms', 23, 1, 'Yahweh is my shepherd: I shall lack nothing.'),
('Psalms', 23, 2, 'He makes me lie down in green pastures. He leads me beside still waters.'),
('Psalms', 23, 3, 'He restores my soul. He guides me in the paths of righteousness for his name''s sake.'),
('Psalms', 23, 4, 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.'),
('Psalms', 23, 5, 'You prepare a table before me in the presence of my enemies. You anoint my head with oil. My cup runs over.'),
('Psalms', 23, 6, 'Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in Yahweh''s house forever.');

-- Schedule Psalm 23 for two weeks out
INSERT INTO readings (book_name, chapter_number, start_date, end_date, order_index) VALUES
('Psalms', 23, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '21 days', 3);

-- Success message
SELECT 'Sample data inserted successfully! You now have:' as message
UNION ALL
SELECT '- James 1 (current week)' as message
UNION ALL
SELECT '- John 3 (next week)' as message
UNION ALL
SELECT '- Psalm 23 (week after)' as message
UNION ALL
SELECT '' as message
UNION ALL
SELECT 'You can now test the app with real Bible content!' as message;
