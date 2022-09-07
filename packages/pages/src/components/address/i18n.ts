import { AddressLine } from "./types.js";

export function localeAddressFormat(locale: string): AddressLine[] {
  switch (locale) {
    case "AD":
    case "AM":
    case "AT":
    case "AX":
    case "AZ":
    case "BA":
    case "BY":
    case "CY":
    case "CZ":
    case "DK":
    case "DZ":
    case "EC":
    case "EH":
    case "ET":
    case "FI":
    case "FR":
    case "GE":
    case "GF":
    case "GI":
    case "GP":
    case "GW":
    case "HT":
    case "KE":
    case "KV":
    case "KW":
    case "LA":
    case "LU":
    case "MC":
    case "MD":
    case "ME":
    case "MG":
    case "MK":
    case "MQ":
    case "MZ":
    case "NC":
    case "NL":
    case "NO":
    case "PL":
    case "PT":
    case "PY":
    case "RE":
    case "RS":
    case "SA":
    case "SE":
    case "SJ":
    case "SM":
    case "SN":
    case "TC":
    case "TJ":
    case "TM":
    case "TN":
    case "TZ":
    case "UY":
    case "VG":
    case "ZM":
      return [["line1"], ["line2"], ["postalCode", "city"], ["countryCode"]];
    case "AF":
    case "IR":
      return [
        ["line1"],
        ["line2"],
        ["city"],
        ["region"],
        ["postalCode"],
        ["countryCode"],
      ];
    case "AG":
    case "AO":
    case "AW":
    case "BJ":
    case "BO":
    case "BS":
    case "BZ":
    case "CI":
    case "CW":
    case "DJ":
    case "FJ":
    case "GA":
    case "GH":
    case "GM":
    case "GY":
    case "JM":
    case "KI":
    case "LY":
    case "MW":
    case "NA":
    case "NR":
    case "PS":
    case "QA":
    case "RW":
    case "SC":
    case "SR":
    case "SX":
    case "TG":
    case "TT":
    case "UG":
    case "VU":
      return [["line1"], ["line2"], ["city"], ["countryCode"]];
    case "AL":
    case "EE":
    case "IS":
      return [["line1"], ["line2"], ["postalCode", "city"]];
    case "AR":
      return [
        ["line1"],
        ["line2"],
        ["postalCode", "city", ",", "region"],
        ["countryCode"],
      ];
    case "AS":
    case "BB":
    case "BD":
    case "BM":
    case "BN":
    case "BT":
    case "CR":
    case "DO":
    case "FK":
    case "FM":
    case "GR":
    case "GU":
    case "JO":
    case "KZ":
    case "LB":
    case "LK":
    case "LS":
    case "MA":
    case "MH":
    case "MM":
    case "MR":
    case "MT":
    case "MV":
    case "NG":
    case "PG":
    case "PK":
    case "PR":
    case "RO":
    case "SG":
    case "VC":
    case "WS":
      return [["line1"], ["line2"], ["city", "postalCode"], ["countryCode"]];
    case "AU":
    case "CA":
    case "SZ":
    case "US":
    case "VI":
      return [
        ["line1"],
        ["line2"],
        ["city", ",", "region", "postalCode"],
        ["countryCode"],
      ];
    case "BE":
    case "PE":
      return [
        ["line1"],
        ["line2"],
        ["postalCode", "sublocality", "city"],
        ["countryCode"],
      ];
    case "BF":
    case "BI":
    case "BQ":
    case "BW":
    case "CF":
    case "CG":
    case "CM":
    case "DM":
    case "ER":
    case "GQ":
    case "KM":
    case "ML":
    case "SY":
    case "TD":
    case "ZW":
      return [["line1"], ["line2"], ["city"], ["region"], ["countryCode"]];
    case "BG":
      return [["line1"], ["postalCode", "region"], ["countryCode"]];
    case "BH":
      return [["line1"], ["line2"], ["sublocality", "city"], ["countryCode"]];
    case "BR":
      return [
        ["line1"],
        ["line2"],
        ["sublocality"],
        ["city", "region"],
        ["postalCode"],
        ["countryCode"],
      ];
    case "CH":
    case "DE":
    case "GT":
    case "IT":
    case "LI":
    case "MY":
    case "NI":
    case "OM":
    case "SK":
    case "VA":
      return [
        ["line1"],
        ["line2"],
        ["postalCode", "city", "region"],
        ["countryCode"],
      ];
    case "CL":
    case "PF":
      return [
        ["line1"],
        ["line2"],
        ["city", "postalCode", "region"],
        ["countryCode"],
      ];
    case "CN":
      return [
        ["region", "city", "sublocality"],
        ["line1"],
        ["line2"],
        ["countryCode"],
      ];
    case "CO":
    case "ID":
    case "IQ":
    case "KH":
    case "MP":
    case "NP":
    case "PW":
    case "UA":
      return [
        ["line1"],
        ["line2"],
        ["city", "region", "postalCode"],
        ["countryCode"],
      ];
    case "EG":
      return [
        ["line1"],
        ["line2"],
        ["sublocality", "city", "region", "postalCode"],
        ["countryCode"],
      ];
    case "ES":
    case "IL":
      return [
        ["line1"],
        ["line2"],
        ["city", "postalCode"],
        ["region"],
        ["countryCode"],
      ];
    case "GB":
    case "MN":
    case "ZA":
      return [
        ["line1"],
        ["line2"],
        ["sublocality", "city", "postalCode"],
        ["countryCode"],
      ];
    case "GG":
    case "IM":
    case "JE":
      return [
        ["line1"],
        ["line2"],
        ["sublocality"],
        ["city"],
        ["postalCode"],
        ["countryCode"],
      ];
    case "GN":
      return [["line1", "line2", "city"], ["countryCode"]];
    case "HK":
      return [
        ["line1"],
        ["line2"],
        ["sublocality"],
        ["city"],
        ["region"],
        ["countryCode"],
      ];
    case "HR":
      return [["line1"], ["postalCode", "city", "region"], ["countryCode"]];
    case "HU":
    case "SI":
      return [["postalCode", "city"], ["line1"], ["line2"], ["countryCode"]];
    case "IE":
      return [
        ["line1"],
        ["line2"],
        ["sublocality"],
        ["city", "region", "postalCode"],
        ["countryCode"],
      ];
    case "IN":
    case "VE":
      return [
        ["line1"],
        ["line2"],
        ["city", "postalCode"],
        ["region"],
        ["countryCode"],
      ];
    case "JP":
      return [
        ["line2"],
        ["line1", "sublocality"],
        ["city", "region"],
        ["postalCode"],
        ["countryCode"],
      ];
    case "KR":
      return [
        ["countryCode"],
        ["region", "city", "sublocality", "line1"],
        ["line2"],
        ["postalCode"],
      ];
    case "KY":
      return [["line1"], ["line2"], ["postalCode"], ["countryCode"]];
    case "LT":
      return [
        ["line1"],
        ["postalCode", "city", "sublocality", "region"],
        ["countryCode"],
      ];
    case "LV":
      return [["line1"], ["city", ",", "postalCode"], ["countryCode"]];
    case "MO":
      return [["line1"], ["line2"], ["sublocality"], ["city"], ["countryCode"]];
    case "MU":
      return [
        ["line1"],
        ["line2"],
        ["city"],
        ["region", "postalCode"],
        ["countryCode"],
      ];
    case "MX":
      return [
        ["line1"],
        ["line2"],
        ["sublocality"],
        ["postalCode", "city", ",", "region"],
        ["countryCode"],
      ];
    case "NE":
    case "SD":
      return [
        ["line1"],
        ["line2"],
        ["postalCode"],
        ["city"],
        ["region"],
        ["countryCode"],
      ];
    case "NZ":
      return [
        ["line1"],
        ["line2"],
        ["sublocality"],
        ["city"],
        ["postalCode"],
        ["countryCode"],
      ];
    case "PH":
    case "TW":
    case "VN":
      return [
        ["line1"],
        ["line2"],
        ["sublocality", "city"],
        ["region", "postalCode"],
        ["countryCode"],
      ];
    case "RU":
      return [["line1"], ["line2"], ["city"], ["postalCode"], ["countryCode"]];
    case "SB":
    case "SL":
    case "ST":
    case "TL":
    case "TO":
    case "TV":
      return [["line1"], ["line2"], ["city", ",", "region"], ["countryCode"]];
    case "TH":
    case "TR":
      return [
        ["line1"],
        ["line2"],
        ["sublocality"],
        ["postalCode", "city"],
        ["countryCode"],
      ];
    case "UZ":
      return [["line1"], ["line2"], ["region", "postalCode"], ["countryCode"]];
  }

  return [
    ["line1", "line2"],
    ["city", "region", "postalCode"],
    ["countryCode"],
  ];
}
