import { HoursIntervalManipulator } from "./hoursManipulator.js";

export interface WeekType {
  monday?: DayType;
  tuesday?: DayType;
  wednesday?: DayType;
  thursday?: DayType;
  friday?: DayType;
  saturday?: DayType;
  sunday?: DayType;
}

export interface DayType {
  isClosed: boolean;
  openIntervals: IntervalType[];
}

export interface HolidayType {
  date: string;
  isClosed?: boolean;
  openIntervals: IntervalType[];
}

export interface IntervalType {
  start: string;
  end: string;
}

export interface HoursType extends WeekType {
  holidayHours?: HolidayType[];
  reopenDate?: string;
}

// HoursTable

export type DayOfWeekNames = {
  [Property in keyof WeekType]?: string;
};

export interface HoursTableProps {
  hours: HoursType;
  dayOfWeekNames?: DayOfWeekNames;
  startOfWeek?: keyof DayOfWeekNames | "today";
  timeOptions?: Intl.DateTimeFormatOptions;
  collapseDays?: boolean; // Combine adjacent day rows with the same intervals.
  intervalStringsBuilderFn?: (
    h: HoursTableDayData,
    t?: Intl.DateTimeFormatOptions
  ) => string[];
  className?: string;
}

export interface HoursTableDayData {
  dayOfWeek: string;
  intervals: HoursIntervalManipulator[];
  sortIdx: number;
  isToday: boolean;
  startDay?: string; // used for 'collapseDays' logic
  endDay?: string; // used for 'collapseDays' logic
}
