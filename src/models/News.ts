export interface NewsTag {
  key: string;
  label: string;
  color: string;
}

export default interface News {
  id: number;
  title: string;
  description: string;
  pictureUrl: string;
  tag: string;
  tagLabel: string;
  tagColor: string;
  author: number | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
}
