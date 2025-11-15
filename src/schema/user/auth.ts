import { email, InferInput, minLength, object, pipe, safeParse, string, union } from "valibot";

const emailSchema = pipe(string(), email("Correo invalido"));
const usernameSchema = pipe(string(), minLength(4,"El nombre de usuario es muy corto"));

const authSchema = object({
    account: union([emailSchema, usernameSchema]),
    password: pipe(string(), minLength(6))
});

export type AuthSchema = InferInput<typeof authSchema>;

export const validateAuth = (imput: unknown) => {
    return safeParse(authSchema, imput)
};