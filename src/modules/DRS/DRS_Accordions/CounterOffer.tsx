import { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import CustomTable, {
    type Column,
} from "../../../components/ui/Table/Table";
import CustomTextField from "../../../components/ui/TextField/TextField";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomButton from "../../../components/ui/Button/Button";
import { useAppSelector } from "../../../store/hooks";

type CounterOfferSelectOption = {
    label: string;
    value: string;
    disabled: boolean;
};

type CounterOfferProps = {
    reasonOptions: Array<{
        label: string;
        value: string;
        disabled?: boolean;
    }>;
};

const COUNTER_OFFER_MASTER_TYPES = {
    emrClass: "EMR_CLASS",
    feClass: "FE_CLASS",
    code: "COUNTER_OFFER_CODE",
} as const;

const toRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object"
        ? (value as Record<string, unknown>)
        : {};

const toDisplayText = (value: unknown): string =>
    value === null || value === undefined
        ? ""
        : String(value).trim();

const toMasterList = (options: unknown): unknown[] => {
    if (Array.isArray(options)) return options;

    const record = toRecord(options);

    if (Array.isArray(record.data)) return record.data;
    if (Array.isArray(record.options)) return record.options;
    if (Array.isArray(record.values)) return record.values;

    return Object.values(record).flatMap((value) =>
        Array.isArray(value) ? value : [],
    );
};

const getMiscMasters = (masters: unknown): unknown => {
    const mastersRecord = toRecord(masters);
    const dataRecord = toRecord(mastersRecord.data);

    return mastersRecord.misc ?? dataRecord.misc ?? [];
};

const buildMasterOptions = (
    misc: unknown,
    masterType: string,
): CounterOfferSelectOption[] =>
    toMasterList(misc)
        .map(toRecord)
        .filter(
            (option) =>
                String(option.type ?? "")
                    .trim()
                    .toUpperCase() === masterType,
        )
        .map((option) => {
            const code = String(
                option.code ??
                    option.key ??
                    option.value ??
                    "",
            ).trim();

            const description = String(
                option.description ??
                    option.label ??
                    option.value ??
                    "",
            ).trim();

            if (!code || !description) return null;

            return {
                label: description,
                value: code,
                disabled:
                    Boolean(option.disabled) ||
                    String(option.isActive ?? "")
                        .trim()
                        .toUpperCase() === "N",
            };
        })
        .filter(
            (
                option,
            ): option is CounterOfferSelectOption =>
                option !== null,
        );

export type CounterOfferRowKey =
    | "baseSumAssured"
    | "riderSumAssured";

type CounterOfferField =
    | "changedSA"
    | "changedPT"
    | "changedPPT"
    | "classRequirement"
    | "classRequirementRemarks"
    | "classRequirement2"
    | "classRequirement2Remarks"
    | "code"
    | "revisedPremium"
    | "reasons";

type CounterOfferValues = {
    changedSA: string;
    changedPT: string;
    changedPPT: string;
    classRequirement: string;
    classRequirementRemarks: string;
    classRequirement2: string;
    classRequirement2Remarks: string;
    code: string;
    revisedPremium: string;
    reasons: string;
};

type CounterOfferStringField = {
    [Field in CounterOfferField]: CounterOfferValues[Field] extends string
        ? Field
        : never;
}[CounterOfferField];

export type CounterOfferTableState = Record<
    CounterOfferRowKey,
    CounterOfferValues
>;

type CounterOfferTableRow = {
    rowKey: CounterOfferRowKey;
    productName: string;
    proposerLifeAssured: string;
    appliedSA: string;
    changedSA: string;
    policyTerm: string;
    changedPT: string;
    premiumPaymentTerm: string;
    changedPPT: string;
    classRequirement: string;
    classRequirementRemarks: string;
    classRequirement2: string;
    classRequirement2Remarks: string;
    code: string;
    premiumCollected: string;
    revisedPremium: string;
    reasons: string;
};

const initialCounterOfferTable: CounterOfferTableState = {
    baseSumAssured: {
        changedSA: "",
        changedPT: "",
        changedPPT: "",
        classRequirement: "",
        classRequirementRemarks: "",
        classRequirement2: "",
        classRequirement2Remarks: "",
        code: "",
        revisedPremium: "",
        reasons: "",
    },
    riderSumAssured: {
        changedSA: "",
        changedPT: "",
        changedPPT: "",
        classRequirement: "",
        classRequirementRemarks: "",
        classRequirement2: "",
        classRequirement2Remarks: "",
        code: "",
        revisedPremium: "",
        reasons: "",
    },
};

const CounterOffer = ({ reasonOptions }: CounterOfferProps) => {
    const masters = useAppSelector(
        (state) => state.drs.masters,
    );
    const drsData = useAppSelector(
        (state) => state.drs.data,
    );

    const [counterOfferTable, setCounterOfferTable] =
        useState<CounterOfferTableState>(
            initialCounterOfferTable,
        );

    const {
        emrClassOptions,
        feClassOptions,
        codeOptions,
    } = useMemo(() => {
        const misc = getMiscMasters(masters);

        return {
            emrClassOptions: buildMasterOptions(
                misc,
                COUNTER_OFFER_MASTER_TYPES.emrClass,
            ),
            feClassOptions: buildMasterOptions(
                misc,
                COUNTER_OFFER_MASTER_TYPES.feClass,
            ),
            codeOptions: buildMasterOptions(
                misc,
                COUNTER_OFFER_MASTER_TYPES.code,
            ),
        };
    }, [masters]);

    const {
        baseProductDetail,
        riderProductDetail,
    } = useMemo(() => {
        const drsRecord = toRecord(drsData);
        const nestedDataRecord = toRecord(drsRecord.data);
        const responseData =
            Object.keys(nestedDataRecord).length > 0
                ? nestedDataRecord
                : drsRecord;
        const applicationOverview = toRecord(
            responseData.applicationOverview,
        );
        const rawProductDetails =
            applicationOverview.productDetail ??
            applicationOverview.productDetails;
        const productDetails = Array.isArray(rawProductDetails)
            ? rawProductDetails
            : [];

        const findProductByType = (productType: string) =>
            toRecord(
                productDetails.find(
                    (product) =>
                        toDisplayText(toRecord(product).type)
                            .toUpperCase() === productType,
                ),
            );

        return {
            baseProductDetail: findProductByType("BASE"),
            riderProductDetail: findProductByType("RIDER"),
        };
    }, [drsData]);

    const updateCounterOfferCell = <Field extends CounterOfferField>(
        rowKey: CounterOfferRowKey,
        field: Field,
        value: CounterOfferValues[Field],
    ) => {
        setCounterOfferTable((previous) => {
            const updatedRow: CounterOfferValues = {
                ...previous[rowKey],
                [field]: value,
            };

            return {
                ...previous,
                [rowKey]: updatedRow,
            };
        });
    };

    const baseCounterOfferRow: CounterOfferTableRow = {
            rowKey: "baseSumAssured",
            productName: toDisplayText(
                baseProductDetail.name ??
                baseProductDetail.productName,
            ),
            proposerLifeAssured: "Life Assured",
            appliedSA: toDisplayText(
                baseProductDetail.sumAssured,
            ),
            changedSA:
                counterOfferTable.baseSumAssured.changedSA,
            policyTerm: toDisplayText(
                baseProductDetail.policyTerm,
            ),
            changedPT:
                counterOfferTable.baseSumAssured.changedPT,
            premiumPaymentTerm: toDisplayText(
                baseProductDetail.premiumPaymentTerm,
            ),
            changedPPT:
                counterOfferTable.baseSumAssured.changedPPT,
            classRequirement:
                counterOfferTable.baseSumAssured
                    .classRequirement,
            classRequirementRemarks:
                counterOfferTable.baseSumAssured
                    .classRequirementRemarks,
            classRequirement2:
                counterOfferTable.baseSumAssured
                    .classRequirement2,
            classRequirement2Remarks:
                counterOfferTable.baseSumAssured
                    .classRequirement2Remarks,
            code: counterOfferTable.baseSumAssured.code,
            premiumCollected: "",
            revisedPremium:
                counterOfferTable.baseSumAssured.revisedPremium,
            reasons: counterOfferTable.baseSumAssured.reasons,
        };

    const riderCounterOfferRow: CounterOfferTableRow = {
            rowKey: "riderSumAssured",
            productName: toDisplayText(
                riderProductDetail.name ??
                riderProductDetail.productName,
            ),
            proposerLifeAssured: "Life Assured",
            appliedSA: toDisplayText(
                riderProductDetail.sumAssured,
            ),
            changedSA:
                counterOfferTable.riderSumAssured.changedSA,
            policyTerm: toDisplayText(
                riderProductDetail.policyTerm,
            ),
            changedPT:
                counterOfferTable.riderSumAssured.changedPT,
            premiumPaymentTerm: toDisplayText(
                riderProductDetail.premiumPaymentTerm,
            ),
            changedPPT:
                counterOfferTable.riderSumAssured.changedPPT,
            classRequirement:
                counterOfferTable.riderSumAssured
                    .classRequirement,
            classRequirementRemarks:
                counterOfferTable.riderSumAssured
                    .classRequirementRemarks,
            classRequirement2:
                counterOfferTable.riderSumAssured
                    .classRequirement2,
            classRequirement2Remarks:
                counterOfferTable.riderSumAssured
                    .classRequirement2Remarks,
            code: counterOfferTable.riderSumAssured.code,
            premiumCollected: "",
            revisedPremium:
                counterOfferTable.riderSumAssured.revisedPremium,
            reasons: counterOfferTable.riderSumAssured.reasons,
        };

    const hasRiderProduct =
        Object.keys(riderProductDetail).length > 0;

    const counterOfferRows: CounterOfferTableRow[] =
        hasRiderProduct
            ? [baseCounterOfferRow, riderCounterOfferRow]
            : [baseCounterOfferRow];

    const renderDisabledField = (value: string) => (
        <CustomTextField
            fullWidth
            size="small"
            value={value}
            disabled
            sx={{
                minWidth: 0,
                "& .MuiInputBase-root": {
                    fontSize: "10px",
                },
                "& .MuiInputBase-root.Mui-disabled": {
                    backgroundColor: "#eeeeee",
                },
                "& .MuiInputBase-input": {
                    px: 0.75,
                    py: 0.75,
                },
                "& .MuiInputBase-input.Mui-disabled": {
                    color: "#6b7280",
                    WebkitTextFillColor: "#6b7280",
                },
                "& .MuiInputBase-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d1d5db",
                },
            }}
        />
    );

    const renderEditableField = (
        value: string,
        row: CounterOfferTableRow,
        field: CounterOfferStringField,
    ) => {
        const isTextField = field === "reasons";

        return (
            <CustomTextField
                fullWidth
                size="small"
                value={value}
                onChange={(event) => {
                    const inputValue = event.target.value;

                    updateCounterOfferCell(
                        row.rowKey,
                        field,
                        isTextField
                            ? inputValue
                            : inputValue.replace(/\D/g, ""),
                    );
                }}
                sx={{
                    minWidth: 0,
                    "& .MuiInputBase-root": {
                        fontSize: "10px",
                    },
                    "& .MuiInputBase-input": {
                        px: 0.75,
                        py: 0.75,
                    },
                }}
            />
        );
    };

    const renderReasonDropdown = (
        value: string,
        row: CounterOfferTableRow,
        field:
            | "classRequirementRemarks"
            | "classRequirement2Remarks",
    ) => (
        <Box
            sx={{
                minWidth: 0,
                "& .MuiInputBase-root": {
                    height: 32,
                    fontSize: "10px",
                    borderRadius: "8px",
                },
                "& .MuiSelect-select": {
                    px: "6px !important",
                    py: "4px !important",
                    fontSize: "10px",
                },
                "& .MuiChip-root": {
                    height: 22,
                    fontSize: "9px",
                },
            }}
        >
            <CustomSelect
                value={value}
                options={reasonOptions}
                placeholder="Select reason"
                onChange={(selectedValue) =>
                    updateCounterOfferCell(
                        row.rowKey,
                        field,
                        selectedValue,
                    )
                }
            />
        </Box>
    );

    const renderClassRequirementDropdown = (
        value: string,
        row: CounterOfferTableRow,
        field: "classRequirement" | "classRequirement2",
    ) => {
        const options =
            field === "classRequirement"
                ? row.rowKey === "baseSumAssured"
                    ? emrClassOptions.filter(
                        (option) =>
                            option.value.trim().toUpperCase() !==
                            "DECLINE",
                    )
                    : emrClassOptions
                : feClassOptions;

        return (
            <Box
                sx={{
                    minWidth: 0,
                    "& .MuiInputBase-root": {
                        height: 32,
                        fontSize: "10px",
                        borderRadius: "8px",
                    },
                    "& .MuiSelect-select": {
                        px: "6px !important",
                        fontSize: "10px",
                    },
                }}
            >
                <CustomSelect
                    value={value}
                    options={options}
                    placeholder="Select"
                    onChange={(selectedValue) =>
                        updateCounterOfferCell(
                            row.rowKey,
                            field,
                            selectedValue,
                        )
                    }
                />
            </Box>
        );
    };

    const renderCodeDropdown = (
        value: string,
        row: CounterOfferTableRow,
    ) => (
        <Box
            sx={{
                minWidth: 0,
                "& .MuiInputBase-root": {
                    height: 32,
                    fontSize: "10px",
                    borderRadius: "8px",
                },
                "& .MuiSelect-select": {
                    px: "6px !important",
                    py: "4px !important",
                    fontSize: "10px",
                },
            }}
        >
            <CustomSelect
                value={value}
                options={codeOptions}
                placeholder="Select"
                onChange={(selectedValue) =>
                    updateCounterOfferCell(
                        row.rowKey,
                        "code",
                        selectedValue,
                    )
                }
            />
        </Box>
    );

    const counterOfferColumns: Column<CounterOfferTableRow>[] = [
        {
            key: "productName",
            header: "",
            width: "6%",
            render: (value) => (
                <Typography
                    sx={{
                        fontSize: "10px",
                        fontWeight: 600,
                        lineHeight: 1.2,
                        wordBreak: "break-word",
                    }}
                >
                    {String(value ?? "")}
                </Typography>
            ),
        },
        {
            key: "proposerLifeAssured",
            header: "Profile",
            width: "8%",
            render: (value) =>
                renderDisabledField(String(value ?? "")),
        },
        {
            key: "appliedSA",
            header: "Applied SA",
            width: "8%",
            render: (value) =>
                renderDisabledField(String(value ?? "")),
        },
        {
            key: "changedSA",
            header: "Changed SA",
            width: "8%",
            render: (value, row) =>
                renderEditableField(
                    String(value ?? ""),
                    row,
                    "changedSA",
                ),
        },
        {
            key: "policyTerm",
            header: "PT",
            width: "4%",
            render: (value) =>
                renderDisabledField(String(value ?? "")),
        },
        {
            key: "changedPT",
            header: "New PT",
            width: "5%",
            render: (value, row) =>
                renderEditableField(
                    String(value ?? ""),
                    row,
                    "changedPT",
                ),
        },
        {
            key: "premiumPaymentTerm",
            header: "PPT",
            width: "4%",
            render: (value) =>
                renderDisabledField(String(value ?? "")),
        },
        {
            key: "changedPPT",
            header: "New PPT",
            width: "5%",
            render: (value, row) =>
                renderEditableField(
                    String(value ?? ""),
                    row,
                    "changedPPT",
                ),
        },
        {
            key: "classRequirement",
            header: "EMR Class",
            width: "8%",
            render: (value, row) =>
                renderClassRequirementDropdown(
                    String(value ?? ""),
                    row,
                    "classRequirement",
                ),
        },
        {
            key: "classRequirementRemarks",
            header: "EMR Reasons",
            width: "10%",
            render: (value, row) =>
                renderReasonDropdown(
                    String(value ?? ""),
                    row,
                    "classRequirementRemarks",
                ),
        },
        {
            key: "classRequirement2",
            header: "FE Class",
            width: "8%",
            render: (value, row) =>
                renderClassRequirementDropdown(
                    String(value ?? ""),
                    row,
                    "classRequirement2",
                ),
        },
        {
            key: "classRequirement2Remarks",
            header: "FE Reasons",
            width: "10%",
            render: (value, row) =>
                renderReasonDropdown(
                    String(value ?? ""),
                    row,
                    "classRequirement2Remarks",
                ),
        },
        {
            key: "code",
            header: "Code",
            width: "9%",
            render: (value, row) =>
                renderCodeDropdown(
                    String(value ?? ""),
                    row,
                ),
        },
        {
            key: "premiumCollected",
            header: "Premium Collected",
            width: "7%",
            render: (value) =>
                renderDisabledField(String(value ?? "")),
        },
        {
            key: "revisedPremium",
            header: "Revised Premium",
            width: "7%",
            render: (value) =>
                renderDisabledField(String(value ?? "")),
        },
        {
            key: "reasons",
            header: "Reasons",
            width: "12%",
            render: (value, row) =>
                renderEditableField(
                    String(value ?? ""),
                    row,
                    "reasons",
                ),
        },
    ];

    return (
        <Box
            sx={{
                mt: 1.25,
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
            }}
        >
            <CustomTable
                title="Counter Offer Details"
                columns={counterOfferColumns}
                data={counterOfferRows}
            />

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 0.75,
                    mb: 0.75,
                }}
            >
                <CustomButton
                    sx={{
                        minWidth: 150,
                        borderRadius: "28px",
                        bgcolor: "#ad252a",
                        py: 1,
                        fontSize: "13px",
                        fontWeight: 600,
                        boxShadow: "none",
                        "&:hover": {
                            bgcolor: "#941f24",
                            boxShadow: "none",
                        }
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        Save
                    </Box>
                </CustomButton>
            </Box>
        </Box>
    );
};

export default CounterOffer;