import { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from "@mui/material";
import { KeyDownArrowIcon, KeyUpArrowIcon } from "../../../icons/Icons";

type CustomAccordionProps = {
  title: string;
  children: React.ReactNode;
  chip?: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onChange?: (expanded: boolean) => void;
  titleFontSize?:number | string;
  detailPadding?:number | string;
  titleColor?:string;
};

export default function CustomAccordion({
  title,
  children,
  chip,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onChange,
  titleFontSize = 20,
  detailPadding,
  titleColor
}: CustomAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const displayExpanded = isControlled ? controlledExpanded : expanded;

  return (
    <Accordion
      expanded={displayExpanded}
      onChange={() => {
        const newExpanded = !displayExpanded;
        if (!isControlled) {
          setExpanded(newExpanded);
        }
        onChange?.(newExpanded);
      }}
      sx={{
        borderRadius: "8px !important",
        overflow: "hidden",
        boxShadow: 2,
        backgroundColor: "#FFFFFF",
        "&:before": { display: "none" },
        marginTop:"0px !important"
      }}
    >
      <AccordionSummary
        sx={{
          borderBottom: "1px solid #E6E6E6",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography component="span" sx={{ fontSize: titleFontSize, fontWeight: 700, flex: 1, color:titleColor}}>
          {title} {chip}
        </Typography>

        <Box
          sx={{
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#161616",
            mt: 0.5,
          }}
        >
          {displayExpanded ? (
            <KeyUpArrowIcon width={20} height={20} />
          ) : (
            <KeyDownArrowIcon width={20} height={20} />
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{padding:detailPadding}}>
        <Box>{children}</Box>
      </AccordionDetails>
    </Accordion>
  );
}
