export interface NewsTag {
  key: string;
  label: string;
  color: string;
}

export default interface News {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  tag: string;
  tagLabel: string;
  tagColor: string;
  createdAt: string;
  updatedAt: string;
}
