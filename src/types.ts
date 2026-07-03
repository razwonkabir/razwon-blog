export interface BlogPost {
  id?: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  author: string;
  createdAt: number; // UTC Timestamp in ms
  readTime: string;
}
