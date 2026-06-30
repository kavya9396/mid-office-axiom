import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Inbox from "./Inbox";
import { useAppDispatch } from "../../store/hooks";
import { fetchInboxThunk } from "../../store/thunks/inboxThunk";
import { poolThunk } from "../../store/thunks/poolThunk";

jest.mock("../../store/hooks", () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("../../store/thunks/inboxThunk", () => ({
  fetchInboxThunk: jest.fn(),
}));

jest.mock("../../store/thunks/poolThunk", () => ({
  poolThunk: jest.fn(),
}));

jest.mock("./LeftPanel", () => {
  type LeftPanelProps = {
    selectedPool: string;
    onSelectPool: (pool: string) => void;
  };

  return function LeftPanelMock({
    selectedPool,
    onSelectPool,
  }: LeftPanelProps) {
    return (
      <div>
        <div data-testid="left-selected">{selectedPool}</div>
        <button onClick={() => onSelectPool("Pool B")}>Select Pool B</button>
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
const mockPoolThunk = poolThunk as unknown as jest.Mock;

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
    mockPoolThunk.mockImplementation((payload) => ({
      type: "poolThunk",
      payload,
    }));
  });

  it("loads inbox data on mount and does not fetch pool data for initial auto-selection", async () => {
    const inboxResponse = {
      roleType: "underwriter",
      roles: [{ name: "UW", pools: ["Pool A", "Pool B"] }],
      poolData: {
        "Pool A": [baseRow],
      },
    };

    mockDispatch.mockReturnValueOnce(makeDispatchResult(inboxResponse));

    render(
      <MemoryRouter>
        <Inbox />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockFetchInboxThunk).toHaveBeenCalledWith({
        username: "test-user",
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("left-selected")).toHaveTextContent("Pool A");
      expect(screen.getByTestId("right-panel")).toHaveTextContent("Pool A:1");
    });

    expect(mockPoolThunk).not.toHaveBeenCalled();
  });

  it("fetches pool data when the user selects a different pool", async () => {
    const inboxResponse = {
      roleType: "underwriter",
      roles: [{ name: "UW", pools: ["Pool A", "Pool B"] }],
      poolData: {
        "Pool A": [baseRow],
      },
    };

    const poolResponse = {
      poolData: {
        "Pool B": [
          { ...baseRow, id: 2, applicationNo: "APP-2" },
          { ...baseRow, id: 3, applicationNo: "APP-3" },
        ],
      },
    };

    mockDispatch
      .mockReturnValueOnce(makeDispatchResult(inboxResponse))
      .mockReturnValueOnce(makeDispatchResult(poolResponse));

    render(
      <MemoryRouter>
        <Inbox />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("left-selected")).toHaveTextContent("Pool A");
    });

    await userEvent.click(screen.getByRole("button", { name: "Select Pool B" }));

    await waitFor(() => {
      expect(mockPoolThunk).toHaveBeenCalledWith({
        roleName: "underwriter",
        poolname: "Pool B",
        userId: "test-user",
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("right-panel")).toHaveTextContent("Pool B:2");
    });
  });
});
