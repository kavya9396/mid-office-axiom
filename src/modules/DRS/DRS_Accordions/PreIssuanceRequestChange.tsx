import { Box, Chip, Typography } from "@mui/material";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import ConfirmationDialog from "../../../components/layout/ConfirmationDialog";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useAppContext } from "../../../hooks/useAppContext";
import { useAppDispatch } from "../../../store/hooks";
import { preIssuanceRequestChangeSubmitThunk } from "../../../store/thunks/preIssuanceRequestChangeSubmitThunk";

const PreIssuanceRequestChange = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { applicationNumber } = useAppContext();

  const [existingAddressPincode, setExistingAddressPincode] = useState("");
  const [changedAddressPincode, setChangedAddressPincode] = useState("");
  const [documentProof, setDocumentProof] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const roleType = localStorage.getItem("roleType") ?? "";
  const taskId = String(localStorage.getItem("taskId") ?? "").trim();

  const isSubmitEnabled =
    existingAddressPincode.trim().length > 0
    && changedAddressPincode.trim().length > 0
    && documentProof.trim().length > 0
    && remarks.trim().length > 0;

  const mergeFiles = (files: File[]) => {
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
    mergeFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    mergeFiles(Array.from(event.dataTransfer.files ?? []));
  };

  const removeFile = (fileToRemove: File) => {
    setSelectedFiles((previous) =>
      previous.filter((file) => !(file.name === fileToRemove.name && file.size === fileToRemove.size && file.lastModified === fileToRemove.lastModified)),
    );
  };

  const handleSubmit = async () => {
    if (!applicationNumber || !roleType || !taskId) {
      setSubmitMessage("Missing required case information. Please open the case from inbox again.");
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitMessage(null);

      const response = await dispatch(
        preIssuanceRequestChangeSubmitThunk({
          applicationId: applicationNumber,
          roleType,
          taskId,
          existingAddressPincode: existingAddressPincode.trim(),
          changedAddressPincode: changedAddressPincode.trim(),
          documentProof: documentProof.trim(),
          remarks: remarks.trim(),
          additionalFiles: selectedFiles.map((file) => ({
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
          })),
        }),
      ).unwrap();

      setSubmitMessage(response.message || "Pre issuance change request submitted successfully.");
      setSelectedFiles([]);
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "Failed to submit pre issuance request change.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box sx={{ px: 1 }}>
      <CustomAccordion title="Pre Issuance Change Request" defaultExpanded>
        <Box sx={{ mt: 1, p: 2, borderRadius: "8px", backgroundColor: "#F6F6F6" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#4B5563", mb: 1.25 }}>
            Change in Address/Pin Code
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: 11, color: "#6B7280", mb: 0.5 }}>Existing Address/Pincode</Typography>
              <CustomTextField
                fullWidth
                size="small"
                placeholder="Address"
                value={existingAddressPincode}
                onChange={(event) => setExistingAddressPincode(event.target.value)}
                sx={{ backgroundColor: "#fff" }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 11, color: "#6B7280", mb: 0.5 }}>Change Address/Pincode</Typography>
              <CustomTextField
                fullWidth
                size="small"
                placeholder="Address"
                value={changedAddressPincode}
                onChange={(event) => setChangedAddressPincode(event.target.value)}
                sx={{ backgroundColor: "#fff" }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 11, color: "#6B7280", mb: 0.5 }}>Document Proof</Typography>
              <CustomTextField
                fullWidth
                size="small"
                placeholder="Document Proof"
                value={documentProof}
                onChange={(event) => setDocumentProof(event.target.value)}
                sx={{ backgroundColor: "#fff" }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 11, color: "#6B7280", mb: 0.5 }}>Remarks, If Any</Typography>
              <CustomTextField
                fullWidth
                size="small"
                placeholder="Remarks"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                sx={{ backgroundColor: "#fff" }}
              />
            </Box>
          </Box>

          <Box
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            sx={{
              mt: 1.75,
              border: "1px dashed #D8D8D8",
              borderRadius: "8px",
              height: 44,
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
                width: 22,
                height: 22,
                borderRadius: "50%",
                backgroundColor: "#E0E0E0",
                color: "#777",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                lineHeight: 1,
              }}
            >
              +
            </Box>
            <Typography sx={{ fontSize: 12, color: "#8A8A8A" }}>
              Upload Additional Files
            </Typography>
          </Box>

          <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileSelect} />

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.25, minHeight: 24 }}>
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

          {!taskId && (
            <Typography sx={{ mt: 0.5, fontSize: 13, color: "#DE2C3B" }}>
              Task ID is missing. Please open the case from inbox again.
            </Typography>
          )}

          {submitMessage && (
            <Typography sx={{ mt: 1, fontSize: 13, color: submitMessage.toLowerCase().includes("success") ? "#0F8A3D" : "#DE2C3B" }}>
              {submitMessage}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <CustomButton
            variant="contained"
            disabled={!isSubmitEnabled || !taskId || submitLoading}
            onClick={() => setOpenConfirm(true)}
            sx={{ minWidth: 140, borderRadius: "999px" }}
          >
            {submitLoading ? "Submitting..." : "Submit"}
          </CustomButton>
        </Box>
      </CustomAccordion>

      <ConfirmationDialog
        open={openConfirm}
        message="Do you want to submit the case?"
        onClose={() => setOpenConfirm(false)}
        onConfirm={() => {
          void handleSubmit();
        }}
      />
    </Box>
  );
};

export default PreIssuanceRequestChange;
