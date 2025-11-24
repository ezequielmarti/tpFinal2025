import { ECategory } from "../../enum/category";

export interface ReviewSchema { 
    productId: string;
    username: string;
    rating: number;
    comment: string | null;
    date: Date;

}

export interface PartialProductSchema {
    id: string;
    title: string;
    description: string;
    category: ECategory;
    price: number;
    discountPercentage: number;
    stock: number;
    brand: string;
    tags?: string[];
    images?: string[]; 
    thumbnail?: string;
}

export interface ProductSchema extends PartialProductSchema{
    accountName: string;
    contactPhone: string;
    contactEmail: string;
    accountBio?: string;
    store?: {
        address: string;
        city: string;
        country: string;
        phone: string;
    }[];
    reviews?: ReviewSchema[];
    meta: {
        created: Date;
        updated: Date;
    };
    weight: number;
    warrantyInformation?: string;
    shippingInformation?: string;
    physical: boolean;
}

