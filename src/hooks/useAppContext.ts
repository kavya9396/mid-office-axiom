import { useParams } from "react-router-dom";

export function useAppContext() {
  const {
    businessType,
    applicationNumber,
  } = useParams();

  return {
    businessType,
    applicationNumber,
  };
}