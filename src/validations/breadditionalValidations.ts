export type AdditionalUwValidationResult =
    | { isValid: true; message?: never }
    | { isValid: false; message: string; ruleId: number };

type DecisionScope =
    | "ALL_TERMINAL"
    | "EXCEPT_DECLINE_POSTPONE"
    | "EXCEPT_DECLINE_POSTPONE_REJECT"
    | "STANDARD"
    | "EXTRA_PREMIUM"
    | "EXTRA_PREMIUM_OR_COUNTER_OFFER"
    | "COUNTER_OFFER"
    | "REJECT"
    | "DECLINE_POSTPONE";

type AdditionalUwValidationRule = {
    id: number;
    flag: string;
    scope: DecisionScope;
    product: string;
    condition: string;
    message: string;
    decisionCodes?: string[];
};

/*
 * The API sets a rule flag to true only when that spreadsheet row's
 * product and non-decision condition are satisfied. This validator owns
 * the selected-decision/decision-code check and the user-facing message.
 */
const RULES: AdditionalUwValidationRule[] = [
    {
        "id": 18,
        "flag": "rule18",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "GOLD & GIFT Plan Rider ACPD or ADBY or ATPD or ACPD",
        "condition": "Annual income in Tele MARS screen is < 3lac for Indian Nationality or < 10 lac for Other than Indian Nationality",
        "message": "Annual income at Tele MER is less than allowable limit, please take counter sign"
    },
    {
        "id": 19,
        "flag": "rule19",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "GOLD & GIFT Rider ACPD or ADBY or ATPD or ACPD",
        "condition": "Education in Tele MARS screen is < SSC",
        "message": "Education at Tele MER is less than allowable limit, please take counter sign"
    },
    {
        "id": 20,
        "flag": "rule20",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "UW5",
        "condition": "If user gives terminal decision and current application is non-Individual & has attached ADBY or ACPD rider",
        "message": "Decline the case as non-Individual application not allowed"
    },
    {
        "id": 21,
        "flag": "rule21",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "UW5",
        "condition": "If CUW/ CPT/ DVT user give terminal decision (exclude Decline/ postpone) & if occupation is “Student” or “Housewife\" or “Agriculture” or “Retired”",
        "message": "Decline the case as student or housewife are non-allowable occupation"
    },
    {
        "id": 22,
        "flag": "rule22",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "E32, E35, UW5",
        "condition": "If CUW/ CPT/ DVT user give terminal decision (exclude Decline/ postpone) & current application is non-Individual & has attached ADBV or ADBY or ATPD or ACPD rider.",
        "message": "Decline the case as non-Individual application not allowed"
    },
    {
        "id": 24,
        "flag": "rule24",
        "scope": "EXTRA_PREMIUM",
        "product": "UW5",
        "condition": "for UW5 plan if in MCA/IBM in \"Family & Medical\" tab value of Smoker Indicator or Tobacco Indicator as \"Yes\" ",
        "message": "XRT decision not allowed for smoker, Kindly Decline the case."
    },
    {
        "id": 25,
        "flag": "rule25",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "UW5",
        "condition": "For UW5 Plan if under Family & Medical tab value of Smoker Indicator and Tobacco Indicator is \"No\" and if under Other Medical MARS screen COT data entry done as \"Positive\" Or on MER MARS screen under Habit and Addiction if \"Cigarettes/beedis/cigar\" Or \"Gutka / snuff / Paan etc.\" any one of these questions answered as \"Yes” Or on Tele MER MARS screen under Habit and Addiction if \"Cigarettes/beedis/cigar\" Or \"Gutka / snuff / Paan etc.\"  any one of these questions answered as \"Yes\"",
        "message": "Standard/Counteroffer/XRT decision not allowed for smoker, Kindly decline the case."
    },
    {
        "id": 26,
        "flag": "rule26",
        "scope": "EXTRA_PREMIUM",
        "product": "UW5",
        "condition": "For UW5 Plan if under Family & Medical tab value of Smoker Indicator and Tobacco Indicator is \"No\" and if under Other Medical MARS screen COT data entry done as \"Positive\" Or on MER MARS screen under Habit and Addiction if \"Cigarettes/beedis/cigar\" Or \"Gutka / snuff / Paan etc.\" any one of these questions answered as \"Yes” Or on Tele MER MARS screen under Habit and Addiction if \"Cigarettes/beedis/cigar\" Or \"Gutka / snuff / Paan etc.\"  any one of these questions answered as \"Yes\"",
        "message": "XRT decision not allowed for smoker, Kindly Decline the case."
    },
    {
        "id": 27,
        "flag": "rule27",
        "scope": "ALL_TERMINAL",
        "product": "All products",
        "condition": "If CUW users’ detail is not available in Authority Limit master of MCA DB and user try to give any terminal decision",
        "message": "Your User ID not available in MCA limit master table, cannot take any terminal decision"
    },
    {
        "id": 28,
        "flag": "rule28",
        "scope": "ALL_TERMINAL",
        "product": "All products",
        "condition": "If CUW users’ detail is not available in Authority Limit master of IBM DB and user try to give any terminal decision",
        "message": "Your User ID not available in IBM limit master table, cannot take any terminal decision"
    },
    {
        "id": 29,
        "flag": "rule29",
        "scope": "ALL_TERMINAL",
        "product": "All products",
        "condition": "If case is non-medical & if upper or/& lower non-medical UW limit is Blank in Authority Limit master of MCA DB & user try to give any terminal decision",
        "message": "Your Non-medical UW limit not updated in MCA master table, cannot take any terminal decision"
    },
    {
        "id": 30,
        "flag": "rule30",
        "scope": "ALL_TERMINAL",
        "product": "All products",
        "condition": "If case is non-medical & if upper or/& lower non-medical UW limit is Blank in Authority Limit master of IBM DB & user try to give any terminal decision",
        "message": "Your Non-medical UW limit not updated in IBM master table, cannot take any terminal decision"
    },
    {
        "id": 31,
        "flag": "rule31",
        "scope": "ALL_TERMINAL",
        "product": "All products",
        "condition": "If case is medical & if upper or/& lower medical UW limit is Blank in Authority Limit master of MCA DB & user try to give any terminal decision",
        "message": "Your Medical UW limit not updated in MCA master table, cannot take any terminal decision"
    },
    {
        "id": 32,
        "flag": "rule32",
        "scope": "ALL_TERMINAL",
        "product": "All products",
        "condition": "If case is medical & if upper or/& lower medical UW limit is Blank in Authority Limit master of IBM DB & user try to give any terminal decision",
        "message": "Your Medical UW limit not updated in IBM master table, cannot take any terminal decision"
    },
    {
        "id": 33,
        "flag": "rule33",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "All products",
        "condition": "If RSK discrepancy is accepted and _IRISK_ Comment not mentioned",
        "message": "Risk Report not received, cannot take terminal decision."
    },
    {
        "id": 34,
        "flag": "rule34",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "IPS",
        "condition": "If Life Insured's resident status is other than Indian and average annual income on DRS Financial Data CUW section is below 10 Lakh or Age above 60 years Or application form education is below \"Graduate \"",
        "message": "Boundary criteria not met for NRI Profile, cannot take terminal decision."
    },
    {
        "id": 38,
        "flag": "rule38",
        "scope": "EXTRA_PREMIUM_OR_COUNTER_OFFER",
        "product": "LC Solution (UW3(signature)+ WPLF/WPHL/WPLH)",
        "condition": "In UW3 plan with LC Story code if CUW user try to give XRT or Counter offer decision for other than base plan then system should not allow the XRT or Counter offer decision",
        "message": "\"Extra Premium” Or “Counter Offer” decision not allowed on Rider in this solution, Kindly Decline the case."
    },
    {
        "id": 39,
        "flag": "rule39",
        "scope": "EXTRA_PREMIUM_OR_COUNTER_OFFER",
        "product": "KZ Solution (UW3+ WPLF/WPHL/WPLH)",
        "condition": "In UW3 plan with KZ Story code if CUW user try to give XRT or Counter offer decision for other than base plan then system should not allow the XRT or Counter offer decision",
        "message": "\"Extra Premium” Or “Counter Offer” decision not allowed on Rider in this solution, Kindly Decline the case."
    },
    {
        "id": 40,
        "flag": "rule40",
        "scope": "EXTRA_PREMIUM_OR_COUNTER_OFFER",
        "product": "KY Solution (E36 + WOPH/WPLI/WOPB",
        "condition": "In E36 plan with KY Story code if CUW user try to give XRT or Counter offer decision for other than base plan then system should not allow the XRT or Counter offer decision",
        "message": "\"Extra Premium” Or “Counter Offer” decision not allowed on Rider in this solution, Kindly Decline the case."
    },
    {
        "id": 41,
        "flag": "rule41",
        "scope": "EXTRA_PREMIUM",
        "product": "UW5",
        "condition": "For UW5 Plan if under Family & Medical tab value of Smoker Indicator and Tobacco Indicator is \"No\" and if under Other Medical MARS screen COT data entry done as \"Non_reactive Or Negative\" Or on MER MARS screen under Habit and Addiction if \"Cigarettes/beedis/cigar\" Or \"Gutka / snuff / Paan etc.\" any one of these questions answered as \"No” Or on Tele MER MARS screen under Habit and Addiction if \"Cigarettes/beedis/cigar\" Or \"Gutka / snuff / Paan etc.\"  any one of these questions answered as \"No\" and If CUW user takes Extra Premium decision for Base & if select Class requirement as Class- III Or Class- IV Or Class-V Or Class-VI or Class- VII)",
        "message": "Decline the case as extra premium class-III and above for base not allowed."
    },
    {
        "id": 42,
        "flag": "rule42",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "UW5",
        "condition": "For UW5 Plan if under Family & Medical tab value of Smoker Indicator and Tobacco Indicator is \"No\" and if under Other Medical MARS screen COT data entry done as \"Reactive Or Positive\" Or on MER MARS screen under Habit and Addiction if \"Cigarettes/beedis/cigar\" Or \"Gutka / snuff / Paan etc.\" any one of these questions answered as \"Yes” Or on Tele MER MARS screen under Habit and Addiction if \"Cigarettes/beedis/cigar\" Or \"Gutka / snuff / Paan etc.\"  any one of these questions answered as \"Yes\"",
        "message": "Personal habits of smoking/tobacco consumption, Kindly Decline the case."
    },
    {
        "id": 43,
        "flag": "rule43",
        "scope": "EXTRA_PREMIUM",
        "product": "UW5",
        "condition": "If Base cover is less than 67,00,000 and CUW user takes Extra Premium decision for Base with any class XRT.",
        "message": "Extra Premium Decision not allowed for applied Sum Assured, Kindly Decline the case."
    },
    {
        "id": 44,
        "flag": "rule44",
        "scope": "EXTRA_PREMIUM",
        "product": "UW5",
        "condition": "If Base cover is less than 100,00,000 and CUW user takes Extra Premium decision for Base with XRT Class-II",
        "message": "Extra Premium Decision with Class II not allowed for applied Sum Assured, Kindly Decline the case."
    },
    {
        "id": 45,
        "flag": "rule45",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "Annuity/Pension",
        "condition": "Accuity transaction status as \n“True Match” or \"Escalate to CUW Manager",
        "message": "Adverse \nAccuity transaction Status, please take counter sign"
    },
    {
        "id": 46,
        "flag": "rule46",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "Annuity/Pension",
        "condition": "Accuity transaction\n status as Open",
        "message": "Accuity status is Open - cannot take decision other than Decline/Postpone"
    },
    {
        "id": 47,
        "flag": "rule47",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "PB source Saving Plan ",
        "condition": "PVD Response is \"Fail\" ",
        "message": "PVD response fail, cannot take terminal decision."
    },
    {
        "id": 48,
        "flag": "rule48",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "PB source Saving Plan",
        "condition": "PVD Response is \"Blank\" ",
        "message": "PVD response blank, click on “Trigger PVD” for response or refer approver for terminal decision."
    },
    {
        "id": 49,
        "flag": "rule49",
        "scope": "EXTRA_PREMIUM",
        "product": "UW8",
        "condition": "If CUW user takes Terminal decision as Extra Premium (XRT)",
        "message": "Decline the case as XRT decision not allowed for this product"
    },
    {
        "id": 50,
        "flag": "rule50",
        "scope": "COUNTER_OFFER",
        "product": "UW8",
        "condition": "If CUW user takes Counter Offer decision for Base or Rider",
        "message": "Counter Offer decision not allowed. Kindly Decline the case."
    },
    {
        "id": 56,
        "flag": "rule56",
        "scope": "STANDARD",
        "product": "UW4",
        "condition": "If CUW user select Terminal decision as “Standard\" decision with decision code BS3 or BS4 and Product component value is ULWA",
        "message": "Decline the case as BS3 & BS4 decision not allowed in ‘Assure Option’",
        "decisionCodes": [
            "BS3",
            "BS4"
        ]
    },
    {
        "id": 57,
        "flag": "rule57",
        "scope": "EXTRA_PREMIUM",
        "product": "UW4",
        "condition": "If CUW user takes Terminal decision as Extra Premium (XRT)",
        "message": "Decline the case as Extra Premium (XRT) decision not allowed for this product"
    },
    {
        "id": 60,
        "flag": "rule60",
        "scope": "EXCEPT_DECLINE_POSTPONE_REJECT",
        "product": "All",
        "condition": "If WOP rider opted (WPLI/WOPH/WOPB/WPLF/WPHL/WPLH) and LA & PR is same Or different and LA Or PR Criminal Question answered is 'BLANK' or “Null” or “Yes” or Tag is missing",
        "message": "Criminal case - Kindly take HOD approval"
    },
    {
        "id": 61,
        "flag": "rule61",
        "scope": "STANDARD",
        "product": "UW9",
        "condition": "If CUW user select Terminal decision as “Standard\" decision with BS3 & BS4 wherein STATCODE value is other than Blank & F00 ",
        "message": "BS3 & BS4 decision not allowed as ‘Family income benefit is inbuilt feature.Kindly decline the case.",
        "decisionCodes": [
            "BS3",
            "BS4"
        ]
    },
    {
        "id": 62,
        "flag": "rule62",
        "scope": "EXTRA_PREMIUM",
        "product": "UW9",
        "condition": "If CUW user takes Terminal decision as Extra Premium (XRT)",
        "message": "Decline the case as XRT decision not allowed for this product"
    },
    {
        "id": 63,
        "flag": "rule63",
        "scope": "EXTRA_PREMIUM",
        "product": "Term + CICL OR CICM",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision with CLASS III for CICL (ICICI Pru Non - Linked Health Protect Rider - 20CI Package) OR CICM (ICICI Pru Non - Linked Health Protect Rider - 60CI Package) rider",
        "message": "EMR loading Class III, kindly refer to reinsurer"
    },
    {
        "id": 64,
        "flag": "rule64",
        "scope": "ALL_TERMINAL",
        "product": "Term + CICL OR CICM",
        "condition": "If CI TSA is above 50 lakh AND CUW user select any Terminal decision",
        "message": "CI TSA above 50 lakh, kindly refer to reinsurer"
    },
    {
        "id": 65,
        "flag": "rule65",
        "scope": "EXTRA_PREMIUM",
        "product": "Term + CICL OR CICM",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision above CLASS III for CICL (ICICI Pru Non - Linked Health Protect Rider - 20CI Package) OR CICM (ICICI Pru Non - Linked Health Protect Rider - 60CI Package) rider",
        "message": "EMR loading above Class III not allowed, kindly decline the rider"
    },
    {
        "id": 66,
        "flag": "rule66",
        "scope": "STANDARD",
        "product": "UB9",
        "condition": "If CUW user select Terminal decision as “Standard\" decision with BS3 & BS4 wherein STATCODE value is other than Blank & F00 ",
        "message": "BS3 & BS4 decision not allowed in ‘Family income benefit option. Kindly decline the case.",
        "decisionCodes": [
            "BS3",
            "BS4"
        ]
    },
    {
        "id": 67,
        "flag": "rule67",
        "scope": "EXTRA_PREMIUM",
        "product": "UB9",
        "condition": "If CUW user takes Terminal decision as Extra Premium (XRT)",
        "message": "Decline the case as XRT decision not allowed for this product"
    },
    {
        "id": 68,
        "flag": "rule68",
        "scope": "EXCEPT_DECLINE_POSTPONE_REJECT",
        "product": "T68/T69/T70/T74/T75",
        "condition": "If CUW user takes Terminal decision as VS/VS1 and IIB adverse match found",
        "message": "IIB adverse match found - kindly take counter sign",
        "decisionCodes": [
            "VS",
            "VS1"
        ]
    },
    {
        "id": 69,
        "flag": "rule69",
        "scope": "EXTRA_PREMIUM",
        "product": "All Saving/ investment +CICJ or CICK",
        "condition": "If CUW user select Terminal decision as “Extra Premium” for CICJ (ICICI Pru Linked Health Protect Rider – 20CI package) Or CICK (ICICI Pru Linked Health Protect Rider – 60CI package) rider",
        "message": "Decline the rider as XRT decision not allowed"
    },
    {
        "id": 70,
        "flag": "rule70",
        "scope": "EXCEPT_DECLINE_POSTPONE_REJECT",
        "product": "All products",
        "condition": "If any special medical test discrepancy accepted and that case is processed by user having rights of CMO role (ECG pool / TMT pool or being referred under “Refer to CMO”) without doing data entry of ECG/TMT or special medical test against particular medical test then system should display following popup “Data Entry pending for newly received special medicals test report ”Test Name” ",
        "message": "“Data Entry pending for newly received special medicals test report ”Test Name”"
    },
    {
        "id": 73,
        "flag": "rule73",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "All product",
        "condition": "If S12 requirement accepted and FBS value is blank or zero",
        "message": "FBS value is missing kindly take counter sign"
    },
    {
        "id": 74,
        "flag": "rule74",
        "scope": "REJECT",
        "product": "All products",
        "condition": "If CUW users selected the Terminal decision as \"Reject\"",
        "message": "Reject decision - kindly take counter sign"
    },
    {
        "id": 75,
        "flag": "rule75",
        "scope": "DECLINE_POSTPONE",
        "product": "All products",
        "condition": "If CUW users selected the Terminal decision as Decline or Postpone and case source from PB or SCB channel (Identifier for PB is - Agent Code : 01434799,01308816, 01444873 and SCB identifier is - UM Code: 1251150 )",
        "message": "PB or SCB channel case Decline / Postpone decision - kindly take counter sign"
    },
    {
        "id": 76,
        "flag": "rule76",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "Applicable for follow products - T46 , T47 , T50 , T51 , T52 , T53 , T62 , T63 , T64 , T65 , T68 , T69 , T70 , T71 , T72 , T74 , T75 , T78  ",
        "condition": "if any medical/Tele MER/Video MER discrepancy not raised",
        "message": "Mandatory Medicals/Tele MER/VMER not done, cannot take terminal decision."
    },
    {
        "id": 77,
        "flag": "rule77",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "All products (Except Annuity /Pension plan)",
        "condition": "On DRS page under Life Assured previous policy section Claim Flag is \"Y\"  ",
        "message": "Claim history found, Kindly Refer case to CUW Claim Audit for further check"
    },
    {
        "id": 78,
        "flag": "rule78",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "All products (Except Annuity /Pension plan)",
        "condition": "On DRS page under Life Assured previous policy section Claim Flag is \"Y\"  ",
        "message": "Claim history noted -Kindly take HOD counter sign"
    },
    {
        "id": 81,
        "flag": "rule81",
        "scope": "STANDARD",
        "product": "T74/T75/T68 /T69/T70/T72/T80/T78/UW5/UW8/T73 \n(Base & Rider)",
        "condition": "If CUW user select Terminal decision as “Standard\" decision with BS2, BS3, BS4, TS2, TS3, TS4, VS2, VS3, VS4",
        "message": "BS2, BS3, BS4, TS2, TS3, TS4, VS2, VS3, VS4 decision not allowed. Kindly recheck decision  of the case.",
        "decisionCodes": [
            "BS2",
            "BS3",
            "BS4",
            "TS2",
            "TS3",
            "TS4",
            "VS2",
            "VS3",
            "VS4"
        ]
    },
    {
        "id": 82,
        "flag": "rule82",
        "scope": "EXTRA_PREMIUM",
        "product": "T68/T69/T70/T74/T75/T80/T78 (Base & Rider)",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision with Class 7 and above",
        "message": "EMR decision is above class 6, Please Decline case - Substandard life"
    },
    {
        "id": 83,
        "flag": "rule83",
        "scope": "EXTRA_PREMIUM",
        "product": "T72 \n(Base & Rider)",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision with Class 6 and above",
        "message": "EMR decision is above class 5, Please Decline case - Substandard life"
    },
    {
        "id": 84,
        "flag": "rule84",
        "scope": "EXTRA_PREMIUM",
        "product": "UW5\n (Base & Rider)",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision with Class 3 and above",
        "message": "EMR loading Class 3 and above not allowed. Kindly decline the case."
    },
    {
        "id": 85,
        "flag": "rule85",
        "scope": "EXTRA_PREMIUM",
        "product": "UW8\n(Base & Rider)",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision with Class 2 and above",
        "message": "EMR loading Class 2 and above not allowed. Kindly decline the case."
    },
    {
        "id": 86,
        "flag": "rule86",
        "scope": "EXTRA_PREMIUM",
        "product": "T73\n(Base & Rider)",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision with Class 4 and above",
        "message": "EMR loading Class 4 and above not allowed. Kindly decline the case."
    },
    {
        "id": 87,
        "flag": "rule87",
        "scope": "EXTRA_PREMIUM",
        "product": "T73\n(Base & Rider)",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision with Class 3 ",
        "message": "EMR loading Class 3, kindly refer to reinsurer."
    },
    {
        "id": 88,
        "flag": "rule88",
        "scope": "EXTRA_PREMIUM",
        "product": "T74/T75/T68 /T69/T70/T72/T80/T78\n(Base & Rider)",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision with above Flat XRT- 3 Per mile",
        "message": "EMR loading above Flat XRT- 3 Per mile not allowed. Kindly decline the case."
    },
    {
        "id": 89,
        "flag": "rule89",
        "scope": "EXTRA_PREMIUM",
        "product": "UW5/UW8\n(Base & Rider)",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision with Flat XRT per mile decision",
        "message": "Flat XRT-Per mile decision not allowed. Kindly decline the case."
    },
    {
        "id": 90,
        "flag": "rule90",
        "scope": "EXTRA_PREMIUM",
        "product": "WPLI/WOPB/WOPH/WOPR/WOPS/WPHL/WPLF/WPLH/WOPG/WOPL",
        "condition": "If CUW user takes Terminal decision as Extra Premium (XRT)",
        "message": "XRT decision not allowed for this product. Kindly Decline the case."
    },
    {
        "id": 91,
        "flag": "rule91",
        "scope": "EXTRA_PREMIUM",
        "product": "GOPR",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision with Class 3 and above",
        "message": "EMR loading Class III and above not allowed. Kindly decline the case."
    },
    {
        "id": 92,
        "flag": "rule92",
        "scope": "EXTRA_PREMIUM",
        "product": "BTBB",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision with Class 2 and above",
        "message": "EMR loading Class II and above not allowed. Kindly decline the case."
    },
    {
        "id": 93,
        "flag": "rule93",
        "scope": "EXTRA_PREMIUM",
        "product": "CICJ/CICK",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision with Class 4 and above",
        "message": "EMR loading Class IV and above not allowed. Kindly decline the case."
    },
    {
        "id": 94,
        "flag": "rule94",
        "scope": "EXTRA_PREMIUM",
        "product": "CICJ/CICK",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision with Class 3",
        "message": "EMR loading Class III, kindly refer to reinsurer"
    },
    {
        "id": 95,
        "flag": "rule95",
        "scope": "EXTRA_PREMIUM",
        "product": "ADBW/ADBY/ADBV",
        "condition": "If CUW user takes Terminal decision as Extra Premium with Class XRT",
        "message": "XRT decision not allowed for this product. Kindly Decline the case."
    },
    {
        "id": 96,
        "flag": "rule96",
        "scope": "EXCEPT_DECLINE_POSTPONE",
        "product": "T68, T69, T70, T72, T74, T75",
        "condition": "If Life Insured's resident status is other than Indian and if LA’s verified income selected is below 10 Lakh or LA’s Age above 60 years Or application form LA’s education is below \"Graduate \"",
        "message": "Boundary criteria not met for NRI Profile, cannot take terminal decision."
    },
    {
        "id": 97,
        "flag": "rule97",
        "scope": "EXTRA_PREMIUM",
        "product": "Saving Plan (Except UW5/UW8/UC5)",
        "condition": "If CUW user select Terminal decision as “Extra Premium\" decision",
        "message": "Extra premium decision not allowed.\nKindly recheck decision  of the case.."
    }
];

const normalize = (value: unknown): string =>
    String(value ?? "").trim().toUpperCase();

const toRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

const isEnabled = (value: unknown): boolean =>
    value === true || ["Y", "YES", "TRUE"].includes(normalize(value));

const isTerminalDecision = (decision: string): boolean =>
    [
        "ACCEPT",
        "STANDARD",
        "ACCEPT/STANDARD",
        "POSTPONE",
        "REJECT",
        "DECLINE",
        "EXTRA PREMIUM",
        "XRT",
        "COUNTER OFFER",
    ].some((value) => decision.includes(value));

const matchesScope = (
    scope: DecisionScope,
    decision: string,
): boolean => {
    if (!isTerminalDecision(decision)) return false;

    switch (scope) {
        case "ALL_TERMINAL":
            return true;
        case "EXCEPT_DECLINE_POSTPONE":
            return !["DECLINE", "POSTPONE"].includes(decision);
        case "EXCEPT_DECLINE_POSTPONE_REJECT":
            return !["DECLINE", "POSTPONE", "REJECT"].includes(decision);
        case "STANDARD":
            return ["ACCEPT", "STANDARD", "ACCEPT/STANDARD"].includes(decision);
        case "EXTRA_PREMIUM":
            return decision.includes("EXTRA PREMIUM") || decision === "XRT";
        case "EXTRA_PREMIUM_OR_COUNTER_OFFER":
            return (
                decision.includes("EXTRA PREMIUM") ||
                decision === "XRT" ||
                decision.includes("COUNTER OFFER")
            );
        case "COUNTER_OFFER":
            return decision.includes("COUNTER OFFER");
        case "REJECT":
            return decision === "REJECT";
        case "DECLINE_POSTPONE":
            return ["DECLINE", "POSTPONE"].includes(decision);
        default:
            return false;
    }
};

const matchesDecisionCode = (
    rule: AdditionalUwValidationRule,
    decisionCode: string,
): boolean =>
    !rule.decisionCodes ||
    rule.decisionCodes.some((code) => normalize(code) === decisionCode);

export const validateAdditionalUwDecision = (
    drsData: unknown,
    selectedDecision: string,
    selectedDecisionCode = "",
): AdditionalUwValidationResult => {
    const response = toRecord(drsData);
    const responseData = toRecord(response.data);
    const drs =
        Object.keys(responseData).length > 0 ? responseData : response;
    const flags = toRecord(drs.uwDecisionValidationFlags);
    const decision = normalize(selectedDecision);
    const decisionCode = normalize(selectedDecisionCode);

    for (const rule of RULES) {
        if (
            isEnabled(flags[rule.flag]) &&
            matchesScope(rule.scope, decision) &&
            matchesDecisionCode(rule, decisionCode)
        ) {
            return {
                isValid: false,
                message: rule.message,
                ruleId: rule.id,
            };
        }
    }

    return { isValid: true };
};
