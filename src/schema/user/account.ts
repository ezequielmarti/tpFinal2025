import { ERole } from "../../enum/role";
import { EStatus } from "../../enum/status";

export interface PartialAccountSchema {
    id: string;
    username: string;
    role: ERole;
    status: EStatus; 
}

export interface AccountSchema extends PartialAccountSchema {
    email: string;
    meta: {
        created: Date,
        updated: Date,
        deletedBy: string | null
    };
    userProfile?: UserSchema;
    businessProfile?: BusinessSchema;
    adminProfile?: AdminSchema;
    address?: AddressSchema[];
    store?: StoreSchema [];
}

export interface UserSchema {
    firstname: string;
    lastname: string;
    birth?: Date | null;
    phone?: string | null;
}

export interface BusinessSchema {
    title: string;
    bio?: string | null;
    phone: string;
    contactEmail: string;
}

export interface AdminSchema {
    publicName: string;
}

export interface AddressSchema {
    id: string;
    address: string;
    apartment?: string;
    city: string;
    zip: string;
    country: string;
}

export interface StoreSchema {
    id: string;
    address: AddressSchema;
    phone: string;
}
