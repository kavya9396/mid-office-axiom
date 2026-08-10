import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  useState,
} from "react";
import type { UserRecord } from "../../types/inboxTypes";



const initialUsers: UserRecord[] =
  [
    {
      id: "1",
      username: "john.smith",
      firstName: "John",
      lastName: "Smith",
      email:
        "john.smith@example.com",
      role: "CVT",
      status: "Active",
    },
  ];

const UserManagement = () => {
  const [users, setUsers] =
    useState<UserRecord[]>(
      initialUsers,
    );

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] =
    useState({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "",
    });

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement
    >,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      }),
    );
  };

  const handleSave = () => {
    const user: UserRecord =
      {
        id:
          Date.now().toString(),

        username:
          form.username,

        firstName:
          form.firstName,

        lastName:
          form.lastName,

        email:
          form.email,

        role:
          form.role,

        status: "Active",
      };

    setUsers(
      (previous) => [
        ...previous,
        user,
      ],
    );

    setForm({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "",
    });

    setShowForm(false);
  };

  /* =========================================
     FORM
     ========================================= */

  if (showForm) {
    return (
      <Paper
        elevation={0}
        sx={{
          border:
            "1px solid #e5e7eb",

          borderRadius:
            "10px",

          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "44px",

            px: 2,

            display: "flex",

            alignItems: "center",

            justifyContent:
              "space-between",

            backgroundColor:
              "#0D4C7D",
          }}
        >
          <Typography
            sx={{
              color: "#fff",

              fontSize:
                "13px",

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
              color: "#fff",

              textTransform:
                "none",

              fontSize:
                "11px",
            }}
          >
            Cancel
          </Button>
        </Box>

        <Box
          sx={{
            p: 2,

            display: "grid",

            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",

            gap: 1.5,
          }}
        >
          <TextField
            label="Username"
            name="username"
            value={
              form.username
            }
            onChange={
              handleChange
            }
            size="small"
          />

          <TextField
            label="First Name"
            name="firstName"
            value={
              form.firstName
            }
            onChange={
              handleChange
            }
            size="small"
          />

          <TextField
            label="Last Name"
            name="lastName"
            value={
              form.lastName
            }
            onChange={
              handleChange
            }
            size="small"
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            value={
              form.email
            }
            onChange={
              handleChange
            }
            size="small"
          />

          <TextField
            label="Role"
            name="role"
            value={
              form.role
            }
            onChange={
              handleChange
            }
            size="small"
          />
        </Box>

        <Box
          sx={{
            display: "flex",

            justifyContent:
              "flex-end",

            gap: 1,

            px: 2,

            pb: 2,
          }}
        >
          <Button
            onClick={() =>
              setShowForm(false)
            }
            sx={{
              textTransform:
                "none",

              fontSize:
                "11px",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSave
            }
            sx={{
              backgroundColor:
                "#0D4C7D",

              textTransform:
                "none",

              fontSize:
                "11px",
            }}
          >
            Save
          </Button>
        </Box>
      </Paper>
    );
  }

  /* =========================================
     TABLE
     ========================================= */

  return (
    <Paper
      elevation={0}
      sx={{
        border:
          "1px solid #e5e7eb",

        borderRadius:
          "10px",

        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: "44px",

          px: 2,

          display: "flex",

          alignItems: "center",

          justifyContent:
            "space-between",

          backgroundColor:
            "#0D4C7D",
        }}
      >
        <Typography
          sx={{
            color: "#fff",

            fontSize:
              "13px",

            fontWeight: 600,
          }}
        >
          User Management
        </Typography>

        <Button
          onClick={() =>
            setShowForm(true)
          }
          sx={{
            minWidth: "52px",

            height: "27px",

            color: "#0D4C7D",

            backgroundColor:
              "#fff",

            textTransform:
              "none",

            fontSize:
              "11px",

            borderRadius:
              "6px",
          }}
        >
          Add
        </Button>
      </Box>

      <TableContainer>
        <Table
          size="small"
          sx={{
            "& .MuiTableCell-root":
              {
                fontSize:
                  "11px",

                py: 0.9,

                px: 1.5,

                whiteSpace:
                  "nowrap",
              },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                Username
              </TableCell>

              <TableCell>
                First Name
              </TableCell>

              <TableCell>
                Last Name
              </TableCell>

              <TableCell>
                Email
              </TableCell>

              <TableCell>
                Role
              </TableCell>

              <TableCell>
                Status
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map(
              (user) => (
                <TableRow
                  key={
                    user.id
                  }
                  hover
                >
                  <TableCell>
                    {
                      user.username
                    }
                  </TableCell>

                  <TableCell>
                    {
                      user.firstName
                    }
                  </TableCell>

                  <TableCell>
                    {
                      user.lastName
                    }
                  </TableCell>

                  <TableCell>
                    {user.email}
                  </TableCell>

                  <TableCell>
                    {user.role}
                  </TableCell>

                  <TableCell>
                    {user.status}
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default UserManagement;