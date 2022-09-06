import { HoursManipulator } from "./hoursManipulator.js";
import { HOURS_WITH_HOLIDAY, HOURS_WITH_REOPEN_DATE } from "./sampleData.js";

describe("HoursManipulator", () => {
  const hours = new HoursManipulator(HOURS_WITH_HOLIDAY);
  const dateOpen = new Date(2022, 6, 11, 13, 14);
  const dateClosed = new Date(2022, 6, 11, 22, 10);
  const dateEndOfWeek = new Date(2022, 6, 17, 13, 14);

  it("returns the current interval for a moment in time", () => {
    const date = dateOpen;
    expect(hours.getInterval(date)).toEqual({
      start: new Date(2022, 6, 11, 9, 1),
      end: new Date(2022, 6, 11, 18, 1),
    });
  });

  it("returns null if there isn't a current interval for a moment in time", () => {
    const date = dateClosed;
    expect(hours.getInterval(date)).toBeNull();
  });

  it("returns the next occuring interval for a moment in time", () => {
    const date = dateOpen;
    expect(hours.getIntervalAfter(date)).toEqual({
      start: new Date(2022, 6, 12, 9, 2),
      end: new Date(2022, 6, 12, 18, 2),
    });
  });

  it("returns all intervals for several days", () => {
    const date = dateOpen;
    expect(hours.getIntervalsForNDays(3, date)).toEqual([
      {
        start: new Date(2022, 6, 11, 9, 1),
        end: new Date(2022, 6, 11, 18, 1),
      },
      {
        start: new Date(2022, 6, 12, 9, 2),
        end: new Date(2022, 6, 12, 18, 2),
      },
      {
        start: new Date(2022, 6, 13, 9, 3),
        end: new Date(2022, 6, 13, 18, 3),
      },
    ]);
  });

  it("returns all intervals for several days across weeks", () => {
    const date = dateEndOfWeek; // during second interval of the first day
    expect(hours.getIntervalsForNDays(3, date)).toEqual([
      {
        start: new Date(2022, 6, 17, 9, 7),
        end: new Date(2022, 6, 17, 11, 7),
      },
      {
        start: new Date(2022, 6, 17, 12, 7),
        end: new Date(2022, 6, 17, 18, 7),
      },
      {
        start: new Date(2022, 6, 18, 9, 1),
        end: new Date(2022, 6, 18, 18, 1),
      },
      {
        start: new Date(2022, 6, 19, 9, 2),
        end: new Date(2022, 6, 19, 18, 2),
      },
    ]);
  });

  it("returns all hours data for a particular day", () => {
    const date = new Date(2022, 6, 17, 13, 14);
    expect(hours.getHours(date)).toEqual({
      isClosed: false,
      openIntervals: [
        {
          start: "9:07",
          end: "11:07",
        },
        {
          start: "12:07",
          end: "18:07",
        },
      ],
    });
  });

  it("returns all hours data for a holiday", () => {
    const date = new Date(2022, 8, 11, 13, 14);
    expect(hours.getHours(date)).toEqual({
      date: "2022-08-11",
      openIntervals: [
        {
          start: "9:00",
          end: "12:00",
        },
      ],
    });
  });

  it("returns boolean if temporarily closed", () => {
    const tempClosedHours = new HoursManipulator(HOURS_WITH_REOPEN_DATE);

    const date = new Date(2022, 6, 11, 13, 14);

    expect(tempClosedHours.isTemporarilyClosedAt(date)).toBeTruthy();
  });
});
