import { Box } from "@mui/material";
import CustomButton from "../ui/Button/Button";

interface ExpandAllAccordionProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  isAllExpanded: boolean;
}

const ExpandAllAccordions: React.FC<ExpandAllAccordionProps> = ({
  onExpandAll,
  onCollapseAll,
  isAllExpanded,
}) => {
  return (
    // <Container disableGutters>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p:1
        }}
      >
        <CustomButton
          variant="text"
          sx={{
            color: "#1E1E1E",
            textDecoration: "underline",
            "&:hover": {
              textDecoration: "underline",
              backgroundColor: "transparent",
            },
          }}
          onClick={() => (isAllExpanded ? onCollapseAll() : onExpandAll())}
        >
          {isAllExpanded ? "Collapse All" : "Expand All"}
        </CustomButton>
      </Box>
    // </Container>
  );
};

export default ExpandAllAccordions;
