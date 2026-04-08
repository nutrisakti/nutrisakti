#!/bin/bash

PROJECT=${PWD##*/}

MESSAGE=${1:-"Default Commit"}
MESSAGE="$(date +%Y-%m-%d.%H%M%S) : $MESSAGE"

git add .
git commit -m "$MESSAGE"

git config pull.rebase true
git pull

echo -e "\033[33m** PUSH : $PROJECT **\033[0m"
echo "$MESSAGE" >>push.log

git add .
git commit -m "$MESSAGE"
git push
