import { createLogger, Logger } from "vite";

const ignoredMessages: string[] = [
  // Suppress this warning b/c nested @tailwind rules are the best option for handling @tailwind base.
  "Nested @tailwind rules were detected, but are not supported.",
  // Sometimes the MIT license gets logged for React modules
  "/*! tailwindcss v3.1.8 | MIT License",
];

/**
 * Returns a custom vite logger with nested tailwind warnings hidden.
 * @return Logger
 */
export const createModuleLogger = (): Logger => {
  const logger = createLogger();
  const loggerWarning = logger.warn;
  logger.warn = (msg, options) => {
    if (msg.includes("vite:css")) {
      for (const ignoredMessage of ignoredMessages) {
        if (msg.includes(ignoredMessage)) {
          return;
        }
      }
    }
    loggerWarning(msg, options);
  };
  return logger;
};
