export interface BlogPost {
  id?: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  categories: string[];
  author: string;
  createdAt: number; // UTC Timestamp in ms
  readTime: string;
  coverImage?: string;
  status?: 'draft' | 'published';
}
