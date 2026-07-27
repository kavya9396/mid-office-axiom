import {
    Alert,
    Box,
    Checkbox,
    Container,
    FormControlLabel,
    Paper,
    Snackbar,
    Stack,
    Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import CustomButton from "../../components/ui/Button/Button";
import CustomDialog from "../../components/ui/Dialog/Dialog";
import CustomSelect from "../../components/ui/Select/Select";
import CustomTable, { type Column } from "../../components/ui/Table/Table";
import CustomTextField from "../../components/ui/TextField/TextField";

type BusinessType = "NL" | "IPRU";

type ManagedUser = {
    id: string;
    businessType: BusinessType;
    username: string;
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
    mobileNumber: string;
    createdAt: string;
    parentRoles: string[];
    subRoles: string[];
};

type SearchFormValues = {
    businessType: BusinessType | "";
    query: string;
};

type CreateUserFormValues = {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
    mobileNumber: string;
};

type RoleSection = {
    parentRoles: string[];
    subRoles: string[];
};

type SnackbarSeverity = "success" | "warning" | "error";

const initialUsers: ManagedUser[] = [
    {
        id: "NL-1001",
        businessType: "NL",
        username: "nl_demo_user",
        firstName: "Nina",
        lastName: "Lopez",
        dob: "1991-04-12",
        email: "nina.lopez@company.com",
        mobileNumber: "9876543210",
        createdAt: "07/07/2026, 10:00:00 AM",
        parentRoles: ["CUW", "COPS"],
        subRoles: ["1st UW"],
    },
    {
        id: "IPRU-2001",
        businessType: "IPRU",
        username: "ipru_demo_user",
        firstName: "Ishan",
        lastName: "Patel",
        dob: "1988-11-03",
        email: "ishan.patel@company.com",
        mobileNumber: "9988776655",
        createdAt: "07/07/2026, 10:05:00 AM",
        parentRoles: ["GOPS", "SUW"],
        subRoles: ["UW Admin"],
    },
];

const businessTypeOptions = [
    { label: "NL", value: "NL" },
    { label: "IPRU", value: "IPRU" },
];

const parentRoleOptions = ["CUW", "COPS", "GOPS", "User Management", "SUW", "Admin"];
const parentToSubRoleMap: Record<string, string[]> = {
    CUW: ["1st UW", "Sr UW", "HOD", "HO CMO"],
    COPS: ["CVT", "CPT"],
    GOPS: ["DVT"],
    "User Management": ["User Management"],
    SUW: ["SUW"],
    Admin: ["COPS Admin", "GOPS Admin", "UW Admin", "Risk Admin", "Reinsurer Admin", "MMT Admin", "IT Admin"],
};

const today = new Date().toISOString().split("T")[0];

const UserManagement = () => {
    const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
    const [roleAuditLogs, setRoleAuditLogs] = useState<ManagedUser[]>(initialUsers);
    const [activeAuditUserId, setActiveAuditUserId] = useState<string | null>(null);
    const [pendingBusinessType, setPendingBusinessType] = useState<BusinessType>("NL");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<SnackbarSeverity>("success");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [draftUser, setDraftUser] = useState<ManagedUser | null>(null);
    const [roleSelections, setRoleSelections] = useState<RoleSection>({
        parentRoles: [],
        subRoles: [],
    });

    const {
        control: searchControl,
        handleSubmit: handleSearchSubmit,
        reset: resetSearchForm,
        formState: { errors: searchErrors },
    } = useForm<SearchFormValues>({
        defaultValues: {
            businessType: "",
            query: "",
        },
    });

    const {
        control: createControl,
        handleSubmit: handleCreateSubmit,
        reset: resetCreateForm,
        formState: { errors: createErrors },
    } = useForm<CreateUserFormValues>({
        defaultValues: {
            id: "",
            username: "",
            firstName: "",
            lastName: "",
            dob: "",
            email: "",
            mobileNumber: "",
        },
    });

    const openSnackbar = (message: string, severity: SnackbarSeverity = "success") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSearch = (values: SearchFormValues) => {
        const query = values.query.trim().toLowerCase();
        const businessType = values.businessType;

        setPendingBusinessType(businessType || "NL");

        const matchedUser = users.find((user) => {
            const matchesBusinessType = user.businessType === businessType;
            const matchesQuery =
                user.id.toLowerCase().includes(query) ||
                user.username.toLowerCase().includes(query) ||
                user.firstName.toLowerCase().includes(query) ||
                user.lastName.toLowerCase().includes(query);

            return matchesBusinessType && matchesQuery;
        });

        if (matchedUser) {
            setActiveAuditUserId(matchedUser.id);
            openSnackbar(`User found: ${matchedUser.username}`);
            return;
        }

        setActiveAuditUserId(null);
        openSnackbar("No User Found! Create a new User", "warning");
        setCreateDialogOpen(true);
    };

    const handleCreateUser = (values: CreateUserFormValues) => {
        const newUser: ManagedUser = {
            id: values.id.trim(),
            businessType: pendingBusinessType,
            username: values.username.trim(),
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            dob: values.dob,
            email: values.email.trim(),
            mobileNumber: values.mobileNumber.trim(),
            createdAt: formatCreatedAt(new Date()),
            parentRoles: [],
            subRoles: [],
        };

        setDraftUser(newUser);
        setCreateDialogOpen(false);
        setRoleSelections({
            parentRoles: [],
            subRoles: [],
        });
        setRoleDialogOpen(true);
        resetCreateForm();
        resetSearchForm({ businessType: pendingBusinessType, query: newUser.username });
    };

    const handleCloseCreateDialog = () => {
        setCreateDialogOpen(false);
        resetCreateForm();
    };

    const toggleParentRole = (role: string) => {
        setRoleSelections((currentSelections) => {
            const isSelected = currentSelections.parentRoles.includes(role);

            if (isSelected) {
                const nextParentRoles = currentSelections.parentRoles.filter((item) => item !== role);
                const nextSubRoles = currentSelections.subRoles.filter(
                    (subRole) => !(parentToSubRoleMap[role] ?? []).includes(subRole),
                );

                return {
                    parentRoles: nextParentRoles,
                    subRoles: nextSubRoles,
                };
            }

            return {
                ...currentSelections,
                parentRoles: [...currentSelections.parentRoles, role],
            };
        });
    };

    const toggleSubRole = (role: string) => {
        setRoleSelections((currentSelections) => {
            const isSelected = currentSelections.subRoles.includes(role);
            const nextSubRoles = isSelected
                ? currentSelections.subRoles.filter((item) => item !== role)
                : [...currentSelections.subRoles, role];

            return {
                parentRoles: currentSelections.parentRoles,
                subRoles: nextSubRoles,
            };
        });
    };

    const handleCloseRoleDialog = () => {
        setRoleDialogOpen(false);
        setDraftUser(null);
    };

    const handleSaveRoles = () => {
        if (!draftUser) {
            return;
        }

        const isExistingUser = users.some((user) => user.id === draftUser.id);

        const parentsWithoutSubRoles = roleSelections.parentRoles.filter((parentRole) =>
            !(parentToSubRoleMap[parentRole] ?? []).some((subRole) => roleSelections.subRoles.includes(subRole)),
        );

        if (roleSelections.parentRoles.length === 0 || roleSelections.subRoles.length === 0 || parentsWithoutSubRoles.length > 0) {
            openSnackbar("Each selected parent role must have at least one selected sub role", "error");
            return;
        }

        const validParentRoles = roleSelections.parentRoles.filter((parentRole) =>
            (parentToSubRoleMap[parentRole] ?? []).some((subRole) => roleSelections.subRoles.includes(subRole)),
        );

        const finalizedUser: ManagedUser = {
            ...draftUser,
            parentRoles: validParentRoles,
            subRoles: roleSelections.subRoles,
        };

        setUsers((currentUsers) => {
            const existingIndex = currentUsers.findIndex((user) => user.id === finalizedUser.id);

            if (existingIndex === -1) {
                return [...currentUsers, finalizedUser];
            }

            return currentUsers.map((user) =>
                user.id === finalizedUser.id ? finalizedUser : user,
            );
        });

        const auditEntry: ManagedUser = {
            ...finalizedUser,
            createdAt: formatCreatedAt(new Date()),
        };

        setRoleAuditLogs((currentLogs) => [...currentLogs, auditEntry]);
        setActiveAuditUserId(finalizedUser.id);

        setDraftUser(null);
        setRoleDialogOpen(false);
        openSnackbar(
            isExistingUser
                ? "User roles updated successfully"
                : "New user created and roles assigned successfully",
        );
    };

    const handleEditRoles = (user: ManagedUser) => {
        const validParentRoles = user.parentRoles.filter((parentRole) =>
            (parentToSubRoleMap[parentRole] ?? []).some((subRole) => user.subRoles.includes(subRole)),
        );

        setDraftUser(user);
        setRoleSelections({
            parentRoles: validParentRoles,
            subRoles: user.subRoles,
        });
        setRoleDialogOpen(true);
    };

    const createdUsersColumns: Column<ManagedUser>[] = 
    // [
    //     { key: "id", header: "ID", width: "130px" },
    //     { key: "username", header: "Username", width: "130px" },
    //     { key: "firstName", header: "First Name", width: "130px" },
    //     { key: "lastName", header: "Last Name", width: "130px" },
    //     { key: "dob", header: "DOB", width: "110px" },
    //     { key: "createdAt", header: "Created", width: "170px" },
    //     {
    //         key: "parentRoles",
    //         header: "Parent Roles",
    //         width: "210px",
    //         render: (_value, row) => formatRoles(row.parentRoles),
    //     },
    //     {
    //         key: "subRoles",
    //         header: "Sub Roles",
    //         width: "170px",
    //         render: (_value, row) => formatRoles(row.subRoles),
    //     },
    //     {
    //         key: "id",
    //         header: "Action",
    //         width: "120px",
    //         render: (_value, row) => (
    //             <CustomButton
    //                 variant="contained"
    //                 onClick={() => handleEditRoles(row)}
    //                 sx={{ borderRadius: "50px", px: 1 }}
    //             >
    //                 Edit
    //             </CustomButton>
    //         ),
    //     },
    // ];

     [
    { key: "id", header: "ID", width: "6%" },
    { key: "username", header: "Username", width: "6%" },
    { key: "firstName", header: "First Name", width: "8%" },
    { key: "lastName", header: "Last Name", width: "8%" },
    { key: "dob", header: "DOB", width: "8%" },
    { key: "createdAt", header: "Created", width: "12%" },
    {
        key: "parentRoles",
        header: "Parent Roles",
        width: "8%",
        render: (_value, row) => formatRoles(row.parentRoles),
    },
    {
        key: "subRoles",
        header: "Sub Roles",
        width: "8%",
        render: (_value, row) => formatRoles(row.subRoles),
    },
    {
        key: "id",
        header: "Action",
        width: "6%",
        render: (_value, row) => (
            <CustomButton
                variant="contained"
                onClick={() => handleEditRoles(row)}
                sx={{ borderRadius: "50px"}}
            >
                Edit
            </CustomButton>
        ),
    },
];

    const activeUserAuditRows = roleAuditLogs.filter((entry) => entry.id === activeAuditUserId);
    const visibleSubRoleOptions = Array.from(
        new Set(
            roleSelections.parentRoles.flatMap((parentRole) => parentToSubRoleMap[parentRole] ?? []),
        ),
    );
    const parentsWithoutSubRoles = roleSelections.parentRoles.filter((parentRole) =>
        !(parentToSubRoleMap[parentRole] ?? []).some((subRole) => roleSelections.subRoles.includes(subRole)),
    );
    const canSaveRoles =
        roleSelections.parentRoles.length > 0 &&
        roleSelections.subRoles.length > 0 &&
        parentsWithoutSubRoles.length === 0;

    return (
        <Box
            sx={{
                minHeight: "90vh",
                background:
                    "radial-gradient(circle at top left, rgba(154,37,41,0.16), transparent 30%), linear-gradient(180deg, #fbfbfd 0%, #f4f6fa 100%)",
                py: { xs: 3, md: 5 },
            }}
        >
            <Container maxWidth="lg">
                <Stack spacing={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 4 },
                            borderRadius: 4,
                            border: "1px solid rgba(154,37,41,0.12)",
                            background:
                                "linear-gradient(135deg, rgba(154,37,41,0.08) 0%, rgba(255,255,255,0.98) 55%, rgba(255,255,255,0.92) 100%)",
                        }}
                    >
                        <Stack spacing={1}>
                            <Typography variant="overline" sx={{ color: "#9A2529", letterSpacing: 1.5 }}>
                                User Management
                            </Typography>
                            {/* <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
                                Search and create users
                            </Typography>
                            <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 760 }}>
                                Use the search form to locate an existing user in NL or IPRU. If no user is found,
                                you can create a new one directly from the alert prompt.
                            </Typography> */}
                        </Stack>
                    </Paper>

                    <Box>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2.5, md: 3 },
                                height: "100%",
                                borderRadius: 4,
                                border: "1px solid rgba(15,23,42,0.08)",
                            }}
                        >
                            <Stack spacing={2.5} component="form" onSubmit={handleSearchSubmit(handleSearch)}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                        Search user
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Select the user type and enter a search value.
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr auto" },
                                        gap: 2,
                                        alignItems: "end",
                                    }}
                                >

                                    <Controller
                                        name="businessType"
                                        control={searchControl}
                                        rules={{ required: "Please select a user type" }}
                                        render={({ field }) => (
                                            <CustomSelect
                                                label="Select User Type"
                                                value={field.value}
                                                onChange={field.onChange}
                                                options={businessTypeOptions}
                                                placeholder="Choose NL or IPRU"
                                                error={!!searchErrors.businessType}
                                                helperText={searchErrors.businessType?.message}
                                            />
                                        )}
                                    />


                                    <Box>

                                        <Typography
                                            sx={{
                                                fontSize: "14px",
                                                fontWeight: 400,
                                                color: "#444",
                                                mb: 1,
                                            }}>User ID</Typography>

                                        <Controller
                                            name="query"
                                            control={searchControl}
                                            rules={{ required: "Please enter a search value" }}
                                            render={({ field }) => (
                                                <CustomTextField
                                                    {...field}
                                                    placeholder="Enter User ID/NTID"
                                                    fullWidth
                                                    error={!!searchErrors.query}
                                                    helperText={searchErrors.query?.message}
                                                />
                                            )}
                                        />
                                    </Box>

                                    <CustomButton
                                        type="submit"
                                        variant="contained"
                                        sx={{
                                            minWidth: 160,
                                            height: 44,
                                            borderRadius: "50px",
                                            fontWeight: 600,
                                            px: 3,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Submit
                                    </CustomButton>
                                </Box>
                            </Stack>
                        </Paper>
                    </Box>

                    {activeAuditUserId && (
                        <>
                            <CustomTable
                                title="User Audit Log"
                                columns={createdUsersColumns}
                                data={activeUserAuditRows}
                            />

                            {activeUserAuditRows.length === 0 && (
                                <Typography sx={{ mt: 1, ml: 1, color: "text.secondary", fontSize: "14px" }}>
                                    No audit logs available for this user.
                                </Typography>
                            )}
                        </>
                    )}
                </Stack>
            </Container>

            <CustomDialog
                open={createDialogOpen}
                onClose={handleCloseCreateDialog}
                title="Add user details"
                maxWidth="md"
                fullWidth
                contentSx={{ p: 3 }}
                actionsSx={{ justifyContent: "center", pb: 3 }}
                actions={
                    <CustomButton
                        variant="contained"
                        //   onClick={handleApply}
                        onClick={handleCreateSubmit(handleCreateUser)}
                        sx={{ width: "150px", borderRadius: "50px" }}
                    >
                        Create User
                    </CustomButton>

                }
            >
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 400,
                                    color: "#444",
                                    mb: 1,
                                }}>User ID</Typography>
                            <Controller
                                name="id"
                                control={createControl}
                                rules={{ required: "ID is required" }}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        // label="ID"
                                        placeholder="Enter user ID..."
                                        error={!!createErrors.id}
                                        helperText={createErrors.id?.message}
                                    />
                                )}
                            />
                        </Box>

                        <Box >
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 400,
                                    color: "#444",
                                    mb: 1,
                                }}>Username</Typography>
                            <Controller
                                name="username"
                                control={createControl}
                                rules={{ required: "Username is required" }}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        // label="Username"
                                        placeholder="Enter username..."
                                        error={!!createErrors.username}
                                        helperText={createErrors.username?.message}
                                    />
                                )}
                            />
                        </Box>

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 400,
                                    color: "#444",
                                    mb: 1,
                                }}>First Name</Typography>
                            <Controller
                                name="firstName"
                                control={createControl}
                                rules={{ required: "First name is required" }}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        // label="First name"
                                        placeholder="Enter first name..."
                                        error={!!createErrors.firstName}
                                        helperText={createErrors.firstName?.message}
                                    />
                                )}
                            />
                        </Box>

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 400,
                                    color: "#444",
                                    mb: 1,
                                }}>Last Name</Typography>
                            <Controller
                                name="lastName"
                                control={createControl}
                                rules={{ required: "Last name is required" }}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        // label="Last name"
                                        placeholder="Enter last name..."
                                        error={!!createErrors.lastName}
                                        helperText={createErrors.lastName?.message}
                                    />
                                )}
                            />
                        </Box>

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 400,
                                    color: "#444",
                                    mb: 1,
                                }}>Email ID</Typography>
                            <Controller
                                name="email"
                                control={createControl}
                                rules={{
                                    required: "Email ID is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Enter a valid email ID",
                                    },
                                }}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        // label="Email ID"
                                        placeholder="Enter email ID..."
                                        error={!!createErrors.email}
                                        helperText={createErrors.email?.message}
                                    />
                                )}
                            />
                        </Box>

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 400,
                                    color: "#444",
                                    mb: 1,
                                }}>Mobile Number</Typography>
                            <Controller
                                name="mobileNumber"
                                control={createControl}
                                rules={{
                                    required: "Mobile number is required",
                                    pattern: {
                                        value: /^\d{10}$/,
                                        message: "Enter a valid 10-digit mobile number",
                                    },
                                }}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        fullWidth
                                        // label="Mobile Number"
                                        placeholder="Enter mobile number..."
                                        error={!!createErrors.mobileNumber}
                                        helperText={createErrors.mobileNumber?.message}
                                    />
                                )}
                            />
                        </Box>

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 400,
                                    color: "#444",
                                    mb: 1,
                                }}>Date of Birth</Typography>
                            <Controller
                                name="dob"
                                control={createControl}
                                rules={{ required: "Date of birth is required" }}
                                render={({ field }) => (
                                    <CustomTextField
                                        {...field}
                                        type="date"
                                        fullWidth
                                        // label="DOB"
                                        slotProps={{
                                            inputLabel: {
                                                shrink: true,
                                            },
                                            htmlInput: {
                                                max: today,
                                            },
                                        }}
                                        error={!!createErrors.dob}
                                        helperText={createErrors.dob?.message}
                                    />
                                )}
                            />
                        </Box>
                    </Box>
                </Stack>
            </CustomDialog>

            <CustomDialog
                open={roleDialogOpen}
                onClose={handleCloseRoleDialog}
                title={`Assign Role to ${draftUser?.id ?? "User"}`}
                maxWidth="md"

                contentSx={{ p: 3 }}
                actionsSx={{ justifyContent: "center", pb: 3 }}
                actions={
                    <CustomButton
                        variant="contained"
                        onClick={handleSaveRoles}
                        disabled={!canSaveRoles}
                        sx={{ width: "150px", borderRadius: "50px" }}
                    >
                        Save roles
                    </CustomButton>
                }
            >
                <Stack spacing={3} sx={{ pt: 1 }}>
                    <RoleGroup
                        title="Parent roles"
                        roles={parentRoleOptions}
                        selectedRoles={roleSelections.parentRoles}
                        onToggle={toggleParentRole}
                    />

                    <RoleGroup
                        title="Sub roles"
                        roles={visibleSubRoleOptions}
                        selectedRoles={roleSelections.subRoles}
                        onToggle={toggleSubRole}
                    />
                    {visibleSubRoleOptions.length === 0 && (
                        <Typography sx={{ color: "#9A2529", fontSize: "14px" }}>
                            Select a parent role to view its sub roles.
                        </Typography>
                    )}
                    {parentsWithoutSubRoles.length > 0 && (
                        <Typography sx={{ color: "#9A2529", fontSize: "14px" }}>
                            Select at least one sub role for: {parentsWithoutSubRoles.join(", ")}
                        </Typography>
                    )}
                </Stack>
            </CustomDialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3200}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

const formatRoles = (roles: string[]) => {
    if (roles.length === 0) {
        return "-";
    }

    return roles.join(", ");
};

const formatCreatedAt = (date: Date) => {
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
};

type RoleGroupProps = {
    title: string;
    roles: string[];
    selectedRoles: string[];
    onToggle: (role: string) => void;
};

const RoleGroup = ({ title, roles, selectedRoles, onToggle }: RoleGroupProps) => {
    return (
        <Box
            sx={{
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 3,
                p: 2.5,
            }}
        >
            <Typography variant="h6" sx={{ fontSize: "1.15rem", fontWeight: 500, mb: 2 }}>
                {title}
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
                    gap: 1,
                }}
            >
                {roles.map((role) => (
                    <FormControlLabel
                        key={role}
                        control={
                            <Checkbox
                                checked={selectedRoles.includes(role)}
                                onChange={() => onToggle(role)}
                                size="small"
                                sx={{
                                    color: "#6b7280",
                                    "&.Mui-checked": {
                                        color: "#f59e0b",
                                    },
                                }}
                            />
                        }
                        label={
                            <Typography variant="body1" sx={{ color: "#374151" }}>
                                {role}
                            </Typography>
                        }
                        sx={{ m: 0, alignItems: "center" }}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default UserManagement;