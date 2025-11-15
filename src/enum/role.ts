export enum Role{
  User = 'user',
  Seller = 'user-seller',
  Business = 'business',
  Admin = 'admin'
};

export const RoleGroup: Record<Role, 'user' | 'business' | 'admin'> = {
  [Role.User]: 'user',
  [Role.Seller]: 'user',
  [Role.Business]: 'business',
  [Role.Admin]: 'admin'
};

export function getRoleGroup(role: Role): 'user' | 'business' | 'admin' {
  return RoleGroup[role];
};