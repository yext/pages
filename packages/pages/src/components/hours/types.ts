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
  isClosed: boolean
  openIntervals: IntervalType[]
}

export interface HolidayType {
  date: string
  isClosed?: boolean
  openIntervals: IntervalType[]
}

export interface IntervalType {
  start: string
  end: string
};

export interface HoursType extends WeekType {
  holidayHours?: HolidayType[];
  reopenDate?: string;
}
