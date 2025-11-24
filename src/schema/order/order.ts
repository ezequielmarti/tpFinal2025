import { OrderItemSchema } from "./order-items";

export interface OrderSchema {
    id: string;
    name: string;
    sellerName: string; 
    total: number;
    date: Date;
    items?: OrderItemSchema[];
}

