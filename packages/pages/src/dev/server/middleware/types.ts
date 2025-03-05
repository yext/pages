/**
 * The body of the Visual Editor preview POST request.
 */
export type VisualEditorPreviewOverrides = {
  /** The site id. */
  siteId: number;
  /** The in-platform page set. */
  pageSet: PageSet;
  /** The dev mode Puck layout data. */
  layout: Record<string, any>;
  /** The dev mode theme data. */
  theme: Record<string, any>;
  /** The slug of the page that is being previewed. */
  slug: string;
  /** The external entityId of the page that is being previewed. */
  entityId: string;
  /** The locale of the page that is being previewed. */
  locale: string;
};

/**
 * The in-platform page set resource.
 * Adapted from com/yext/publish/pagesets/resource.proto.
 */
export type PageSet = {
  /** The AIP resource identifier. */
  id: string;
  /** The name of the code template the page set should use. */
  codeTemplate: string;
  /**
   * Assignments define when to use this page set in new deployments for the site. They support the following:
   * - GLOBAL to use this page set in all new deployments
   * - PRODUCTION to use this page set in all new deployments for the production branch of the site
   * - STAGING to use this page set in all new deployments for staging branches of the site
   * - <branch name> to use this page set in all new deployments for the specified branch
   * - <branch id> to use this page set in all new deployments for the specified branch
   */
  assignments: string[];
  /** The page set's entity scope. */
  scope: Scope;
  /** A display name to use for this page set. */
  displayName: string;
  /** The type of the page set. */
  type: "ENTITY" | "DIRECTORY";
  /** Whether the page set is linked to directory page sets. */
  hasDirectoryPageSets: boolean;
};

/**
 * Scope defines which entity profiles to use when generating pages for this page set.
 * At least one locale must be provided, along with either at least one saved filter or at least one entity type.
 */
type Scope = {
  /** The list of entity locales to include profiles for. Required to have at least one element. */
  locales: string[];
  /** The list of saved filters ("saved searches") to include entities for. */
  savedFilters: ScopeItem[];
  /** The list of entity types to include entities for. */
  entityTypes: ScopeItem[];
};

/**
 * ScopeItem describes an entity type or saved filter to be
 * included in a PageSet's scope.
 */
type ScopeItem = {
  /** The display name of the scope item. */
  name: string;
  /** A link to the scope item in Knowledge Graph. */
  link: string;
  /** The internal id of the scope item. */
  internalId: number;
  /** The external id of the scope item. */
  externalId: string;
};
