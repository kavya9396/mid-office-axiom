import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Grievance from "./Grievance";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { grievanceThunk } from "../../store/thunks/grievanceThunk";
import { grievanceSubmitThunk } from "../../store/thunks/grievanceSubmitThunk";
import { referToItThunk } from "../../store/thunks/referToItThunk";
import { getDRSPath, getInboxPath } from "../../routes/routes";

jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock("../../store/hooks", () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("../../store/thunks/grievanceThunk", () => ({
  grievanceThunk: jest.fn(),
}));

jest.mock("../../store/thunks/grievanceSubmitThunk", () => ({
  grievanceSubmitThunk: jest.fn(),
}));

jest.mock("../../store/thunks/referToItThunk", () => ({
  referToItThunk: jest.fn(),
}));

jest.mock("../../routes/routes", () => ({
  getDRSPath: jest.fn(),
  getInboxPath: jest.fn(),
}));

jest.mock("../../components/layout/BackButton", () => {
  type BackButtonProps = {
    label: string;
    onClick?: () => void;
  };

  return function MockBackButton({ label, onClick }: BackButtonProps) {
    return <button onClick={onClick}>{label}</button>;
  };
});

jest.mock("../../components/layout/ConfirmationDialog", () => {
  type DialogProps = {
    open: boolean;
    message: string;
    onClose?: () => void;
    onConfirm?: () => void;
  };

  return function MockConfirmationDialog({ open, message, onClose, onConfirm }: DialogProps) {
    if (!open) return null;
    return (
      <div>
        <div>{message}</div>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    );
  };
});

jest.mock("../../components/ui/Button/Button", () => {
  type ButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  };

  return function MockButton({ children, onClick, disabled }: ButtonProps) {
    return (
      <button onClick={onClick} disabled={disabled}>
        {children}
      </button>
    );
  };
});

jest.mock("../../components/ui/Table/Table", () => {
  return function MockTable({ title, data }: { title: string; data: Array<{ fupCode: string }> }) {
    return (
      <div>
        <div>{title}</div>
        <div data-testid="grievance-table">{data.map((row) => row.fupCode).join(",")}</div>
      </div>
    );
  };
});

jest.mock("../../icons/Icons", () => ({
  CloseIcon: () => <span>CloseIcon</span>,
  HeadphoneIcon: () => <span>HeadphoneIcon</span>,
  HouseIcon: () => <span>HouseIcon</span>,
  NoteIcon: () => <span>NoteIcon</span>,
  PlusIcon: () => <span>PlusIcon</span>,
  UserProfileIcon: () => <span>UserProfileIcon</span>,
}));

const mockUseLocation = useLocation as unknown as jest.Mock;
const mockUseNavigate = useNavigate as unknown as jest.Mock;
const mockUseAppDispatch = useAppDispatch as unknown as jest.Mock;
const mockGrievanceThunk = grievanceThunk as unknown as jest.Mock;
const mockGrievanceSubmitThunk = grievanceSubmitThunk as unknown as jest.Mock;
const mockReferToItThunk = referToItThunk as unknown as jest.Mock;
const mockGetDRSPath = getDRSPath as unknown as jest.Mock;
const mockGetInboxPath = getInboxPath as unknown as jest.Mock;

const makeDispatchResult = (value: unknown) => ({
  unwrap: jest.fn().mockResolvedValue(value),
});

const grievanceResponse = {
  applicationId: "APP-1",
  policyNumber: "POL-1",
  lifeAssuredName: "Life Assured",
  proposerName: "Proposer",
  fupCodes: [
    {
      id: 1,
      fupCode: "FUP-1",
      lifeAssured: "LA-1",
      remarksUser: "",
      remarksTpa: "TPA-1",
    },
  ],
};

describe("Grievance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("roleType", "uw");
    localStorage.setItem("applicationNumber", "APP-1");
    localStorage.setItem("businessType", "retail");

    mockUseLocation.mockReturnValue({
      state: { applicationNumber: "APP-1", businessType: "retail" },
    });
    mockUseNavigate.mockReturnValue(jest.fn());
    mockUseAppDispatch.mockReturnValue(jest.fn());
    mockGrievanceThunk.mockImplementation((payload) => ({
      type: "grievanceThunk",
      payload,
    }));
    mockGrievanceSubmitThunk.mockImplementation((payload) => ({
      type: "grievanceSubmitThunk",
      payload,
    }));
    mockReferToItThunk.mockImplementation((payload) => ({
      type: "referToItThunk",
      payload,
    }));
    mockGetDRSPath.mockReturnValue("/retail/app/APP-1/drs");
    mockGetInboxPath.mockReturnValue("/retail/inbox");
  });

  it("fetches grievance data and submits the case with remarks", async () => {
    const navigate = jest.fn();
    const dispatch = jest
      .fn()
      .mockReturnValueOnce(makeDispatchResult(grievanceResponse))
      .mockReturnValueOnce(makeDispatchResult({ message: "Grievance submitted successfully" }));

    mockUseNavigate.mockReturnValue(navigate);
    mockUseAppDispatch.mockReturnValue(dispatch);

    render(<Grievance />);

    await waitFor(() => {
      expect(mockGrievanceThunk).toHaveBeenCalledWith({ applicationId: "APP-1" });
      expect(screen.getByText("POL-1")).toBeInTheDocument();
      expect(screen.getByTestId("grievance-table")).toHaveTextContent("FUP-1");
    });

    await userEvent.type(screen.getByPlaceholderText("Add remarks..."), "Need review");
    await userEvent.click(screen.getByRole("button", { name: "Raise Grievance" }));

    await waitFor(() => {
      expect(mockGrievanceSubmitThunk).toHaveBeenCalledWith({
        applicationId: "APP-1",
        roleType: "uw",
        remarks: "Need review",
        fupCodes: grievanceResponse.fupCodes,
        attachments: [],
      });
      expect(navigate).toHaveBeenCalledWith("/retail/inbox", {
        state: { snackbarMessage: "Grievance submitted successfully" },
      });
    });
  });

  it("confirms refer to IT and navigates back to inbox", async () => {
    const navigate = jest.fn();
    const dispatch = jest
      .fn()
      .mockReturnValueOnce(makeDispatchResult(grievanceResponse))
      .mockReturnValueOnce(makeDispatchResult({ message: "Referred to IT" }));

    mockUseNavigate.mockReturnValue(navigate);
    mockUseAppDispatch.mockReturnValue(dispatch);

    render(<Grievance />);

    await waitFor(() => {
      expect(screen.getByText("Refer to IT")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Refer to IT"));
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(mockReferToItThunk).toHaveBeenCalledWith({
        applicationId: "APP-1",
        roleType: "uw",
        decision: "Refer to IT",
      });
      expect(navigate).toHaveBeenCalledWith("/retail/inbox", {
        state: { snackbarMessage: "Referred to IT" },
      });
    });
  });
});