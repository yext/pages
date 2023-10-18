#!/bin/bash
cd $1/jstest/sdks

for D in ./*; do
    if [ -d "$D" ]; then
        cd "$D"
        npm i && npx playwright install \
          && npm install @yext/pages $1/packages/pages/latest/* \
          && npm run test
        cd ..
    fi
done