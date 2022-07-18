import prettyMilliseconds from "pretty-ms";

/**
 * @returns a Timer which tracks the time since it was created.
 */
export const startTimer = (): Timer => {
  const startTime = new Date().getTime();

  return {
    stop: () => {
      const endTime = new Date().getTime();
      return prettyMilliseconds(endTime.valueOf() - startTime.valueOf());
    },
  };
};

type Timer = {
  // Returns a human-readable time of the difference in time from when startTimer was called and
  // timer was stopped.
  stop: () => string;
};
