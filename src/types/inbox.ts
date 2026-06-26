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
poolData?: Record<string, tableData[]>;
};
export type InboxRequest = {
  username: string;
}
export type PoolProps = {
  onSelectPool: (pool: string) => void;
  selectedPool: string;
  toggle: boolean;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
};

export interface tableData {
  id: number;

  applicationNo: string;

  productCode?:string;
  masterPlanNo?:number;
  typeOfGroupBusiness?:string;
  sumAssured?:number;

  appliedSa: number;
  annualPremium: number;
  productType: string;

  drc: string;
  ptlr: string;

  isMedical: boolean;
  breDecision: string;
  channel: string;

  munichReMedicalDecision: string;
  hniFlag: boolean;

  roleType: string;
  state?: string;

  poolTAT?: string;
  dateAndTimeStamp?: string;
  displayName?:string;

  clientType?:string;
  caseType?:string;
  lastPool?:string;

  product?:string;
  uwName?:string;
  userId?:string;
  leaveDateFrom?:string;
  leaveDateTill?:string;
  leaveReason?:string;
  caseToReassignToUw?:string;
  reassignedUserId?:string;
  roles?:string;
  authorityLimitFrom?:string;
  authorityLimitTill?:string;
  startDate?:string;
  endDate?:string;
  status?:string;
  premium?:string;
  nameOfProposer?:string;
  nameOfLifeAssured?:string;
  plan?:string;
  caseStatus?:string;
  caseInWhichPool?:string;
  remarks?:string;
  uwDecisionDate?:string;
  dueDate?:string;
  laDecisionDate?:string;
  medicalReceivedDate?:string;
  financialReceivedDate?:string;
  clientName?:string;
  planOpted?:string;
  assignedTpa?:string;
  grievanceRaisedDate?:string;
  
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

export interface TableColumn<T = unknown> {
  key: keyof T;
  label: string;
  width?: number;
  numeric?: boolean;
}


export type PoolColumnConfig = {
  visible: string[];
  hidden: string[];
};

export type ColumnConfig = {
  visible: string[];
  hidden: string[];
};


export interface PoolRequest {
  roleName:string;
  userId: string;
  poolname: string;
}

export interface PoolResponse {
  poolData: Record<string, tableData[]>;
}