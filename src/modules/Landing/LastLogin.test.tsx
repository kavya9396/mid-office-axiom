import { render, screen } from "@testing-library/react";
import LastLogin from "./LastLogin";

describe("LastLogin", () => {
  it("formats and renders the last login timestamp", () => {
    render(<LastLogin lastLogin={new Date(2026, 0, 1, 9, 5)} />);

    expect(screen.getByText(/Last login: 1st January/)).toBeInTheDocument();
    expect(screen.getByText(/9:05 am/)).toBeInTheDocument();
  });
});
