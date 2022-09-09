import { getHref, isEmail, reverse } from "./methods.js";
import { LinkType } from "./types.js";

// getHref
test("getHref: Url type", () => {
  expect(
    getHref({
      label: "",
      link: "https://yext.com",
      linkType: LinkType.URL,
    })
  ).toEqual("https://yext.com");
});

test("getHref: Email type", () => {
  expect(
    getHref({
      label: "",
      link: "email@test.com",
      linkType: LinkType.Email,
    })
  ).toEqual("mailto:email@test.com");
});

test("getHref: Telephone type", () => {
  expect(
    getHref({
      label: "",
      link: "+11234567890",
      linkType: LinkType.Phone,
    })
  ).toEqual("tel:+11234567890");
});

// isEmail

// Source test cases from chromium
// https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/web_tests/fast/forms/resources/ValidityState-typeMismatch-email.js?q=ValidityState-typeMismatch-email.js&ss=chromium

const expectValid = true;
const expectInvalid = false;

test.each<[string, boolean]>([
  ["something@something.com", expectValid],
  ["someone@localhost.localdomain", expectValid],
  ["someone@127.0.0.1", expectValid],
  ["a@b.b", expectValid],
  ["a/b@domain.com", expectValid],
  ["{}@domain.com", expectValid],
  ["m*'!%@something.sa", expectValid],
  ["tu!!7n7.ad##0!!!@company.ca", expectValid],
  ["%@com.com", expectValid],
  ["!#$%&'*+/=?^_`{|}~.-@com.com", expectValid],
  [".wooly@example.com", expectValid],
  ["wo..oly@example.com", expectValid],
  ["someone@do-ma-in.com", expectValid],
  ["somebody@example", expectValid],
  ["invalid:email@example.com", expectInvalid],
  ["@somewhere.com", expectInvalid],
  ["example.com", expectInvalid],
  ["@@example.com", expectInvalid],
  ["a space@example.com", expectInvalid],
  ["something@ex..ample.com", expectInvalid],
  ["a\b@c", expectInvalid],
  ["someone@somewhere.com.", expectInvalid],
  ['""test\blah""@example.com', expectInvalid],
  ['"testblah"@example.com', expectInvalid],
  ["someone@somewhere.com@", expectInvalid],
  ["someone@somewhere_com", expectInvalid],
  ["someone@some:where.com", expectInvalid],
  [".", expectInvalid],
  ["F/s/f/a@feo+re.com", expectInvalid],
  [
    'some+long+email+address@some+host-weird-/looking.com", "some+long+email+address@some+host-weird-/looking.com',
    expectInvalid,
  ],
  ["a @p.com", expectInvalid],
  ["ddjk-s-jk@asl-.com", expectInvalid],
])(`isEmail: %s`, (emailAddress, validity) => {
  expect(isEmail(emailAddress)).toEqual(validity);
});

// reverse

test.each<[string, string]>([
  ["https://yext.com", "moc.txey//:sptth"],
  ["0123456789", "9876543210"],
  ["the quick fox", "xof kciuq eht"],
])(`reverse: %s`, (forwards, backwards) => {
  expect(reverse(forwards)).toEqual(backwards);
});
