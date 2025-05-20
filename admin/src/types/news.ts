export type News = {
    id: string;
    title: string;
    content: string;
    type: "main" | "sports";
    imageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
};