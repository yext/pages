import * as React from "react";

export type Address = {
  line1: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
};

type Banner = {
  name?: string;
  address?: Address;
  openTime?: string;
  children?: React.ReactNode;
};

const renderPrettyAddress = (address?: Address) => {
  return (
    <>
      {address && (
        <span>
          {address.line1} in {address.city}, {address.region}
        </span>
      )}
    </>
  );
};

const Banner = (props: Banner) => {
  const { name, address, children } = props;

  return (
    <>
      <div className="bg-red-900 text-5xl font-bold text-white p-10 flex items-center justify-center flex-row space-x-20 w-full">
        <div className="flex-col space-y-10 text-center">
          <div>{name}</div>
          <div>{renderPrettyAddress(address)}</div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Banner;
