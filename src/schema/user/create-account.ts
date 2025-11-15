import { InferInput, object, optional, string, pipe, email, minLength, date, enum_, safeParse } from "valibot";
import { Role } from "../../enum/role";


const accountSchema = object({
    "email": pipe(string(), email()),
    "username": pipe(string(), minLength(4)),
    "password": pipe(string(), minLength(6)),
    "role": enum_(Role)
});

const adminSchema = object({
    ...accountSchema.entries,
    "publicName": string()
});

const businessSchema = object({
    ...accountSchema.entries,
    "title": string(),
    "bio": optional(string()),
    "phone": string(),
    "contactEmail": optional(pipe(string(), email()))
});

const userSchema = object({
    "firstname": string(),
    "lastname": string(),
    "birth": optional(date()),
    "phone": optional(string())
});

export type CreateUser = InferInput<typeof userSchema>;
export type UpdateUser = Partial<CreateUser>;

export type CreateBusiness = InferInput<typeof businessSchema>;
export type UpdateBusiness = Partial<CreateBusiness>;

export type CreateAdmin = InferInput<typeof adminSchema>;

export const validateUser = (imput: unknown) => {
    return safeParse(userSchema, imput)
};

export const validateBusiness = (imput: unknown) => {
    return safeParse(businessSchema, imput)
};

export const validateAdmin = (imput: unknown) => {
    return safeParse(adminSchema, imput)
};