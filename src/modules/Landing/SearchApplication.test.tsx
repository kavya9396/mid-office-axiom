import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchApplication from "./SearchApplication";
import { useDispatch } from "react-redux";
import { searchThunk } from "../../store/thunks/searchAppThunk";
import { useNavigate } from "react-router-dom";
import { getDRSPath } from "../../routes/routes";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

jest.mock("../../store/thunks/searchAppThunk", () => ({
  searchThunk: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../../routes/routes", () => ({
  getDRSPath: jest.fn(),
}));

jest.mock("../../components/ui/TextField/TextField", () => {
  type TextFieldProps = {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    helperText?: string;
  };

  return function MockTextField({
    value,
    onChange,
    placeholder,
    helperText,
  }: TextFieldProps) {
    return (
      <div>
        <input
          aria-label="search-application"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        {helperText ? <span>{helperText}</span> : null}
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

jest.mock("../../components/layout/GridSection", () => ({
  GridSection: () => <div>GridSection</div>,
}));

jest.mock("../DRS/DRS_Accordions/RequirementManagement", () => {
  return function MockRequirementManagement() {
    return <div>RequirementManagement</div>;
  };
});

jest.mock("../DRS/DRS_Accordions/AuditTrail", () => {
  return function MockAuditTrail() {
    return <div>AuditTrail</div>;
  };
});

const mockDispatch = jest.fn();
const mockUseDispatch = useDispatch as unknown as jest.Mock;
const mockSearchThunk = searchThunk as unknown as jest.Mock;
const mockUseNavigate = useNavigate as jest.Mock;
const mockGetDRSPath = getDRSPath as jest.Mock;

const makeDispatchResult = (value: unknown) => ({
  unwrap: jest.fn().mockResolvedValue(value),
});

describe("SearchApplication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDispatch.mockReturnValue(mockDispatch);
    mockSearchThunk.mockImplementation((payload) => ({
      type: "searchThunk",
      payload,
    }));
    mockGetDRSPath.mockReturnValue("/drs/retail/APP1234567");
  });

  it("sanitizes input and enables search only for 10 alphanumeric chars", async () => {
    render(<SearchApplication />);

    const input = screen.getByLabelText("search-application");
    const searchBtn = screen.getByRole("button", { name: "Search" });

    expect(searchBtn).toBeDisabled();

    await userEvent.type(input, "AB12!@3456789");

    expect(input).toHaveValue("AB12345678");
    expect(searchBtn).toBeEnabled();
  });

  it("searches and renders result actions", async () => {
    const navigate = jest.fn();
    const openSpy = jest
      .spyOn(window, "open")
      .mockImplementation(() => null as any);

    const response = {
      applicationDetails: {
        applicationId: "APP1234567",
      },
      applicationOverview: {},
      summary: [],
      riderDetails: [],
      requirements: [],
      auditTrail: {},
      udsLink: "https://example.com/uds",
    };

    mockUseNavigate.mockReturnValue(navigate);
    mockDispatch.mockReturnValueOnce(makeDispatchResult(response));

    render(<SearchApplication />);

    const input = screen.getByLabelText("search-application");
    await userEvent.type(input, "APP1234567");

    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(mockSearchThunk).toHaveBeenCalledWith({
        applicationId: "APP1234567",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText("Application Details - APP1234567"),
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "View UDS Document" }));
    expect(openSpy).toHaveBeenCalledWith("https://example.com/uds", "_blank");

    await userEvent.click(screen.getByRole("button", { name: "View DRS Sheet" }));
    expect(mockGetDRSPath).toHaveBeenCalledWith("retail", "APP1234567");
    expect(navigate).toHaveBeenCalledWith("/drs/retail/APP1234567");

    openSpy.mockRestore();
  });
});
