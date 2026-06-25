import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterTable from "./FilterTable";

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
        <div>{actions}</div>
      </div>
    );
  };
});

jest.mock("../../components/ui/Button/Button", () => {
  type ButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
  };

  return function MockButton({ children, onClick }: ButtonProps) {
    return <button onClick={onClick}>{children}</button>;
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
    roleType: "uw",
  },
  {
    id: 2,
    applicationNo: "APP-2",
    appliedSa: 200,
    annualPremium: 20,
    productType: "Term",
    drc: "High",
    ptlr: "P",
    isMedical: false,
    breDecision: "Accept",
    channel: "Online",
    munichReMedicalDecision: "Clear",
    hniFlag: false,
    roleType: "uw",
  },
];

describe("FilterTable", () => {
  it("clears all filters and applies/close dialog", async () => {
    const setOpenFilterDialog = jest.fn();
    const setFilterValues = jest.fn();
    const onApply = jest.fn();

    render(
      <FilterTable
        openFilterDialog
        setOpenFilterDialog={setOpenFilterDialog}
        filterValues={{ applicationNo: ["APP-1"] }}
        setFilterValues={setFilterValues}
        visibleColumns={[{ key: "applicationNo", label: "Application" }] as any}
        rows={rows as any}
        onApply={onApply}
      />,
    );

    setFilterValues.mockClear();

    await userEvent.click(screen.getByRole("button", { name: "Clear All" }));
    expect(setFilterValues).toHaveBeenCalledWith({});

    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(setOpenFilterDialog).toHaveBeenCalledWith(false);
  });

  it("toggles a selected filter value", async () => {
    const setFilterValues = jest.fn();

    render(
      <FilterTable
        openFilterDialog
        setOpenFilterDialog={jest.fn()}
        filterValues={{}}
        setFilterValues={setFilterValues}
        visibleColumns={[{ key: "applicationNo", label: "Application" }] as any}
        rows={rows as any}
        onApply={jest.fn()}
      />,
    );

    setFilterValues.mockClear();

    await userEvent.click(screen.getByLabelText("APP-1"));

    const updater = setFilterValues.mock.calls[0][0] as (
      prev: Record<string, string[]>,
    ) => Record<string, string[]>;

    expect(updater({})).toEqual({ applicationNo: ["APP-1"] });
    expect(updater({ applicationNo: ["APP-1"] })).toEqual({ applicationNo: [] });
  });
});
