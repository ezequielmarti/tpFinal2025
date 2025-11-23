export interface CreateReviewSchema {
    productId: string;
    rating: number;
    comment?: string;
}