/**
 * ESBuild is configured to load html files as text modules. We declare custom modules so that tsc
 * doesn't error when we import content from these modules.
 */

declare module '*public/500' {
  const value: string;
  export default value;
}

declare module '*public/404' {
  const value: string;
  export default value;
}
