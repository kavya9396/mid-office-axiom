export const columnFlex = {
  display: "flex",
  flexDirection: "column",
};

export const centerFlex = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const selectedSx = {
  borderLeft: "4px solid #9A2529",
  borderColor: "error.dark",
  borderRadius: 1,
  background: "linear-gradient(to right, rgba(154,37,41,0.10), transparent)",
  transition: "background 0.2s ease",
};

export const hoverSx = {
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#f3f4f6",
  },
};

export const tableSx = {
  "& th, & td": {
    borderColor: "#dde3ea",
    fontFamily: "Mulish, sans-serif",
  },

  "& thead tr:first-of-type th": {
    backgroundColor: "#0f5b92",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "13px",
    py: 1.15,
  },

  "& thead tr:last-of-type th": {
    backgroundColor: "#ffffff",
    color: "#6f7787",
    fontSize: "13px",
    fontWeight: 600,
    py: 1.1,
  },

  "& thead tr:last-of-type th:first-of-type": {
    backgroundColor: "#E9EEF3",
  },

  "& tbody td": {
    fontSize: "14px",
    color: "#3a4250",
    py: 1.15,
  },

  "& tbody td:first-of-type": {
    backgroundColor: "#E9EEF3",
    color: "#596274",
    fontWeight: 600,
  },
};

export const fieldStyles = {
  backgroundColor: "#E5E5E5",
  borderRadius: "10px",

  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
  },

  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "10px",
  },
};

export const labelStyles = {
  fontSize: "14px",
  fontWeight: 400,
  color: "#444",
  mb: 1,
};

export const fieldStylesEdit = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: "10px",

    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#9A2529",
    },

    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#9A2529",
    },
  },

  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "10px",
  },
};

export const modalTitleStyles = {
  color: "#9A2529",
  fontWeight: 800,
  textTransform: "uppercase",
  fontSize: "16px",
};

export const decisionStyles = {
  container: {
    mt: 1,
    p: 2,
    borderRadius: "12px",
    backgroundColor: "#FAFAFA",
    border: "1px solid #E2E8F0",
  },

  label: {
    fontSize: "14px",
    fontWeight: 400,
    color: "#444",
    mb: 1,
  },

  textField: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
  },
};