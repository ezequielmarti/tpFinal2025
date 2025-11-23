import { ERole } from "../../enum/role";

interface AccountSchema {
    email: string;
    username: string;
    password: string;
    role: ERole;  
}

export interface CreateAdminSchema extends AccountSchema {
    publicName: string;
}

export interface CreateUserSchema extends AccountSchema {
    firstname: string;
    lastname: string;
    birth?: string;
    phone?: string;
}

export interface CreateBusinessSchema extends AccountSchema {
    title: string;
    bio?: string;
    phone: string;
    contactEmail?: string;
}

//-------------- Se definen separados para que rol no se pueda modificar por el usuario --------------------------
interface UpdateAccountSchema {
    email?: string;
    username?: string;
    password?: string;
}

export interface UpdateAdminSchema extends UpdateAccountSchema {
    publicName?: string;
}

export interface UpdateUserSchema extends UpdateAccountSchema {
    firstname?: string;
    lastname?: string;
    birth?: string;
    phone?: string;
}

export interface UpdateBusinessSchema extends UpdateAccountSchema {
    title?: string;
    bio?: string;
    phone?: string;
    contactEmail?: string;
}
