#!/bin/bash
set -e

git pull
pnpm build
cp -R dist/* /www/wwwroot/chatvrm.lijie.space
