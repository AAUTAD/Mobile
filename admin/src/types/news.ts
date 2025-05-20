export type News = {
    id: string;
    title: string;
    content: string;
    type: "main" | "sports";
    imageUrl?: string | null;
    type: string;
    createdAt: Date;
    updatedAt: Date;
};