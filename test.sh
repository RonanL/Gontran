#!/bin/sh
npm run build &
wait %1 &&
./node_modules/babel-cli/bin/babel-node.js dist/index.js process-all -v;
mv archive/test*.md source/
