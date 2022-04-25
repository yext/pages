type ServerSideArgs = Record<string, any>;

/**
 * TODO (SUMO-4392) - document.
 *
 * @public
 */
export type GetServerSideProps = (data: ServerSideArgs) => any;

/**
 * TODO (SUMO-4392) - document.
 *
 * @public
 */
export type Page = {
  path: string;
  props: any;
  component: any;
};
