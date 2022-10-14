/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { HoursStatus } from ".";
import { HoursData, HoursWithMultipleIntervalsData } from "./sampleData.js";
import { HoursManipulator } from "../hours/hoursManipulator.js";

describe("HoursStatus", () => {
  const isOpenNow = new HoursManipulator(HoursData).isOpenNow();
  it("properly renders a status message for default component call", () => {
    render(<HoursStatus hours={HoursData} />);
    if (isOpenNow) {
      expect(screen.findByText("open now - closes at")).toBeTruthy();
    } else {
      expect(screen.findByText("closed - opens at")).toBeTruthy();
    }
    expect(screen.findByText("am") || screen.findByText("pm")).toBeTruthy();
  });

  it("properly renders a status message for 24 hour component call", () => {
    render(<HoursStatus hours={HoursData} timeOptions={{ hour12: false }} />);

    expect(screen.queryByText("am")).toBeFalsy();
    expect(screen.queryByText("pm")).toBeFalsy();
  });

  it("properly takes on custom parameters for component call", () => {
    const currentTemplateString = "Open Currently";
    const separatorTemplateString = " • ";
    const futureTemplateOpenNowString = "Will be closing at";
    const futureTemplateClosedNowString = "Will be opening at";
    const timeTemplateString = " HH:MM ";
    const dayOfWeekTemplateString = "Gameday";
    render(
      <HoursStatus
        hours={HoursData}
        currentTemplate={() => currentTemplateString}
        separatorTemplate={() => separatorTemplateString}
        futureTemplate={() => {
          return (
            <span className="HoursStatus-future">
              {isOpenNow
                ? futureTemplateOpenNowString
                : futureTemplateClosedNowString}
            </span>
          );
        }}
        timeTemplate={() => timeTemplateString}
        dayOfWeekTemplate={() => dayOfWeekTemplateString}
      />
    );

    expect(screen.findByText(currentTemplateString)).toBeTruthy();
    expect(screen.findByText(separatorTemplateString)).toBeTruthy();
    expect(screen.findByText(timeTemplateString)).toBeTruthy();
    expect(screen.findByText(dayOfWeekTemplateString)).toBeTruthy();
    if (isOpenNow) {
      expect(screen.findByText(futureTemplateOpenNowString)).toBeTruthy();
    } else {
      expect(screen.findByText(futureTemplateClosedNowString)).toBeTruthy();
    }
  });
});
