/**
 * @jest-environment jsdom
 */

import * as React from "react";
import { render, screen } from "@testing-library/react";
import { HoursTable } from "./";
import { HOURS, HOURS_WITH_REOPEN_DATE } from "./sampleData";

describe("HoursTable", () => {
  it("properly renders full week", () => {
    render(<HoursTable hours={HOURS} />);

    expect(screen.queryByText("sunday")).toBeTruthy();
    expect(screen.queryByText("monday")).toBeTruthy();
    expect(screen.queryByText("tuesday")).toBeTruthy();
    expect(screen.queryByText("wednesday")).toBeTruthy();
    expect(screen.queryByText("thursday")).toBeTruthy();
    expect(screen.queryByText("friday")).toBeTruthy();
    expect(screen.queryByText("saturday")).toBeTruthy();
  });

  it("properly renders with custom day labels", () => {
    const label = "ice cream sundae";
    render(<HoursTable hours={HOURS} dayOfWeekNames={{ sunday: label }} />);

    expect(screen.queryByText(label)).toBeTruthy();
    expect(screen.queryByText("sunday")).toBeFalsy();
  });

  it("properly renders with custom day labels", () => {
    render(<HoursTable hours={HOURS_WITH_REOPEN_DATE} collapseDays={true} />);

    expect(screen.queryByText("sunday - saturday")).toBeTruthy();
  });
});
