import { Box, Chip, Typography } from "@mui/material";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useAppContext } from "../../../hooks/useAppContext";
import { useAppDispatch } from "../../../store/hooks";
import { supportingDocumentsSubmitThunk } from "../../../store/thunks/supportingDocumentsSubmitThunk";

const SupportingDocuments = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { applicationNumber } = useAppContext();
  const roleType = localStorage.getItem("roleType") ?? "";

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [remarks, setRemarks] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const mergeSelectedFiles = (files: File[]) => {
    if (!files.length) {
      return;
    }

    setSubmitMessage(null);
    setSelectedFiles((previous) => {
      const existing = new Set(previous.map((file) => `${file.name}_${file.size}_${file.lastModified}`));
      const next = [...previous];

      files.forEach((file) => {
        const key = `${file.name}_${file.size}_${file.lastModified}`;
        if (!existing.has(key)) {
          next.push(file);
          existing.add(key);
        }
      });

      return next;
    });
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    mergeSelectedFiles(files);

    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files ?? []);
    mergeSelectedFiles(files);
  };

  const removeFile = (fileToRemove: File) => {
    setSubmitMessage(null);
    setSelectedFiles((previous) =>
      previous.filter((file) => !(file.name === fileToRemove.name && file.size === fileToRemove.size && file.lastModified === fileToRemove.lastModified)),
    );
  };

  const handleSubmit = async () => {
    if (!applicationNumber || !roleType) {
      setSubmitMessage("Missing application or role information.");
      return;
    }

    if (selectedFiles.length === 0) {
      setSubmitMessage("Please upload at least one document.");
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitMessage(null);

      const response = await dispatch(
        supportingDocumentsSubmitThunk({
          applicationId: applicationNumber,
          roleType,
          remarks: remarks.trim(),
          documents: selectedFiles.map((file) => ({
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
          })),
        }),
      ).unwrap();

      setSubmitMessage(response.message || "Supporting documents submitted successfully.");
      setSelectedFiles([]);
      setRemarks("");
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "Failed to submit supporting documents.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    // <Container disableGutters>
      <Box sx={{ p:1 }}>
        <CustomAccordion title="Supporting Documents" defaultExpanded>
          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: "8px",
              backgroundColor: "#F6F6F6",
            }}
          >
            <Box
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
              sx={{
                border: "1px dashed #D8D8D8",
                borderRadius: "8px",
                height: 76,
                backgroundColor: "#EFEFEF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                cursor: "pointer",
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: "#E0E0E0",
                  color: "#777",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  lineHeight: 1,
                }}
              >
                +
              </Box>
              <Typography sx={{ fontSize: 12, color: "#8A8A8A" }}>
                Upload or Drag the required documents
              </Typography>
            </Box>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={handleFileSelect}
            />

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5, minHeight: 24 }}>
              {selectedFiles.map((file) => (
                <Chip
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  label={file.name}
                  size="small"
                  onDelete={() => removeFile(file)}
                  sx={{
                    backgroundColor: "#ECF1F5",
                    border: "1px solid #CCD5DD",
                    borderRadius: "999px",
                    "& .MuiChip-label": { fontSize: 11 },
                  }}
                />
              ))}
            </Box>

            <Typography sx={{ mt: 1.5, mb: 0.75, fontSize: 12, color: "#555" }}>
              Remarks
            </Typography>
            <CustomTextField
              fullWidth
              multiline
              minRows={3}
              placeholder="Enter remarks..."
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              sx={{ backgroundColor: "#fff" }}
            />

            {submitMessage && (
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 13,
                  color: submitMessage.toLowerCase().includes("success") ? "#0F8A3D" : "#DE2C3B",
                }}
              >
                {submitMessage}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", mt: 2 }}>
            <CustomButton
              onClick={() => {
                void handleSubmit();
              }}
              disabled={submitLoading}
              sx={{ minWidth: 160, borderRadius: "999px" }}
            >
              {submitLoading ? "Submitting..." : "Submit"}
            </CustomButton>
          </Box>
        </CustomAccordion>
      </Box>
    // </Container>
  );
};

export default SupportingDocuments;
