export interface CreateAddressSchema {
    address: string;
    apartment?: string;
    city: string;
    zip: string;
    country: string;
}

export interface CreateStoreSchema extends CreateAddressSchema {
    phone: string;
}