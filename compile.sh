#!/bin/sh
#sass --style expanded wui-mini.scss dist/wui-mini.css
#sass --style compressed wui-mini.scss dist/wui-mini-min.css

#sass --style expanded add-on/wui-add-ons.scss dist/wui-add-ons.css
#sass --style compressed add-on/wui-add-ons.scss dist/wui-add-ons-min.css

sass --style expanded wui-bundle.scss dist/wui-bundle.css
sass --style compressed wui-bundle.scss dist/wui-bundle-min.css

rm -f dist/*.map