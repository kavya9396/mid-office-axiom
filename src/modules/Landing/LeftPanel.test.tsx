import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LeftPanel from "./LeftPanel";

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
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  it("shows empty pool message when no roles are available", () => {
    render(
      <LeftPanel
        selectedPool=""
        toggle={false}
        setToggle={jest.fn()}
        onSelectPool={jest.fn()}
        mode="accordion"
        role="admin"
        roles={[]}
        rows={[]}
        poolData={{}}
        poolCounts={{}}
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
        mode="accordion"
        role="uw"
        roles={[{ name: "UW", pools: ["Pool A", "Pool B"] }]}
        rows={[]}
        poolData={{}}
        poolCounts={{ "Pool A": 2, "Pool B": 0 }}
      />,
    );

    expect(screen.getByText("UW")).toBeInTheDocument();
    expect(screen.getByText("Pool A (2)")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Pool B"));

    expect(onSelectPool).toHaveBeenCalledWith("Pool B");
    expect(window.scrollTo).toHaveBeenCalled();
  });
});
