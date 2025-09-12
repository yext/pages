export interface ConfigYaml {
  /**
   * The folder path that assets will be served from. If you're using a reverse proxy at
   * a subpath, this should typically look like "mySubpath/assets".
   * */
  assetsDir?: string;

  /**
   * GlobalData is information that is pulled from the Yext Platform and available in all of
   * your templates under the _globalData variable.
   */
  globalData: {
    /** The identifier of the stream */
    $id: string;
    source: "knowledgeGraph";
    /** The fields to apply to the stream */
    fields: string[];
    /** The filter to apply to the stream */
    filter: {
      /** The entity IDs to apply to the stream */
      entityIds?: string[];
      /** The entity types to apply to the stream */
      entityTypes?: string[];
      /** The saved filters to apply to the stream */
      savedFilterIds?: string[];
    };
    /** The localization used by the filter. Either set primary: true or specify a locales array. */
    localization:
      | {
          /** The entity profiles languages to apply to the stream. */
          locales: string[];
          primary?: never;
        }
      | {
          /** Use the primary profile language. */
          primary: true;
          locales?: never;
        };
  };

  /**
   * Use Redirects to configure manual redirects from one page to another
   */
  redirects: { from: string; to: string }[];

  /**
   * Custom configuration for your sitemap.
   * By default a Sitemap will be generated at /sitemap.xml
   * You can override defaults here.
   */
  sitemap: {
    disableSitemapGeneration: boolean;
    filename: string;
    excludeList: string[];
  };

  /** Auth policy configuration */
  authentication: {
    policyName: string;
  };

  /** Reverse proxy configuration */
  reverseProxy: {
    displayUrlPrefix: string;
  };

  // TODO: unsure what this would be used for
  studio: {
    isStudioRepo: boolean;
  };
}
