import type { ApplicantInfoTab, ApplicantTab } from "../types/drs.types";

export const reasonOptions = [
  { value: "tea", label: "Tea / Coffee Break" },
  { value: "lunch", label: "Lunch Break" },
  { value: "personal", label: "Personal Work" },
  { value: "meeting", label: "Internal Meeting" },
  { value: "system", label: "System Issue" },
];
export const breakDurationOptions = [
  { label: "15 minutes", value: "15" },
  { label: "30 minutes", value: "30" },
  { label: "45 minutes", value: "45" },
  { label: "60 minutes", value: "60" },
  { label: "90 minutes", value: "90" },
  { label: "120 minutes", value: "120" },
];

export const caseUWDecisionOptions = [
  { label: "Accept", value: "Accept" },
  { label: "Reject", value: "Reject" },
  { label: "Decline", value: "Decline" },
  { label: "Postpone", value: "Postpone" },
  { label: "Counter Offer", value: "Counter Offer" },
  { label: "Refer to HoD", value: "Refer to HoD" },
  { label: "Refer to Sr.UW", value: "Refer to Sr.UW" },
  { label: "Refer to Reinsurer", value: "Refer to Reinsurer" },
  { label: "Refer to HO CMO", value: "Refer to HO CMO" },
  { label: "Refer to Risk", value: "Refer to Risk" },
  { label: "Refer to Accuity", value: "Refer to Accuity" },
  { label: "Raise Requirement", value: "Raise Requirement" },
  { label: "Refer to CUW Claim Pool", value: "Refer to CUW Claim Pool" },
  { label: "Hold", value: "Hold" },
];

export const firstUWDecisionOptions = [
  { label: "Accept", value: "Accept" },
  { label: "Counter Offer", value: "Counter Offer" },
  { label: "Reject", value: "Reject" },
  { label: "Decline", value: "Decline" },
  { label: "Postpone", value: "Postpone" },
  {
    label: "Raise Requirement",
    value: "Raise Requirement",
  },
];

export const decisionCodeOptions = [
  { label: "XXR", value: "XXR" },
  { label: "TAX", value: "TAX" },
  { label: "TJX", value: "TJX" },
];

export const parallelUWDecisionOptions = [
  { label: "Raise Requirement", value: "Raise Requirement" },
  { label: "Refer to HO CMO", value: "Refer to HO CMO" },
  { label: "Refer to Risk", value: "Refer to Risk" },
  { label: "Refer to Accuity", value: "Refer to Accuity" },
  { label: "Tele MER/ Video MER", value: "Tele MER/ Video MER" },
  { label: "None", value: "None" },
];

export const ReferralRisk = [
  { label: "Adverse Profile", value: "Adverse Profile" },
  { label: "DRC Adverse", value: "DRC Adverse" },
  { label: "IIB Adverse", value: "IIB Adverse" },
  { label: "PTRL Adverse", value: "PTRL Adverse" },
];

export const AccuityReferralReasons = [
  { label: "Reason 1", value: "Reason 1" },
  { label: "Reason 2", value: "Reason 2" },
  { label: "Reason 3", value: "Reason 3" },
];

export const ReinsurerReferralReasons = [
  { label: "Reason 1", value: "Reason 1" },
  { label: "Reason 2", value: "Reason 2" },
  { label: "Reason 3", value: "Reason 3" },
];

export const HoldReasons = [
  { label: "Reason 1", value: "Reason 1" },
  { label: "Reason 2", value: "Reason 2" },
  { label: "Reason 3", value: "Reason 3" },
];

export const CUWReferralReasons = [
  { label: "Reason 1", value: "Reason 1" },
  { label: "Reason 2", value: "Reason 2" },
  { label: "Reason 3", value: "Reason 3" },
];

export const ReinsurerOptions = [
  { label: "Swiss Re", value: "Swiss Re" },
  { label: "Munich Re", value: "Munich Re" },
  { label: "SCOR Re", value: "SCOR Re" },
  { label: "Hannover Re", value: "Hannover Re" },
  { label: "RGA", value: "RGA" },
  { label: "GenRe", value: "GenRe" },
];

export const cvtDecisionOptions = [
  { label: "Accept", value: "Accept" },
  { label: "Raise Requirements", value: "Raise Requirements" },
  { label: "Refer to Risk", value: "Refer to Risk" },
  // { label: "Refer to IT", value: "Refer to IT" },
  { label: "Reraise PIVV", value: "Reraise PIVV" },
  { label: "Refer to CUW", value: "Refer to CUW" },
];
export const dvtDecisionOptions = [
  { label: "Accept", value: "Accept" },
  { label: "Raise Requirements", value: "Raise Requirements" },
  { label: "Refer to GUW", value: "Refer to GUW" },
];

export const applicantTabs: { key: ApplicantTab; label: string }[] = [
  { key: "proposer", label: "Proposer" },
  { key: "lifeassured1", label: "Life Assured 1" },
  { key: "lifeassured2", label: "Life Assured 2" },
];

export const applicantInfoTabs: { key: ApplicantInfoTab; label: string }[] = [
  { key: "imageDetails", label: "Image Details" },
  { key: "personalKyc", label: "Personal & KYC" },
  { key: "contactAddress", label: "Contact & Address" },
  { key: "financialProfession", label: "Financial & Profession" },
  { key: "medicalLifestyle", label: "Medical & Lifestyle" },
  { key: "nominee", label: "Nominee" },
  { key: "generic", label: "Generic" },
  { key: "eia", label: "eIA" },
  { key: "fundDetails", label: "Fund Details" },
  { key: "paymentPayoutDetails", label: "Payment & Payout" },
];

export const GenderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Transgender", value: "Transgender" },
];

export const NationalityOptions = [
  { label: "Indian", value: "Indian" },
  { label: "Non-Indian", value: "Non-Indian" },
  { label: "Not Answered", value: "Not Answered" },
];

export const IDProofOptions = [
  { label: "PAN Card", value: "PAN Card" },
  { label: "Voter ID", value: "Voter ID" },
  { label: "Aadhaar Card", value: "Aadhaar Card" },
  { label: "Passport", value: "Passport" },
  { label: "Driving's License", value: "Driving's License" },
];

export const AddressProofOptions = [
  { label: "PAN Card", value: "PAN Card" },
  { label: "Voter ID", value: "Voter ID" },
  { label: "Aadhaar Card", value: "Aadhaar Card" },
  { label: "Passport", value: "Passport" },
  { label: "Driving's License", value: "Driving's License" },
];

export const StateOptions = [
  { label: "Andaman & Nicobar (UT)", value: "Andaman & Nicobar (UT)" },
  { label: "Andhra Pradesh", value: "Andhra Pradesh" },
  { label: "Assam", value: "Assam" },
  { label: "Bihar", value: "Bihar" },
  { label: "Chandigarh (UT)", value: "Chandigarh (UT)" },
  { label: "Chhattisgarh", value: "Chhattisgarh" },
  {
    label: "Dadra and Nagar Haveli (UT)",
    value: "Dadra and Nagar Haveli (UT)",
  },
  { label: "Daman and Diu (UT)", value: "Daman and Diu (UT)" },
  { label: "Delhi (UT)", value: "Delhi (UT)" },
  { label: "Goa", value: "Goa" },
  { label: "Gujarat", value: "Gujarat" },
  { label: "Haryana", value: "Haryana" },
  { label: "Himachal Pradesh", value: "Himachal Pradesh" },
  { label: "Jammu & Kashmir", value: "Jammu & Kashmir" },
  { label: "Jharkhand", value: "Jharkhand" },
  { label: "Karnataka", value: "Karnataka" },
  { label: "Kerala", value: "Kerala" },
  { label: "Lakshadweep (UT)", value: "Lakshadweep (UT)" },
  { label: "Madhya Pradesh", value: "Madhya Pradesh" },
  { label: "Maharashtra", value: "Maharashtra" },
  { label: "Manipur", value: "Manipur" },
  { label: "Meghalaya", value: "Meghalaya" },
  { label: "Mizoram", value: "Mizoram" },
  { label: "Nagaland", value: "Nagaland" },
  { label: "Odisha", value: "Odisha" },
  { label: "Others", value: "Others" },
  { label: "Puducherry (UT)", value: "Puducherry (UT)" },
  { label: "Punjab", value: "Punjab" },
  { label: "Rajasthan", value: "Rajasthan" },
  { label: "Sikkim", value: "Sikkim" },
  { label: "Tamil Nadu", value: "Tamil Nadu" },
  { label: "Telangana", value: "Telangana" },
  { label: "Tripura", value: "Tripura" },
  { label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { label: "Uttarakhand", value: "Uttarakhand" },
  { label: "West Bengal", value: "West Bengal" },
];

export const CountryOptions = [
  { label: "Abkhazia", value: "Abkhazia" },
  { label: "Afghanistan", value: "Afghanistan" },
  { label: "Aland", value: "Aland" },
  { label: "Albania", value: "Albania" },
  { label: "Algeria", value: "Algeria" },
  { label: "American Samoa", value: "American Samoa" },
  { label: "Andorra", value: "Andorra" },
  { label: "Angola", value: "Angola" },
  { label: "Anguilla", value: "Anguilla" },
  { label: "Antigua and Barbuda", value: "Antigua and Barbuda" },
  { label: "Argentina", value: "Argentina" },
  { label: "Armenia", value: "Armenia" },
  { label: "Aruba", value: "Aruba" },
  { label: "Ascension", value: "Ascension" },
  { label: "Australia", value: "Australia" },
  { label: "Austria", value: "Austria" },
  { label: "Azerbaijan", value: "Azerbaijan" },
  { label: "Bahamas", value: "Bahamas" },
  { label: "Bahrain", value: "Bahrain" },
  { label: "Bangladesh", value: "Bangladesh" },
  { label: "Barbados", value: "Barbados" },
  { label: "Belarus", value: "Belarus" },
  { label: "Belgium", value: "Belgium" },
  { label: "Belize", value: "Belize" },
  { label: "Benin", value: "Benin" },
  { label: "Bermuda", value: "Bermuda" },
  { label: "Bhutan", value: "Bhutan" },
  { label: "Bolivia", value: "Bolivia" },
  { label: "Bosnia and Herzegovina", value: "Bosnia and Herzegovina" },
  { label: "Botswana", value: "Botswana" },
  { label: "Brazil", value: "Brazil" },
  { label: "Brunei Darussalam", value: "Brunei Darussalam" },
  { label: "Bulgaria", value: "Bulgaria" },
  { label: "Burkina Faso", value: "Burkina Faso" },
  { label: "Burundi", value: "Burundi" },
  { label: "Cambodia", value: "Cambodia" },
  { label: "Cameroon", value: "Cameroon" },
  { label: "Canada", value: "Canada" },
  { label: "Cape Verde", value: "Cape Verde" },
  { label: "Cayman Islands", value: "Cayman Islands" },
  { label: "Central African Republic", value: "Central African Republic" },
  { label: "Chad", value: "Chad" },
  { label: "Chile", value: "Chile" },
  { label: "China", value: "China" },
  { label: "Colombia", value: "Colombia" },
  { label: "Comoros", value: "Comoros" },
  { label: "Congo (Brazzaville)", value: "Congo (Brazzaville)" },
  { label: "Congo (Kinshasa)", value: "Congo (Kinshasa)" },
  { label: "Costa Rica", value: "Costa Rica" },
  { label: "Croatia", value: "Croatia" },
  { label: "Cuba", value: "Cuba" },
  { label: "Curacao", value: "Curacao" },
  { label: "Cyprus", value: "Cyprus" },
  { label: "Czech Republic", value: "Czech Republic" },
  { label: "Denmark", value: "Denmark" },
  { label: "Djibouti", value: "Djibouti" },
  { label: "Dominica", value: "Dominica" },
  { label: "Dominican Republic", value: "Dominican Republic" },
  { label: "Ecuador", value: "Ecuador" },
  { label: "Egypt", value: "Egypt" },
  { label: "El Salvador", value: "El Salvador" },
  { label: "Equatorial Guinea", value: "Equatorial Guinea" },
  { label: "Eritrea", value: "Eritrea" },
  { label: "Estonia", value: "Estonia" },
  { label: "Ethiopia", value: "Ethiopia" },
  { label: "Faroe Islands", value: "Faroe Islands" },
  { label: "Fiji", value: "Fiji" },
  { label: "Finland", value: "Finland" },
  { label: "France", value: "France" },
  { label: "French Guiana", value: "French Guiana" },
  { label: "French Polynesia", value: "French Polynesia" },
  { label: "Gabon", value: "Gabon" },
  { label: "Gambia", value: "Gambia" },
  { label: "Georgia", value: "Georgia" },
  { label: "Germany", value: "Germany" },
  { label: "Ghana", value: "Ghana" },
  { label: "Gibraltar", value: "Gibraltar" },
  { label: "Greece", value: "Greece" },
  { label: "Greenland", value: "Greenland" },
  { label: "Grenada", value: "Grenada" },
  { label: "Guadeloupe", value: "Guadeloupe" },
  { label: "Guam", value: "Guam" },
  { label: "Guatemala", value: "Guatemala" },
  { label: "Guinea", value: "Guinea" },
  { label: "Guinea-Bissau", value: "Guinea-Bissau" },
  { label: "Guyana", value: "Guyana" },
  { label: "Haiti", value: "Haiti" },
  { label: "Honduras", value: "Honduras" },
  { label: "Hong Kong", value: "Hong Kong" },
  { label: "Hungary", value: "Hungary" },
  { label: "Iceland", value: "Iceland" },
  { label: "India", value: "India" },
  { label: "Indonesia", value: "Indonesia" },
  { label: "Iran", value: "Iran" },
  { label: "Iraq", value: "Iraq" },
  { label: "Ireland", value: "Ireland" },
  { label: "Israel", value: "Israel" },
  { label: "Italy", value: "Italy" },
  { label: "Ivory Coast", value: "Ivory Coast" },
  { label: "Jamaica", value: "Jamaica" },
  { label: "Japan", value: "Japan" },
  { label: "Jordan", value: "Jordan" },
  { label: "Kazakhstan", value: "Kazakhstan" },
  { label: "Kenya", value: "Kenya" },
  { label: "Kuwait", value: "Kuwait" },
  { label: "Kyrgyzstan", value: "Kyrgyzstan" },
  { label: "Laos", value: "Laos" },
  { label: "Latvia", value: "Latvia" },
  { label: "Lebanon", value: "Lebanon" },
  { label: "Lesotho", value: "Lesotho" },
  { label: "Liberia", value: "Liberia" },
  { label: "Libya", value: "Libya" },
  { label: "Liechtenstein", value: "Liechtenstein" },
  { label: "Lithuania", value: "Lithuania" },
  { label: "Luxembourg", value: "Luxembourg" },
  { label: "Madagascar", value: "Madagascar" },
  { label: "Malawi", value: "Malawi" },
  { label: "Malaysia", value: "Malaysia" },
  { label: "Maldives", value: "Maldives" },
  { label: "Mali", value: "Mali" },
  { label: "Malta", value: "Malta" },
  { label: "Mauritania", value: "Mauritania" },
  { label: "Mauritius", value: "Mauritius" },
  { label: "Mexico", value: "Mexico" },
  { label: "Moldova", value: "Moldova" },
  { label: "Monaco", value: "Monaco" },
  { label: "Mongolia", value: "Mongolia" },
  { label: "Montenegro", value: "Montenegro" },
  { label: "Morocco", value: "Morocco" },
  { label: "Mozambique", value: "Mozambique" },
  { label: "Myanmar", value: "Myanmar" },
  { label: "Namibia", value: "Namibia" },
  { label: "Nepal", value: "Nepal" },
  { label: "Netherlands", value: "Netherlands" },
  { label: "New Zealand", value: "New Zealand" },
  { label: "Nicaragua", value: "Nicaragua" },
  { label: "Niger", value: "Niger" },
  { label: "Nigeria", value: "Nigeria" },
  { label: "North Korea", value: "North Korea" },
  { label: "Norway", value: "Norway" },
  { label: "Oman", value: "Oman" },
  { label: "Pakistan", value: "Pakistan" },
  { label: "Panama", value: "Panama" },
  { label: "Papua New Guinea", value: "Papua New Guinea" },
  { label: "Paraguay", value: "Paraguay" },
  { label: "Peru", value: "Peru" },
  { label: "Philippines", value: "Philippines" },
  { label: "Poland", value: "Poland" },
  { label: "Portugal", value: "Portugal" },
  { label: "Qatar", value: "Qatar" },
  { label: "Romania", value: "Romania" },
  { label: "Russia", value: "Russia" },
  { label: "Rwanda", value: "Rwanda" },
  { label: "Saudi Arabia", value: "Saudi Arabia" },
  { label: "Senegal", value: "Senegal" },
  { label: "Serbia", value: "Serbia" },
  { label: "Singapore", value: "Singapore" },
  { label: "Slovakia", value: "Slovakia" },
  { label: "Slovenia", value: "Slovenia" },
  { label: "Somalia", value: "Somalia" },
  { label: "South Africa", value: "South Africa" },
  { label: "South Korea", value: "South Korea" },
  { label: "Spain", value: "Spain" },
  { label: "Sri Lanka", value: "Sri Lanka" },
  { label: "Sudan", value: "Sudan" },
  { label: "Sweden", value: "Sweden" },
  { label: "Switzerland", value: "Switzerland" },
  { label: "Syria", value: "Syria" },
  { label: "Taiwan", value: "Taiwan" },
  { label: "Tanzania", value: "Tanzania" },
  { label: "Thailand", value: "Thailand" },
  { label: "Togo", value: "Togo" },
  { label: "Trinidad and Tobago", value: "Trinidad and Tobago" },
  { label: "Tunisia", value: "Tunisia" },
  { label: "Turkey", value: "Turkey" },
  { label: "Uganda", value: "Uganda" },
  { label: "Ukraine", value: "Ukraine" },
  { label: "United Arab Emirates", value: "United Arab Emirates" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "United States", value: "United States" },
  { label: "Uruguay", value: "Uruguay" },
  { label: "Uzbekistan", value: "Uzbekistan" },
  { label: "Vanuatu", value: "Vanuatu" },
  { label: "Vatican City", value: "Vatican City" },
  { label: "Venezuela", value: "Venezuela" },
  { label: "Vietnam", value: "Vietnam" },
  { label: "Yemen", value: "Yemen" },
  { label: "Zambia", value: "Zambia" },
  { label: "Zimbabwe", value: "Zimbabwe" },
];

export const applicationDetailsFields = [
  { label: "DoB", key: "dob" },
  { label: "Name of Proposer", key: "nameOfProposer" },
  { label: "Product Opted", key: "productOpted" },
  { label: "Plan Opted", key: "planOpted" },
  { label: "Applied SA", key: "appliedSA" },
  { label: "Premium", key: "premium" },
  { label: "Client Type", key: "clientType" },
  { label: "Last Bucket", key: "lastBucket" },
  { label: "Last User", key: "lastUser" },
] as const;

export const rm_team = [
   { "label": "Gops", "value": "Gops" },
   { "label": "System Requirement", "value": "System Requirement" },
   { "label": "UW", "value": "UW" },
];

export const rm_profile = [
  { "label": "Life Assured", "value": "Life Assured" },
  { "label": "Proposer", "value": "Proposer" },
  { "label": "Payer", "value": "Payer" }
];

export const rm_category = [
  { "label": "Declaration", "value": "Declaration" },
  { "label": "Internal", "value": "Internal" },
  { "label": "Document", "value": "Document" },
  { "label": "Customer Declaration Form", "value": "Customer Declaration Form" },
  { "label": "Financial", "value": "Financial" },
  { "label": "OID", "value": "OID" },
  { "label": "Application", "value": "Application" },
  { "label": "Questionnaire", "value": "Questionnaire" },
  { "label": "Medicals", "value": "Medicals" },
  { "label": "Medical", "value": "Medical" },
  { "label": "KYC", "value": "KYC" },
  { "label": "NRI-OCI", "value": "NRI-OCI" },
  { "label": "Business", "value": "Business" },
  { "label": "Business Insurance", "value": "Business Insurance" },
  { "label": "Consent", "value": "Consent" },
  { "label": "PSO OID", "value": "PSO OID" },
  { "label": "Covid", "value": "Covid" }
];

export const rm_sub_category = [
  { "label": "Customer declaration form", "value": "Customer declaration form" },
  { "label": "Joint life", "value": "Joint life" },
  { "label": "Vernacular DCR", "value": "Vernacular DCR" },
  { "label": "Salary", "value": "Salary" },
  { "label": "Salary/ Bussiness", "value": "Salary/ Bussiness" },
  { "label": "Bank Assissement", "value": "Bank Assissement" },
  { "label": "Customer Declaration Form", "value": "Customer Declaration Form" },
  { "label": "Non medical", "value": "Non medical" },
  { "label": "Business/ salaried", "value": "Business/ salaried" },
  { "label": "Surrogates", "value": "Surrogates" },
  { "label": "Medical Questionairre Required", "value": "Medical Questionairre Required" },
  { "label": "Non Medical", "value": "Non Medical" },
  { "label": "CAM sheet", "value": "CAM sheet" },
  { "label": "Accuity", "value": "Accuity" },
  { "label": "Joint life-financial", "value": "Joint life-financial" },
  { "label": "Incomplete Medicals", "value": "Incomplete Medicals" },
  { "label": "Medical Questionnaire Required", "value": "Medical Questionnaire Required" },
  { "label": "Customer declaration", "value": "Customer declaration" },
  { "label": "Business", "value": "Business" },
  { "label": "App form adversity", "value": "App form adversity" },
  { "label": "Salaried", "value": "Salaried" },
  { "label": "Medical findings", "value": "Medical findings" },
  { "label": "Self employed/Business/professional", "value": "Self employed/Business/professional" },
  { "label": "NRI", "value": "NRI" },
  { "label": "Income", "value": "Income" },
  { "label": "Financial", "value": "Financial" },
  { "label": "PAN Card", "value": "PAN Card" },
  { "label": "Medical Findings", "value": "Medical Findings" },
  { "label": "OCI", "value": "OCI" },
  { "label": "Loan sanction letter", "value": "Loan sanction letter" },
  { "label": "Loan", "value": "Loan" },
  { "label": "Income proof", "value": "Income proof" },
  { "label": "Partnership Deed", "value": "Partnership Deed" },
  { "label": "Medical Questionnaire", "value": "Medical Questionnaire" },
  { "label": "Member consent form", "value": "Member consent form" },
  { "label": "Bank statement", "value": "Bank statement" },
  { "label": "Digital consent", "value": "Digital consent" },
  { "label": "Keyman", "value": "Keyman" },
  { "label": "Employer - Employee", "value": "Employer - Employee" },
  { "label": "ECS/Bank", "value": "ECS/Bank" },
  { "label": "Grid Medicals", "value": "Grid Medicals" },
  { "label": "Nominee/PEP/EBI/personal details", "value": "Nominee/PEP/EBI/personal details" },
  { "label": "Report", "value": "Report" },
  { "label": "Status", "value": "Status" },
  { "label": "OCI/PIO", "value": "OCI/PIO" },
  { "label": "EDD", "value": "EDD" },
  { "label": "Minor life", "value": "Minor life" },
  { "label": "Approval", "value": "Approval" },
  { "label": "Premium", "value": "Premium" },
  { "label": "App form", "value": "App form" },
  { "label": "Non Medical", "value": "Non Medical" },
  { "label": "Policy confirmation", "value": "Policy confirmation" },
  { "label": "Certificate", "value": "Certificate" },
  { "label": "UAC", "value": "UAC" },
  { "label": "Declaration", "value": "Declaration" },
  { "label": "Student Life- fin", "value": "Student Life- fin" },
  { "label": "Trust", "value": "Trust" },
  { "label": "HUF", "value": "HUF" },
  { "label": "Student Life-Fin", "value": "Student Life-Fin" },
  { "label": "Housewife", "value": "Housewife" },
  { "label": "PIVV", "value": "PIVV" },
  { "label": "Credit Society", "value": "Credit Society" },
  { "label": "Clear/complete Copy", "value": "Clear/complete Copy" },
  { "label": "TOF", "value": "TOF" },
  { "label": "Partnership", "value": "Partnership" },
  { "label": "Business insurance", "value": "Business insurance" },
  { "label": "Premium Related", "value": "Premium Related" },
  { "label": "Risk", "value": "Risk" },
  { "label": "IIB Findings", "value": "IIB Findings" },
  { "label": "Medicals due to TU", "value": "Medicals due to TU" },
  { "label": "medicals due to VMER", "value": "medicals due to VMER" },
  { "label": "Previous policy substd", "value": "Previous policy substd" },
  { "label": "Nominee/PEP/EBI", "value": "Nominee/PEP/EBI" },
  { "label": "Nominee/PEP/EBI/Personal details", "value": "Nominee/PEP/EBI/Personal details" },
  { "label": "Agriculturist", "value": "Agriculturist" },
  { "label": "Medical Questionnaire", "value": "Medical Questionnaire" },
  { "label": "MHR", "value": "MHR" },
  { "label": "PAN", "value": "PAN" }
];

export const rm_document = [
  {
    "label": "Disability",
    "value": "Disability"
  },
  {
    "label": "Loan",
    "value": "Loan"
  },
  {
    "label": "Accuity check",
    "value": "Accuity check"
  },
  {
    "label": "Partial Medicals",
    "value": "Partial Medicals"
  },
  {
    "label": "PEP Declaration",
    "value": "PEP Declaration"
  },
  {
    "label": "Epilepsy",
    "value": "Epilepsy"
  },
  {
    "label": "Vernacular declaration",
    "value": "Vernacular declaration"
  },
  {
    "label": "NRI",
    "value": "NRI"
  },
  {
    "label": "partnership document",
    "value": "partnership document"
  },
  {
    "label": "Application form",
    "value": "Application form"
  },
  {
    "label": "Bank statement/ salary slip",
    "value": "Bank statement/ salary slip"
  },
  {
    "label": "Diabetes",
    "value": "Diabetes"
  },
  {
    "label": "ITR/COI",
    "value": "ITR/COI"
  },
  {
    "label": "PMEs",
    "value": "PMEs"
  },
  {
    "label": "ITR/CPI",
    "value": "ITR/CPI"
  },
  {
    "label": "Occupation Questionnaire",
    "value": "Occupation Questionnaire"
  },
  {
    "label": "Merchant marine",
    "value": "Merchant marine"
  },
  {
    "label": "Dual Signature Declaration",
    "value": "Dual Signature Declaration"
  },
  {
    "label": "Passport",
    "value": "Passport"
  },
  {
    "label": "Tuberculosis",
    "value": "Tuberculosis"
  },
  {
    "label": "Bank statement",
    "value": "Bank statement"
  },
  {
    "label": "Occupation",
    "value": "Occupation"
  },
  {
    "label": "ITR/bank statement/salary slip",
    "value": "ITR/bank statement/salary slip"
  },
  {
    "label": "loan",
    "value": "loan"
  },
  {
    "label": "OID",
    "value": "OID"
  },
  {
    "label": "FD/Portfolio/SIP/Car IDV",
    "value": "FD/Portfolio/SIP/Car IDV"
  },
  {
    "label": "Photo",
    "value": "Photo"
  },
  {
    "label": "Blood test",
    "value": "Blood test"
  },
  {
    "label": "NRI-OCI",
    "value": "NRI-OCI"
  },
  {
    "label": "Loan account statement",
    "value": "Loan account statement"
  },
  {
    "label": "ITR",
    "value": "ITR"
  },
  {
    "label": "Document",
    "value": "Document"
  },
  {
    "label": "Medical Questionnaire",
    "value": "Medical Questionnaire"
  },
  {
    "label": "Consent",
    "value": "Consent"
  },
  {
    "label": "Endorsement",
    "value": "Endorsement"
  },
  {
    "label": "Annexure",
    "value": "Annexure"
  },
  {
    "label": "Bank details",
    "value": "Bank details"
  },
  {
    "label": "Cardiac",
    "value": "Cardiac"
  },
  {
    "label": "Family History/Email",
    "value": "Family History/Email"
  },
  {
    "label": "MOA AOA",
    "value": "MOA AOA"
  },
  {
    "label": "MWP",
    "value": "MWP"
  },
  {
    "label": "Agent Report",
    "value": "Agent Report"
  },
  {
    "label": "OID/PSO",
    "value": "OID/PSO"
  },
  {
    "label": "premium payment",
    "value": "premium payment"
  },
  {
    "label": "Third party",
    "value": "Third party"
  },
  {
    "label": "CSO/Level9/BM",
    "value": "CSO/Level9/BM"
  },
  {
    "label": "Personal Information",
    "value": "Personal Information"
  },
  {
    "label": "Payor",
    "value": "Payor"
  },
  {
    "label": "Tele",
    "value": "Tele"
  },
  {
    "label": "Declaration form",
    "value": "Declaration form"
  },
  {
    "label": "App form",
    "value": "App form"
  },
  {
    "label": "Hypertension",
    "value": "Hypertension"
  },
  {
    "label": "Alcohol",
    "value": "Alcohol"
  },
  {
    "label": "Agricuture",
    "value": "Agricuture"
  },
  {
    "label": "Arthritis",
    "value": "Arthritis"
  },
  {
    "label": "BOW",
    "value": "BOW"
  },
  {
    "label": "COI",
    "value": "COI"
  },
  {
    "label": "Epilepsy",
    "value": "Epilepsy"
  },
  {
    "label": "Gynac",
    "value": "Gynac"
  },
  {
    "label": "health",
    "value": "health"
  },
  {
    "label": "PEP",
    "value": "PEP"
  },
  {
    "label": "Keyman",
    "value": "Keyman"
  },
  {
    "label": "Ophthalmic",
    "value": "Ophthalmic"
  },
  {
    "label": "OTP",
    "value": "OTP"
  },
  {
    "label": "Annuity",
    "value": "Annuity"
  },
  {
    "label": "Declaration",
    "value": "Declaration"
  },
  {
    "label": "Acuity Check",
    "value": "Acuity Check"
  },
  {
    "label": "Invalid",
    "value": "Invalid"
  },
    {
    "label": "Bank statement",
    "value": "Bank statement"
  },
  {
    "label": "Re-submit Marital Status declaration",
    "value": "Re-submit Marital Status declaration"
  },
  {
    "label": "Nominee",
    "value": "Nominee"
  },
  {
    "label": "Occupation",
    "value": "Occupation"
  },
  {
    "label": "Declaration",
    "value": "Declaration"
  },
  {
    "label": "OID/PSO",
    "value": "OID/PSO"
  },
  {
    "label": "Addendum",
    "value": "Addendum"
  },
  {
    "label": "Deed",
    "value": "Deed"
  },
  {
    "label": "Tele",
    "value": "Tele"
  },
  {
    "label": "Declaration form",
    "value": "Declaration form"
  },
  {
    "label": "health Declaration",
    "value": "health Declaration"
  },
  {
    "label": "Parents Income",
    "value": "Parents Income"
  },
  {
    "label": "Armed Forces",
    "value": "Armed Forces"
  },
  {
    "label": "Agent report",
    "value": "Agent report"
  },
  {
    "label": "MER/VMER/TU",
    "value": "MER/VMER/TU"
  },
  {
    "label": "Blood test",
    "value": "Blood test"
  },
  {
    "label": "USG",
    "value": "USG"
  },
  {
    "label": "ITR/CPI",
    "value": "ITR/CPI"
  },
  {
    "label": "Salary slip",
    "value": "Salary slip"
  },
  {
    "label": "Profit and loss a/c",
    "value": "Profit and loss a/c"
  },
  {
    "label": "Form J/land documents",
    "value": "Form J/land documents"
  },
  {
    "label": "premium payment",
    "value": "premium payment"
  },
  {
    "label": "ITR",
    "value": "ITR"
  },
  {
    "label": "FD/Portfolio/SIP/Car IDV",
    "value": "FD/Portfolio/SIP/Car IDV"
  },
  {
    "label": "PMEs",
    "value": "PMEs"
  },
  {
    "label": "GST",
    "value": "GST"
  },
  {
    "label": "NRE Bank statement",
    "value": "NRE Bank statement"
  },
  {
    "label": "Cardiac",
    "value": "Cardiac"
  },
  {
    "label": "ADD",
    "value": "ADD"
  },
  {
    "label": "Verfication",
    "value": "Verfication"
  },
  {
    "label": "XRAY",
    "value": "XRAY"
  },
  {
    "label": "RUA",
    "value": "RUA"
  },
  {
    "label": "Certificate",
    "value": "Certificate"
  },
  {
    "label": "Clear copy",
    "value": "Clear copy"
  },
  {
    "label": "Loan",
    "value": "Loan"
  },
  {
    "label": "Suitability",
    "value": "Suitability"
  },
  {
    "label": "Respiratory",
    "value": "Respiratory"
  },
  {
    "label": "Endorsement",
    "value": "Endorsement"
  },
  {
    "label": "Family History/Personal details",
    "value": "Family History/Personal details"
  },
  {
    "label": "Form J",
    "value": "Form J"
  },
  {
    "label": "Education/Sign",
    "value": "Education/Sign"
  },
  {
    "label": "HID",
    "value": "HID"
  },
  {
    "label": "Bank details",
    "value": "Bank details"
  },
  {
    "label": "Annexure",
    "value": "Annexure"
  },
  {
    "label": "PEP",
    "value": "PEP"
  },
  {
    "label": "Minor Life",
    "value": "Minor Life"
  },
  {
    "label": "income proof",
    "value": "income proof"
  },
  {
    "label": "Parents Insurance",
    "value": "Parents Insurance"
  },
  {
    "label": "X-ray",
    "value": "X-ray"
  },
  {
    "label": "CSO/Level9/BM",
    "value": "CSO/Level9/BM"
  },
  {
    "label": "COI",
    "value": "COI"
  },
  {
    "label": "Annexure/Questionnaire",
    "value": "Annexure/Questionnaire"
  },
  {
    "label": "MOA AOA",
    "value": "MOA AOA"
  },
  {
    "label": "Resolution",
    "value": "Resolution"
  },
  {
    "label": "NRI",
    "value": "NRI"
  },
  {
    "label": "OID status",
    "value": "OID status"
  },
  {
    "label": "Renewal Pending",
    "value": "Renewal Pending"
  },
  {
    "label": "Fund Transfer",
    "value": "Fund Transfer"
  },
  {
    "label": "Declaration ",
    "value": "Declaration "
  },
  {
    "label": "HNI",
    "value": "HNI"
  },
  {
    "label": "health",
    "value": "health"
  },
  {
    "label": "Tuberculosis",
    "value": "Tuberculosis"
  },
  {
    "label": "Third party",
    "value": "Third party"
  },
  {
    "label": "EBI",
    "value": "EBI"
  },
  {
    "label": "Partial Medicals",
    "value": "Partial Medicals"
  },
  {
    "label": "Declaration",
    "value": "Declaration"
  },
  {
    "label": "Husband income",
    "value": "Husband income"
  },
  {
    "label": "Verification",
    "value": "Verification"
  },
  {
    "label": "FD/Portfolio/car idv/SIP",
    "value": "FD/Portfolio/car idv/SIP"
  },
  {
    "label": "Disability",
    "value": "Disability"
  },
  {
    "label": "Criminial proceeding",
    "value": "Criminial proceeding"
  },
  {
    "label": "Keyman",
    "value": "Keyman"
  },
  {
    "label": "OID",
    "value": "OID"
  },
  {
    "label": "Education/Sign/Income",
    "value": "Education/Sign/Income"
  },
  {
    "label": "Assignment",
    "value": "Assignment"
  },
  {
    "label": "BOW",
    "value": "BOW"
  },
  {
    "label": "Affidavit",
    "value": "Affidavit"
  },
  {
    "label": "School/College admission proof",
    "value": "School/College admission proof"
  },
  {
    "label": "Resubmit school/College admission proof",
    "value": "Resubmit school/College admission proof"
  },
  {
    "label": "School/College fee receipt",
    "value": "School/College fee receipt"
  },
  {
    "label": "Resubmit school/College fee receipt",
    "value": "Resubmit school/College fee receipt"
  },
  {
    "label": "Schedule of Fees",
    "value": "Schedule of Fees"
  },
  {
    "label": "Resubmit Schedule of Fees",
    "value": "Resubmit Schedule of Fees"
  },
  {
    "label": "FCCR",
    "value": "FCCR"
  },
  {
    "label": "Moral Hazard Report",
    "value": "Moral Hazard Report"
  },
  {
    "label": "PAN Card",
    "value": "PAN Card"
  }
];

export const rm_reason = [
  { "label": "Documents submitted not clear", "value": "DOC_NOT_CLEAR" },
  { "label": "Documents not submitted", "value": "DOC_NOT_SUBMITTED" },
  { "label": "Incomplete/Invalid document submitted", "value": "INCOMPLETE_INVALID_DOCUMENT" },
  { "label": "Joint Life Identification", "value": "JOINT_LIFE_IDENTIFICATION" },
  { "label": "Vernacular DCR Not Given", "value": "VERNACULAR_DCR_NOT_GIVEN" },
  { "label": "Latest income proof required", "value": "LATEST_INCOME_PROOF_REQUIRED" },
  { "label": "Income proof not clear", "value": "INCOME_PROOF_NOT_CLEAR" },
  { "label": "Clear copy of Latest income proof required", "value": "CLEAR_COPY_INCOME_PROOF_REQUIRED" },
  { "label": "CAM sheet Required", "value": "CAM_SHEET_REQUIRED" },
  { "label": "Document not uploaded", "value": "DOCUMENT_NOT_UPLOADED" },
  { "label": "Complete duly filled CDF Required", "value": "CDF_REQUIRED" },
  { "label": "Policies with other insurance company", "value": "OTHER_INSURANCE_POLICIES" },
  { "label": "Income proof not given", "value": "INCOME_PROOF_NOT_GIVEN" },
  { "label": "Surrogates required as additional income proof for financial eligibility", "value": "SURROGATES_REQUIRED" },
  { "label": "Mismatch in documents submitted with application form", "value": "DOCUMENT_APPLICATION_MISMATCH" },
  { "label": "Medical Questionnaire Required", "value": "MEDICAL_QUESTIONNAIRE_REQUIRED" },
  { "label": "Non medical Questionnaire not submitted", "value": "NON_MEDICAL_QUESTIONNAIRE_NOT_SUBMITTED" },
  { "label": "Accuity pending", "value": "ACCUIY_PENDING" },
  { "label": "Loan details required", "value": "LOAN_DETAILS_REQUIRED" },
  { "label": "Incomplete medicals done", "value": "INCOMPLETE_MEDICALS_DONE" },
  { "label": "Declaration Required", "value": "DECLARATION_REQUIRED" },
  { "label": "Questionnaire Required", "value": "QUESTIONNAIRE_REQUIRED" },
  { "label": "Medical history noted on application form /MER/TU/VMER", "value": "MEDICAL_HISTORY_DISCLOSED" },
  { "label": "Partial income proof submitted", "value": "PARTIAL_INCOME_PROOF_SUBMITTED" },
  { "label": "Additional medical test required", "value": "ADDITIONAL_MEDICAL_TEST_REQUIRED" },
  { "label": "Copy submitted is not clear", "value": "COPY_NOT_CLEAR" },
  { "label": "Discrepancy noted on Loan sanction letter", "value": "LOAN_SANCTION_LETTER_DISCREPANCY" },
  { "label": "Additional business income proof required", "value": "ADDITIONAL_BUSINESS_INCOME_PROOF_REQUIRED" },
  { "label": "Shareholding of life assured in partnership business", "value": "SHAREHOLDING_DETAILS_REQUIRED" },
  { "label": "Medical adversity disclosed in TU/VMER/MER", "value": "MEDICAL_ADVERSITY_DISCLOSED" },
  { "label": "For processing case", "value": "PROCESSING_CASE" },
  { "label": "Financial grid/Financial eligibility calculation", "value": "FINANCIAL_GRID_REQUIRED" },
  { "label": "Submitted income proof not clear", "value": "SUBMITTED_INCOME_PROOF_NOT_CLEAR" },
  { "label": "Documents uploaded is not clear", "value": "DOCUMENTS_UPLOADED_NOT_CLEAR" },
  { "label": "Mandatory document not submitted", "value": "MANDATORY_DOCUMENT_NOT_SUBMITTED" },
  { "label": "ECS/Bank Details not submitted", "value": "ECS_BANK_DETAILS_NOT_SUBMITTED" },
  { "label": "Mandatory medicals not done", "value": "MANDATORY_MEDICALS_NOT_DONE" },
  { "label": "Mandatory details are not provided", "value": "MANDATORY_DETAILS_NOT_PROVIDED" },
  { "label": "Mandatory document not provided", "value": "MANDATORY_DOCUMENT_NOT_PROVIDED" },
  { "label": "Policies with other insurance companies noted in Proposal status", "value": "PROPOSAL_STATUS_OTHER_POLICIES" },
  { "label": "Income proof given is not clear", "value": "INCOME_PROOF_GIVEN_NOT_CLEAR" },
  { "label": "Submitted document is not clear", "value": "SUBMITTED_DOCUMENT_NOT_CLEAR" },
  { "label": "Approval Required", "value": "APPROVAL_REQUIRED" },
  { "label": "Mismatch in information provided", "value": "INFORMATION_MISMATCH" }
];