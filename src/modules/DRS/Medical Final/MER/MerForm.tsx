// import { Box, Typography } from "@mui/material";
// import {
//   forwardRef,
//   useCallback,
//   useImperativeHandle,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { useSelector } from "react-redux";
// import CustomSelect from "../../../../components/ui/Select/Select";
// import CustomTextField from "../../../../components/ui/TextField/TextField";
// import type { RootState } from "../../../../store/store";
// import type {
//   MedicalFinalConfigField,
//   MerSubSectionFieldConfig,
// } from "./merConfig";
// import {
//   getMerSubSectionFormFields,
//   PULSE_RATE_DETAILS_SECTION_LABEL,
// } from "./merConfig";

// type MerFormProps = {
//   selectedSubSection?: string;
//   fields?: MedicalFinalConfigField[];
//   applicationNo?: string;
//   isEditing?: boolean;
// };

// export type MerFormHandle = {
//   validateForm: () => boolean;
//   getFormValues: () => Record<string, string>;
//   setFormValues: (nextValues: Record<string, string>) => void;
//   beginEdit: () => void;
//   resetEdit: () => void;
//   commitEdit: () => void;
// };

// type MastersOption = {
//   code?: string;
//   description?: string;
//   value?: string | null;
//   isActive?: string;
//   type?: string;
// };

// type MasterOptionKey =
//   | "yes_no"
//   | "place_of_examination"
//   | "gender"
//   | "mer_education_sd"
//   | "mer_occupation_sd"
//   | "family_relation"
//   | "dead_or_alive";

// const MER_CONTROL_HEIGHT = 36;

// const toOptionList = (values: MastersOption[] = []) =>
//   values
//     .filter(
//       (option) =>
//         String(option.isActive ?? "Y").trim().toUpperCase() === "Y"
//     )
//     .map((option) => ({
//       label: String(
//         option.description ?? option.value ?? option.code ?? ""
//       ).trim(),
//       value: String(option.code ?? "").trim(),
//     }))
//     .filter((option) => option.label && option.value);

// type MasterOptions = Record<
//   MasterOptionKey,
//   ReturnType<typeof toOptionList>
// >;

// const getMasterArray = (
//   data: Record<string, unknown>,
//   key: string
// ): MastersOption[] => {
//   const value = data[key];

//   return Array.isArray(value) ? (value as MastersOption[]) : [];
// };

// const getMiscMasterByType = (
//   masterData: Record<string, unknown>,
//   type: string
// ) =>
//   getMasterArray(masterData, "misc").filter(
//     (option) =>
//       String(option.type ?? "").trim().toUpperCase() ===
//       type.toUpperCase()
//   );

// const buildMasterOptions = (
//   masters: Record<string, unknown>
// ): MasterOptions => {
//   const nestedData = masters.data;
//   const masterData =
//     nestedData &&
//       typeof nestedData === "object" &&
//       !Array.isArray(nestedData)
//       ? (nestedData as Record<string, unknown>)
//       : masters;

//   return {
//     yes_no: toOptionList(
//       getMiscMasterByType(masterData, "YESNO")
//     ),
//     place_of_examination: toOptionList(
//       getMiscMasterByType(masterData, "EXAM_PL")
//     ),
//     gender: toOptionList(getMasterArray(masterData, "gender")),
//     mer_education_sd: toOptionList(
//       getMiscMasterByType(masterData, "EDUCATION")
//     ),
//     mer_occupation_sd: toOptionList(
//       getMiscMasterByType(masterData, "OCCUPATION")
//     ),
//     family_relation: toOptionList(
//       getMiscMasterByType(masterData, "RELATION")
//     ),
//     dead_or_alive: toOptionList(
//       getMiscMasterByType(masterData, "DEAD_ALIVE")
//     ),
//   };
// };

// const getCodeFromDisplayValue = (
//   displayValue: string,
//   options: ReturnType<typeof toOptionList>
// ) => {
//   const normalizedValue = displayValue.trim().toUpperCase();
//   const option = options.find(
//     (item) =>
//       item.value.trim().toUpperCase() === normalizedValue ||
//       item.label.trim().toUpperCase() === normalizedValue
//   );

//   return option?.value ?? displayValue;
// };

// const resolveMasterFieldValue = (
//   field: MerSubSectionFieldConfig,
//   value: string,
//   masterOptions: MasterOptions
// ) => {
//   if (!field.masterKey) {
//     return value;
//   }

//   return getCodeFromDisplayValue(
//     value,
//     masterOptions[field.masterKey as MasterOptionKey] ?? []
//   );
// };

// const normalizeConditionalValue = (value: string) => {
//   const normalizedValue = value.trim().toLowerCase();

//   if (normalizedValue === "yes" || normalizedValue === "y") {
//     return "y";
//   }

//   if (normalizedValue === "no" || normalizedValue === "n") {
//     return "n";
//   }

//   return normalizedValue;
// };

// const isConditionallyRequired = (
//   field: MerSubSectionFieldConfig,
//   values: Record<string, string>
// ) => {
//   if (!field.requiredWhen) {
//     return false;
//   }

//   const selectedValue = normalizeConditionalValue(
//     values[field.requiredWhen.fieldId] ?? ""
//   );

//   return (
//     selectedValue ===
//     normalizeConditionalValue(field.requiredWhen.value)
//   );
// };

// const validateField = (
//   field: MerSubSectionFieldConfig,
//   value: string,
//   values: Record<string, string>
// ) => {
//   const trimmedValue = value.trim();

//   const isRequired =
//     field.required ||
//     isConditionallyRequired(field, values);

//   if (isRequired && !trimmedValue) {
//     return "This field is required.";
//   }

//   if (!trimmedValue) {
//     return "";
//   }

//   if (
//     field.validation === "alpha" &&
//     !/^[A-Za-z ]+$/.test(trimmedValue)
//   ) {
//     return "Only alphabets are allowed.";
//   }

//   if (
//     field.validation === "numeric" &&
//     !/^\d+$/.test(trimmedValue)
//   ) {
//     return "Only numbers are allowed.";
//   }

//   return "";
// };

// const isQuestionTableSection = (selectedSubSection?: string) => {
//   const normalizedSection = (selectedSubSection ?? "")
//     .trim()
//     .toLowerCase();

//   return (
//     normalizedSection ===
//     PULSE_RATE_DETAILS_SECTION_LABEL.toLowerCase() ||
//     normalizedSection === "pulse rate details" ||
//     normalizedSection === "question table"
//   );
// };

// const MerForm = forwardRef<MerFormHandle, MerFormProps>(
//   (
//     {
//       selectedSubSection,
//       applicationNo,
//       isEditing = false,
//     },
//     ref
//   ) => {
//     const masters = useSelector(
//       (state: RootState) => state.drs.masters
//     );

//     const [formValues, setFormValuesState] = useState<
//       Record<string, string>
//     >({
//       applicationNo: applicationNo ?? "",
//     });

//     const [formErrors, setFormErrors] = useState<
//       Record<string, string>
//     >({});

//     const editSnapshotRef = useRef<
//       Record<string, string> | null
//     >(null);

//     const masterOptions = useMemo(
//       () =>
//         buildMasterOptions(
//           masters && typeof masters === "object"
//             ? (masters as Record<string, unknown>)
//             : {}
//         ),
//       [masters]
//     );

//     const subsectionFields = useMemo(
//       () =>
//         getMerSubSectionFormFields(
//           selectedSubSection
//         ),
//       [selectedSubSection]
//     );

//     const isQuestionTable = useMemo(
//       () =>
//         isQuestionTableSection(
//           selectedSubSection
//         ),
//       [selectedSubSection]
//     );

//     const handleValueChange = (
//       field: MerSubSectionFieldConfig,
//       value: string
//     ) => {
//       const nextValues = {
//         ...formValues,
//         [field.id]: value,
//       };

//       setFormValuesState(nextValues);

//       setFormErrors((currentErrors) => ({
//         ...currentErrors,
//         [field.id]: validateField(
//           field,
//           value,
//           nextValues
//         ),
//       }));
//     };

//     const getFieldValue = (
//       field: MerSubSectionFieldConfig
//     ) => {
//       const value =
//         formValues[field.id] ??
//         field.defaultValue ??
//         "";

//       return resolveMasterFieldValue(
//         field,
//         value,
//         masterOptions
//       );
//     };

//     const getResolvedFormValues = useCallback(
//       () =>
//         subsectionFields.reduce<
//           Record<string, string>
//         >(
//           (accumulator, field) => ({
//             ...accumulator,
//             [field.id]:
//               resolveMasterFieldValue(
//                 field,
//                 formValues[field.id] ??
//                   field.defaultValue ??
//                   "",
//                 masterOptions
//               ),
//           }),
//           {
//             applicationNo:
//               formValues.applicationNo ??
//               applicationNo ??
//               "",
//           }
//         ),
//       [
//         applicationNo,
//         formValues,
//         masterOptions,
//         subsectionFields,
//       ]
//     );

//     useImperativeHandle(
//       ref,
//       () => ({
//         validateForm: () => {
//           const nextErrors =
//             subsectionFields.reduce<
//               Record<string, string>
//             >((accumulator, field) => {
//               const value =
//                 formValues[field.id] ??
//                 field.defaultValue ??
//                 "";

//               const error = validateField(
//                 field,
//                 value,
//                 formValues
//               );

//               if (error) {
//                 accumulator[field.id] = error;
//               }

//               return accumulator;
//             }, {});

//           setFormErrors(nextErrors);

//           return (
//             Object.keys(nextErrors).length === 0
//           );
//         },

//         getFormValues: () =>
//           getResolvedFormValues(),

//         setFormValues: (
//           nextValues: Record<string, string>
//         ) => {
//           const resolvedValues =
//             subsectionFields.reduce<
//               Record<string, string>
//             >((accumulator, field) => {
//               const nextValue = nextValues[field.id];

//               if (nextValue !== undefined) {
//                 accumulator[field.id] =
//                   resolveMasterFieldValue(
//                     field,
//                     nextValue,
//                     masterOptions
//                   );
//               }

//               return accumulator;
//             }, { ...nextValues });

//           setFormValuesState((currentValues) => ({
//             ...currentValues,
//             ...resolvedValues,
//           }));
//         },

//         beginEdit: () => {
//           editSnapshotRef.current = {
//             ...formValues,
//           };
//         },

//         resetEdit: () => {
//           if (editSnapshotRef.current) {
//             setFormValuesState(
//               editSnapshotRef.current
//             );
//           }

//           setFormErrors({});
//           editSnapshotRef.current = null;
//         },

//         commitEdit: () => {
//           editSnapshotRef.current = null;
//           setFormErrors({});
//         },
//       }),
//       [
//         formValues,
//         getResolvedFormValues,
//         subsectionFields,
//         masterOptions
//       ]
//     );

//     return (
//       <Box
//         component="fieldset"
//         disabled={!isEditing}
//         sx={{
//           border: 0,
//           p: 0,
//           m: 0,
//           minWidth: 0,

//           "&& .MuiOutlinedInput-root": {
//             height: MER_CONTROL_HEIGHT,
//             minHeight: `${MER_CONTROL_HEIGHT}px`,
//           },

//           "&& .MuiOutlinedInput-input": {
//             boxSizing: "border-box",
//             height: MER_CONTROL_HEIGHT,
//             py: "12px",
//           },

//           "&& .MuiSelect-select": {
//             display: "flex",
//             alignItems: "center",
//             boxSizing: "border-box",
//             height: `${MER_CONTROL_HEIGHT}px !important`,
//             minHeight: "0 !important",
//             py: "0 !important",
//           },

//           "& .MuiOutlinedInput-root.Mui-disabled": {
//             backgroundColor: "#F3F4F6",
//           },
//         }}
//       >
//         <Box
//           sx={
//             isQuestionTable
//               ? {
//                 mt: 1,
//                 overflow: "hidden",
//                 border: "1px solid #E4E7EC",
//                 borderRadius: 1.5,
//                 backgroundColor: "#FFFFFF",
//               }
//               : {
//                 display: "grid",
//                 gridTemplateColumns: {
//                   xs: "1fr",
//                   md: "repeat(3, minmax(0, 1fr))",
//                 },
//                 gap: 1.5,
//                 mt: 1,
//               }
//           }
//         >
//           {isQuestionTable && (
//             <Box
//               sx={{
//                 display: {
//                   xs: "none",
//                   md: "grid",
//                 },
//                 gridTemplateColumns:
//                   "minmax(0, 9fr) minmax(0, 1fr)",
//                 columnGap: 2,
//                 px: 1.5,
//                 py: 1,
//                 borderBottom: "1px solid #E4E7EC",
//                 backgroundColor: "#F8FAFC",
//               }}
//             >
//               <Box
//                 component="span"
//                 sx={{
//                   fontSize: 12,
//                   fontWeight: 600,
//                   lineHeight: 1.4,
//                   color: "#475467",
//                 }}
//               >
//                 Question
//               </Box>

//               <Box
//                 component="span"
//                 sx={{
//                   fontSize: 12,
//                   fontWeight: 600,
//                   lineHeight: 1.4,
//                   color: "#475467",
//                 }}
//               >
//                 Response
//               </Box>
//             </Box>
//           )}

//           {subsectionFields.map((field, index) => {
//             const value = getFieldValue(field);
//             const error =
//               formErrors[field.id] ?? "";

//             const options = field.masterKey
//               ? masterOptions[
//               field.masterKey as MasterOptionKey
//               ] ?? []
//               : [];

//             const showRequired =
//               field.required ||
//               isConditionallyRequired(
//                 field,
//                 formValues
//               );

//             const fieldControl =
//               field.type === "dropdown" ? (
//                 <CustomSelect
//                   value={value}
//                   onChange={(nextValue) =>
//                     handleValueChange(
//                       field,
//                       nextValue
//                     )
//                   }
//                   options={options}
//                   placeholder="Select"
//                   disabled={
//                     !isEditing ||
//                     !field.editable
//                   }
//                   error={Boolean(error)}
//                   helperText={error || undefined}
//                 />
//               ) : (
//                 <CustomTextField
//                   fullWidth
//                   size="small"
//                   type={
//                     field.type === "date"
//                       ? "date"
//                       : field.type === "number"
//                         ? "number"
//                         : "text"
//                   }
//                   value={value}
//                   onChange={(event) =>
//                     handleValueChange(
//                       field,
//                       event.target.value
//                     )
//                   }
//                   disabled={
//                     !isEditing ||
//                     !field.editable
//                   }
//                   error={Boolean(error)}
//                   helperText={error || undefined}
//                   placeholder={
//                     field.type === "date"
//                       ? "YYYY-MM-DD"
//                       : ""
//                   }
//                 />
//               );

//             if (isQuestionTable) {
//               return (
//                 <Box
//                   key={field.id}
//                   sx={{
//                     display: "grid",
//                     gridTemplateColumns: {
//                       xs: "1fr",
//                       md: "minmax(0, 9fr) minmax(0, 1fr)",
//                     },
//                     alignItems: "center",
//                     columnGap: 2,
//                     rowGap: 0.75,
//                     px: 1,
//                     py: 0.5,
//                     backgroundColor:
//                       index % 2 === 0
//                         ? "#FFFFFF"
//                         : "#F5F7FA",
//                     borderBottom:
//                       index ===
//                         subsectionFields.length - 1
//                         ? 0
//                         : "1px solid #EAECF0",
//                     "&:hover": {
//                       backgroundColor: "#EEF2F6",
//                     },
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       display: "flex",
//                       alignItems: "center",
//                       minWidth: 0,
//                     }}
//                   >
//                     <Box
//                       component="span"
//                       sx={{
//                         fontSize: 12,
//                         fontWeight: 400,
//                         lineHeight: 1.45,
//                         color: "#344054",
//                         overflowWrap: "anywhere",
//                       }}
//                     >
//                       {field.label}
//                       {showRequired && (
//                         <Box
//                           component="span"
//                           aria-hidden="true"
//                           sx={{
//                             ml: 0.25,
//                             fontSize: 12,
//                             fontWeight: 700,
//                             color: "#B42318",
//                           }}
//                         >
//                           *
//                         </Box>
//                       )}
//                     </Box>
//                   </Box>

//                   <Box
//                     sx={{
//                       minWidth: 0,
//                       width: "100%",
//                       "& .MuiFormControl-root": {
//                         width: "100%",
//                       },
//                       "& .MuiFormHelperText-root": {
//                         mx: 0,
//                         mt: 0.5,
//                       },
//                     }}
//                   >
//                     {fieldControl}
//                   </Box>
//                 </Box>
//               );
//             }

//             return (
//               <Box key={field.id}>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 0.25,
//                     mb: 1,
//                   }}
//                 >
//                   <Typography
//                     sx={{
//                       fontSize: "14px",
//                       fontWeight: 400,
//                       color: "#444",
//                     }}
//                   >
//                     {field.label}
//                   </Typography>

//                     {showRequired && (
//                       <Typography
//                         sx={{
//                           fontSize: 12,
//                           fontWeight: 700,
//                           color: "#B42318",
//                         }}
//                       >
//                         *
//                       </Typography>
//                     )}
//                 </Box>

//                 {fieldControl}
//               </Box>
//             );
//           })}
//         </Box>
//       </Box>
//     );
//   }
// );

// MerForm.displayName = "MerForm";

// export default MerForm;

import { Box, Typography } from "@mui/material";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import CustomSelect from "../../../../components/ui/Select/Select";
import CustomTextField from "../../../../components/ui/TextField/TextField";
import type { RootState } from "../../../../store/store";
import type {
  MedicalFinalConfigField,
  MerSubSectionFieldConfig,
} from "./merConfig";
import {
  getMerSubSectionFormFields,
  PULSE_RATE_DETAILS_SECTION_LABEL,
} from "./merConfig";

type MerFormProps = {
  selectedSubSection?: string;
  fields?: MedicalFinalConfigField[];
  applicationNo?: string;
  isEditing?: boolean;
};

export type MerFormHandle = {
  validateForm: () => boolean;
  getFormValues: () => Record<string, string>;
  setFormValues: (nextValues: Record<string, string>) => void;
  beginEdit: () => void;
  resetEdit: () => void;
  commitEdit: () => void;
};

type MastersOption = {
  code?: string;
  description?: string;
  value?: string | null;
  isActive?: string;
  type?: string;
};

type MasterOptionKey =
  | "yes_no"
  | "place_of_examination"
  | "gender"
  | "mer_education_sd"
  | "mer_occupation_sd"
  | "family_relation"
  | "dead_or_alive";

const MER_CONTROL_HEIGHT = 36;

const toOptionList = (values: MastersOption[] = []) =>
  values
    .filter(
      (option) =>
        String(option.isActive ?? "Y").trim().toUpperCase() === "Y"
    )
    .map((option) => ({
      label: String(
        option.description ?? option.value ?? option.code ?? ""
      ).trim(),
      value: String(option.code ?? "").trim(),
    }))
    .filter((option) => option.label && option.value);

type MasterOptions = Record<
  MasterOptionKey,
  ReturnType<typeof toOptionList>
>;

const getMasterArray = (
  data: Record<string, unknown>,
  key: string
): MastersOption[] => {
  const value = data[key];

  return Array.isArray(value) ? (value as MastersOption[]) : [];
};

const getMiscMasterByType = (
  masterData: Record<string, unknown>,
  type: string
) =>
  getMasterArray(masterData, "misc").filter(
    (option) =>
      String(option.type ?? "").trim().toUpperCase() ===
      type.toUpperCase()
  );

const buildMasterOptions = (
  masters: Record<string, unknown>
): MasterOptions => {
  const nestedData = masters.data;
  const masterData =
    nestedData &&
      typeof nestedData === "object" &&
      !Array.isArray(nestedData)
      ? (nestedData as Record<string, unknown>)
      : masters;

  return {
    yes_no: toOptionList(
      getMiscMasterByType(masterData, "YESNO")
    ),
    place_of_examination: toOptionList(
      getMiscMasterByType(masterData, "EXAM_PL")
    ),
    gender: toOptionList(getMasterArray(masterData, "gender")),
    mer_education_sd: toOptionList(
      getMiscMasterByType(masterData, "EDUCATION")
    ),
    mer_occupation_sd: toOptionList(
      getMiscMasterByType(masterData, "OCCUPATION")
    ),
    family_relation: toOptionList(
      getMiscMasterByType(masterData, "RELATION")
    ),
    dead_or_alive: toOptionList(
      getMiscMasterByType(masterData, "DEAD_ALIVE")
    ),
  };
};

const getCodeFromDisplayValue = (
  displayValue: string,
  options: ReturnType<typeof toOptionList>
) => {
  const normalizedValue = displayValue.trim().toUpperCase();
  const option = options.find(
    (item) =>
      item.value.trim().toUpperCase() === normalizedValue ||
      item.label.trim().toUpperCase() === normalizedValue
  );

  return option?.value ?? displayValue;
};

const resolveMasterFieldValue = (
  field: MerSubSectionFieldConfig,
  value: string,
  masterOptions: MasterOptions
) => {
  if (!field.masterKey) {
    return value;
  }

  return getCodeFromDisplayValue(
    value,
    masterOptions[field.masterKey as MasterOptionKey] ?? []
  );
};

const normalizeConditionalValue = (value: string) => {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "yes" || normalizedValue === "y") {
    return "y";
  }

  if (normalizedValue === "no" || normalizedValue === "n") {
    return "n";
  }

  return normalizedValue;
};

const isConditionallyRequired = (
  field: MerSubSectionFieldConfig,
  values: Record<string, string>
) => {
  if (!field.requiredWhen) {
    return false;
  }

  const selectedValue = normalizeConditionalValue(
    values[field.requiredWhen.fieldId] ?? ""
  );

  return (
    selectedValue ===
    normalizeConditionalValue(field.requiredWhen.value)
  );
};

const validateField = (
  field: MerSubSectionFieldConfig,
  value: string,
  values: Record<string, string>
) => {
  const trimmedValue = value.trim();

  const isRequired =
    field.required ||
    isConditionallyRequired(field, values);

  if (isRequired && !trimmedValue) {
    return "This field is required.";
  }

  if (!trimmedValue) {
    return "";
  }

  if (
    field.validation === "alpha" &&
    !/^[A-Za-z ]+$/.test(trimmedValue)
  ) {
    return "Only alphabets are allowed.";
  }

  if (
    field.validation === "numeric" &&
    !/^\d+$/.test(trimmedValue)
  ) {
    return "Only numbers are allowed.";
  }

  if (field.type === "date" && field.disableFutureDate) {
    const selectedDate = new Date(trimmedValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      !Number.isNaN(selectedDate.getTime()) &&
      selectedDate > today
    ) {
      return "Future date is not allowed.";
    }
  }

  return "";
};

const isQuestionTableSection = (selectedSubSection?: string) => {
  const normalizedSection = (selectedSubSection ?? "")
    .trim()
    .toLowerCase();

  return (
    normalizedSection ===
    PULSE_RATE_DETAILS_SECTION_LABEL.toLowerCase() ||
    normalizedSection === "pulse rate details" ||
    normalizedSection === "question table"
  );
};

const MerForm = forwardRef<MerFormHandle, MerFormProps>(
  (
    {
      selectedSubSection,
      applicationNo,
      isEditing = false,
    },
    ref
  ) => {
    const masters = useSelector(
      (state: RootState) => state.drs.masters
    );

    const [formValues, setFormValuesState] = useState<
      Record<string, string>
    >({
      applicationNo: applicationNo ?? "",
    });

    const [formErrors, setFormErrors] = useState<
      Record<string, string>
    >({});

    const editSnapshotRef = useRef<
      Record<string, string> | null
    >(null);

    const masterOptions = useMemo(
      () =>
        buildMasterOptions(
          masters && typeof masters === "object"
            ? (masters as Record<string, unknown>)
            : {}
        ),
      [masters]
    );

    const subsectionFields = useMemo(
      () =>
        getMerSubSectionFormFields(
          selectedSubSection
        ),
      [selectedSubSection]
    );

    const isQuestionTable = useMemo(
      () =>
        isQuestionTableSection(
          selectedSubSection
        ),
      [selectedSubSection]
    );

    const maxDate = useMemo(
      () => new Date().toISOString().split("T")[0],
      []
    );

    const handleValueChange = (
      field: MerSubSectionFieldConfig,
      value: string
    ) => {
      const nextValues = {
        ...formValues,
        [field.id]: value,
      };

      setFormValuesState(nextValues);

      setFormErrors((currentErrors) => ({
        ...currentErrors,
        [field.id]: validateField(
          field,
          value,
          nextValues
        ),
      }));
    };

    const getFieldValue = (
      field: MerSubSectionFieldConfig
    ) => {
      const value =
        formValues[field.id] ??
        field.defaultValue ??
        "";

      return resolveMasterFieldValue(
        field,
        value,
        masterOptions
      );
    };

    const getResolvedFormValues = useCallback(
      () =>
        subsectionFields.reduce<
          Record<string, string>
        >(
          (accumulator, field) => ({
            ...accumulator,
            [field.id]:
              resolveMasterFieldValue(
                field,
                formValues[field.id] ??
                  field.defaultValue ??
                  "",
                masterOptions
              ),
          }),
          {
            applicationNo:
              formValues.applicationNo ??
              applicationNo ??
              "",
          }
        ),
      [
        applicationNo,
        formValues,
        masterOptions,
        subsectionFields,
      ]
    );

    useImperativeHandle(
      ref,
      () => ({
        validateForm: () => {
          const nextErrors =
            subsectionFields.reduce<
              Record<string, string>
            >((accumulator, field) => {
              const value =
                formValues[field.id] ??
                field.defaultValue ??
                "";

              const error = validateField(
                field,
                value,
                formValues
              );

              if (error) {
                accumulator[field.id] = error;
              }

              return accumulator;
            }, {});

          setFormErrors(nextErrors);

          return (
            Object.keys(nextErrors).length === 0
          );
        },

        getFormValues: () =>
          getResolvedFormValues(),

        setFormValues: (
          nextValues: Record<string, string>
        ) => {
          const resolvedValues =
            subsectionFields.reduce<
              Record<string, string>
            >((accumulator, field) => {
              const nextValue = nextValues[field.id];

              if (nextValue !== undefined) {
                accumulator[field.id] =
                  resolveMasterFieldValue(
                    field,
                    nextValue,
                    masterOptions
                  );
              }

              return accumulator;
            }, { ...nextValues });

          setFormValuesState((currentValues) => ({
            ...currentValues,
            ...resolvedValues,
          }));
        },

        beginEdit: () => {
          editSnapshotRef.current = {
            ...formValues,
          };
        },

        resetEdit: () => {
          if (editSnapshotRef.current) {
            setFormValuesState(
              editSnapshotRef.current
            );
          }

          setFormErrors({});
          editSnapshotRef.current = null;
        },

        commitEdit: () => {
          editSnapshotRef.current = null;
          setFormErrors({});
        },
      }),
      [
        formValues,
        getResolvedFormValues,
        subsectionFields,
        masterOptions
      ]
    );

    return (
      <Box
        component="fieldset"
        disabled={!isEditing}
        sx={{
          border: 0,
          p: 0,
          m: 0,
          minWidth: 0,

          "&& .MuiOutlinedInput-root": {
            height: MER_CONTROL_HEIGHT,
            minHeight: `${MER_CONTROL_HEIGHT}px`,
          },

          "&& .MuiOutlinedInput-input": {
            boxSizing: "border-box",
            height: MER_CONTROL_HEIGHT,
            py: "12px",
          },

          "&& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box",
            height: `${MER_CONTROL_HEIGHT}px !important`,
            minHeight: "0 !important",
            py: "0 !important",
          },

          "& .MuiOutlinedInput-root.Mui-disabled": {
            backgroundColor: "#F3F4F6",
          },
        }}
      >
        <Box
          sx={
            isQuestionTable
              ? {
                mt: 1,
                overflow: "hidden",
                border: "1px solid #E4E7EC",
                borderRadius: 1.5,
                backgroundColor: "#FFFFFF",
              }
              : {
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.5,
                mt: 1,
              }
          }
        >
          {isQuestionTable && (
            <Box
              sx={{
                display: {
                  xs: "none",
                  md: "grid",
                },
                gridTemplateColumns:
                  "minmax(0, 9fr) minmax(0, 1fr)",
                columnGap: 2,
                px: 1.5,
                py: 1,
                borderBottom: "1px solid #E4E7EC",
                backgroundColor: "#F8FAFC",
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: "#475467",
                }}
              >
                Question
              </Box>

              <Box
                component="span"
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: "#475467",
                }}
              >
                Response
              </Box>
            </Box>
          )}

          {subsectionFields.map((field, index) => {
            const value = getFieldValue(field);
            const error =
              formErrors[field.id] ?? "";

            const options = field.masterKey
              ? masterOptions[
              field.masterKey as MasterOptionKey
              ] ?? []
              : [];

            const showRequired =
              field.required ||
              isConditionallyRequired(
                field,
                formValues
              );

            const fieldControl =
              field.type === "dropdown" ? (
                <CustomSelect
                  value={value}
                  onChange={(nextValue) =>
                    handleValueChange(
                      field,
                      nextValue
                    )
                  }
                  options={options}
                  placeholder="Select"
                  disabled={
                    !isEditing ||
                    !field.editable
                  }
                  error={Boolean(error)}
                  helperText={error || undefined}
                />
              ) : (
                <CustomTextField
                  fullWidth
                  size="small"
                  type={
                    field.type === "date"
                      ? "date"
                      : field.type === "number"
                        ? "number"
                        : "text"
                  }
                  value={value}
                  onChange={(event) =>
                    handleValueChange(
                      field,
                      event.target.value
                    )
                  }
                  disabled={
                    !isEditing ||
                    !field.editable
                  }
                  error={Boolean(error)}
                  helperText={error || undefined}
                  placeholder={
                    field.type === "date"
                      ? "YYYY-MM-DD"
                      : ""
                  }
                  slotProps={
                    field.type === "date" &&
                    field.disableFutureDate
                      ? {
                          htmlInput: {
                            max: maxDate,
                          },
                        }
                      : undefined
                  }
                />
              );

            if (isQuestionTable) {
              return (
                <Box
                  key={field.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "minmax(0, 9fr) minmax(0, 1fr)",
                    },
                    alignItems: "center",
                    columnGap: 2,
                    rowGap: 0.75,
                    px: 1,
                    py: 0.5,
                    backgroundColor:
                      index % 2 === 0
                        ? "#FFFFFF"
                        : "#F5F7FA",
                    borderBottom:
                      index ===
                        subsectionFields.length - 1
                        ? 0
                        : "1px solid #EAECF0",
                    "&:hover": {
                      backgroundColor: "#EEF2F6",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minWidth: 0,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        fontSize: 12,
                        fontWeight: 400,
                        lineHeight: 1.45,
                        color: "#344054",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {field.label}
                      {showRequired && (
                        <Box
                          component="span"
                          aria-hidden="true"
                          sx={{
                            ml: 0.25,
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#B42318",
                          }}
                        >
                          *
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      minWidth: 0,
                      width: "100%",
                      "& .MuiFormControl-root": {
                        width: "100%",
                      },
                      "& .MuiFormHelperText-root": {
                        mx: 0,
                        mt: 0.5,
                      },
                    }}
                  >
                    {fieldControl}
                  </Box>
                </Box>
              );
            }

            return (
              <Box key={field.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.25,
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "#444",
                    }}
                  >
                    {field.label}
                  </Typography>

                    {showRequired && (
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#B42318",
                        }}
                      >
                        *
                      </Typography>
                    )}
                </Box>

                {fieldControl}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }
);

MerForm.displayName = "MerForm";

export default MerForm;
