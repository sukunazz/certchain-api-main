#!/bin/bash

git add .
git commit -m "update"

git pull origin main

yarn
yarn build
yarn prisma migrate deploy

pm2 restart cc-api
