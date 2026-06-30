import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GrievanceApplication from "./GrievanceApplication";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../hooks/useAppContext";
import { useAppDispatch } from "../../store/hooks";
import { grievanceApplicationThunk } from "../../store/thunks/grievanceApplicationThunk";
import { grievanceApplicationSubmitThunk } from "../../store/thunks/grievanceApplicationSubmitThunk";
import { getInboxPath } from "../../routes/routes";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../../hooks/useAppContext", () => ({
  useAppContext: jest.fn(),
}));

jest.mock("../../store/hooks", () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("../../store/thunks/grievanceApplicationThunk", () => ({
  grievanceApplicationThunk: jest.fn(),
}));

jest.mock("../../store/thunks/grievanceApplicationSubmitThunk", () => ({
  grievanceApplicationSubmitThunk: jest.fn(),
}));

jest.mock("../../routes/routes", () => ({
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

jest.mock("../../components/ui/Accordion/Accordion", () => {
  type AccordionProps = {
    title: string;
    children: React.ReactNode;
  };

  return function MockAccordion({ title, children }: AccordionProps) {
    return (
      <section>
        <h3>{title}</h3>
        {children}
      </section>
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

jest.mock("../../icons/Icons", () => ({
  CloseIcon: () => <span>CloseIcon</span>,
  PlusIcon: () => <span>PlusIcon</span>,
}));

const mockUseNavigate = useNavigate as unknown as jest.Mock;
const mockUseAppContext = useAppContext as unknown as jest.Mock;
const mockUseAppDispatch = useAppDispatch as unknown as jest.Mock;
const mockGrievanceApplicationThunk = grievanceApplicationThunk as unknown as jest.Mock;
const mockGrievanceApplicationSubmitThunk = grievanceApplicationSubmitThunk as unknown as jest.Mock;
const mockGetInboxPath = getInboxPath as unknown as jest.Mock;

const makeDispatchResult = (value: unknown) => ({
  unwrap: jest.fn().mockResolvedValue(value),
});

describe("GrievanceApplication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("roleType", "underwriter");
    localStorage.setItem("applicationNumber", "APP1234567");
    mockUseNavigate.mockReturnValue(jest.fn());
    mockUseAppContext.mockReturnValue({ businessType: "retail", applicationNumber: "APP1234567" });
    mockUseAppDispatch.mockReturnValue(jest.fn());
    mockGrievanceApplicationThunk.mockImplementation((payload) => ({
      type: "grievanceApplicationThunk",
      payload,
    }));
    mockGrievanceApplicationSubmitThunk.mockImplementation((payload) => ({
      type: "grievanceApplicationSubmitThunk",
      payload,
    }));
    mockGetInboxPath.mockReturnValue("/retail/inbox");
  });

  it("loads application details and navigates back to inbox", async () => {
    const dispatch = jest.fn();
    mockUseAppDispatch.mockReturnValue(dispatch);
    dispatch.mockReturnValueOnce(
      makeDispatchResult({
        status: "Open",
        productOpted: "Term",
        premium: "1000",
        sumAssured: "50000",
        medicalRaisedDate: "2026-01-01",
        medicalsReceivedDate: "2026-01-02",
        reports: [
          {
            id: 1,
            user: "User A",
            reports: "Report A",
            lifeAssuredProposer: "John Doe",
            remarksByUser: "Remark",
            grievanceRaisedDate: "2026-01-03",
            grievanceRaisedRemarks: "Raised",
            grievanceReceivedDate: "2026-01-04",
          },
        ],
      }),
    );

    const navigate = jest.fn();
    mockUseNavigate.mockReturnValue(navigate);

    render(<GrievanceApplication />);

    await waitFor(() => {
      expect(mockGrievanceApplicationThunk).toHaveBeenCalledWith({
        applicationId: "APP1234567",
        roleType: "underwriter",
      });
      expect(screen.getByText("Open")).toBeInTheDocument();
      expect(screen.getByText("User A")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Back to Inbox" }));
    expect(mockGetInboxPath).toHaveBeenCalledWith("retail");
    expect(navigate).toHaveBeenCalledWith("/retail/inbox");
  });

  it("submits the selected grievance application reports", async () => {
    const dispatch = jest.fn();
    mockUseAppDispatch.mockReturnValue(dispatch);
    dispatch
      .mockReturnValueOnce(
        makeDispatchResult({
          status: "Open",
          productOpted: "Term",
          premium: "1000",
          sumAssured: "50000",
          medicalRaisedDate: "2026-01-01",
          medicalsReceivedDate: "2026-01-02",
          reports: [
            {
              id: 1,
              user: "User A",
              reports: "Report A",
              lifeAssuredProposer: "John Doe",
              remarksByUser: "Remark",
              grievanceRaisedDate: "2026-01-03",
              grievanceRaisedRemarks: "Raised",
              grievanceReceivedDate: "2026-01-04",
            },
          ],
        }),
      )
      .mockReturnValueOnce(
        makeDispatchResult({ message: "Grievance application submitted successfully" }),
      );

    const navigate = jest.fn();
    mockUseNavigate.mockReturnValue(navigate);

    render(<GrievanceApplication />);

    await waitFor(() => {
      expect(screen.getByText("User A")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Submit Grievance Application" }));

    await waitFor(() => {
      expect(mockGrievanceApplicationSubmitThunk).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationId: "APP1234567",
          roleType: "underwriter",
          selectedReportIds: [1],
        }),
      );
      expect(navigate).toHaveBeenCalledWith("/retail/inbox", {
        state: { snackbarMessage: "Grievance application submitted successfully" },
      });
    });
  });
});