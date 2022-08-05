/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplateProps } from "../../common/src/template/types";
import { AnalyticsProvider } from "./provider";
import { useAnalytics, useTrack } from "./hooks";
import { AnalyticsScopeProvider } from "./scope";

global.fetch = jest.fn().mockImplementation(
  jest.fn(() => {
    return Promise.resolve({ status: 200 });
  }) as jest.Mock
);

jest.spyOn(global, "fetch");

const baseProps: TemplateProps = {
  document: {
    __: {
      entityPageSet: {},
      name: "foo",
    },
    uid: 0,
    businessId: 0,
    siteId: 0,
  },
  __meta: { mode: "development" },
};

const currentProcess = global.process;

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.process = undefined;
});

afterEach(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.fetch.mockClear();
});

afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete global.fetch;
  global.process = currentProcess;
});

describe("Analytics", () => {
  it("should fire a page view once", () => {
    const App = () => {
      return (
        <AnalyticsProvider templateData={baseProps} requireOptIn={false} />
      );
    };
    const { rerender } = render(<App />);
    rerender(<App />);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should not fire a page view when opt in is required", () => {
    render(<AnalyticsProvider templateData={baseProps} requireOptIn={true} />);
    expect(global.fetch).toHaveBeenCalledTimes(0);
  });

  it("should track a click", () => {
    const MyButton = () => {
      const track = useTrack();
      return <button onClick={async () => await track("foo click")} />;
    };

    render(
      <AnalyticsProvider templateData={baseProps} requireOptIn={false}>
        <MyButton />
      </AnalyticsProvider>
    );

    fireEvent.click(screen.getByRole("button"));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const generatedUrlStr = global.fetch.mock.calls[1][0];
    const generatedUrl = new URL(generatedUrlStr);
    expect(generatedUrl.searchParams.get("eventType")).toBe("fooclick");
  });

  it("should track a click with scoping", async () => {
    const MyButton: React.FC<{ id?: string }> = (props) => {
      const track = useTrack();
      return (
        <button onClick={async () => await track("foo click")}>
          {props.children}
        </button>
      );
    };

    const App = () => {
      return (
        <AnalyticsProvider templateData={baseProps} requireOptIn={false}>
          <AnalyticsScopeProvider name={"header"}>
            <AnalyticsScopeProvider name={"menu"}>
              <MyButton>one</MyButton>
            </AnalyticsScopeProvider>
            <AnalyticsScopeProvider name={"drop down"}>
              <MyButton>two</MyButton>
            </AnalyticsScopeProvider>
          </AnalyticsScopeProvider>
          <MyButton>three</MyButton>
        </AnalyticsProvider>
      );
    };

    const { rerender } = render(<App />);
    rerender(<App />);

    const testClicks: {
      expectedTag: string;
      matcher: RegExp;
    }[] = [
      {
        expectedTag: "header_menu_fooclick",
        matcher: /one/,
      },
      {
        expectedTag: "header_dropdown_fooclick",
        matcher: /two/,
      },
      {
        expectedTag: "fooclick",
        matcher: /three/,
      },
    ];

    expect.assertions(testClicks.length);

    const user = userEvent.setup();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const callstack = global.fetch.mock.calls;

    for (const { matcher, expectedTag } of testClicks) {
      await user.click(screen.getByText(matcher));
      const generatedUrlStr = callstack[callstack.length - 1][0];
      const generatedUrl = new URL(generatedUrlStr);
      const eventName = generatedUrl.searchParams.get("eventType");
      expect(eventName).toBe(expectedTag);
    }
  });

  it("should track a click with a conversion", async () => {
    const expectedConversionData = { cid: "123456", cv: "10" };

    const MyButton = () => {
      const { track, enableTrackingCookie } = useAnalytics();
      enableTrackingCookie();
      return (
        <button
          onClick={async () => await track("foo click", expectedConversionData)}
        />
      );
    };

    render(
      <AnalyticsProvider
        templateData={baseProps}
        requireOptIn={false}
        enableTrackingCookie={true}
      >
        <MyButton />
      </AnalyticsProvider>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const mockCalls = global.fetch.mock.calls;

      const generatedClickUrlStr = mockCalls[1][0];
      const generatedClickUrl = new URL(generatedClickUrlStr);
      expect(generatedClickUrl.searchParams.get("_yfpc")).toBeTruthy();

      const generatedConversionUrlStr = mockCalls[2][0];
      const generatedConversionUrl = new URL(generatedConversionUrlStr);
      expect(generatedConversionUrl.searchParams.get("_yfpc")).toBeTruthy();
      expect(generatedConversionUrl.searchParams.get("cid")).toBe(
        expectedConversionData.cid
      );
      expect(generatedConversionUrl.searchParams.get("cv")).toBe(
        expectedConversionData.cv
      );
    });
  });
  // TODO: figure out the right way to test window.location logic to credit listings with y_source param
});
