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
  normalizeBusinessType: jest.fn((businessType?: string | null) => {
    const normalized = String(businessType ?? "").trim().toLowerCase();
    return ["retail", "group"].includes(normalized) ? normalized : undefined;
  }),
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
    type?: "button" | "submit" | "reset";
  };

  return function MockButton({ children, onClick, disabled, type }: ButtonProps) {
    return (
      <button type={type} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    );
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
    mockGetDRSPath.mockReturnValue("/retail/app/APP1234567/drs");
    localStorage.clear();
    localStorage.setItem("businessType", "retail");
    localStorage.setItem("roleType", "CPT Pool");
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

  it("searches and redirects to the DRS page", async () => {
    const navigate = jest.fn();

    const response = {
      data: {
        basicDetails: {
          applicationNumber: "APP1234567",
        },
      },
    };

    mockUseNavigate.mockReturnValue(navigate);
    mockDispatch.mockReturnValueOnce(makeDispatchResult(response));

    render(<SearchApplication />);

    const input = screen.getByLabelText("search-application");
    await userEvent.type(input, "APP1234567");

    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(mockSearchThunk).toHaveBeenCalledWith({
        applicationNo: "APP1234567",
        roleType: "CPT Pool",
      });
    });

    await waitFor(() => {
      expect(mockGetDRSPath).toHaveBeenCalledWith("retail", "APP1234567");
      expect(navigate).toHaveBeenCalledWith("/retail/app/APP1234567/drs");
    });

    expect(localStorage.getItem("applicationNumber")).toBe("APP1234567");
  });
});
