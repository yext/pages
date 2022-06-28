export const dynamicModeInfoText = `Dynamic mode enabled. Below are sample URLs generated based on the contents 
of the localData folder, but entity data will be re-fetched on each page load and reflect updates in real time. 
Also, all entites specified by your stream config will be available at a url of the form: 
localhost:3000/[templateName]/[entityId]`;

export const localModeInfoText = `Local mode enabled. Below are the URLs that are available based on 
the contents of the localData folder. Entity Data will only be refreshed upon regenerating the test data, 
so updates to entities will not be reflected in real time. Also, entities other than the ones listed below 
will not be available unless run in dynamic mode.`;

export const generateTestDataWarningText = `On server start-up, the call to regenerate test data failed. 
Check your network connection and that the CLI is authorized to the correct account. Functionality may be limited.`;

export const noLocalDataErrorText = `No localData directory present, cannot generate example URLs. Run yext sites
generate-test-data to generate the localData directory.`;
