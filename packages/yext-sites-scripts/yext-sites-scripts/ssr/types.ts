type ServerSideArgs = Record<string, any>;

export type GetServerSideProps = (data: ServerSideArgs) => any;

export type Page = {
  path: string;
  props: any;
  component: any;
};
