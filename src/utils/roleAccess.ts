type RoleAccess = {
  canEditFinancial: boolean;
  canEditMedical: boolean;
};

const defaultRoleAccess: RoleAccess = {
  canEditFinancial: true,
  canEditMedical: true,
};

export const roleAccessMapper: Record<string, RoleAccess> = {
  "CVT Pool": {
    canEditFinancial: false,
    canEditMedical: false,
  },
  "CPT_TASK": {
    canEditFinancial: true,
    canEditMedical: true,
  },
};

export const getRoleAccess = (roleType: string): RoleAccess => {
  return roleAccessMapper[roleType] ?? defaultRoleAccess;
};
