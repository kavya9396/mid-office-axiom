import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LeftPanel from "./LeftPanel";
import { ALL_CASES_POOL } from "./LeftPanel";
import type { tableData } from "../../types/inbox";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("./LastLogin", () => {
  return function MockLastLogin() {
    return <div>LastLogin</div>;
  };
});

jest.mock("../../icons/Icons", () => ({
  InboxIcon: () => <span>InboxIcon</span>,
  TaskIcon: () => <span>TaskIcon</span>,
  MenuIcon: () => <span>MenuIcon</span>,
  KeyRightArrowIcon: () => <span>Arrow</span>,
}));

describe("LeftPanel", () => {
  const poolRow = {} as tableData;

  beforeEach(() => {
    window.scrollTo = jest.fn();
    mockNavigate.mockClear();
  });

  it("shows empty pool message when no roles are available", () => {
    render(
      <LeftPanel
        selectedPool=""
        toggle={false}
        setToggle={jest.fn()}
        onSelectPool={jest.fn()}
        poolData={{}}
      />,
    );

    expect(screen.getByText("Search Applications")).toBeInTheDocument();
    expect(screen.getByText("No work pools available.")).toBeInTheDocument();
  });

  it("renders pools with count and handles pool selection", async () => {
    const onSelectPool = jest.fn();

    render(
      <LeftPanel
        selectedPool="Pool A"
        toggle={false}
        setToggle={jest.fn()}
        onSelectPool={onSelectPool}
        poolData={{ "Pool A": [poolRow, poolRow], "Pool B": [] }}
      />,
    );

    expect(screen.getByText("All Cases (2)")).toBeInTheDocument();
    expect(screen.getByText("Pool A (2)")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Pool B"));

    expect(onSelectPool).toHaveBeenCalledWith("Pool B");
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it("highlights all cases when selected", () => {
    render(
      <LeftPanel
        selectedPool={ALL_CASES_POOL}
        toggle={false}
        setToggle={jest.fn()}
        onSelectPool={jest.fn()}
        poolData={{ "Pool A": [poolRow], "Pool B": [poolRow, poolRow] }}
      />,
    );

    expect(screen.getByText("All Cases (3)")).toBeInTheDocument();
    expect(screen.getByText("Arrow")).toBeInTheDocument();
  });

  it("navigates to the standalone search application page", async () => {
    const onSelectPool = jest.fn();

    render(
      <LeftPanel
        selectedPool="Pool A"
        toggle={false}
        setToggle={jest.fn()}
        onSelectPool={onSelectPool}
        poolData={{ "Pool A": [poolRow] }}
      />,
    );

    await userEvent.click(screen.getByText("Search Applications"));

    expect(mockNavigate).toHaveBeenCalledWith("/search/application");
    expect(onSelectPool).not.toHaveBeenCalled();
  });
});
