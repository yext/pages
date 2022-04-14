/**
 * @fileoverview exports a logger to assist in standardizing logs across the CLI.
 */
import { startTimer } from "./timing.js";
import ora from "ora";
import chalk from "chalk";

type ILogger = {
  timedLog: (opts: TimedLogOpts) => TimedLogFinisher;
};

const logger = {} as ILogger;

type TimedLogOpts = {
  // The text to show at the start of the async log
  startLog: string;
};

// The returned object of logger.timedLog
type TimedLogFinisher = {
  // Call when the timeed process failed
  fail: (text: string) => void;
  // Call when the timeed process succeeded
  succeed: (text: string) => void;
};

/**
 * Starts logging a timed process. It returns an object with success and fail functions which should
 * be called depending on the result of the process to finish the timed log.
 */
logger.timedLog = (opts: TimedLogOpts) => {
  const { startLog } = opts;
  const timer = startTimer();
  const spinner = ora(startLog).start();

  return {
    fail: (text) => spinner.fail(addTimingToLog(timer.stop(), text)),
    succeed: (text) => spinner.succeed(addTimingToLog(timer.stop(), text)),
  };
};

const addTimingToLog = (prettyPrintedTime: string, text: string): string => {
  return `${chalk.grey(`[${prettyPrintedTime}]`)} ${text}`;
};

export default logger;
