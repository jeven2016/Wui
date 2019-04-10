#!/bin/sh
node_modules/node-sass/bin/node-sass --style expanded wui-mini.scss dist/wui-mini.css --trace
node_modules/node-sass/bin/node-sass --style compressed wui-mini.scss dist/wui-mini-min.css

node_modules/node-sass/bin/node-sass --style expanded wui-bundle.scss dist/wui-bundle.css --trace
node_modules/node-sass/bin/node-sass --style compressed wui-bundle.scss dist/wui-bundle-min.css

rm -f dist/*.map