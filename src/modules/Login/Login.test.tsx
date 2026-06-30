import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./Login";
import { useAppDispatch } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import { loginThunk } from "../../store/thunks/authThunk";

jest.mock("../../assets/Login-Image.svg", () => "login-image.svg");
jest.mock("../../assets/ICICI-Logo.svg", () => "icici-logo.svg");
jest.mock("../../assets/Axiom Logo.svg", () => "axiom-logo.svg");
jest.mock("../../assets/IBM Logo.svg", () => "ibm-logo.svg");

jest.mock("../../store/hooks", () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../../store/thunks/authThunk", () => ({
  loginThunk: jest.fn(),
}));

jest.mock("../../components/ui/TextField/TextField", () => {
  type TextFieldProps = {
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    autoComplete?: string;
    helperText?: string;
    error?: boolean;
  };

  return function MockTextField({
    value,
    onChange,
    placeholder,
    type,
    autoComplete,
    helperText,
    error,
  }: TextFieldProps) {
    return (
      <div>
        <input
          aria-label={placeholder}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete}
          data-error={error ? "true" : "false"}
        />
        {helperText ? <span>{helperText}</span> : null}
      </div>
    );
  };
});

jest.mock("../../components/ui/Checkbox/Checkbox", () => {
  type CheckboxProps = {
    label: string;
  };

  return function MockCheckbox({ label }: CheckboxProps) {
    return <span>{label}</span>;
  };
});

jest.mock("../../components/ui/Button/Button", () => {
  type ButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
  };

  return function MockButton({ children, onClick, disabled, type }: ButtonProps) {
    return (
      <button onClick={onClick} disabled={disabled} type={type}>
        {children}
      </button>
    );
  };
});

const mockUseAppDispatch = useAppDispatch as unknown as jest.Mock;
const mockUseNavigate = useNavigate as unknown as jest.Mock;
const mockLoginThunk = loginThunk as unknown as jest.Mock;

const makeDispatchResult = (value: unknown) => ({
  unwrap: jest.fn().mockResolvedValue(value),
});

describe("Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockUseAppDispatch.mockReturnValue(jest.fn());
    mockUseNavigate.mockReturnValue(jest.fn());
    mockLoginThunk.mockImplementation((payload) => ({
      type: "loginThunk",
      payload,
    }));
  });

  it("shows validation errors when fields are empty", async () => {
    render(<Login />);

    await userEvent.click(screen.getByRole("button", { name: "Log In" }));

    expect(screen.getByText("Username is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("submits credentials and navigates after a successful login", async () => {
    const navigate = jest.fn();
    const dispatch = jest.fn().mockReturnValue(
      makeDispatchResult({ ldapAuthentication: "Success", token: "token-123" }),
    );

    mockUseNavigate.mockReturnValue(navigate);
    mockUseAppDispatch.mockReturnValue(dispatch);

    render(<Login />);

    await userEvent.type(screen.getByPlaceholderText("enter your User ID"), "demouser");
    await userEvent.type(screen.getByPlaceholderText("enter your Password"), "Password1");
    await userEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(mockLoginThunk).toHaveBeenCalledWith({
        username: "demouser",
        password: "Password1",
      });
      expect(localStorage.getItem("token")).toBe("token-123");
      expect(localStorage.getItem("username")).toBe("demouser");
      expect(navigate).toHaveBeenCalledWith("/retail/inbox");
    });
  });
});