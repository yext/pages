import getPort, { portNumbers } from "get-port";

// Will use any available port from 5173 to 6000, otherwise fall back to a random port
export const devServerPort = await getPort({
  port: portNumbers(5173, 6000),
});

export const dynamicModeInfoText = `URLs displayed here are generated 
from the contents of the <span class="code">localData</span> folder. This folder is auto-generated 
every time you re-run the dev server.  By default, you will receive real-time data updates from the 
Yext Platform into your local environment.`;

export const localDevUrlInfoText = `To ensure local URLs match URLs 
in the deployed environment, use the slug field on every entity to specify the URL path. 
Local development URLs will only match deployed URLs if the slug field is returned from 
the <span class="code">getPath</span> function in entity-powered templates. 
To learn more or disable, check out this 
<a href="https://hitchhikers.yext.com/docs/pages/paths-and-slugs/" target="_blank">
ref doc.</a>`;

export const localDevUrlHelpText = `Learn more with our 
<a href="https://hitchhikers.yext.com/docs/pages/templates/" target="_blank">complete ref docs</a>.`;

export const localModeInfoText = `Local mode enabled. Below are the URLs that are available based on 
the contents of the <span class="code">localData</span> folder. Entity Data will only be refreshed upon regenerating the test data, so updates 
to entities will not be reflected in real time. To regenerate test data, enter the command <span class="code">yext pages 
generate-test-data</span>. Also, entities other than the ones listed below will not be available unless run in dynamic mode.`;

export const generateTestDataWarningText = `On server start-up, the call to regenerate test data failed. 
Check your network connection and that the CLI is authorized to the correct account. Functionality may be limited.`;

export const noLocalDataErrorText = `No localData directory present, cannot generate example URLs. Run <span class="code">yext pages
generate-test-data</span> to generate the localData directory.`;

export const yextLogoWhiteSvg = `
  <svg class="yext-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width="64">
    <path fill="#FFFFFF" d="M360 0C161.18 0 0 161.18 0 360s161.18 360 360 360 360-161.18 360-360S558.82 0 360 0zm0 691.2C177.08 691.2 28.8 542.92 28.8 360S177.08 28.8 360 28.8 691.2 177.08 691.2 360 542.92 691.2 360 691.2z"></path>
    <path fill="#FFFFFF" d="M370.8 399.6h64.8v129.6h28.8V399.6h64.8v-28.8H370.8zM332.43 367.2L270 429.64l-62.43-62.44-20.37 20.37L249.64 450l-62.44 62.43 20.37 20.37L270 470.36l62.43 62.44 20.37-20.37L290.36 450l62.44-62.43zM448.2 349.2c44.73 0 81-36.27 81-81h-28.8c0 28.83-23.37 52.2-52.2 52.2-8.23 0-16.01-1.91-22.93-5.3l69.83-69.83 21.08-21.08c-14.44-22.25-39.48-36.98-67.98-36.98-44.74 0-81 36.27-81 81s36.26 80.99 81 80.99zm0-133.2c10.12 0 19.56 2.89 27.56 7.88l-71.88 71.88c-4.99-8-7.87-17.44-7.87-27.56-.01-28.83 23.36-52.2 52.19-52.2zM270 259.58l-60.74-72.38-22.06 18.51 68.4 81.52v61.97h28.8v-61.97l68.4-81.52-22.06-18.51z"></path>
  </svg>
`;

export const laptopIconBlackSvg = `
  <svg width="72" height="53" viewBox="0 0 72 53" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.772949 52.0092H71.2269V32.5736V0.990799H0.772949V52.0092ZM68.7975 49.5798H3.2024V13.138H68.7975V32.5736V49.5798ZM68.7975 3.42025V10.7086H3.2024V3.42025H68.7975Z" fill="#374151"/>
    <path d="M66.3679 5.8497H63.9385V8.27915H66.3679V5.8497Z" fill="#374151"/>
    <path d="M61.5091 5.8497H20.2085V8.27915H61.5091V5.8497Z" fill="#374151"/>
    <path d="M17.7791 5.8497H15.3496V8.27915H17.7791V5.8497Z" fill="#374151"/>
    <path d="M12.9202 5.8497H10.4907V8.27915H12.9202V5.8497Z" fill="#374151"/>
    <path d="M8.06129 5.8497H5.63184V8.27915H8.06129V5.8497Z" fill="#374151"/>
    <path d="M44.6853 24.7386L49.119 31.3589L44.6853 37.9791L46.7503 39.3153L52.0344 31.3589L46.7503 23.4025L44.6853 24.7386Z" fill="#374151"/>
    <path d="M37.8833 21.8746L31.8108 40.0807L34.1154 40.8494L40.1879 22.6433L37.8833 21.8746Z" fill="#374151"/>
    <path d="M25.2496 23.4025L19.9656 31.3589L25.2496 39.3153L27.3147 37.9791L22.8809 31.3589L27.3147 24.7386L25.2496 23.4025Z" fill="#374151"/>
  </svg>
`;
