#!/usr/bin/env bash
cd api/
[[ $TRAVIS_BRANCH = "master" ]] && DEPLOY_ENV="production" || DEPLOY_ENV="staging"
echo "Deploy Starting: $DEPLOY_ENV"
export SSH_KEY="/home/travis/.ssh/id_rsa"
git checkout -- yarn.lock
export CMD="pm2 deploy ecosystem.config.js $DEPLOY_ENV --force"
$CMD
