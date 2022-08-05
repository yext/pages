import { finalSlashRedirect } from "./finalSlashRedirect";

describe("finalSlashRedirect", () => {
  it("redirects when request path ends in slash", async () => {
    const canonicalUrl = "test.com/foo";

    const req = {
      url: canonicalUrl + "/",
      path: canonicalUrl + "/",
    };
    const res = {
      redirect: jest.fn(),
    };
    const next = jest.fn();

    finalSlashRedirect(req, res, next);

    expect(res.redirect).toBeCalledWith(301, canonicalUrl);
    expect(next).not.toBeCalled();
  });

  it("redirects with query when request path ends in slash", async () => {
    const query = "?bar=baz";
    const canonicalUrl = "test.com/foo";

    const req = {
      url: canonicalUrl + "/" + query,
      path: canonicalUrl + "/",
    };
    const res = {
      redirect: jest.fn(),
    };
    const next = jest.fn();

    finalSlashRedirect(req, res, next);

    expect(res.redirect).toBeCalledWith(301, canonicalUrl + query);
    expect(next).not.toBeCalled();
  });

  it("does not redirect when request path does not end in slash", async () => {
    const canonicalUrl = "test.com/foo";

    const req = {
      url: canonicalUrl,
      path: canonicalUrl,
    };
    const res = {
      redirect: jest.fn(),
    };
    const next = jest.fn();

    finalSlashRedirect(req, res, next);

    expect(res.redirect).not.toBeCalled();
    expect(next).toBeCalled();
  });
});
