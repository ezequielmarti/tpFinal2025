import { array, boolean, date, enum_, nullable, number, object, optional, safeParse, string, type InferInput } from "valibot";
import { Category } from "../../enum/category";

/**
 * Aca se define la estructura de los datos que entran del back.
 */

const partialProductSchema = object({
    "id": string(),
    "title": string(),
    "description": string(),
    "category": enum_(Category),
    "price": number(),
    "discountPercentage": number(),
    "stock": number(),
    "brand": string(),
    "tags": optional(array(string())),
    "images": optional(array(string())), 
    "thumbnail": nullable(string())
});

export type PartialProductSchema = InferInput<typeof partialProductSchema>;

const storeSchema = object({
    "id": string(),
    "address": string(),
    "city": string(),
    "country": string(),
    "phone": string()

});

const reviewsSchema = object({
    "productId": string(),
    "username": string(),
    "rating": number(),
    "comment": nullable(string()),
    "date": date()
});

const metaSchema = object({
    "created": string(),
    "updated": string()
});

const productSchema = object({
    ...partialProductSchema.entries,
    "store": optional(array(storeSchema)),
    "reviews": optional(array(reviewsSchema)),
    "meta": metaSchema,
    "accountName": string(),
    "contactPhone": string(),
    "contactEmail": string(),
    "accountBio": nullable(string()),
    "weight": number(),
    "warrantyInformation": nullable(string()),
    "shippingInformation": nullable(string()),
    "physical": boolean()
});

export type ProductSchema = InferInput<typeof productSchema>;

const cartSchema = object({
    "id": string(),
    "product": array(partialProductSchema)
});

export type CartSchema = InferInput<typeof cartSchema>;

export const validateCart = (imput: unknown) => {
    return safeParse(cartSchema, imput)
};

export const validateProduct = (imput: unknown) => {
    return safeParse(productSchema, imput)
};

export const validatePartialProduct = (imput: unknown) => {
    return safeParse(partialProductSchema, imput)
};

