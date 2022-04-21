import { spawn } from 'child_process';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const generateTestData = async (featureConfig: any, entityId: string): Promise<any> => {
  return new Promise((resolve) => {
    const generateTestDataExec = spawn(
      'yext',
      [
        'sites',
        'generate-test-data',
        '--featureName',
        `'${featureConfig?.features[0]?.name}'`,
        '--entityId',
        entityId,
        '--featuresConfig',
        `'${JSON.stringify(featureConfig)}'`,
        '--locale',
        'en',
        '--printDocuments',
      ],
      {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      },
    );

    let testData = '';

    generateTestDataExec.stdout.setEncoding('utf8');
    generateTestDataExec.stdout.on('data', (chunk) => {
      if (chunk.startsWith('{')) {
        testData += chunk;
      } else if (chunk.includes('This is a beta version of the Yext Command Line Interface')) {
        return;
      } else {
        process.stdout.write(chunk);
      }
    });

    generateTestDataExec.stderr.setEncoding('utf8');
    generateTestDataExec.stderr.on('data', (chunk) => {
      process.stderr.write(chunk);
    });

    generateTestDataExec.on('close', () => {
      if (testData) {
        testData = JSON.parse(testData.trim());
      }

      resolve(testData);
    });

    process.stdin.pipe(generateTestDataExec.stdin);
  });
};
