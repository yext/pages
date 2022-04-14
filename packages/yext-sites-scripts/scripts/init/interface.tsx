import { render, Text } from "ink";
import React, { FC, useEffect, useState, Fragment } from "react";
import { spawn } from "child_process";
import { generate } from './generate.js';
import Spinner from "./spinner.js";

export async function runGenerate() {
  return new Promise<void>(() => {
    render(<Generator />);
  });
}

const Generator: FC = () => {
  interface Step {
    title: string;
    output: {
      type: "out" | "err";
      content: string;
    }[];
  }

  const [steps, setSteps] = useState<Step[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    generate({
      startStep(step) {
        setSteps((old) => [...old, { title: step, output: [] }]);
      },

      runCommand(command) {
        return new Promise<number>((resolve, reject) => {
          const spawned = spawn(command, {
            stdio: ["inherit", "pipe", "pipe"],
            shell: true,
          });

          spawned.on("error", reject);

          spawned.on("exit", (exitCode) => resolve(exitCode || 0));

          spawned.stdout.setEncoding("utf-8");
          spawned.stdout.on("data", (chunk) => {
            setSteps((old) => {
              const prev = old.slice(0, -1);
              let last = old[old.length - 1];
              const lastOutput = last.output[last.output.length - 1];

              if (lastOutput && lastOutput.type === "out") {
                last = {
                  ...last,
                  output: [
                    ...last.output.slice(0, -1),
                    {
                      type: "out",
                      content: lastOutput.content + chunk,
                    },
                  ],
                };
              } else {
                last = {
                  ...last,
                  output: [
                    ...last.output,
                    {
                      type: "out",
                      content: chunk,
                    },
                  ],
                };
              }

              return [...prev, last];
            });
          });

          spawned.stderr.setEncoding("utf-8");
          spawned.stderr.on("data", (chunk) => {
            setSteps((old) => {
              const prev = old.slice(0, -1);
              let last = old[old.length - 1];
              const lastOutput = last.output[last.output.length - 1];

              if (lastOutput && lastOutput.type === "err") {
                last = {
                  ...last,
                  output: [
                    ...last.output.slice(0, -1),
                    {
                      type: "err",
                      content: lastOutput.content + chunk,
                    },
                  ],
                };
              } else {
                last = {
                  ...last,
                  output: [
                    ...last.output,
                    {
                      type: "err",
                      content: chunk,
                    },
                  ],
                };
              }

              return [...prev, last];
            });
          });
        });
      },
    })
      .then(() => setDone(true))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      });
  }, []);

  return (
    <>
      {steps.map((step, i) => {
        const isLastStep = i === steps.length - 1;

        return (
          <Fragment key={i}>
            <Text bold={isLastStep && !done}>
              {isLastStep && !done && !error ? (
                <Text color="yellow">
                  <Spinner />
                </Text>
              ) : isLastStep && error ? (
                <Text color="redBright">✗</Text>
              ) : (
                <Text color="green">✓</Text>
              )}{" "}
              {step.title}
            </Text>

            {error &&
              step.output.map(
                (output) =>
                  output.content && (
                    <Text
                      key={i}
                      color={output.type === "err" ? "redBright" : "white"}
                    >
                      {output.content}
                    </Text>
                  ),
              )}
          </Fragment>
        );
      })}

      {error && (
        <Text color="redBright">Project generation failed: {error}</Text>
      )}

      {done && (
        <Text color="white">
          {"\n"}
          <Text color="greenBright">Done!</Text> Try following commands to
          start:{"\n"}
          <Text bold>npm run dev</Text>
          {"   "}
          <Text color="white"># Start a development server</Text>
          {"\n"}
        </Text>
      )}
    </>
  );
};
