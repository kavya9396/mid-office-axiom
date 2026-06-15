import { PATHS } from "./paths";

//Create other paths
export const getInboxPath = (businessType: string) =>
  `/${businessType}/${PATHS.INBOX}`;

export const getDRSPath = (businessType: string, appNo: string) =>
  `/${businessType}/app/${appNo}/drs`;