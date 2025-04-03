export type Event = {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  imageUrl?: string | null | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}