import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RightPanel from "./RightPanel";
import { useColumnConfig } from "../../hooks/useColumnConfig";
import { useNavigate } from "react-router-dom";
import { getDRSPath } from "../../routes/routes";
import { useAppDispatch } from "../../store/hooks";
import { claimTaskThunk } from "../../store/thunks/claimTaskThunk";

jest.mock("../../hooks/useColumnConfig", () => ({
  useColumnConfig: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../../routes/routes", () => ({
  getDRSPath: jest.fn(),
  getGrievanceApplicationPath: jest.fn(),
}));

jest.mock("../../store/hooks", () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("../../store/thunks/claimTaskThunk", () => ({
  claimTaskThunk: jest.fn(),
}));

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

jest.mock("../../components/ui/SearchBar/SearchBar", () => {
  type SearchProps = {
    onSearch: (value: string) => void;
  };

  return function MockSearchBar({ onSearch }: SearchProps) {
    return (
      <input
        aria-label="search input"
        onChange={(e) => onSearch(e.target.value)}
      />
    );
  };
});

jest.mock("../../components/ui/Dialog/Dialog", () => {
  type DialogProps = {
    open: boolean;
    children: React.ReactNode;
    actions?: React.ReactNode;
    title?: string;
  };

  return function MockDialog({ open, children, actions, title }: DialogProps) {
    if (!open) return null;
    return (
      <div>
        <h2>{title}</h2>
        {children}
        {actions}
      </div>
    );
  };
});

jest.mock("../../components/ui/Checkbox/Checkbox", () => {
  type CheckboxProps = {
    label: string;
    checked: boolean;
    onChange: () => void;
  };

  return function MockCheckbox({ label, checked, onChange }: CheckboxProps) {
    return (
      <label>
        <input type="checkbox" checked={checked} onChange={onChange} />
        {label}
      </label>
    );
  };
});

jest.mock("../../components/ui/Badge/Badge", () => {
  type BadgeProps = {
    label: string;
  };

  return function MockBadge({ label }: BadgeProps) {
    return <span>{label}</span>;
  };
});

jest.mock("./FilterTable", () => {
  return function MockFilterTable() {
    return <div>FilterTable</div>;
  };
});

jest.mock("./SearchApplication", () => {
  return function MockSearchApplication() {
    return <div>SearchApplication</div>;
  };
});

jest.mock("../../icons/Icons", () => ({
  FilterIcon: () => <span>FilterIcon</span>,
  SearchIcon: () => <span>SearchIcon</span>,
  SettingsIcon: () => <span>SettingsIcon</span>,
  KeyLeftArrowIcon: () => <span>Prev</span>,
  KeyRightArrowIcon: () => <span>Next</span>,
}));

const mockUseColumnConfig = useColumnConfig as jest.Mock;
const mockUseNavigate = useNavigate as jest.Mock;
const mockGetDRSPath = getDRSPath as jest.Mock;
const mockUseAppDispatch = useAppDispatch as jest.Mock;
const mockClaimTaskThunk = claimTaskThunk as unknown as jest.Mock;

const rows = [
  {
    id: 1,
    applicationNo: "APP-1",
    appliedSa: 100,
    annualPremium: 10,
    productType: "Term",
    drc: "Low",
    ptlr: "P",
    isMedical: false,
    breDecision: "Accept",
    channel: "Online",
    munichReMedicalDecision: "Clear",
    hniFlag: false,
    roleType: "underwriter",
    taskId: "2078.18763",
  },
];

describe("RightPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("username", "ipru74685");
    localStorage.setItem("password", "secret");
    mockClaimTaskThunk.mockImplementation((payload) => payload);
    mockUseAppDispatch.mockReturnValue(
      jest.fn(() => ({
        unwrap: () => Promise.resolve({ success: true, message: "ok" }),
      })),
    );
    mockUseColumnConfig.mockReturnValue({
      config: {
        visible: ["applicationNo", "drc", "roleType"],
        hidden: [],
      },
      updateConfig: jest.fn(),
    });
  });

  it("renders SearchApplication component for Search Applications pool", () => {
    render(<RightPanel selectedPool="Search Applications" rows={[]} />);

    expect(screen.getByText("SearchApplication")).toBeInTheDocument();
  });

  it("shows empty state when no rows are available", () => {
    render(<RightPanel selectedPool="UW Pool" rows={[]} />);

    expect(screen.getByText("No Data Found!")).toBeInTheDocument();
    expect(screen.queryAllByRole("columnheader")).toHaveLength(0);

    expect(screen.getByTestId("search-toggle")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByTestId("filter-toggle")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByTestId("settings-toggle")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("navigates to DRS page when application number is clicked", async () => {
    const navigate = jest.fn();
    mockUseNavigate.mockReturnValue(navigate);
    mockGetDRSPath.mockReturnValue("/drs/retail/APP-1");

    render(<RightPanel selectedPool="UW Pool" rows={rows} />);

    await userEvent.click(screen.getByText("APP-1"));

    expect(mockClaimTaskThunk).toHaveBeenCalledWith({
      username: "ipru74685",
      password: "secret",
      taskId: "18763",
    });
    expect(localStorage.getItem("roleType")).toBe("underwriter");
    expect(mockGetDRSPath).toHaveBeenCalledWith("retail", "APP-1");
    expect(navigate).toHaveBeenCalledWith("/drs/retail/APP-1");
  });
});
