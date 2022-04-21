// Builds a featureConfig suitable for use with generate-test-data.
export const buildFeatureConfig = (templateConfig: any): any => {
  return {
    locales: ['en'],
    features: [
      {
        name: templateConfig.name,
        ...(templateConfig.streamId ? { streamId: templateConfig.streamId } : ''),
        templateType: 'JS',
        // Assume this is a static page if there is no stream defined
        ...(templateConfig.stream ? { entityPageSet: {} } : { staticPage: {} }),
      },
    ],
    ...(templateConfig.stream ? { streams: [templateConfig.stream] } : ''),
  };
};
