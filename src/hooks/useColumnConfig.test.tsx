import { render, screen } from "@testing-library/react";
import { useColumnConfig } from "./useColumnConfig";

jest.mock("../services/api", () => ({
  apiRequest: jest.fn().mockResolvedValue({}),
}));

jest.mock("../services/apiConfig", () => ({
  url: (key: string) => key,
}));

const HookHarness = ({ rows }: { rows: object[] }) => {
  const { config, allowedColumns, maxVisibleColumns } = useColumnConfig("ipru74685", "ANY_TASK", rows);

  return (
    <div>
      <div data-testid="visible">{config.visible.join(",")}</div>
      <div data-testid="hidden">{config.hidden.join(",")}</div>
      <div data-testid="allowed">{allowedColumns.join(",")}</div>
      <div data-testid="max">{maxVisibleColumns}</div>
    </div>
  );
};

describe("useColumnConfig", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses row object keys as columns for every task except technical identifiers", () => {
    render(
      <HookHarness
        rows={[
          {
            id: 1,
            taskId: "18763",
            instanceId: "1234",
            applicationNo: "NB0000021",
            role: "RETAIL_RECONSIDERATION_USER",
            businessType: "RETAIL",
            state: "DRAFT",
            displayName: "ARYAYAN Khan",
            customDecisionField: "Value",
          },
        ]}
      />,
    );

    expect(screen.getByTestId("allowed")).toHaveTextContent(
      "applicationNo,role,businessType,displayName,customDecisionField",
    );
    expect(screen.getByTestId("visible")).toHaveTextContent(
      "applicationNo,role,businessType,displayName,customDecisionField",
    );
    expect(screen.getByTestId("hidden")).toBeEmptyDOMElement();
    expect(screen.getByTestId("max")).toHaveTextContent("8");
  });

  it("shows only first 8 row-key columns and keeps the rest hidden for customization", () => {
    render(
      <HookHarness
        rows={[
          {
            id: 1,
            taskId: "18763",
            instanceId: "1234",
            state: "DRAFT",
            applicationNo: "NB0000021",
            appliedSa: 1000000,
            annualPremium: 876863872,
            productType: "I19",
            channel: "0TTB",
            breDecision: "STD",
            roleType: "RECONSIDERATION_TASK",
            role: "RETAIL_RECONSIDERATION_USER",
            businessType: "RETAIL",
            displayName: "ARYAYAN Khan",
          },
        ]}
      />,
    );

    expect(screen.getByTestId("visible")).toHaveTextContent(
      "applicationNo,appliedSa,annualPremium,productType,channel,breDecision,roleType,role",
    );
    expect(screen.getByTestId("hidden")).toHaveTextContent("businessType,displayName");
    expect(screen.getByTestId("max")).toHaveTextContent("8");
  });
});
