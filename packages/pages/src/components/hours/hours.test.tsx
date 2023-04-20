/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { Hours } from ".";
import { HOURS, HOURS_WITH_REOPEN_DATE } from "./sampleData.js";

describe("Hours", () => {
  beforeAll(() => {
    jest
      .spyOn(global.Date.prototype, "toISOString")
      .mockReturnValue("6-11-2022 00:00:00");
  });

  it("properly renders a full week", () => {
    render(<Hours hours={HOURS} />);

    expect(screen.queryByText("sunday")).toBeTruthy();
    expect(screen.queryByText("monday")).toBeTruthy();
    expect(screen.queryByText("tuesday")).toBeTruthy();
    expect(screen.queryByText("wednesday")).toBeTruthy();
    expect(screen.queryByText("thursday")).toBeTruthy();
    expect(screen.queryByText("friday")).toBeTruthy();
    expect(screen.queryByText("saturday")).toBeTruthy();
  });

  it("properly renders with a custom day label", () => {
    const label = "ice cream sundae";
    render(<Hours hours={HOURS} dayOfWeekNames={{ sunday: label }} />);

    expect(screen.queryByText(label)).toBeTruthy();
    expect(screen.queryByText("sunday")).toBeFalsy();
  });

  it("properly renders with a custom day label", () => {
    render(<Hours hours={HOURS_WITH_REOPEN_DATE} collapseDays={true} />);

    expect(screen.queryByText("sunday - saturday")).toBeTruthy();
  });
});
