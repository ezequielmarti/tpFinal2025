import { CartProductSchema } from "./cart-product";

export interface CartSchema {
    id: string;
    created: Date;
    updated: Date;
    products: CartProductSchema[];
}