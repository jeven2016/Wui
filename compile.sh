#!/bin/sh
sass --style expanded wui-mini.scss dist/wui-mini.css --trace
sass --style compressed wui-mini.scss dist/wui-mini-min.css

sass --style expanded wui-bundle.scss dist/wui-bundle.css --trace
sass --style compressed wui-bundle.scss dist/wui-bundle-min.css

rm -f dist/*.map