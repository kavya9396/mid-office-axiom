import { useAppDispatch } from "../../../store/hooks";
import type { ApplicantTab } from "../../../types/drs.types";
import { merSubmitThunk } from "../../../store/thunks/merSubmitThunk";
import MedicalSheetForm from "./MedicalSheetForm";
import { merFieldConfig } from "./merFieldConfig";

type MerFormProps = {
  applicationId: string;
  roleType: string;
  memberType: ApplicantTab;
  isEditable?: boolean;
};

const MerForm = ({ applicationId, roleType, memberType, isEditable = true }: MerFormProps) => {
  const dispatch = useAppDispatch();

  return (
    <MedicalSheetForm
      config={merFieldConfig}
      submitLabel="Submit MER"
      defaultExpandedSection="MER"
      isEditable={isEditable}
      onSubmit={async ({ testCode, fields }) => {
        const response = await dispatch(merSubmitThunk({
          applicationId,
          roleType,
          memberType,
          testCode,
          fields,
        })).unwrap();

        return response.message || "MER details submitted successfully.";
      }}
    />
  );
};

export default MerForm;
