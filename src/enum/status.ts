export enum Status{
  Pending = "pending-verification",
  Active = "active",
  Inactive = "inactive",
  Banned = "banned"
}

export function getStatus(value: string): Status | undefined {
  return value.toLowerCase().trim() as Status;
};
