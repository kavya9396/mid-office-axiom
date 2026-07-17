import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Inbox from "./Inbox";
import { ALL_CASES_POOL } from "./LeftPanel";
import { useAppDispatch } from "../../store/hooks";
import { fetchInboxThunk } from "../../store/thunks/inboxThunk";

jest.mock("../../store/hooks", () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("../../store/thunks/inboxThunk", () => ({
  fetchInboxThunk: jest.fn(),
}));

jest.mock("./LeftPanel", () => {
  type LeftPanelProps = {
    selectedPool: string;
    onSelectPool: (pool: string) => void;
    poolData: Record<string, Array<unknown>>;
  };

  return function LeftPanelMock({
    selectedPool,
    onSelectPool,
    poolData,
  }: LeftPanelProps) {
    return (
      <div>
        <div data-testid="left-selected">{selectedPool}</div>
        <button onClick={() => onSelectPool(ALL_CASES_POOL)}>{ALL_CASES_POOL}</button>
        {Object.keys(poolData).map((pool) => (
          <button key={pool} onClick={() => onSelectPool(pool)}>{pool}</button>
        ))}
      </div>
    );
  };
});

jest.mock("./RightPanel", () => {
  type RightPanelProps = {
    selectedPool: string;
    rows: Array<unknown>;
  };

  return function RightPanelMock({ selectedPool, rows }: RightPanelProps) {
    return <div data-testid="right-panel">{`${selectedPool}:${rows.length}`}</div>;
  };
});

const mockDispatch = jest.fn();
const mockUseAppDispatch = useAppDispatch as jest.Mock;
const mockFetchInboxThunk = fetchInboxThunk as unknown as jest.Mock;

const makeDispatchResult = (value: unknown) => ({
  unwrap: jest.fn().mockResolvedValue(value),
});

const baseRow = {
  id: 1,
  applicationNo: "APP-1",
  appliedSa: 100,
  annualPremium: 10,
  productType: "Term",
  drc: "D",
  ptlr: "P",
  isMedical: false,
  breDecision: "Accept",
  channel: "Online",
  munichReMedicalDecision: "Clear",
  hniFlag: false,
  roleType: "underwriter",
};

describe("Inbox", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("username", "test-user");

    mockUseAppDispatch.mockReturnValue(mockDispatch);
    mockFetchInboxThunk.mockImplementation((payload) => ({
      type: "fetchInboxThunk",
      payload,
    }));
  });

  it("loads inbox data on mount and renders all cases by default", async () => {
    const inboxResponse = {
      poolData: {
        "Pool A": [baseRow],
        "Pool B": [],
      },
    };

    mockDispatch.mockReturnValue(makeDispatchResult(inboxResponse));

    render(
      <MemoryRouter>
        <Inbox />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockFetchInboxThunk).toHaveBeenCalledWith({
        username: "test-user",
        password: "",
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("left-selected")).toHaveTextContent(ALL_CASES_POOL);
      expect(screen.getByTestId("right-panel")).toHaveTextContent(`${ALL_CASES_POOL}:1`);
    });
  });

  it("switches rows immediately when the user selects a different pool", async () => {
    const inboxResponse = {
      poolData: {
        "Pool A": [baseRow],
        "Pool B": [
          { ...baseRow, id: 2, applicationNo: "APP-2" },
          { ...baseRow, id: 3, applicationNo: "APP-3" },
        ],
      },
    };

    mockDispatch.mockReturnValue(makeDispatchResult(inboxResponse));

    render(
      <MemoryRouter>
        <Inbox />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("left-selected")).toHaveTextContent(ALL_CASES_POOL);
    });

    await userEvent.click(screen.getByRole("button", { name: "Pool B" }));

    await waitFor(() => {
      expect(screen.getByTestId("right-panel")).toHaveTextContent("Pool B:2");
    });

    expect(fetchInboxThunk).toHaveBeenCalled();
  });

  it("shows aggregated rows when all cases is selected", async () => {
    const inboxResponse = {
      poolData: {
        "Pool A": [baseRow],
        "Pool B": [
          { ...baseRow, id: 2, applicationNo: "APP-2" },
          { ...baseRow, id: 3, applicationNo: "APP-3" },
        ],
      },
    };

    mockDispatch.mockReturnValue(makeDispatchResult(inboxResponse));

    render(
      <MemoryRouter>
        <Inbox />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("right-panel")).toHaveTextContent(`${ALL_CASES_POOL}:3`);
    });
  });
});
