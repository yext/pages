import { RedirectConfig, TemplateProps, GetDestination, GetSources } from "@yext/pages";

export const config: RedirectConfig = {
  stream: {
    $id: "closed-location-redirects",
    fields: ["slug"],
    filter: {
      entityTypes: ["location"],
    },
    localization: {
      locales: ["en"],
    },
  },
};

/**
 * Defines the URL to redirect the source paths to.
 */
export const getDestination: GetDestination<TemplateProps> = ({ document }) => {
  return document.c_feedbackUrl;
};

/**
 * Defines a list of redirect source objects, which will redirect to the URL created by getDestination.
 */

export const getSources: GetSources<TemplateProps> = ({ document }) => {
  return [
    {
      source: `${document.c_nmlsID}`,
      status: 301,
    },
    {
      source: `${document.c_temporary_alias}`,
      status: 302,
    },
  ];
};
