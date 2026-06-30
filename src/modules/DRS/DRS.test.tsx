import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DRS from "./DRS";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { drsThunk } from "../../store/thunks/drsThunk";
import { mastersThunk } from "../../store/thunks/mastersThunk";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("../../store/thunks/drsThunk", () => ({
  drsThunk: jest.fn(),
}));

jest.mock("../../store/thunks/mastersThunk", () => ({
  mastersThunk: jest.fn(),
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

jest.mock("./drs-layouts", () => ({
  DRS_LAYOUTS: {
    RETAIL_CVT_POOL: ["APP_OVERVIEW", "BRE_DECISION"],
  },
  accordionRegistry: {
    APP_OVERVIEW: () => <div>Application Overview Accordion</div>,
    BRE_DECISION: () => <div>Bre Decision Accordion</div>,
  },
}));

const mockUseDispatch = useDispatch as unknown as jest.Mock;
const mockUseNavigate = useNavigate as unknown as jest.Mock;
const mockUseParams = useParams as unknown as jest.Mock;
const mockDrsThunk = drsThunk as unknown as jest.Mock;
const mockMastersThunk = mastersThunk as unknown as jest.Mock;

describe("DRS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("roleType", "CVT Pool");
    mockUseParams.mockReturnValue({ applicationNumber: "APP-123" });
    mockUseNavigate.mockReturnValue(jest.fn());
    mockUseDispatch.mockReturnValue(jest.fn());
    mockDrsThunk.mockImplementation((payload) => ({
      type: "drsThunk",
      payload,
    }));
    mockMastersThunk.mockImplementation((payload) => ({
      type: "mastersThunk",
      payload,
    }));
  });

  it("dispatches DRS and master fetches when application number is present", async () => {
    const dispatch = jest.fn();
    mockUseDispatch.mockReturnValue(dispatch);

    render(<DRS />);

    await waitFor(() => {
      expect(mockDrsThunk).toHaveBeenCalledWith({
        applicationId: "APP-123",
        roleType: "CVT Pool",
      });
      expect(mockMastersThunk).toHaveBeenCalledWith({
        masters: ["gender", "nationality", "idProof", "addressProof", "state", "country"],
      });
      expect(dispatch).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByText("Application Overview Accordion")).toBeInTheDocument();
    expect(screen.getByText("Bre Decision Accordion")).toBeInTheDocument();
  });

  it("navigates back to inbox", async () => {
    const navigate = jest.fn();
    mockUseNavigate.mockReturnValue(navigate);

    render(<DRS />);

    await userEvent.click(screen.getByRole("button", { name: "Back to inbox" }));

    expect(navigate).toHaveBeenCalledWith("/retail/inbox");
  });
});