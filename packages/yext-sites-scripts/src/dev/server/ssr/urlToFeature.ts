import chalk from 'chalk';

export const urlToFeature = (url: string): { feature: string; entityId: string } => {
  // URI decode and remove leading slash: /foo/123
  const uriSegments = decodeURI(url).substring(1).split('/');

  if (uriSegments.length !== 2) {
    process.stderr.write(`Url must be of the form ${chalk.bold('/{featureName}/{entityId}')}\n`);
  }

  // Remove all whitespaces and lowercase
  const feature = uriSegments[0].replace(/\s/g, '').toLowerCase();
  const entityId = uriSegments[1];

  return {
    feature,
    entityId,
  };
};
