#!/usr/bin/env bash
echo hi noob
/usr/bin/env node --experimental-specifier-resolution=node --experimental-vm-modules node_modules/@yext/pages/dist/bin/pages.js "$@"