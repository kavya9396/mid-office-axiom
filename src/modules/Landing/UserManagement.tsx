import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { useMemo, useState } from "react";
import type { UserRecord } from "../../types/inboxTypes";

/* =========================================================
   TYPES
========================================================= */

interface UserForm {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

type SortField =
  | "username"
  | "firstName"
  | "lastName"
  | "email"
  | "role"
  | "status";

type SortDirection = "asc" | "desc";

interface ColumnVisibility {
  username: boolean;
  firstName: boolean;
  lastName: boolean;
  email: boolean;
  role: boolean;
  status: boolean;
}

/* =========================================================
   INITIAL DATA
========================================================= */

const initialUsers: UserRecord[] = [
  {
    id: "1",
    username: "john.smith",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    role: "CVT",
    status: "Active",
  },
];

/* =========================================================
   CUSTOM ICONS
   Small icons - no MUI icons
========================================================= */

const SearchIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      cx="10.5"
      cy="10.5"
      r="6"
      stroke="currentColor"
      strokeWidth="1.6"
    />

    <path
      d="M15 15L20 20"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const FilterIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M4 6H20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    <path
      d="M7 12H17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    <path
      d="M10 18H14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    <circle
      cx="9"
      cy="6"
      r="1.3"
      fill="#fff"
      stroke="currentColor"
      strokeWidth="1"
    />

    <circle
      cx="15"
      cy="12"
      r="1.3"
      fill="#fff"
      stroke="currentColor"
      strokeWidth="1"
    />

    <circle
      cx="12"
      cy="18"
      r="1.3"
      fill="#fff"
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M5 6H19"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />

    <path
      d="M5 12H19"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />

    <path
      d="M5 18H19"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />

    <rect
      x="8"
      y="4"
      width="3"
      height="4"
      rx="0.8"
      fill="#fff"
      stroke="currentColor"
      strokeWidth="1"
    />

    <rect
      x="14"
      y="10"
      width="3"
      height="4"
      rx="0.8"
      fill="#fff"
      stroke="currentColor"
      strokeWidth="1"
    />

    <rect
      x="10"
      y="16"
      width="3"
      height="4"
      rx="0.8"
      fill="#fff"
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);

const UpArrow = () => (
  <svg
    width="9"
    height="9"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M12 5L7 10"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />

    <path
      d="M12 5L17 10"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />

    <path
      d="M12 5V19"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const DownArrow = () => (
  <svg
    width="9"
    height="9"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M12 19L7 14"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />

    <path
      d="M12 19L17 14"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />

    <path
      d="M12 5V19"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const LeftArrow = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M15 5L8 12L15 19"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RightArrow = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M9 5L16 12L9 19"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* =========================================================
   SORT ICON
========================================================= */

const SortIcon = ({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) => {
  if (active) {
    return (
      <Box
        sx={{
          ml: "3px",
          display: "flex",
          alignItems: "center",
          color: "#60788B",
        }}
      >
        {direction === "asc" ? (
          <UpArrow />
        ) : (
          <DownArrow />
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ml: "3px",
        width: "9px",
        height: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#7B8791",
        opacity: 0.8,
      }}
    >
      <Box
        sx={{
          height: "7px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <UpArrow />
      </Box>

      <Box
        sx={{
          height: "7px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <DownArrow />
      </Box>
    </Box>
  );
};

/* =========================================================
   TOOLBAR BUTTON
   Outside component - prevents render warning
========================================================= */

const ToolbarButton = ({
  children,
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  onClick: (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  active?: boolean;
}) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    sx={{
      width: "34px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #DCE1E6",
      borderRadius: "5px",
      backgroundColor: active
        ? "#F0F5F9"
        : "#fff",
      color: "#596771",
      cursor: "pointer",
      padding: 0,

      "&:hover": {
        backgroundColor: "#F5F7F9",
      },
    }}
  >
    {children}
  </Box>
);

/* =========================================================
   HEADER CELL
   IMPORTANT:
   This is outside UserManagement
========================================================= */

const HeaderCell = ({
  label,
  field,
  visible,
  sortField,
  sortDirection,
  onSort,
}: {
  label: string;
  field: SortField;
  visible: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}) => {
  if (!visible) {
    return null;
  }

  return (
    <TableCell
      onClick={() => onSort(field)}
      sx={{
        height: "36px",
        px: "8px",
        py: 0,
        backgroundColor: "#EEF1F4",
        borderBottom:
          "1px solid #D5DBE0",
        color: "#202B33",
        fontSize: "10.5px",
        fontWeight: 500,
        whiteSpace: "nowrap",
        cursor: "pointer",
        userSelect: "none",

        "&:hover": {
          backgroundColor: "#E7EBEF",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontSize: "10.5px",
            fontWeight: 500,
            color: "#202B33",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>

        <SortIcon
          active={sortField === field}
          direction={sortDirection}
        />
      </Box>
    </TableCell>
  );
};

/* =========================================================
   USER MANAGEMENT
========================================================= */

const UserManagement = () => {
  /* =======================================================
     USERS
  ======================================================= */

  const [users, setUsers] =
    useState<UserRecord[]>(initialUsers);

  /* =======================================================
     ADD USER FORM
  ======================================================= */

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] =
    useState<UserForm>({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "",
    });

  /* =======================================================
     SEARCH
  ======================================================= */

  const [showSearch, setShowSearch] =
    useState(false);

  const [searchText, setSearchText] =
    useState("");

  /* =======================================================
     FILTER
  ======================================================= */

  const [showFilter, setShowFilter] =
    useState(false);

  const [roleFilter, setRoleFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  /* =======================================================
     COLUMN SETTINGS
  ======================================================= */

  const [columnAnchorEl, setColumnAnchorEl] =
    useState<null | HTMLElement>(null);

  const [columns, setColumns] =
    useState<ColumnVisibility>({
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
    });

  /* =======================================================
     SORT
  ======================================================= */

  const [sortField, setSortField] =
    useState<SortField>("username");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  /* =======================================================
     PAGINATION
  ======================================================= */

  const [rowsPerPage, setRowsPerPage] =
    useState(25);

  const [page, setPage] =
    useState(0);

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     SAVE USER
  ======================================================= */

  const handleSave = () => {
    if (
      !form.username.trim() ||
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.role.trim()
    ) {
      return;
    }

    const user: UserRecord = {
      id: Date.now().toString(),
      username: form.username.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      role: form.role.trim(),
      status: "Active",
    };

    setUsers((previous) => [
      ...previous,
      user,
    ]);

    setForm({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "",
    });

    setShowForm(false);
  };

  /* =======================================================
     SORT
  ======================================================= */

  const handleSort = (
    field: SortField,
  ) => {
    if (sortField === field) {
      setSortDirection(
        (previous) =>
          previous === "asc"
            ? "desc"
            : "asc",
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    setPage(0);
  };

  /* =======================================================
     SEARCH / FILTER / SORT
  ======================================================= */

  const processedUsers = useMemo(() => {
    let result = [...users];

    /* SEARCH */

    if (searchText.trim()) {
      const search =
        searchText
          .trim()
          .toLowerCase();

      result = result.filter(
        (user) =>
          String(user.username)
            .toLowerCase()
            .includes(search) ||
          String(user.firstName)
            .toLowerCase()
            .includes(search) ||
          String(user.lastName)
            .toLowerCase()
            .includes(search) ||
          String(user.email)
            .toLowerCase()
            .includes(search) ||
          String(user.role)
            .toLowerCase()
            .includes(search) ||
          String(user.status)
            .toLowerCase()
            .includes(search),
      );
    }

    /* ROLE FILTER */

    if (roleFilter) {
      result = result.filter(
        (user) =>
          user.role === roleFilter,
      );
    }

    /* STATUS FILTER */

    if (statusFilter) {
      result = result.filter(
        (user) =>
          user.status ===
          statusFilter,
      );
    }

    /* SORT */

    result.sort((a, b) => {
      const first = String(
        a[sortField],
      ).toLowerCase();

      const second = String(
        b[sortField],
      ).toLowerCase();

      if (first < second) {
        return sortDirection === "asc"
          ? -1
          : 1;
      }

      if (first > second) {
        return sortDirection === "asc"
          ? 1
          : -1;
      }

      return 0;
    });

    return result;
  }, [
    users,
    searchText,
    roleFilter,
    statusFilter,
    sortField,
    sortDirection,
  ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      processedUsers.length /
        rowsPerPage,
    ),
  );

  const paginatedUsers =
    processedUsers.slice(
      page * rowsPerPage,
      page * rowsPerPage +
        rowsPerPage,
    );

  const startRecord =
    processedUsers.length === 0
      ? 0
      : page * rowsPerPage + 1;

  const endRecord = Math.min(
    (page + 1) * rowsPerPage,
    processedUsers.length,
  );

  /* =======================================================
     COLUMN TOGGLE
  ======================================================= */

  const toggleColumn = (
    column: keyof ColumnVisibility,
  ) => {
    setColumns((previous) => ({
      ...previous,
      [column]: !previous[column],
    }));
  };

  /* =======================================================
     ADD USER FORM
  ======================================================= */

  if (showForm) {
    return (
      <Paper
        elevation={0}
        sx={{
          border:
            "1px solid #DDE2E6",
          borderRadius: "7px",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        {/* FORM HEADER */}

        <Box
          sx={{
            height: "42px",
            px: 1.25,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            backgroundColor: "#0D4C7D",
          }}
        >
          <Typography
            sx={{
              color: "#fff",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Add User
          </Typography>

          <Button
            onClick={() =>
              setShowForm(false)
            }
            sx={{
              minWidth: "auto",
              height: "26px",
              color: "#fff",
              textTransform: "none",
              fontSize: "10px",
              px: 0.75,
              py: 0,
            }}
          >
            Cancel
          </Button>
        </Box>

        {/* FORM BODY */}

        <Box
          sx={{
            p: 1.25,
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: 1,
          }}
        >
          <TextField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            size="small"
            fullWidth
            sx={{
              "& .MuiInputBase-root": {
                fontSize: "11px",
                height: "34px",
              },
              "& .MuiInputLabel-root": {
                fontSize: "11px",
              },
            }}
          />

          <TextField
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            size="small"
            fullWidth
            sx={{
              "& .MuiInputBase-root": {
                fontSize: "11px",
                height: "34px",
              },
              "& .MuiInputLabel-root": {
                fontSize: "11px",
              },
            }}
          />

          <TextField
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            size="small"
            fullWidth
            sx={{
              "& .MuiInputBase-root": {
                fontSize: "11px",
                height: "34px",
              },
              "& .MuiInputLabel-root": {
                fontSize: "11px",
              },
            }}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            size="small"
            fullWidth
            sx={{
              "& .MuiInputBase-root": {
                fontSize: "11px",
                height: "34px",
              },
              "& .MuiInputLabel-root": {
                fontSize: "11px",
              },
            }}
          />

          <TextField
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            size="small"
            fullWidth
            sx={{
              "& .MuiInputBase-root": {
                fontSize: "11px",
                height: "34px",
              },
              "& .MuiInputLabel-root": {
                fontSize: "11px",
              },
            }}
          />
        </Box>

        {/* FORM BUTTONS */}

        <Box
          sx={{
            display: "flex",
            justifyContent:
              "flex-end",
            gap: "4px",
            px: 1.25,
            pb: 1.25,
          }}
        >
          <Button
            onClick={() =>
              setShowForm(false)
            }
            sx={{
              textTransform: "none",
              fontSize: "10px",
              minWidth: "50px",
              height: "28px",
              borderRadius: "4px",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              backgroundColor:
                "#0D4C7D",
              textTransform: "none",
              fontSize: "10px",
              minWidth: "50px",
              height: "28px",
              borderRadius: "4px",
              boxShadow: "none",

              "&:hover": {
                backgroundColor:
                  "#0A3D65",
                boxShadow: "none",
              },
            }}
          >
            Save
          </Button>
        </Box>
      </Paper>
    );
  }

  /* =======================================================
     MAIN TABLE
  ======================================================= */

  return (
    <Paper
      elevation={0}
      sx={{
        border:
          "1px solid #DDE2E6",
        borderRadius: "7px",
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      {/* ===================================================
          BLUE HEADER
      =================================================== */}

      <Box
        sx={{
          height: "42px",
          px: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          backgroundColor: "#0D4C7D",
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          User Management
        </Typography>

        <Button
          onClick={() =>
            setShowForm(true)
          }
          sx={{
            minWidth: "48px",
            height: "27px",
            color: "#0D4C7D",
            backgroundColor: "#fff",
            textTransform: "none",
            fontSize: "10.5px",
            fontWeight: 500,
            borderRadius: "4px",
            padding: 0,

            "&:hover": {
              backgroundColor:
                "#F5F7F9",
            },
          }}
        >
          Add
        </Button>
      </Box>

      {/* ===================================================
          TOOLBAR
      =================================================== */}

      <Box
        sx={{
          minHeight: "42px",
          px: 1.25,
          py: "5px",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "flex-end",
          gap: "4px",
          borderBottom:
            "1px solid #E1E5E9",
          backgroundColor: "#fff",
        }}
      >
        {showSearch && (
          <TextField
            autoFocus
            size="small"
            placeholder="Search..."
            value={searchText}
            onChange={(event) => {
              setSearchText(
                event.target.value,
              );
              setPage(0);
            }}
            sx={{
              width: "170px",

              "& .MuiInputBase-root": {
                height: "30px",
                fontSize: "10.5px",
              },

              "& .MuiInputBase-input": {
                py: 0,
                px: 1,
              },
            }}
          />
        )}

        {/* SEARCH */}

        <ToolbarButton
          active={showSearch}
          onClick={() =>
            setShowSearch(
              (previous) => !previous,
            )
          }
        >
          <SearchIcon />
        </ToolbarButton>

        {/* FILTER */}

        <ToolbarButton
          active={showFilter}
          onClick={() =>
            setShowFilter(
              (previous) => !previous,
            )
          }
        >
          <FilterIcon />
        </ToolbarButton>

        {/* COLUMN SETTINGS */}

        <ToolbarButton
          onClick={(event) =>
            setColumnAnchorEl(
              event.currentTarget,
            )
          }
        >
          <SettingsIcon />
        </ToolbarButton>
      </Box>

      {/* ===================================================
          FILTER PANEL
      =================================================== */}

      {showFilter && (
        <Box
          sx={{
            px: 1.25,
            py: "6px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor:
              "#FAFBFC",
            borderBottom:
              "1px solid #E1E5E9",
          }}
        >
          <FormControl
            size="small"
            sx={{
              width: "120px",
            }}
          >
            <InputLabel
              sx={{
                fontSize: "10px",
              }}
            >
              Role
            </InputLabel>

            <Select
              value={roleFilter}
              label="Role"
              onChange={(event) => {
                setRoleFilter(
                  event.target.value,
                );
                setPage(0);
              }}
              sx={{
                height: "29px",
                fontSize: "10px",

                "& .MuiSelect-select": {
                  py: 0.5,
                },
              }}
            >
              <MenuItem value="">
                All
              </MenuItem>

              <MenuItem value="CVT">
                CVT
              </MenuItem>

              <MenuItem value="Admin">
                Admin
              </MenuItem>

              <MenuItem value="User">
                User
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              width: "120px",
            }}
          >
            <InputLabel
              sx={{
                fontSize: "10px",
              }}
            >
              Status
            </InputLabel>

            <Select
              value={statusFilter}
              label="Status"
              onChange={(event) => {
                setStatusFilter(
                  event.target.value,
                );
                setPage(0);
              }}
              sx={{
                height: "29px",
                fontSize: "10px",

                "& .MuiSelect-select": {
                  py: 0.5,
                },
              }}
            >
              <MenuItem value="">
                All
              </MenuItem>

              <MenuItem value="Active">
                Active
              </MenuItem>

              <MenuItem value="Inactive">
                Inactive
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            onClick={() => {
              setRoleFilter("");
              setStatusFilter("");
              setPage(0);
            }}
            sx={{
              minWidth: "42px",
              height: "28px",
              textTransform: "none",
              fontSize: "10px",
              color: "#0D4C7D",
              px: 0.75,
            }}
          >
            Clear
          </Button>
        </Box>
      )}

      {/* ===================================================
          COLUMN SETTINGS MENU
      =================================================== */}

      <Menu
        anchorEl={columnAnchorEl}
        open={Boolean(
          columnAnchorEl,
        )}
        onClose={() =>
          setColumnAnchorEl(null)
        }
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: "160px",
            boxShadow:
              "0px 3px 12px rgba(0,0,0,0.12)",
          },
        }}
      >
        <Typography
          sx={{
            px: 1.25,
            py: "5px",
            fontSize: "10px",
            fontWeight: 600,
            color: "#555",
          }}
        >
          Columns
        </Typography>

        {(
          [
            [
              "username",
              "Username",
            ],
            [
              "firstName",
              "First Name",
            ],
            [
              "lastName",
              "Last Name",
            ],
            ["email", "Email"],
            ["role", "Role"],
            ["status", "Status"],
          ] as [
            keyof ColumnVisibility,
            string,
          ][]
        ).map(
          ([
            key,
            label,
          ]) => (
            <FormControlLabel
              key={key}
              sx={{
                px: 1,
                width: "100%",
                margin: 0,
                height: "25px",
              }}
              control={
                <Checkbox
                  size="small"
                  checked={
                    columns[key]
                  }
                  onChange={() =>
                    toggleColumn(
                      key,
                    )
                  }
                  sx={{
                    p: "3px",
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: "10px",
                  }}
                >
                  {label}
                </Typography>
              }
            />
          ),
        )}
      </Menu>

      {/* ===================================================
          TABLE
      =================================================== */}

      <TableContainer
        sx={{
          overflowX: "auto",
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: "760px",

            "& .MuiTableCell-root": {
              fontSize: "10.5px",
            },

            "& .MuiTableRow-root:hover": {
              backgroundColor:
                "#F8FAFC",
            },
          }}
        >
          {/* TABLE HEADER */}

          <TableHead>
            <TableRow>
              <HeaderCell
                label="Username"
                field="username"
                visible={
                  columns.username
                }
                sortField={sortField}
                sortDirection={
                  sortDirection
                }
                onSort={handleSort}
              />

              <HeaderCell
                label="First Name"
                field="firstName"
                visible={
                  columns.firstName
                }
                sortField={sortField}
                sortDirection={
                  sortDirection
                }
                onSort={handleSort}
              />

              <HeaderCell
                label="Last Name"
                field="lastName"
                visible={
                  columns.lastName
                }
                sortField={sortField}
                sortDirection={
                  sortDirection
                }
                onSort={handleSort}
              />

              <HeaderCell
                label="Email"
                field="email"
                visible={
                  columns.email
                }
                sortField={sortField}
                sortDirection={
                  sortDirection
                }
                onSort={handleSort}
              />

              <HeaderCell
                label="Role"
                field="role"
                visible={
                  columns.role
                }
                sortField={sortField}
                sortDirection={
                  sortDirection
                }
                onSort={handleSort}
              />

              <HeaderCell
                label="Status"
                field="status"
                visible={
                  columns.status
                }
                sortField={sortField}
                sortDirection={
                  sortDirection
                }
                onSort={handleSort}
              />
            </TableRow>
          </TableHead>

          {/* TABLE BODY */}

          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map(
                (user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      height: "38px",
                      borderBottom:
                        "1px solid #E8EBEE",
                    }}
                  >
                    {columns.username && (
                      <TableCell
                        sx={{
                          px: "8px",
                          py: "4px",
                          color:
                            "#34495E",
                          fontSize:
                            "10.5px",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {
                          user.username
                        }
                      </TableCell>
                    )}

                    {columns.firstName && (
                      <TableCell
                        sx={{
                          px: "8px",
                          py: "4px",
                          color:
                            "#34495E",
                          fontSize:
                            "10.5px",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {
                          user.firstName
                        }
                      </TableCell>
                    )}

                    {columns.lastName && (
                      <TableCell
                        sx={{
                          px: "8px",
                          py: "4px",
                          color:
                            "#34495E",
                          fontSize:
                            "10.5px",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {
                          user.lastName
                        }
                      </TableCell>
                    )}

                    {columns.email && (
                      <TableCell
                        sx={{
                          px: "8px",
                          py: "4px",
                          color:
                            "#34495E",
                          fontSize:
                            "10.5px",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {user.email}
                      </TableCell>
                    )}

                    {columns.role && (
                      <TableCell
                        sx={{
                          px: "8px",
                          py: "4px",
                          color:
                            "#34495E",
                          fontSize:
                            "10.5px",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {user.role}
                      </TableCell>
                    )}

                    {columns.status && (
                      <TableCell
                        sx={{
                          px: "8px",
                          py: "4px",
                        }}
                      >
                        <Box
                          sx={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            minWidth:
                              "46px",
                            height:
                              "18px",
                            px: "6px",
                            borderRadius:
                              "9px",
                            fontSize:
                              "9.5px",
                            backgroundColor:
                              user.status ===
                              "Active"
                                ? "#E8F5E9"
                                : "#FDECEC",
                            color:
                              user.status ===
                              "Active"
                                ? "#2E7D32"
                                : "#C62828",
                          }}
                        >
                          {
                            user.status
                          }
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ),
              )
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{
                    height: "60px",
                    color: "#777",
                    fontSize: "10.5px",
                  }}
                >
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ===================================================
          PAGINATION
      =================================================== */}

      <Box
        sx={{
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "flex-end",
          gap: "1px",
          px: 1.25,
          borderTop:
            "1px solid #E1E5E9",
          backgroundColor: "#fff",
        }}
      >
        <Typography
          sx={{
            fontSize: "10px",
            color: "#4A5568",
          }}
        >
          Show
        </Typography>

        <Select
          size="small"
          value={rowsPerPage}
          onChange={(event) => {
            setRowsPerPage(
              Number(event.target.value),
            );
            setPage(0);
          }}
          sx={{
            height: "25px",
            minWidth: "48px",
            fontSize: "10px",

            "& .MuiSelect-select": {
              py: 0,
              px: "7px",
            },

            "& fieldset": {
              border: "none",
            },
          }}
        >
          <MenuItem value={10}>
            10
          </MenuItem>

          <MenuItem value={25}>
            25
          </MenuItem>

          <MenuItem value={50}>
            50
          </MenuItem>

          <MenuItem value={100}>
            100
          </MenuItem>
        </Select>

        <Typography
          sx={{
            fontSize: "10px",
            color: "#4A5568",
            minWidth: "58px",
            textAlign: "center",
          }}
        >
          {startRecord}–{endRecord} of{" "}
          {processedUsers.length}
        </Typography>

        {/* PREVIOUS */}

        <Box
          component="button"
          type="button"
          disabled={page === 0}
          onClick={() =>
            setPage((previous) =>
              Math.max(
                0,
                previous - 1,
              ),
            )
          }
          sx={{
            border: "none",
            background: "transparent",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            color:
              page === 0
                ? "#C8CCD0"
                : "#8A959D",
            cursor:
              page === 0
                ? "default"
                : "pointer",
            padding: 0,
          }}
        >
          <LeftArrow />
        </Box>

        {/* NEXT */}

        <Box
          component="button"
          type="button"
          disabled={
            page >= totalPages - 1
          }
          onClick={() =>
            setPage((previous) =>
              Math.min(
                totalPages - 1,
                previous + 1,
              ),
            )
          }
          sx={{
            border: "none",
            background: "transparent",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            color:
              page >= totalPages - 1
                ? "#C8CCD0"
                : "#8A959D",
            cursor:
              page >= totalPages - 1
                ? "default"
                : "pointer",
            padding: 0,
          }}
        >
          <RightArrow />
        </Box>
      </Box>
    </Paper>
  );
};

export default UserManagement;