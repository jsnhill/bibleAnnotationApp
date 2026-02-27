export interface User {
  id: string;
  first_name: string;
  last_name: string;
  initials: string;
  created_at: string;
}

export interface BibleVerse {
  id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface Reading {
  id: string;
  book_name: string;
  chapter_number: number;
  start_date: string;
  end_date: string;
  order_index: number;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  reading_id: string;
  verse_number: number;
  comment_text: string;
  created_at: string;
  user?: User; // Joined data
}

export interface ReadingCompletion {
  id: string;
  user_id: string;
  reading_id: string;
  completed_at: string;
}

export interface VerseWithComments extends BibleVerse {
  comments: Comment[];
  userCommentCount: number;
  allCommentCount: number;
  hasUserCommented: boolean;
}
