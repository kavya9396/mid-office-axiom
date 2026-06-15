export type RoleGroup = {
  name: string;
  pools: string[];
};

export type UserContextResponse = {
  userId: string;
  username: string;
  businessType: string;
  roleType: string;
  roles: RoleGroup[];
  pools?: Record<string, string[]>;
};
export type PoolProps = {
  onSelectPool: (pool: string) => void;
  selectedPool: string;
  toggle: boolean;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
};

export interface tableData {
  id: number;
}
export type PoolItemProps = {
  label: string;
  value: string;
  selectedPool?: string;
  onClick: (val: string) => void;
  count?: number;
  showCount?: boolean;
};

type Pools = Record<string, string[]>;
export type RoleListResponse = {
  role?: string;
  roles?: RoleGroup[];
  roleList?: RoleGroup[];
  pools?: Pools;
};