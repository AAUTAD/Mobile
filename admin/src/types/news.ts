export type News = {
    id: string;
    title: string;
    content: string;
    imageUrl?: string | null;
    type: string;
    createdAt: Date;
    updatedAt: Date;
};
