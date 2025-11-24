export interface CreateProductSchema {
    title: string;
    description: string;
    category: string;
    price: number;
    discountPercentage?: number;
    stock: number;
    brand: string;
    weight: number;
    physical: boolean;
    warrantyInformation?: string;
    shippingInformation?: string;
    tags?: string[];
    images?: string[]; 
    thumbnail?: string;
}

export interface UpdateProductSchema extends Partial<CreateProductSchema> {
    id: string;
}
