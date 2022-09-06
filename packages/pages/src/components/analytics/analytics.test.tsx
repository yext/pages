/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplateProps } from "../../common/src/template/types.js";
import { Link } from "../link/index.js";
import { AnalyticsProvider } from "./provider.js";
import { useAnalytics } from "./hooks.js";
import { AnalyticsScopeProvider } from "./scope.js";

// The following section of mocks just exists to supress an error that occurs
// because jest does not implement a window.location.navigate.  See:
// https://www.benmvp.com/blog/mocking-window-location-methods-jest-jsdom/
// for details.
const oldWindowLocation = global.location;

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete global.location;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.location = Object.defineProperties(
    {},
    {
      ...Object.getOwnPropertyDescriptors(oldWindowLocation),
      assign: {
        configurable: true,
        value: jest.fn(),
      },
    }
  );

  // this mock allows us to inspect the fetch requests sent by the analytics
  // package and ensure they are generated correctly.
  global.fetch = jest.fn().mockImplementation(
    jest.fn(() => {
      return Promise.resolve({ status: 200 });
    }) as jest.Mock
  );

  jest.spyOn(global, "fetch");
});

afterAll(() => {
  // restore window location so we don't side effect other tests.
  window.location = oldWindowLocation;
});

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
    render(
      <AnalyticsProvider templateData={baseProps} requireOptIn={false}>
        <Link href="https://yext.com" onClick={(e) => e.preventDefault()}>
          Click Me
        </Link>
      </AnalyticsProvider>
    );

    fireEvent.click(screen.getByRole("link"));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const callstack = global.fetch.mock.calls;
    const generatedUrlStr = callstack[callstack.length - 1][0];
    const generatedUrl = new URL(generatedUrlStr);
    expect(generatedUrl.searchParams.get("eventType")).toBe("link");
  });

  it("should track a click with scoping", async () => {
    const App = () => {
      return (
        <AnalyticsProvider templateData={baseProps} requireOptIn={false}>
          <AnalyticsScopeProvider name={"header"}>
            <AnalyticsScopeProvider name={"menu"}>
              <Link href="https://yext.com">one</Link>
            </AnalyticsScopeProvider>
            <AnalyticsScopeProvider name={"drop down"}>
              <Link cta={{ link: "https://yext.com" }}>two</Link>
            </AnalyticsScopeProvider>
          </AnalyticsScopeProvider>
          <Link href="https://yext.com" eventName={"fooclick"}>
            three
          </Link>
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
        expectedTag: "header_menu_link",
        matcher: /one/,
      },
      {
        expectedTag: "header_dropdown_cta",
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
      const analytics = useAnalytics();
      analytics?.enableTrackingCookie();
      return (
        <button
          onClick={async () =>
            await analytics?.track("foo click", expectedConversionData)
          }
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
