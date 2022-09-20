import * as React from "react";

type Hours = {
  title?: string;
  hours: Week;
  children?: React.ReactNode;
};

interface Week extends Record<string, any> {
  monday?: Day;
  tuesday?: Day;
  wednesday?: Day;
  thursday?: Day;
  friday?: Day;
  saturday?: Day;
  sunday?: Day;
}

type Day = {
  isClosed: boolean;
  openIntervals: OpenIntervals[];
};

type OpenIntervals = {
  start: string;
  end: string;
};

// Default to a Monday for Playwright screenshots
const todayIndex = new Date("2022-09-19T03:24:00").getDay();

/**
 * Dynamically creates a sort order based on today's day.
 */
function getSorterForCurrentDay(): { [key: string]: number } {
  const dayIndexes = [0, 1, 2, 3, 4, 5, 6];

  const updatedDayIndexes = [];
  for (let i = 0; i < dayIndexes.length; i++) {
    let dayIndex = dayIndexes[i];
    if (dayIndex - todayIndex >= 0) {
      dayIndex = dayIndex - todayIndex;
    } else {
      dayIndex = dayIndex + 7 - todayIndex;
    }
    updatedDayIndexes[i] = dayIndex;
  }

  return {
    sunday: updatedDayIndexes[0],
    monday: updatedDayIndexes[1],
    tuesday: updatedDayIndexes[2],
    wednesday: updatedDayIndexes[3],
    thursday: updatedDayIndexes[4],
    friday: updatedDayIndexes[5],
    saturday: updatedDayIndexes[6],
  };
}

const defaultSorter: { [key: string]: number } = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function sortByDay(week: Week): Week {
  const tmp = [];
  for (const [k, v] of Object.entries(week)) {
    tmp[getSorterForCurrentDay()[k]] = { key: k, value: v };
  }

  const orderedWeek: Week = {};
  tmp.forEach((obj) => {
    orderedWeek[obj.key] = obj.value;
  });

  return orderedWeek;
}

const renderHours = (week: Week) => {
  const dayDom: JSX.Element[] = [];
  for (const [k, v] of Object.entries(sortByDay(week))) {
    dayDom.push(<DayRow key={k} dayName={k} day={v} isToday={isDayToday(k)} />);
  }

  return <tbody className="font-normal">{dayDom}</tbody>;
};

function isDayToday(dayName: string) {
  return defaultSorter[dayName] === todayIndex;
}

function convertTo12HourFormat(time: string, includeMeridiem: boolean): string {
  const timeParts = time.split(":");
  let hour = Number(timeParts[0]);
  const minutesString = timeParts[1];
  const meridiem = hour < 12 || hour === 24 ? "AM" : "PM"; // Set AM/PM
  hour = hour % 12 || 12; // Adjust hours

  return (
    hour.toString() + ":" + minutesString + (includeMeridiem ? meridiem : "")
  );
}

type DayRow = {
  dayName: string;
  day: Day;
  isToday?: boolean;
};

const DayRow = (props: DayRow) => {
  const { dayName, day, isToday } = props;

  return (
    <tr className={isToday ? "bg-gray-200 font-bold" : ""}>
      <td className="capitalize text-left pl-1 pr-4">
        <span>{dayName}</span>
      </td>
      {!day.isClosed && (
        <td className="pr-1">
          <span>
            {convertTo12HourFormat(day.openIntervals[0].start, true)} -{" "}
            {convertTo12HourFormat(day.openIntervals[0].end, true)}
          </span>
        </td>
      )}
      {day.isClosed && (
        <td className="pr-1">
          <span>Closed</span>
        </td>
      )}
    </tr>
  );
};

const Hours = (props: Hours) => {
  const { title, hours } = props;

  return (
    <>
      <div className="text-xl font-semibold mb-4">{title}</div>
      <table>
        <thead className="sr-only">
          <tr>
            <th>Day of the Week</th>
            <th>Hours</th>
          </tr>
        </thead>
        {renderHours(hours)}
      </table>
    </>
  );
};

export default Hours;
