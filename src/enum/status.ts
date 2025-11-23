export enum EStatus{
  Pending = "pending-verification",
  Active = "active",
  Inactive = "inactive",
  Banned = "banned"
}

export function getStatus(value: string): EStatus | undefined {
  return value.toLowerCase().trim() as EStatus;
};
