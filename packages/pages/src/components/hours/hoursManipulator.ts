import {
  WeekType,
  DayType,
  HolidayType,
  IntervalType,
  HoursType,
} from "./types.js";

const dayKeys: (keyof WeekType)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export class HoursIntervalManipulator {
  end: Date;
  start: Date;

  /**
   * @param {Date} date the Date for the day on which the interval starts
   * @param {interval} interval the Yext Streams interval data
   */
  constructor(date: Date, interval: IntervalType) {
    this.end = new Date(date);
    this.start = new Date(date);

    [interval.start, interval.end].forEach((time) => {
      if (time.split(":").length != 2) {
        throw new Error(
          `expected interval start and end data to be in the format "HH:MM"`
        );
      }
    });

    const [startHour, startMinute] = interval.start.split(":");
    const [endHour, endMinute] = interval.end.split(":");
    this.end.setHours(Number(endHour), Number(endMinute));
    this.start.setHours(Number(startHour), Number(startMinute));

    // If interval crosses midnight increment day
    if (this.end < this.start) {
      this.end.setDate(this.end.getDate() + 1);
    }

    if (this.end.getMinutes() === 59) {
      this.end.setMinutes(60);
    }
  }

  /**
   * @param {Date} date A moment in time
   * @returns {boolean} True if the given moment is within the interval
   */
  contains(date: Date): boolean {
    return this.start <= date && date < this.end;
  }

  /**
   * @param {Object} opts intl.DateTimeFormatOptions
   * @param {string} locale defaults to 'en-US'
   * @returns {string} representation of this interval's start time
   */
  getStartTime(locale?: string, opts?: Intl.DateTimeFormatOptions): string {
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      ...opts,
    };

    return this.start.toLocaleString(locale || "en-US", timeOptions);
  }

  /**
   * @param {Object} opts intl.DateTimeFormatOptions
   * @param {string} locale defaults to 'en-US'
   * @returns {string} representation of this interval's end time
   */
  getEndTime(locale?: string, opts?: Intl.DateTimeFormatOptions): string {
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      ...opts,
    };

    return this.end.toLocaleString(locale || "en-US", timeOptions);
  }

  /**
   * @param {HoursIntervalManipulator} other
   * @returns {boolean} if this interval and 'other' have the same start/end
   */
  timeIsEqualTo(other: HoursIntervalManipulator): boolean {
    const startEqual = this.getStartTime() === other.getStartTime();
    const endEqual = this.getEndTime() === other.getEndTime();
    return startEqual && endEqual;
  }
}

export class HoursManipulator {
  holidayHoursByDate: Record<string, HolidayType>;
  hours: HoursType;

  /**
   * @param {Object} hours Hours object in the format returned by Yext Streams
   */
  constructor(hours: HoursType) {
    this.holidayHoursByDate = Object.fromEntries(
      (hours.holidayHours || []).map((hours) => [hours.date, hours])
    );
    this.hours = hours;
  }

  /**
   * @param {Date} date A moment in time
   * @returns {HoursIntervalManipulator?} The first interval that contains the given moment, null if none
   */
  getInterval(date: Date): HoursIntervalManipulator | null {
    if (this.isTemporarilyClosedAt(date)) {
      return null;
    }

    // Also need to check yesterday in case the interval crosses dates
    // (Assumes intervals will be no longer than 24 hours)
    const priorDate = new Date(date);
    priorDate.setDate(priorDate.getDate() - 1);

    for (const hoursDate of [priorDate, date]) {
      const hours = this.getHours(hoursDate);

      if (hours && !hours.isClosed) {
        for (const interval of hours.openIntervals || []) {
          const hoursInterval = new HoursIntervalManipulator(
            hoursDate,
            interval
          );

          if (hoursInterval.contains(date)) {
            return hoursInterval;
          }
        }
      }
    }

    return null;
  }

  /**
   * @returns {HoursIntervalManipulator?} The first interval that contains the current time, null if none
   */
  getCurrentInterval(): HoursIntervalManipulator | null {
    return this.getInterval(new Date());
  }

  /**
   * @param {Date} date A moment in time
   * @returns {HoursIntervalManipulator?} The next interval that hasn't started as of the given moment
   */
  getIntervalAfter(date: Date): HoursIntervalManipulator | null {
    // Look ahead up to 7 days for the next interval
    const intervalsList = this.getIntervalsForNDays(7, date);

    // Ensure the intervals are sorted by start time
    const sortFn = (
      interval1: HoursIntervalManipulator,
      interval2: HoursIntervalManipulator
    ) => {
      if (interval1.start === interval2.start) return 0;
      return interval1.start > interval2.start ? 1 : -1;
    };
    const sortedIntervals = intervalsList.sort(sortFn);

    // If we find the current interval, return the next one
    for (const [idx, hoursInterval] of sortedIntervals.entries()) {
      if (hoursInterval.contains(date)) {
        // If this is the last interval, can't return the next one
        if (sortedIntervals.length > idx + 1) {
          return sortedIntervals[idx + 1];
        }
      }
    }

    // Otherwise, look for the first interval which starts after the current datetime
    for (const hoursInterval of sortedIntervals) {
      if (hoursInterval.start > date) {
        return hoursInterval;
      }
    }

    // Return null if no next interval found
    return null;
  }

  /**
   * @returns {HoursIntervalManipulator?} The next interval that hasn't started as of the current time
   */
  getNextInterval(): HoursIntervalManipulator | null {
    return this.getIntervalAfter(new Date());
  }

  /**
   * @param {number} n number of days to check
   * @param {Date} startDate first day to check
   * @returns {HoursIntervalManipulator[]} list of intervals in range [startDate, startDate+7]
   */
  getIntervalsForNDays(n: number, startDate: Date): HoursIntervalManipulator[] {
    const intervalsList: HoursIntervalManipulator[] = [];
    for (let i = 0; i < n; i++) {
      const theDate = new Date(startDate);
      theDate.setDate(theDate.getDate() + i);

      const hours = this.getHours(theDate);
      if (hours && !hours.isClosed) {
        intervalsList.push(
          ...hours.openIntervals.map(
            (interval) => new HoursIntervalManipulator(theDate, interval)
          )
        );
      }
    }

    return intervalsList;
  }

  /**
   * @param {Date} date The day to get the hours for
   * @returns {Object?} The daily holiday hours object from the original Streams response for the
   *   given date, null if none
   */
  getHolidayHours(date: Date): HolidayType | null {
    if (this.isTemporarilyClosedAt(date)) {
      return null;
    }

    return this.holidayHoursByDate[this.transformDateToYext(date)] || null;
  }

  /**
   * @param {Date} date The day to get the hours for
   * @returns {Object?} The daily normal hours object from the original Streams response for the
   *   given date, null if none
   */
  getNormalHours(date: Date): DayType | null {
    if (this.isTemporarilyClosedAt(date)) {
      return null;
    }

    return this.hours[dayKeys[date.getDay()]] as DayType;
  }

  /**
   * @param {Date} date The day to get the hours for
   * @returns {Object?} The daily hours object from the original Streams response for the given
   *   date, null if none
   */
  getHours(date: Date): DayType | HolidayType | null {
    return this.getHolidayHours(date) || this.getNormalHours(date);
  }

  /**
   * @param {Date} date A day
   * @returns {Boolean} True if the given day has holiday hours
   */
  isHoliday(date: Date): boolean {
    return !!this.getHolidayHours(date);
  }

  /**
   * Yext platform uses the field `hours.reopenDate` to indicate an entity is
   *  temporarily closed for more than one day.
   * @param {Date} date
   * @returns {Boolean} True if the given date is before 'reopenDate'
   */
  isTemporarilyClosedAt(targetDate: Date): boolean {
    if (!this.hours.reopenDate) {
      return false;
    }

    if (this.transformDateToYext(targetDate) < this.hours.reopenDate) {
      return true;
    }

    return false;
  }

  /**
   * @param {Date} date A moment in time
   * @returns {Boolean} True if the given moment falls within any interval
   */
  isOpenAt(date: Date): boolean {
    if (this.isTemporarilyClosedAt(date)) {
      return false;
    }

    // Otherwise, just look for an interval
    return !!this.getInterval(date);
  }

  /**
   * @returns {Boolean} True if the current time falls within any interval
   */
  isOpenNow(): boolean {
    return this.isOpenAt(new Date());
  }

  /**
   * Convert ISO Date which have 1-based months, to Yext date string which have 0-based months
   * @param date a moment in time
   * @returns a Yext date string
   */
  transformDateToYext(date: Date): string {
    const [year, month, day] = date.toISOString().split("T")[0].split("-");
    const zeroBasedMonth = Number(month) - 1;
    const monthZeroBased =
      zeroBasedMonth < 10 ? "0" + zeroBasedMonth : zeroBasedMonth.toString();

    return `${year}-${monthZeroBased}-${day}`;
  }
}

/**
 * @param {Array<any>} arr Any array
 * @param {number} n amount to shift
 * @returns {Array<any>} a new array shifted 'n' elements to the right, looping from the end back to the start
 */
export function arrayShift(arr: Array<any>, n: number): Array<any> {
  // Make a local copy of the array to mutate
  const myArr = [...arr];
  // Handle the (invalid) case where n > arr.length
  n = n % myArr.length;
  return myArr.concat(myArr.splice(0, myArr.length - n));
}

/**
 * @param {HoursIntervalManipulator[]} il1
 * @param {HoursIntervalManipulator[]} il2
 * @returns {boolean} whether the two intervals lists are equal
 */
export function intervalsListsAreEqual(
  il1: HoursIntervalManipulator[],
  il2: HoursIntervalManipulator[]
): boolean {
  if (il1.length != il2.length) {
    return false;
  }

  for (const [idx, interval] of il1.entries()) {
    if (!interval.timeIsEqualTo(il2[idx])) {
      return false;
    }
  }

  return true;
}
