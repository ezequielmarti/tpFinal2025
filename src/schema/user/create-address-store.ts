import { InferInput, object, optional, safeParse, string } from "valibot";

const addressSchema = object({
    "address": string(),
    "apartment": optional(string()),
    "city": string(),
    "zip": string(),
    "country": string()
});

const storeSchema = object({
    ...addressSchema.entries,
    "phone": optional(string())
});

export type CreateAddress = InferInput<typeof addressSchema>;

export type CreateStore = InferInput<typeof storeSchema>;

export const validateAddress = (imput: unknown) => {
    return safeParse(addressSchema, imput)
};

export const validateStore = (imput: unknown) => {
    return safeParse(storeSchema, imput)
};