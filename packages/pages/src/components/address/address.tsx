import * as React from "react";
import { AddressProps, AddressLineProps } from "./types.js";
import { localeAddressFormat } from "./i18n.js";
import { getUnabbreviated } from "./methods.js";

/**
 * Renders an HTML address based from the Yext Knowledge Graph. Example of using the component to render
 * a location entity's address from Yext Knowledge Graph:
 * ```
 * import { Address } from "@yext/pages/components";
 *
 * const address = (<Address address={document.address} />);
 *   --> 1101 Wilson Blvd., Suite 2300,
 *       Arlington, VA, 22201,
 *       US
 * const customAddress = (<Address address={document.address} lines={[['line1', 'city', 'region']]} />);
 *   --> 1101 Wilson Blvd., Arlington, VA
 * ```
 *
 * @public
 */
export const Address = ({
  address,
  lines,
  separator,
  ...props
}: AddressProps) => {
  const renderedLines = (lines || localeAddressFormat(address.countryCode)).map(
    (line) => (
      <AddressLine
        address={address}
        line={line}
        separator={separator}
        key={line.toString()}
      />
    )
  );

  return <div {...props}>{renderedLines}</div>;
};

Address.defaultProps = {
  separator: ",",
};

const AddressLine = ({
  address,
  line,
  separator,
}: AddressLineProps): JSX.Element => {
  const addressDOM: JSX.Element[] = [];

  for (const field of line) {
    if (field === ",") {
      addressDOM.push(<span key={field}>{separator}</span>);
      continue;
    }

    const value = address[field];
    if (!value) {
      continue;
    }

    // Include unabbreviated tooltip if available
    const unabbreviated = getUnabbreviated(field, address);
    if (unabbreviated) {
      addressDOM.push(
        <abbr key={field} title={unabbreviated}>
          {" "}
          {value}
        </abbr>
      );
      continue;
    }

    addressDOM.push(<span key={field}> {value}</span>);
  }

  return <div>{addressDOM}</div>;
};
