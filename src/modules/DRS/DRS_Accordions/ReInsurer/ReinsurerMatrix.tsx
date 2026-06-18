import { useState } from "react";
import CustomCheckbox from "../../../../components/ui/Checkbox/Checkbox";
import CustomTable, { type Column } from "../../../../components/ui/Table/Table";

export type MatrixRow = {
  reportName: string;
  [key: string]: string | boolean;
};

const reinsurers = ["Reinsurer 1", "Reinsurer 2", "Reinsurer 3", "Reinsurer 4"];

const initialRows: MatrixRow[] = [
  {
    reportName: "Report 1",
    reinsurer1: true,
    reinsurer2: false,
    reinsurer3: false,
    reinsurer4: false,
  },
  {
    reportName: "Report 2",
    reinsurer1: false,
    reinsurer2: false,
    reinsurer3: true,
    reinsurer4: false,
  },
  {
    reportName: "Report 3",
    reinsurer1: false,
    reinsurer2: true,
    reinsurer3: false,
    reinsurer4: false,
  },
  {
    reportName: "Report 4",
    reinsurer1: false,
    reinsurer2: false,
    reinsurer3: false,
    reinsurer4: true,
  },
  {
    reportName: "Report 5",
    reinsurer1: false,
    reinsurer2: false,
    reinsurer3: true,
    reinsurer4: false,
  },
];

const ReinsurerMatrix = () => {
  const [tableData, setTableData] = useState<MatrixRow[]>(initialRows);

  /*
    SELECT ALL COLUMN
  */
  const handleSelectAll = (columnKey: string) => {
    const allSelected = tableData.every((row) => Boolean(row[columnKey]));

    const updatedRows = tableData.map((row) => ({
      ...row,
      [columnKey]: !allSelected,
    }));

    setTableData(updatedRows);
  };

  /*
    SINGLE CHECKBOX CHANGE
  */
  const handleCheckboxChange = (rowIndex: number, columnKey: string) => {
    const updatedRows = [...tableData];

    updatedRows[rowIndex][columnKey] = !updatedRows[rowIndex][columnKey];

    setTableData(updatedRows);
  };

  /*
    DYNAMIC COLUMNS
  */
  const columns: Column<MatrixRow>[] = [
    {
      key: "reportName",
      header: "Document name",
      width: "25%",
    },

    ...reinsurers.map((reinsurer, index) => {
      const columnKey = `reinsurer${index + 1}`;

      return {
        key: columnKey as keyof MatrixRow,

        width: "18%",

        header: reinsurer,

        renderSelectAll: () => handleSelectAll(columnKey),

        render: (
          value: MatrixRow[keyof MatrixRow],
          _row: MatrixRow,
          rowIndex: number,
        ) => (
          <CustomCheckbox
            label=""
            checked={Boolean(value)}
            onChange={() => handleCheckboxChange(rowIndex, columnKey)}
          />
        ),
      };
    }),
  ];

  return (
    <CustomTable<MatrixRow>
      title="Assign Documents"
      columns={columns}
      data={tableData}
    />
  );
};

export default ReinsurerMatrix;
