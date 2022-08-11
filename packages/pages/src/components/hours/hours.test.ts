import { Hours, HoursInterval } from './hours';
import { HoursType } from './types';

const HOURS_DATA: HoursType = {
  monday: {
    isClosed: false,
    openIntervals: [
      { start: '9:01', end: '18:01' }
    ],
  },
  tuesday: {
    isClosed: false,
    openIntervals: [
      { start: '9:02', end: '18:02' }
    ],
  },
  wednesday: {
    isClosed: false,
    openIntervals: [
      { start: '9:03', end: '18:03' }
    ],
  },
  thursday: {
    isClosed: false,
    openIntervals: [
      { start: '9:04', end: '18:04' }
    ],
  },
  friday: {
    isClosed: false,
    openIntervals: [
      { start: '9:05', end: '18:05' }
    ],
  },
  saturday: {
    isClosed: false,
    openIntervals: [
      { start: '9:06', end: '18:06' }
    ],
  },
  sunday: {
    isClosed: false,
    openIntervals: [
      { start: '9:07', end: '18:07' }
    ],
  },
  holidayHours: [
    {
      date: '2022-08-11',
      openIntervals: [
        { start: '9:00', end: '18:00' }
      ]
    }
  ]
};

describe("Hours", () => {
  const hours = new Hours(HOURS_DATA);
  const dateOpen = new Date(2022, 6, 11, 13, 14);
  const dateClosed = new Date(2022, 6, 11, 22, 10);
  const dateEndOfWeek = new Date(2022, 6, 17, 13, 14);

  it("return the interval containing a given Date", () => {
    const date = dateOpen;
    expect(hours.getInterval(date)).toEqual({
      start: new Date(2022, 6, 11, 9, 1),
      end: new Date(2022, 6, 11, 18, 1),
    });
  });

  it("return null if Date is not within an interval", () => {
    const date = dateClosed;
    expect(hours.getInterval(date)).toBeNull();
  });

  it("return the next occuring interval for a given Date", () => {
    const date = dateOpen;
    expect(hours.getIntervalAfter(date)).toEqual({
      start: new Date(2022, 6, 12, 9, 2),
      end: new Date(2022, 6, 12, 18, 2),
    });
  });

  it("return all intervals for several days", () => {
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

  it("return all intervals for several days across weeks", () => {
    const date = dateEndOfWeek;
    expect(hours.getIntervalsForNDays(3, date)).toEqual([
      {
        start: new Date(2022, 6, 17, 9, 7),
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

  it("return day data", () => {
    const date = new Date(2022, 6, 17, 13, 14);
    expect(hours.getHours(date)).toEqual({
      isClosed: false,
      openIntervals: [
        {
          start: "9:07",
          end: "18:07",
        },
      ]
    });
  });

  it("return day data for a holiday", () => {
    const date = new Date(2022, 8, 11, 13, 14);
    expect(hours.getHours(date)).toEqual({
      date: '2022-08-11',
      openIntervals: [
        {
          start: "9:00",
          end: "18:00",
        },
      ]
    });
  });

  it("return if temporarily closed", () => {
    const tempClosedHours = new Hours({
      ...HOURS_DATA,
      reopenDate: '2022-08-11',
    });

    const date = new Date(2022, 6, 11, 13, 14);

    expect(tempClosedHours.isTemporarilyClosedAt(date)).toBeTruthy();
  });
});
