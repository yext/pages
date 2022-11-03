/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import Breadcrumbs from "./breadcrumbs.js";

const Breadcrumbs_data: { slug: string; name: string }[] = [
  { name: "VA", slug: "va.html" },
  { name: "Vienna", slug: "va/vienna.html" },
  { name: "123 Main St", slug: "va/vienna/123-Main-St.html" },
];

describe("Breadcrumbs", () => {
  it("Renders component", () => {
    render(<Breadcrumbs breadcrumbs={Breadcrumbs_data} />);
  });

  it("Renders component with a single crumb", () => {
    render(<Breadcrumbs breadcrumbs={[{ name: "VA", slug: "va.html" }]} />);
  });

  it("Renders single crumb with no url", () => {
    render(<Breadcrumbs breadcrumbs={[{ name: "VA", slug: "" }]} />);
  });

  it("Renders first crumb an anchor tag not a span", () => {
    render(<Breadcrumbs breadcrumbs={Breadcrumbs_data} />);
    const firstCrumb = screen.getByText("VA");
    const firstCrumbParent = firstCrumb.parentNode;
    expect(firstCrumbParent?.nodeName === "A").toBeTruthy();
  });

  it("Does not render last crumb as an anchor tag", () => {
    render(<Breadcrumbs breadcrumbs={Breadcrumbs_data} />);
    const lastCrumb = screen.getByText("123 Main St");
    const lastCrumbParent = lastCrumb.parentNode;
    expect(lastCrumbParent?.nodeName === "LI").toBeTruthy();
  });

  it("Renders component with custom separator", () => {
    render(<Breadcrumbs breadcrumbs={Breadcrumbs_data} separator=">" />);
    const separators = screen.getAllByText(">");
    for (const separator of separators) {
      expect(separator.className === "Breadcrumbs-separator").toBeTruthy();
    }
  });
});
