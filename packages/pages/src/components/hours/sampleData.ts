import { HoursType } from "./index.js";

export const HOURS: HoursType = {
  monday: {
    isClosed: false,
    openIntervals: [{ start: "9:01", end: "18:01" }],
  },
  tuesday: {
    isClosed: false,
    openIntervals: [{ start: "9:02", end: "18:02" }],
  },
  wednesday: {
    isClosed: false,
    openIntervals: [{ start: "9:03", end: "18:03" }],
  },
  thursday: {
    isClosed: false,
    openIntervals: [{ start: "9:04", end: "18:04" }],
  },
  friday: {
    isClosed: false,
    openIntervals: [{ start: "9:05", end: "18:05" }],
  },
  saturday: {
    isClosed: false,
    openIntervals: [{ start: "9:06", end: "18:06" }],
  },
  sunday: {
    isClosed: false,
    openIntervals: [{ start: "9:07", end: "18:07" }],
  },
};

export const HOURS_WITH_HOLIDAY: HoursType = {
  monday: {
    isClosed: false,
    openIntervals: [{ start: "9:01", end: "18:01" }],
  },
  tuesday: {
    isClosed: false,
    openIntervals: [{ start: "9:02", end: "18:02" }],
  },
  wednesday: {
    isClosed: false,
    openIntervals: [{ start: "9:03", end: "18:03" }],
  },
  thursday: {
    isClosed: false,
    openIntervals: [{ start: "9:04", end: "18:04" }],
  },
  friday: {
    isClosed: false,
    openIntervals: [{ start: "9:05", end: "18:05" }],
  },
  saturday: {
    isClosed: false,
    openIntervals: [{ start: "9:06", end: "18:06" }],
  },
  sunday: {
    isClosed: false,
    openIntervals: [
      { start: "9:07", end: "11:07" },
      { start: "12:07", end: "18:07" },
    ],
  },
  holidayHours: [
    {
      date: "2022-08-11",
      openIntervals: [{ start: "9:00", end: "12:00" }],
    },
  ],
};

export const HOURS_WITH_REOPEN_DATE = {
  monday: {
    isClosed: false,
    openIntervals: [{ start: "9:01", end: "18:01" }],
  },
  tuesday: {
    isClosed: false,
    openIntervals: [{ start: "9:02", end: "18:02" }],
  },
  wednesday: {
    isClosed: false,
    openIntervals: [{ start: "9:03", end: "18:03" }],
  },
  thursday: {
    isClosed: false,
    openIntervals: [{ start: "9:04", end: "18:04" }],
  },
  friday: {
    isClosed: false,
    openIntervals: [{ start: "9:05", end: "18:05" }],
  },
  saturday: {
    isClosed: false,
    openIntervals: [{ start: "9:06", end: "18:06" }],
  },
  sunday: {
    isClosed: false,
    openIntervals: [{ start: "9:07", end: "18:07" }],
  },
  reopenDate: "6-14-2022",
};

export function offsetDate(daysForward: number) {
  const d = new Date();

  d.setDate(d.getDate() + daysForward);

  const yyyy = "" + d.getFullYear();
  let mm = "" + (d.getMonth() + 1);
  let dd = "" + d.getDate();

  if (mm.length < 2) {
    mm = "0" + mm;
  }
  if (dd.length < 2) {
    dd = "0" + dd;
  }

  return [yyyy, mm, dd].join("-");
}
