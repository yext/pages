import * as React from "react";
import Cta from "../components/cta";
import { Address } from "@yext/pages/components";

const Contact = (props: any) => {
  const { address, phone } = props;

  return (
    <>
      <div className="grid gap-y-5">
        <div className="text-xl font-semibold">Contact</div>
        <div className="grid gap-y-3">
          <Address address={address} />
          <div>
            <a href="#">{phone}</a>
          </div>
        </div>
        <div className="w-30">
          <Cta buttonText="Order Online" url="#" style="primary-cta"></Cta>
        </div>
      </div>
    </>
  );
};

export default Contact;
