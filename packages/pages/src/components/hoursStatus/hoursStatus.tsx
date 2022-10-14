import React, { useEffect, useState } from "react";
import c from "classnames";
import { HoursType } from "../hours/types.js";
import {
  HoursIntervalManipulator,
  HoursManipulator,
} from "../hours/hoursManipulator.js";

export interface StatusParams {
  isOpen: boolean;
  currentInterval: HoursIntervalManipulator | null;
  futureInterval: HoursIntervalManipulator | null;
  timeOptions?: Intl.DateTimeFormatOptions;
  dayOptions?: Intl.DateTimeFormatOptions;
}

export interface TemplateParams {
  currentTemplate?: (s: StatusParams) => React.ReactNode;
  separatorTemplate?: (s: StatusParams) => React.ReactNode;
  futureTemplate?: (s: StatusParams) => React.ReactNode;
  timeTemplate?: (s: StatusParams) => React.ReactNode;
  dayOfWeekTemplate?: (s: StatusParams) => React.ReactNode;
}

export interface StatusTemplateParams extends StatusParams, TemplateParams {}

export interface HoursStatusProps extends TemplateParams {
  hours: HoursType;
  timeOptions?: Intl.DateTimeFormatOptions;
  dayOptions?: Intl.DateTimeFormatOptions;
  statusTemplate?: (s: StatusParams) => React.ReactNode;
  className?: string;
}

function defaultCurrentTemplate(params: StatusParams): React.ReactNode {
  return (
    <span className="HoursStatus-current">
      {params.isOpen ? "Open Now" : "Closed"}
    </span>
  );
}

function defaultSeparatorTemplate(params: StatusParams): React.ReactNode {
  return <span className="HoursStatus-separator"> - </span>;
}

function defaultFutureTemplate(params: StatusParams): React.ReactNode {
  return (
    <span className="HoursStatus-future">
      {params.isOpen ? "Closes at" : "Opens at"}
    </span>
  );
}

function defaultTimeTemplate(params: StatusParams): React.ReactNode {
  let time = "";
  if (params.isOpen) {
    const interval = params.currentInterval;
    time += interval ? interval.getEndTime("en-US", params.timeOptions) : "";
  } else {
    const interval = params.futureInterval;
    time += interval ? interval.getStartTime("en-US", params.timeOptions) : "";
  }
  return <span className="HoursStatus-time"> {time}</span>;
}

function defaultDayOfWeekTemplate(params: StatusParams): React.ReactNode {
  const dayOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    ...(params.dayOptions ?? {}),
  };

  let dayOfWeek = "";
  if (params.isOpen) {
    const interval = params.currentInterval;
    dayOfWeek += interval?.end?.toLocaleString("en-US", dayOptions) || "";
  } else {
    const interval = params.futureInterval;
    dayOfWeek += interval?.start?.toLocaleString("en-US", dayOptions) || "";
  }
  return <span className="HoursStatus-dayOfWeek"> {dayOfWeek}</span>;
}

function defaultStatusTemplate(
  params: StatusTemplateParams,
  props?: HoursStatusProps
): React.ReactNode {
  const currentTemplate = params.currentTemplate || defaultCurrentTemplate;
  const separatorTemplate =
    params.separatorTemplate || defaultSeparatorTemplate;
  const futureTemplate = params.futureTemplate || defaultFutureTemplate;
  const timeTemplate = params.timeTemplate || defaultTimeTemplate;
  const dayOfWeekTemplate =
    params.dayOfWeekTemplate || defaultDayOfWeekTemplate;

  return (
    <div className={c("HoursStatus", props?.className || "")}>
      {currentTemplate(params)}
      {separatorTemplate(params)}
      {futureTemplate(params)}
      {timeTemplate(params)}
      {dayOfWeekTemplate(params)}
    </div>
  );
}

/*
 * The HoursStatus component uses Hours data to generate a status message
 *  describing the current Open/Closed status of the entity
 *
 * @param {HoursType} hours data from Yext Streams
 * @param {Intl.DateTimeFormatOptions} timeOptions
 * @param {Intl.DateTimeFormatOptions} dayOptions
 * @param {Function} statusTemplate completely override rendering for this component
 * @param {Function} currentTemplate override rendering for the "current" part of this component "[[Open Now]] - closes at 5:00PM Monday"
 * @param {Function} separatorTemplate override rendering for the "separator" part of this component "Open Now [[-]] closes at 5:00PM Monday"
 * @param {Function} futureTemplate override rendering for the "future" part of this component "Open Now - [[closes at]] 5:00PM Monday"
 * @param {Function} timeTemplate override rendering for the "time" part of this component "Open Now - closes at [[5:00PM]] Monday"
 * @param {Function} dayOfWeekTemplate override rendering for the "dayOfWeek" part of this component "Open Now - closes at 5:00PM [[Monday]]"
 */
const HoursStatus: React.FC<HoursStatusProps> = (props) => {
  const [hasStatusTimeout, setHasStatusTimeout] = useState(false);

  // Use two rendering passes to avoid SSR issues where server & client rendered content are different
  // https://reactjs.org/docs/react-dom.html#hydrate
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const statusTemplateFn = props.statusTemplate || defaultStatusTemplate;
  const h = new HoursManipulator(props.hours);
  const isOpen = h.isOpenNow();
  const currentInterval = h.getCurrentInterval();
  const futureInterval = h.getNextInterval();

  // When the current interval ends, or the next interval starts, trigger component rerender
  const isOpenChangeTime = currentInterval?.end || futureInterval?.start;
  if (isOpenChangeTime && !hasStatusTimeout) {
    setHasStatusTimeout(true);
    const delayMS = isOpenChangeTime.getTime() - new Date().getTime();
    setTimeout(() => setHasStatusTimeout(false), delayMS);
  }

  const statusParams: StatusParams = {
    isOpen,
    currentInterval,
    futureInterval,
    ...props,
  };

  return <>{isClient && statusTemplateFn(statusParams, props)}</>;
};

export { defaultStatusTemplate, HoursStatus };
