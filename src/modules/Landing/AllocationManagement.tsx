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
import type { AllocationRecord } from "../../types/inboxTypes";



const initialAllocations:
  AllocationRecord[] = [
    {
      id: "1",
      employeeName:
        "John Smith",
      taskName:
        "Allocation Task",
      role: "CVT",
      allocationPercentage: 100,
      startDate:
        "2026-08-01",
      endDate:
        "2026-08-31",
      status: "Active",
    },
  ];

const AllocationManagement =
  () => {
    const [
      allocations,
      setAllocations,
    ] =
      useState<AllocationRecord[]>(
        initialAllocations,
      );

    const [
      showForm,
      setShowForm,
    ] = useState(false);

    const [form, setForm] =
      useState({
        employeeName: "",
        taskName: "",
        role: "",
        allocationPercentage:
          "",
        startDate: "",
        endDate: "",
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
      const record: AllocationRecord =
        {
          id:
            Date.now().toString(),

          employeeName:
            form.employeeName,

          taskName:
            form.taskName,

          role: form.role,

          allocationPercentage:
            Number(
              form
                .allocationPercentage,
            ),

          startDate:
            form.startDate,

          endDate:
            form.endDate,

          status: "Active",
        };

      setAllocations(
        (previous) => [
          ...previous,
          record,
        ],
      );

      setForm({
        employeeName: "",
        taskName: "",
        role: "",
        allocationPercentage:
          "",
        startDate: "",
        endDate: "",
      });

      setShowForm(false);
    };

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

              alignItems:
                "center",

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
              Add Allocation
            </Typography>

            <Button
              onClick={() =>
                setShowForm(
                  false,
                )
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
            />

            <TextField
              label="Task Name"
              name="taskName"
              value={
                form.taskName
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

            <TextField
              label="Allocation %"
              name="allocationPercentage"
              type="number"
              value={
                form
                  .allocationPercentage
              }
              onChange={
                handleChange
              }
              size="small"
            />

            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={
                form.startDate
              }
              onChange={
                handleChange
              }
              size="small"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={
                form.endDate
              }
              onChange={
                handleChange
              }
              size="small"
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
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
                setShowForm(
                  false,
                )
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

            alignItems:
              "center",

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
            Allocation Details
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
                  Employee
                </TableCell>

                <TableCell>
                  Task
                </TableCell>

                <TableCell>
                  Role
                </TableCell>

                <TableCell>
                  Allocation %
                </TableCell>

                <TableCell>
                  Start Date
                </TableCell>

                <TableCell>
                  End Date
                </TableCell>

                <TableCell>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {allocations.map(
                (item) => (
                  <TableRow
                    key={
                      item.id
                    }
                    hover
                  >
                    <TableCell>
                      {
                        item.employeeName
                      }
                    </TableCell>

                    <TableCell>
                      {
                        item.taskName
                      }
                    </TableCell>

                    <TableCell>
                      {item.role}
                    </TableCell>

                    <TableCell>
                      {
                        item.allocationPercentage
                      }
                      %
                    </TableCell>

                    <TableCell>
                      {
                        item.startDate
                      }
                    </TableCell>

                    <TableCell>
                      {
                        item.endDate
                      }
                    </TableCell>

                    <TableCell>
                      {
                        item.status
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

export default AllocationManagement;