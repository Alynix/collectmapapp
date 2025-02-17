#!/bin/bash

npm i && npm run build
aws s3 cp dist/ s3://clusters.decker-fp.com/ --recursive --acl=public-read
