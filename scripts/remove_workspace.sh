#!/bin/bash

# This sed command will remove everything between the "workspaces"
# key and the next ']' encountered. It will only work with the
# GNU version of sed.
sed -i '/\"workspaces\"/,/]/ d; /^$/d' package.json

echo "$(<package.json )"