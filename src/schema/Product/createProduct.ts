import { 
    array, boolean, enum_, InferInput, integer, minLength, number, 
    object, optional, pipe, safeParse, string, toMinValue 
} from "valibot";
import { Category } from "../../enum/category";

/**
 * Aca se define la estructura con la que los datos se envian al back.
 */

const productSchema = object({
    "title": string(),
    "description": string(),
    "category": enum_(Category),
    "price": pipe(number(), toMinValue(0)),
    "discountPercentage": optional(pipe(number(), toMinValue(0))),
    "stock": pipe(number(), integer(), toMinValue(0)),
    "brand": string(),
    "weight": pipe(number(), toMinValue(0)),
    "physical": boolean(),
    "warrantyInformation": optional(string()),
    "shippingInformation": optional(string()),
    "tags": optional(pipe(array(string()), minLength(1))),
    "images": optional(pipe(array(string()), minLength(1))), 
    "thumbnail": optional(string())
});

export type CreateProduct = InferInput<typeof productSchema>;
export type UpdateProduct = Partial<InferInput<typeof productSchema>>;

export const validateProduct = (imput: unknown) => {
    return safeParse(productSchema, imput)
};