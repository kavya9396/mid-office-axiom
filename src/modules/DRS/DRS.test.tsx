import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DRS from "./DRS";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { drsThunk } from "../../store/thunks/drsThunk";
import { mastersThunk } from "../../store/thunks/mastersThunk";
import { breRetriggerThunk } from "../../store/thunks/breRetriggerThunk";
import { setBreExternalApiOutputs } from "../../store/slices/drsSlice";
import { useAppContext } from "../../hooks/useAppContext";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../../hooks/useAppContext", () => ({
  useAppContext: jest.fn(),
}));

jest.mock("../../store/thunks/drsThunk", () => ({
  drsThunk: jest.fn(),
}));

jest.mock("../../store/thunks/mastersThunk", () => ({
  mastersThunk: jest.fn(),
}));

jest.mock("../../store/thunks/breRetriggerThunk", () => ({
  breRetriggerThunk: jest.fn(),
}));

jest.mock("../../store/slices/drsSlice", () => ({
  setBreExternalApiOutputs: jest.fn(),
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
    RETAIL_CVT_POOL: ["applicationOverview", "breDecision"],
  },
  getPoolWiseAvailableAccordions: jest.fn(() => ["applicationOverview", "breDecision"]),
  accordionRegistry: {
    applicationOverview: () => <div>Application Overview Accordion</div>,
    breDecision: () => <div>Bre Decision Accordion</div>,
  },
}));

const mockUseDispatch = useDispatch as unknown as jest.Mock;
const mockUseSelector = useSelector as unknown as jest.Mock;
const mockUseNavigate = useNavigate as unknown as jest.Mock;
const mockUseAppContext = useAppContext as unknown as jest.Mock;
const mockDrsThunk = drsThunk as unknown as jest.Mock;
const mockMastersThunk = mastersThunk as unknown as jest.Mock;
const mockBreRetriggerThunk = breRetriggerThunk as unknown as jest.Mock;
const mockSetBreExternalApiOutputs = setBreExternalApiOutputs as unknown as jest.Mock;

describe("DRS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("roleType", "CVT Pool");
    localStorage.setItem("userId", "USER-123");
    mockUseAppContext.mockReturnValue({ applicationNumber: "APP-123", businessType: "retail" });
    mockUseSelector.mockImplementation((selector) => selector({ drs: { data: null } }));
    mockUseNavigate.mockReturnValue(jest.fn());
    mockUseDispatch.mockReturnValue(jest.fn());
    mockDrsThunk.mockImplementation((payload) => ({
      type: "drsThunk",
      payload,
    }));
    mockBreRetriggerThunk.mockImplementation((payload) => ({
      type: "breRetriggerThunk",
      payload,
    }));
    mockMastersThunk.mockImplementation((payload) => ({
      type: "mastersThunk",
      payload,
    }));
    mockSetBreExternalApiOutputs.mockImplementation((payload) => ({
      type: "setBreExternalApiOutputs",
      payload,
    }));
  });

  it("dispatches DRS, BRE retrigger, and masters fetch when application number is present", async () => {
    const mockDrsData = {
      applicationNumber: "APP-123",
      externalAPIs: {
        breOutput: {
          systemDecision: "STP",
          decisionTypes: {
            initialDecision: "STD",
            breDecision: "STD",
            breAction: "Standard",
            breRequirement: "-",
          },
          requirements: [],
          systemDecisionDateTime: "2026-04-10",
          errorResp: "",
          breRemarks: "-",
        },
        medicalBreOutput: {},
        financialBreOutput: {},
        risk: {},
        iibOutput: [],
        drcOutput: {},
        ptlrOutput: {},
        ptllOutput: {},
      },
    };

    const dispatch = jest
      .fn()
      .mockReturnValueOnce({
        unwrap: () => Promise.resolve({ data: mockDrsData }),
      })
      .mockReturnValueOnce({
        unwrap: () =>
          Promise.resolve({
            data: {
              breOutput: {
                systemDecision: "Non-STP",
                decisionTypes: {
                  initialDecision: "RM",
                  breDecision: "RM",
                  breAction: "Regular Medical required",
                  breRequirement: "IDM",
                },
                requirements: [],
                systemDecisionDateTime: "2026-04-10",
                errorResp: "",
                breRemarks: "Updated",
              },
            },
          }),
      })
      .mockReturnValueOnce({});

    mockUseDispatch.mockReturnValue(dispatch);

    render(<DRS />);

    await waitFor(() => {
      expect(mockDrsThunk).toHaveBeenCalledWith({
        applicationNo: "APP-123",
        userId: "USER-123",
        roleType: "CVT Pool",
        sections: ["applicationOverview", "breDecision"],
      });
      expect(mockBreRetriggerThunk).toHaveBeenCalledWith({
        data: mockDrsData,
      });
      expect(mockSetBreExternalApiOutputs).toHaveBeenCalledWith({
        breOutput: {
          systemDecision: "Non-STP",
          decisionTypes: {
            initialDecision: "RM",
            breDecision: "RM",
            breAction: "Regular Medical required",
            breRequirement: "IDM",
          },
          requirements: [],
          systemDecisionDateTime: "2026-04-10",
          errorResp: "",
          breRemarks: "Updated",
        },
        initialBreOutput: mockDrsData.externalAPIs.breOutput,
        breRetriggerStatus: "success",
        medicalBreOutput: undefined,
        financialBreOutput: undefined,
      });
      expect(mockMastersThunk).toHaveBeenCalledWith({
        masters: ["title", "gender", "nationality", "idProof", "addressProof", "state", "country", "exceptionDecision"],
      });
      expect(dispatch).toHaveBeenCalledTimes(4);
    });

    expect(screen.getByText("Application Overview Accordion")).toBeInTheDocument();
    expect(screen.getByText("Bre Decision Accordion")).toBeInTheDocument();
  });

  it("preserves initial BRE and marks final BRE failed when retrigger fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const mockDrsData = {
      applicationNumber: "APP-123",
      externalAPIs: {
        breOutput: {
          systemDecision: "STP",
          decisionTypes: {
            initialDecision: "STD",
            breDecision: "STD",
            breAction: "Standard",
            breRequirement: "-",
          },
          requirements: [],
          systemDecisionDateTime: "2026-04-10",
          errorResp: "",
          breRemarks: "-",
        },
        medicalBreOutput: {},
        financialBreOutput: {},
        risk: {},
        iibOutput: [],
        drcOutput: {},
        ptlrOutput: {},
        ptllOutput: {},
      },
    };

    const dispatch = jest
      .fn()
      .mockReturnValueOnce({
        unwrap: () => Promise.resolve({ data: mockDrsData }),
      })
      .mockReturnValueOnce({
        unwrap: () => Promise.reject(new Error("BRE retrigger failed")),
      })
      .mockReturnValueOnce({});

    mockUseDispatch.mockReturnValue(dispatch);

    render(<DRS />);

    await waitFor(() => {
      expect(mockSetBreExternalApiOutputs).toHaveBeenCalledWith({
        initialBreOutput: mockDrsData.externalAPIs.breOutput,
        breRetriggerStatus: "failure",
      });
      expect(mockMastersThunk).toHaveBeenCalledWith({
        masters: ["title", "gender", "nationality", "idProof", "addressProof", "state", "country", "exceptionDecision"],
      });
    });

    consoleErrorSpy.mockRestore();
  });

  it("navigates back to inbox", async () => {
    const navigate = jest.fn();
    const dispatch = jest
      .fn()
      .mockReturnValueOnce({
        unwrap: () =>
          Promise.resolve({
            data: {
              applicationNumber: "APP-123",
              externalAPIs: {
                breOutput: {
                  systemDecision: "STP",
                  decisionTypes: {
                    initialDecision: "STD",
                    breDecision: "STD",
                    breAction: "Standard",
                    breRequirement: "-",
                  },
                  requirements: [],
                  systemDecisionDateTime: "2026-04-10",
                  errorResp: "",
                  breRemarks: "-",
                },
                medicalBreOutput: {},
                financialBreOutput: {},
                risk: {},
                iibOutput: [],
                drcOutput: {},
                ptlrOutput: {},
                ptllOutput: {},
              },
            },
          }),
      })
      .mockReturnValueOnce({
        unwrap: () =>
          Promise.resolve({
            data: {
              breOutput: {
                systemDecision: "STP",
                decisionTypes: {
                  initialDecision: "STD",
                  breDecision: "STD",
                  breAction: "Standard",
                  breRequirement: "-",
                },
                requirements: [],
                systemDecisionDateTime: "2026-04-10",
                errorResp: "",
                breRemarks: "-",
              },
            },
          }),
      })
      .mockReturnValueOnce({});

    mockUseNavigate.mockReturnValue(navigate);
    mockUseDispatch.mockReturnValue(dispatch);

    render(<DRS />);

    await userEvent.click(screen.getByRole("button", { name: "Back to inbox" }));

    expect(navigate).toHaveBeenCalledWith("/retail/inbox");
  });
});