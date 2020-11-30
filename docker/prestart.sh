#!/bin/sh
dockerize -template /webappSettings.json.tmpl:/usr/share/nginx/html/webappSettings.json
