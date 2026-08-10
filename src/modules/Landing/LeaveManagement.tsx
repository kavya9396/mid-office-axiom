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
import type { LeaveRecord } from "../../types/inboxTypes";



const initialLeaves: LeaveRecord[] =
  [
    {
      id: "1",
      employeeName:
        "John Smith",
      leaveType: "Annual Leave",
      fromDate:
        "2026-08-10",
      toDate:
        "2026-08-12",
      numberOfDays: 3,
      reason:
        "Personal work",
      status: "Pending",
    },
  ];

const LeaveManagement = () => {
  const [leaves, setLeaves] =
    useState<LeaveRecord[]>(
      initialLeaves,
    );

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] =
    useState({
      employeeName: "",
      leaveType: "",
      fromDate: "",
      toDate: "",
      numberOfDays: "",
      reason: "",
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
    const newRecord: LeaveRecord =
      {
        id:
          Date.now().toString(),

        employeeName:
          form.employeeName,

        leaveType:
          form.leaveType,

        fromDate:
          form.fromDate,

        toDate:
          form.toDate,

        numberOfDays:
          Number(
            form.numberOfDays,
          ),

        reason:
          form.reason,

        status: "Pending",
      };

    setLeaves(
      (previous) => [
        ...previous,
        newRecord,
      ],
    );

    setForm({
      employeeName: "",
      leaveType: "",
      fromDate: "",
      toDate: "",
      numberOfDays: "",
      reason: "",
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

          backgroundColor:
            "#fff",

          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2,

            py: 1.3,

            backgroundColor:
              "#0D4C7D",

            display: "flex",

            justifyContent:
              "space-between",

            alignItems: "center",
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
            Add Leave
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
            label="Employee Name"
            name="employeeName"
            value={
              form.employeeName
            }
            onChange={
              handleChange
            }
            size="small"
            fullWidth
          />

          <TextField
            label="Leave Type"
            name="leaveType"
            value={
              form.leaveType
            }
            onChange={
              handleChange
            }
            size="small"
            fullWidth
          />

          <TextField
            label="From Date"
            name="fromDate"
            type="date"
            value={
              form.fromDate
            }
            onChange={
              handleChange
            }
            size="small"
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            label="To Date"
            name="toDate"
            type="date"
            value={
              form.toDate
            }
            onChange={
              handleChange
            }
            size="small"
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            label="Number of Days"
            name="numberOfDays"
            type="number"
            value={
              form.numberOfDays
            }
            onChange={
              handleChange
            }
            size="small"
            fullWidth
          />

          <TextField
            label="Reason"
            name="reason"
            value={
              form.reason
            }
            onChange={
              handleChange
            }
            size="small"
            fullWidth
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

              color: "#555",
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
              textTransform:
                "none",

              fontSize:
                "11px",

              backgroundColor:
                "#0D4C7D",

              "&:hover": {
                backgroundColor:
                  "#093c62",
              },
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

        backgroundColor:
          "#fff",
      }}
    >
      {/* HEADER */}

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
          Leave Management
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

            "&:hover": {
              backgroundColor:
                "#f4f4f4",
            },
          }}
        >
          Add
        </Button>
      </Box>

      {/* TABLE */}

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
                Employee
              </TableCell>

              <TableCell>
                Leave Type
              </TableCell>

              <TableCell>
                From
              </TableCell>

              <TableCell>
                To
              </TableCell>

              <TableCell>
                Days
              </TableCell>

              <TableCell>
                Reason
              </TableCell>

              <TableCell>
                Status
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {leaves.map(
              (leave) => (
                <TableRow
                  key={
                    leave.id
                  }
                  hover
                >
                  <TableCell>
                    {
                      leave.employeeName
                    }
                  </TableCell>

                  <TableCell>
                    {
                      leave.leaveType
                    }
                  </TableCell>

                  <TableCell>
                    {
                      leave.fromDate
                    }
                  </TableCell>

                  <TableCell>
                    {
                      leave.toDate
                    }
                  </TableCell>

                  <TableCell>
                    {
                      leave.numberOfDays
                    }
                  </TableCell>

                  <TableCell>
                    {
                      leave.reason
                    }
                  </TableCell>

                  <TableCell>
                    {
                      leave.status
                    }
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

export default LeaveManagement;