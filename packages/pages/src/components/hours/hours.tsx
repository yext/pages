import React, { useEffect, useState } from "react";
import c from "classnames";
import {
  HoursManipulator,
  arrayShift,
  intervalsListsAreEqual,
} from "./hoursManipulator.js";
import { HoursTableProps, HoursTableDayData, DayOfWeekNames } from "./types.js";
import "./hours.css";

// Order of these arrays corresponds to js Date.getDay() function output.
// Display name for each day of week.
const defaultDayOfWeekNames = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
// Order to display days of week.
const defaultDayOfWeekSortIdx = [0, 1, 2, 3, 4, 5, 6];

/**
 * @param {HoursTableProps} props
 * @param {Date} todayDate Date object for today
 * @returns {number[]} the SortIdx array for days of week
 */
function getSortIdx(props: HoursTableProps, todayDate: Date): number[] {
  let startIdx = 0;
  // 1. Start the table on today's day of week.
  if (props.startOfWeek === "today") {
    startIdx = todayDate.getDay();
    return arrayShift(defaultDayOfWeekSortIdx, startIdx);

    // 2. Start the table on a specific day of week.
  } else if (props.startOfWeek) {
    startIdx = defaultDayOfWeekNames.indexOf(props.startOfWeek);
    return arrayShift(defaultDayOfWeekSortIdx, startIdx);

    // 3. Fall back to the default sort order (starts on Sunday).
  } else {
    return defaultDayOfWeekSortIdx;
  }
}

/**
 *
 * @param {HoursTableDayData[]} hoursDays
 * @returns {HoursTableDayData[]} where adjacent days with the same intervals are combined.
 */
function collapseDays(hoursDays: HoursTableDayData[]): HoursTableDayData[] {
  const collapsedDays: HoursTableDayData[] = [];
  hoursDays.forEach((hoursDay) => {
    const latestGroup = collapsedDays[collapsedDays.length - 1];

    // latestGroup = undefined indicates that this is the first group of days
    // add a new 'collapsedDay'.
    if (!latestGroup) {
      collapsedDays.push({
        startDay: hoursDay.dayOfWeek,
        endDay: hoursDay.dayOfWeek,
        ...hoursDay,
      });
    } else {
      // Check if this `hoursDay`s intervals matches latestGroup's intervals.
      if (intervalsListsAreEqual(latestGroup.intervals, hoursDay.intervals)) {
        // If it is a match, update the latestGroup to include this 'hoursDay'.
        latestGroup.endDay = hoursDay.dayOfWeek;
        latestGroup.isToday = latestGroup.isToday || hoursDay.isToday;
      } else {
        // Otherwise, add a new 'collapsedDay'.
        collapsedDays.push({
          startDay: hoursDay.dayOfWeek,
          endDay: hoursDay.dayOfWeek,
          ...hoursDay,
        });
      }
    }
  });

  return collapsedDays.map((day) => ({
    ...day,
    dayOfWeek:
      day.startDay === day.endDay
        ? `${day.startDay}`
        : `${day.startDay} - ${day.endDay}`,
  }));
}

function defaultIntervalStringsBuilder(
  dayData: HoursTableDayData,
  timeOptions?: Intl.DateTimeFormatOptions
): string[] {
  const intervalStrings: string[] = [];
  if (dayData.intervals.length === 0) {
    intervalStrings.push("Closed");
  } else {
    dayData.intervals.forEach((interval) => {
      const startTime = interval.getStartTime("en-US", timeOptions);
      const endTime = interval.getEndTime("en-US", timeOptions);
      intervalStrings.push(`${startTime} - ${endTime}`);
    });
  }
  return intervalStrings;
}

/**
 * @param {DayOfWeekNames} nameMap
 * @returns correctly ordered list of day of week names, using param values and
 * falling back to default values if empty.
 */
function dayOfWeekNamesToArray(nameMap: DayOfWeekNames): string[] {
  return [
    nameMap.sunday || defaultDayOfWeekNames[0],
    nameMap.monday || defaultDayOfWeekNames[1],
    nameMap.tuesday || defaultDayOfWeekNames[2],
    nameMap.wednesday || defaultDayOfWeekNames[3],
    nameMap.thursday || defaultDayOfWeekNames[4],
    nameMap.friday || defaultDayOfWeekNames[5],
    nameMap.saturday || defaultDayOfWeekNames[6],
  ];
}

/*
 * The HoursTable component uses HoursManipulator data to generate a table
 * listing the business hours of the entity.
 *
 * @param {HoursType} hours data from Yext Streams
 * @param {Intl.DateTimeFormatOptions} timeOptions
 * @param {String[]} dayOfWeekNames label for each day of week, ordered starting from Sunday
 * @param {String} startOfWeek set the day of the first row of the table
 * @param {Boolean} collapseDays combine adjacent rows (days) with the same intervals
 * @param {Function} intervalStringsBuilderFn override rendering for the interval on each table row
 */
const Hours: React.FC<HoursTableProps> = (props) => {
  // Use two rendering passes to avoid SSR issues where server & client rendered content is different.
  // On the first pass, don't render any content in this component, only set `state.isClient`.
  // On the second pass (after the page has been loaded), render the content.
  // https://reactjs.org/docs/react-dom.html#hydrate
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const h = new HoursManipulator(props.hours);
  const now = new Date();

  const dayOfWeekNames = props.dayOfWeekNames
    ? dayOfWeekNamesToArray(props.dayOfWeekNames)
    : defaultDayOfWeekNames;
  const dayOfWeekSortIdx = getSortIdx(props, new Date());

  // Fetch intervals for the next 7 days.
  const allIntervals = h.getIntervalsForNDays(7, now);

  // Split intervals into buckets by day of week.
  let hoursDays: HoursTableDayData[] = [];
  for (let i = 0; i < 7; i++) {
    hoursDays.push({
      dayOfWeek: dayOfWeekNames[i],
      sortIdx: dayOfWeekSortIdx[i],
      intervals: allIntervals.filter(
        (interval) => interval.start.getDay() === i
      ),
      isToday: now.getDay() === i,
    });
  }

  // Sort the days
  const sortFn = (day1: HoursTableDayData, day2: HoursTableDayData) => {
    if (day1.sortIdx === day2.sortIdx) {
      return 0;
    }
    return day1.sortIdx > day2.sortIdx ? 1 : -1;
  };
  hoursDays.sort(sortFn);

  // Collapse the days
  if (props.collapseDays) {
    hoursDays = collapseDays(hoursDays);
  }

  return (
    <>
      {isClient && (
        <div className={c("HoursTable", props.className)}>
          {hoursDays.map((dayData) => {
            const intervalStringsBuilderFn =
              props.intervalStringsBuilderFn || defaultIntervalStringsBuilder;
            const intervalStrings = intervalStringsBuilderFn(
              dayData,
              props.timeOptions
            );

            return (
              <div
                className={c("HoursTable-row", { "is-today": dayData.isToday })}
                key={dayData.sortIdx}
              >
                <span className="HoursTable-day">{dayData.dayOfWeek}</span>
                <span className="HoursTable-intervals">
                  {intervalStrings.map((intervalString, idx) => (
                    <span className="HoursTable-interval" key={idx}>
                      {intervalString}
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export { Hours };
