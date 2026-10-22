#!/usr/bin/env bash
branch="$1"
target_branch="$2"

GROUP='^(feature|fix|hotfix|refactor|docs|test)/grupo-[0-9]+-[a-z0-9]+(-[a-z0-9]+)*$'
DEVOPS='^(chore|ci|feature|fix|hotfix|refactor|docs|test)/devops-[a-z0-9]+(-[a-z0-9]+)*$'
EPIC='^epic/.+$' 

if [[ "$branch" == "develop" || "$branch" == "main" \
   || "$branch" =~ $GROUP || "$branch" =~ $DEVOPS || "$branch" =~ $EPIC ]]; then
  
  if [[ "$target_branch" == "develop" ]]; then
    if [[ "$branch" =~ $GROUP ]]; then
      echo "ERROR: ACCESS DENIED (Architectural Standard)" >&2
      echo "Group development branches ($branch) cannot merge directly into 'develop'." >&2
      echo "You must point your PR to the corresponding Epic branch." >&2
      exit 1
    fi
  fi

  exit 0
fi

echo "Invalid branch name: $branch" >&2
echo "Groups: <type>/grupo-<n>-<description> (e.g., feature/grupo-1-login)" >&2
echo "DevOps: <type>/devops-<description> (chore and ci are DevOps only)" >&2
echo "Epics: epic/<any-name> (e.g., epic/db-migration)" >&2
exit 1