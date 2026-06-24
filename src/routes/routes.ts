import { PATHS } from "./paths";

//Create other paths
export const getInboxPath = (businessType: string) =>
  `/${businessType}/${PATHS.INBOX}`;

export const getDRSPath = (businessType: string, appNo: string) =>
  `/${businessType}/app/${appNo}/drs`;

export const getPreviousPoliciesPath = (businessType: string, appNo: string) =>
  `/${businessType}/app/${appNo}/drs/previousPolicies`;

export const getMedicalPath = (businessType: string, appNo: string) =>
  `/${businessType}/app/${appNo}/drs/medical`;

export const getFinancialPath = (businessType: string, appNo: string) =>
  `/${businessType}/app/${appNo}/drs/financial`;