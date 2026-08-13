import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Inbox from "./Inbox_";
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
  const ALL_CASES_POOL = "ALL CASES";

  type LeftPanelProps = {
    selectedPool: string;
    onSelectPool: (pool: string) => void;
    poolData: Record<string, Array<unknown>>;
  };

  function LeftPanelMock({
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
  }

  return {
    __esModule: true,
    ALL_CASES_POOL,
    default: LeftPanelMock,
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

  it("loads inbox data on mount and renders the first available pool by default", async () => {
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
      expect(screen.getByTestId("left-selected")).toHaveTextContent("Pool A");
      expect(screen.getByTestId("right-panel")).toHaveTextContent("Pool A:1");
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
      expect(screen.getByTestId("left-selected")).toHaveTextContent("Pool A");
    });

    await userEvent.click(screen.getByRole("button", { name: "Pool B" }));

    await waitFor(() => {
      expect(screen.getByTestId("right-panel")).toHaveTextContent("Pool B:2");
    });

    expect(fetchInboxThunk).toHaveBeenCalled();
  });

  it("shows only CVT task rows when CVT_TASK is selected", async () => {
    const inboxResponse = {
      poolData: {
        CVT_TASK: [
          { ...baseRow, id: 1, applicationNo: "CVT-1", roleType: "CVT_TASK" },
          { ...baseRow, id: 2, applicationNo: "CVT-2", roleType: "CVT_TASK" },
        ],
        DVT_TASK: [
          { ...baseRow, id: 3, applicationNo: "DVT-1", roleType: "DVT_TASK" },
          { ...baseRow, id: 4, applicationNo: "DVT-2", roleType: "DVT_TASK" },
          { ...baseRow, id: 5, applicationNo: "DVT-3", roleType: "DVT_TASK" },
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
      expect(screen.getByTestId("right-panel")).toHaveTextContent("CVT_TASK:2");
    });

    await userEvent.click(screen.getByRole("button", { name: "CVT_TASK" }));

    await waitFor(() => {
      expect(screen.getByTestId("left-selected")).toHaveTextContent("CVT_TASK");
      expect(screen.getByTestId("right-panel")).toHaveTextContent("CVT_TASK:2");
    });
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
      expect(screen.getByTestId("right-panel")).toHaveTextContent("Pool A:1");
    });

    await userEvent.click(screen.getByRole("button", { name: ALL_CASES_POOL }));

    await waitFor(() => {
      expect(screen.getByTestId("right-panel")).toHaveTextContent(`${ALL_CASES_POOL}:3`);
    });
  });

  it("renders every row from the role list response in both panels", async () => {
    const sharedApplicationRow = { ...baseRow, id: 2, applicationNo: "APP-SHARED" };
    const inboxResponse = {
      poolData: {
        "Pool A": [sharedApplicationRow],
        "Pool B": [{ ...sharedApplicationRow, taskId: "TASK-2", roleType: "Pool B" }],
      },
    };

    mockDispatch.mockReturnValue(makeDispatchResult(inboxResponse));

    render(
      <MemoryRouter>
        <Inbox />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Pool A" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Pool B" })).toBeInTheDocument();
      expect(screen.getByTestId("right-panel")).toHaveTextContent("Pool A:1");
    });

    await userEvent.click(screen.getByRole("button", { name: "Pool B" }));

    await waitFor(() => {
      expect(screen.getByTestId("left-selected")).toHaveTextContent("Pool B");
      expect(screen.getByTestId("right-panel")).toHaveTextContent("Pool B:1");
    });
  });

  it("replaces the whole inbox when a later role list response changes buckets", async () => {
    const sharedApplicationRow = { ...baseRow, applicationNo: "APP-SHARED" };
    const firstResponse = {
      poolData: {
        CVT_TASK: [{ ...sharedApplicationRow, id: 1, roleType: "CVT_TASK" }],
        DVT_TASK: [{ ...sharedApplicationRow, id: 2, roleType: "DVT_TASK" }],
      },
    };
    const secondResponse = {
      poolData: {
        DVT_TASK: [
          { ...sharedApplicationRow, id: 3, taskId: "DVT-1", roleType: "DVT_TASK" },
          { ...sharedApplicationRow, id: 4, taskId: "DVT-2", roleType: "DVT_TASK" },
        ],
        PIVV_TASK: [{ ...sharedApplicationRow, id: 5, roleType: "PIVV_TASK" }],
      },
    };

    mockDispatch
      .mockReturnValueOnce(makeDispatchResult(firstResponse))
      .mockReturnValueOnce(makeDispatchResult(secondResponse));

    render(
      <MemoryRouter>
        <Inbox />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("right-panel")).toHaveTextContent("CVT_TASK:1");
    });

    window.dispatchEvent(new Event("focus"));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledTimes(2);
      expect(screen.queryByRole("button", { name: "CVT_TASK" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "DVT_TASK" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "PIVV_TASK" })).toBeInTheDocument();
      expect(screen.getByTestId("left-selected")).toHaveTextContent("DVT_TASK");
      expect(screen.getByTestId("right-panel")).toHaveTextContent("DVT_TASK:2");
    });
  });
});
