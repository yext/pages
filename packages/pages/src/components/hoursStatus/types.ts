import { HoursType } from "../hours/types.js";
import { HoursIntervalManipulator } from "../hours/hoursManipulator.js";

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
