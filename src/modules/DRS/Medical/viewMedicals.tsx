import { Box, Container, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTabs from "../../../components/ui/Tabs/Tabs";
import BackButton from "../../../components/layout/BackButton";
import BreDecision from "../DRS_Accordions/BreDecision";
import CustomTable, { type Column } from "../../../components/ui/Table/Table";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomButton from "../../../components/ui/Button/Button";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { applicantTabs } from "../../../utils/constant";
import type {
	ApplicantTab,
	DRSRequest,
	MedicalSubmitRequest,
	MedicalResponse,
	MedicalSection,
	MedicalStatus,
	MedicalSummaryMember,
	MedicalTestRow,
} from "../../../types/drs.types";
import { BriefcaseIcon, DangerIcon, PhoneIcon, SmsIcon, WalletIcon } from "../../../icons/Icons";
import { useAppContext } from "../../../hooks/useAppContext";
import { getDRSPath } from "../../../routes/routes";
import { useAppDispatch } from "../../../store/hooks";
import { medicalThunk } from "../../../store/thunks/medicalThunk";
import { medicalSubmitThunk } from "../../../store/thunks/medicalSubmitThunk";

const getRoleType = () => localStorage.getItem("roleType") ?? "";
const getStoredApplicantTab = () => (localStorage.getItem("drsSelectedApplicantTab") as ApplicantTab | null) ?? "proposer";

const formatCurrencyINR = (value?: number | string) => {
	if (value === undefined || value === null || value === "") {
		return "-";
	}

	const numericValue = Number(value);
	if (Number.isNaN(numericValue)) {
		return String(value);
	}

	return numericValue.toLocaleString("en-IN");
};

const parseNormalRange = (normalRange: string) => {
	const rangeMatch = normalRange.replace(/\s+/g, "").match(/^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/);

	if (!rangeMatch) {
		return null;
	}

	const min = Number(rangeMatch[1]);
	const max = Number(rangeMatch[2]);

	if (Number.isNaN(min) || Number.isNaN(max)) {
		return null;
	}

	return { min, max };
};

const getValidatedStatus = (
	value: string,
	normalRange: string,
	fallbackStatus: MedicalStatus
): MedicalStatus => {
	const parsedRange = parseNormalRange(normalRange);
	if (!parsedRange) {
		return fallbackStatus;
	}

	const numericValue = Number(value);
	if (Number.isNaN(numericValue)) {
		return "abnormal";
	}

	return numericValue < parsedRange.min || numericValue > parsedRange.max
		? "abnormal"
		: "normal";
};

const getMemberSummary = (member?: MedicalSummaryMember) => {
	if (!member) {
		return undefined;
	}

	if (member.memberType === "proposer") {
		return member.proposerSummary;
	}

	if (member.memberType === "lifeassured1") {
		return member.lifeassured1Summary;
	}

	if (member.memberType === "lifeassured2") {
		return member.lifeassured2Summary;
	}

	return undefined;
};

const getApplicantHeaderData = (summary?: MedicalSummaryMember) => {
	const memberSummary = getMemberSummary(summary);

	return {
		name: [memberSummary?.firstName, memberSummary?.middleName, memberSummary?.lastName].filter(Boolean).join(" ") || "-",
		dob: memberSummary?.dob ?? "-",
		age: memberSummary?.age ?? "-",
		gender: memberSummary?.gender ?? "-",
		profileImage: memberSummary?.profileImage ?? "",
		occupation: memberSummary?.occupation ?? "-",
		annualIncome: memberSummary?.annualIncome,
		email: memberSummary?.email ?? "-",
		mobile: memberSummary?.mobile ?? "-",
	};
};

const ViewMedicals = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { businessType, applicationNumber } = useAppContext();
	const requestedApplicantTab =
		((location.state as { selectedApplicantTab?: ApplicantTab } | null)?.selectedApplicantTab) ??
		getStoredApplicantTab();

	const [medicalData, setMedicalData] = useState<MedicalResponse | null>(null);
	const [editableSections, setEditableSections] = useState<MedicalSection[]>([]);
	const [initialSections, setInitialSections] = useState<MedicalSection[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [activeApplicantTab, setActiveApplicantTab] = useState<ApplicantTab>(requestedApplicantTab);
	const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({});
	const [selectedSection, setSelectedSection] = useState<string>("");
	const [submitLoading, setSubmitLoading] = useState(false);
	const [submitMessage, setSubmitMessage] = useState<string | null>(null);

	const roleType = getRoleType();
	const safeBusinessType = businessType ?? "retail";
	const safeApplicationId = applicationNumber ?? "";
	const isApplicationIdMissing = !safeApplicationId;

	const sectionList = editableSections;
	const editedSectionTitles = useMemo(
		() =>
			sectionList
				.filter((section) => {
					const initialSection = initialSections.find((item) => item.title === section.title);
					if (!initialSection) {
						return false;
					}

					return JSON.stringify(section.rows) !== JSON.stringify(initialSection.rows);
				})
				.map((section) => section.title),
		[initialSections, sectionList]
	);

	useEffect(() => {
		if (isApplicationIdMissing) {
			return;
		}

		const payload: DRSRequest = {
			applicationId: safeApplicationId,
			roleType,
		};

		const fetchMedicals = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await dispatch(medicalThunk(payload)).unwrap();

				const hydratedSections = response.sections.map((section) => ({
					...section,
					rows: section.rows.map((row) => ({
						...row,
						status: getValidatedStatus(row.value, row.normalRange, row.status),
					})),
				}));

				setMedicalData(response);
				setEditableSections(hydratedSections);
				setInitialSections(hydratedSections);

				const initialExpandedState = hydratedSections.reduce<Record<string, boolean>>((acc, section) => {
					acc[section.title] = false;
					return acc;
				}, {});

				setExpandedAccordions(initialExpandedState);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to fetch medical details.");
			} finally {
				setLoading(false);
			}
		};

		void fetchMedicals();
	}, [dispatch, isApplicationIdMissing, roleType, safeApplicationId]);

	const availableMemberTypes = useMemo(
		() => medicalData?.summary?.map((item) => item.memberType) ?? [],
		[medicalData]
	);

	const visibleTabs = useMemo(
		() => applicantTabs.filter((tab) => availableMemberTypes.includes(tab.key)),
		[availableMemberTypes]
	);

	const currentApplicantTab = useMemo(
		() =>
			visibleTabs.some((tab) => tab.key === activeApplicantTab)
				? activeApplicantTab
				: (visibleTabs[0]?.key ?? "proposer"),
		[activeApplicantTab, visibleTabs]
	);

	const selectedApplicantSummary = useMemo(() => {
		const preferred = medicalData?.summary?.find((item) => item.memberType === currentApplicantTab);
		if (preferred) return preferred;

		if (visibleTabs[0]) {
			return medicalData?.summary?.find((item) => item.memberType === visibleTabs[0].key);
		}

		return medicalData?.summary?.[0];
	}, [currentApplicantTab, medicalData, visibleTabs]);

	const applicantData = getApplicantHeaderData(selectedApplicantSummary);

	const handleMedicalValueChange = (
		sectionTitle: string,
		rowIndex: number,
		nextValue: string
	) => {
		setSubmitMessage(null);
		setExpandedAccordions((previous) => ({
			...previous,
			[sectionTitle]: true,
		}));

		setEditableSections((previousSections) =>
			previousSections.map((section) => {
				if (section.title !== sectionTitle) {
					return section;
				}

				const updatedRows = section.rows.map((row, index) => {
					if (index !== rowIndex) {
						return row;
					}

					const updatedStatus = getValidatedStatus(nextValue, row.normalRange, row.status);

					return {
						...row,
						value: nextValue,
						status: updatedStatus,
					};
				});

				return {
					...section,
					rows: updatedRows,
				};
			})
		);
	};

	const getTestColumns = (sectionTitle: string): Column<MedicalTestRow>[] => [
		{ key: "parameter", header: "Parameter", width: "28%" },
		{
			key: "value",
			header: "Value",
			width: "16%",
			render: (value, row, rowIndex) => {
				const parsedRange = parseNormalRange(row.normalRange);
				const isInvalidNumber = parsedRange !== null && Number.isNaN(Number(value));

				return (
					<CustomTextField
						value={value}
						onChange={(event) => {
							handleMedicalValueChange(sectionTitle, rowIndex, event.target.value);
						}}
						size="small"
						slotProps={{
							htmlInput: {
								inputMode: "decimal",
								style: {
									fontSize: 14,
									paddingTop: 6,
									paddingBottom: 6,
								},
							},
						}}
						error={isInvalidNumber}
						helperText={isInvalidNumber ? "Enter numeric value" : " "}
						sx={{
							minWidth: 110,
							"& .MuiFormHelperText-root": {
								minHeight: 16,
								mb: 0,
							},
						}}
					/>
				);
			},
		},
		{ key: "unit", header: "Unit", width: "18%" },
		{ key: "normalRange", header: "Normal Range", width: "18%" },
		{
			key: "status",
			header: "Status",
			width: "12%",
			render: (value) => (
				<Box
					component="span"
					sx={{
						display: "inline-block",
						width: 10,
						height: 10,
						borderRadius: "50%",
						bgcolor: value === "abnormal" ? "#DE2C3B" : "#2FA641",
					}}
				/>
			),
		},
	];

	const handleSectionFilterChange = (sectionTitle: string) => {
		setSubmitMessage(null);
		setSelectedSection(sectionTitle);
		setExpandedAccordions(
			sectionList.reduce<Record<string, boolean>>((acc, section) => {
				acc[section.title] = sectionTitle !== "" && section.title === sectionTitle;
				return acc;
			}, {})
		);
	};

	const handleSubmit = async () => {
		if (!safeApplicationId) {
			setSubmitMessage("Application ID is missing.");
			return;
		}

		try {
			setSubmitLoading(true);
			setSubmitMessage(null);

			const payload: MedicalSubmitRequest = {
				applicationId: safeApplicationId,
				roleType,
				memberType: currentApplicantTab,
				sections: sectionList,
			};

			const response = await dispatch(medicalSubmitThunk(payload)).unwrap();
			setInitialSections(
				sectionList.map((section) => ({
					...section,
					rows: section.rows.map((row) => ({ ...row })),
				}))
			);
			setSubmitMessage(response.message || "Medical details submitted successfully.");
		} catch (err) {
			setSubmitMessage(err instanceof Error ? err.message : "Failed to submit medical details.");
		} finally {
			setSubmitLoading(false);
		}
	};

	const sectionOptions = useMemo(
		() =>
			sectionList.map((section) => ({
				label: section.title,
				value: section.title,
			})),
		[sectionList]
	);

	const visibleSections = useMemo(
		() =>
			sectionList.filter(
				(section) =>
					editedSectionTitles.includes(section.title) ||
					(selectedSection !== "" && section.title === selectedSection)
			),
		[editedSectionTitles, sectionList, selectedSection]
	);

	return (
		<Container disableGutters sx={{ pb: 4 }}>
			<BackButton
				label="Back to DRS"
				onClick={() => navigate(getDRSPath(safeBusinessType, safeApplicationId))}
			/>

			{isApplicationIdMissing && (
				<Typography sx={{ color: "#DE2C3B", mb: 2 }}>
					Application ID is missing.
				</Typography>
			)}

			{error && (
				<Typography sx={{ color: "#DE2C3B", mb: 2 }}>{error}</Typography>
			)}

			{/* <Box
				sx={{
					bgcolor: "#FFFFFF",
					border: "1px solid #E5E7EB",
					borderRadius: "12px",
					p: 2,
					mb: 2,
				}}
			>
				<Typography sx={{ fontSize: 24, fontWeight: 700, color: "#1E1E1E", mb: 1.5 }}>
					BRE (Business Rules Engine) - {safeApplicationId || "-"}
				</Typography>

				<Box
					sx={{
						p: 2,
						bgcolor: "#F8FAFC",
						borderRadius: "10px",
						display: "grid",
						gridTemplateColumns: {
							xs: "1fr",
							md: "repeat(4, minmax(0, 1fr))",
						},
						rowGap: 2,
						columnGap: 2,
					}}
				>
					{[
						{ label: "Decision", value: medicalData?.decisionStandard ?? "-" },
						{ label: "Decision Date", value: medicalData?.decisionDate ?? "-" },
						{ label: "Discrepancy", value: medicalData?.discrepancy ?? "-" },
						{ label: "Remarks", value: medicalData?.remarks ?? "-" },
						{ label: "Medical Decision", value: medicalData?.medicalDecision ?? "-" },
						{ label: "Medical Decision Date", value: medicalData?.medicalDecisionDate ?? "-" },
						{ label: "Medical Discrepancy", value: medicalData?.medicalDiscrepancy ?? "-" },
						{ label: "Medical Remarks", value: medicalData?.medicalRemarks ?? "-" },
					].map((item) => (
						<Box key={item.label}>
							<Typography sx={{ fontSize: 12, color: "#6B7280" }}>{item.label}</Typography>
							<Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
								{item.value}
							</Typography>
						</Box>
					))}
				</Box>
			</Box> */}

			<BreDecision
				extraFields={medicalData?.breAdditionalFields ?? []}
				breDecisionOverride={medicalData?.breDecision ?? null}
			/>

			<Box sx={{ mt: 2, mb: 2, display: "flex", justifyContent: "center" }}>
				<CustomTabs
					tabs={visibleTabs}
					value={currentApplicantTab}
					onChange={(value) => {
						setActiveApplicantTab(value);
						localStorage.setItem("drsSelectedApplicantTab", value);
					}}
				/>
			</Box>

			<CustomAccordion title="Applicant Profile">
				<Box
					sx={{
						p: 1.5,
						bgcolor: "#F8FAFC",
						borderRadius: "12px",
						display: "flex",
						alignItems: "center",
						gap: 1.5,
					}}
				>
					<Box
						sx={{
							width: 52,
							height: 52,
							borderRadius: "50%",
							overflow: "hidden",
							bgcolor: "#E5E7EB",
						}}
					>
						{applicantData.profileImage && (
							<Box
								component="img"
								src={applicantData.profileImage}
								alt={applicantData.name}
								sx={{ width: "100%", height: "100%", objectFit: "cover" }}
							/>
						)}
					</Box>

					<Box>
						<Typography sx={{ fontSize: 15, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
							{applicantData.name}
						</Typography>
						<Typography sx={{ fontSize: 12, color: "#6B7280" }}>
							{applicantData.gender}, {applicantData.age} Years | DOB: {applicantData.dob}
						</Typography>

						<Box
							sx={{
								mt: 1.5,
								display: "grid",
								gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
								gap: 1.5,
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<BriefcaseIcon />
								<Box>
									<Typography sx={{ fontSize: 12, color: "#6B7280" }}>Occupation</Typography>
									<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{applicantData.occupation}</Typography>
								</Box>
							</Box>

							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<WalletIcon />
								<Box>
									<Typography sx={{ fontSize: 12, color: "#6B7280" }}>Annual Income</Typography>
									<Typography sx={{ fontSize: 14, fontWeight: 600 }}>
										Rs {formatCurrencyINR(applicantData.annualIncome)}
									</Typography>
								</Box>
							</Box>

							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<SmsIcon />
								<Box>
									<Typography sx={{ fontSize: 12, color: "#6B7280" }}>Email</Typography>
									<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{applicantData.email}</Typography>
								</Box>
							</Box>

							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<PhoneIcon />
								<Box>
									<Typography sx={{ fontSize: 12, color: "#6B7280" }}>Mobile</Typography>
									<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{applicantData.mobile}</Typography>
								</Box>
							</Box>
						</Box>
					</Box>
				</Box>
			</CustomAccordion>

			{!loading && sectionList.length > 0 && (
				<Box
					sx={{
						mt: 2,
						mb: 2,
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "320px auto" },
						gap: 2,
						alignItems: "end",
					}}
				>
					<CustomSelect
						label="Select Medical Section"
						value={selectedSection}
						onChange={handleSectionFilterChange}
						options={sectionOptions}
						placeholder="Choose section"
					/>
					<Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
						<CustomButton
							onClick={handleSubmit}
							disabled={submitLoading || isApplicationIdMissing || sectionList.length === 0}
							sx={{ minWidth: 120, borderRadius: "999px" }}
						>
							{submitLoading ? "Submitting..." : "Submit"}
						</CustomButton>
					</Box>
				</Box>
			)}

			{submitMessage && (
				<Typography sx={{ color: submitMessage.toLowerCase().includes("failed") ? "#DE2C3B" : "#0F8A3D", mb: 2 }}>
					{submitMessage}
				</Typography>
			)}

			{loading ? (
				<Typography sx={{ color: "#6B7280" }}>Loading medical details...</Typography>
			) : (
				<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
					{selectedSection === "" && sectionList.length > 0 && (
						<Typography sx={{ color: "#6B7280" }}>
							Select a medical section from dropdown to view tests.
						</Typography>
					)}

					{visibleSections.map((section) => {
						const abnormalCount = section.rows.filter((row) => row.status === "abnormal").length;

						return (
							<CustomAccordion
								key={section.title}
								title={section.title}
								expanded={Boolean(expandedAccordions[section.title])}
								onChange={(expanded) => {
									setExpandedAccordions(
										sectionList.reduce<Record<string, boolean>>((acc, currentSection) => {
											acc[currentSection.title] = currentSection.title === section.title ? expanded : false;
											return acc;
										}, {})
									);
								}}
								titleFontSize={14}
								chip={
									abnormalCount > 0 ? (
										<Box
											component="span"
											sx={{
												display: "inline-flex",
												alignItems: "center",
												gap: 0.5,
												px: 1,
												py: 0.2,
												ml: 1,
												borderRadius: "999px",
												bgcolor: "#FFF6ED",
												color: "#C2410C",
												fontSize: 12,
											}}
										>
											<DangerIcon width={14} height={14} />
											{abnormalCount}
										</Box>
									) : null
								}
								detailPadding={0}
							>
								{section.rows.length > 0 ? (
									<CustomTable<MedicalTestRow> columns={getTestColumns(section.title)} data={section.rows} />
								) : (
									<Typography sx={{ p: 2, color: "#6B7280" }}>
										No test data available for this section.
									</Typography>
								)}
							</CustomAccordion>
						);
					})}
				</Box>
			)}
		</Container>
	);
};

export default ViewMedicals;
