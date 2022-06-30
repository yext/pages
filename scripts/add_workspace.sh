#!/bin/bash

# This sed command will re-add the workspaces field to the
# package.json ahead of where the repository key is. It will 
# only work with the GNU version of sed.
sed -i '/\"repository\": {/i\  \"workspaces\": [\n    \"./packages/*\"\n  ],' package.json

echo "$(<package.json )"