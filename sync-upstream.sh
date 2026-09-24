#!/bin/bash
# CoNest fork sync script — dual-branch workflow
# Usage: bash sync-upstream.sh [branch]
#   branch: develop (default) or main
#
# Branch strategy:
#   - develop: our active development branch, tracks upstream/develop (0.6.x).
#              Sync = merge upstream INTO local (preserve local history).
#              Upstream squashes merged PRs, so our commits and upstream
#              commits are content-equivalent but hash-distinct; rebase would
#              rewrite history and create phantom conflicts. Merge is safe.
#   - main:    stable baseline, tracks upstream/main.
#              Upstream may force-push/rewrite main; sync = reset local to
#              upstream/main. Only safe when local main's extra commits have
#              already entered upstream via PRs (check before reset).
#
# Workflow:
#   1. Fetch upstream and origin
#   2. Merge (develop) or reset (main) to upstream
#   3. Push to our fork (origin)
#   4. Report PR link if develop is ahead of upstream

set -euo pipefail

BRANCH="${1:-develop}"
if [[ "$BRANCH" != develop && "$BRANCH" != main ]]; then
  echo 'Branch must be develop or main' >&2
  exit 2
fi
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

echo "=== CoNest Fork Sync: $BRANCH ==="
echo ""

# 0. Guard: dirty worktree
if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is not clean; commit or stash changes first" >&2
  exit 1
fi

# 1. Fetch
echo "[1/6] Fetching upstream and origin..."
git fetch upstream
git fetch origin

# 2. Switch to target branch
CURRENT=$(git branch --show-current)
if [ "$CURRENT" != "$BRANCH" ]; then
  echo "[2/6] Switching from $CURRENT to $BRANCH..."
  git checkout "$BRANCH"
else
  echo "[2/6] Already on $BRANCH"
fi

# 3. Show divergence
echo ""
echo "[3/6] Divergence from upstream/$BRANCH:"
OURS=$(git rev-list --count "upstream/$BRANCH..$BRANCH" 2>/dev/null || echo 0)
THEIRS=$(git rev-list --count "$BRANCH..upstream/$BRANCH" 2>/dev/null || echo 0)
echo "  Our commits ahead: $OURS"
echo "  Upstream commits behind: $THEIRS"
if [ "$OURS" -gt 0 ]; then
  echo "Our commits:"
  git log --oneline "upstream/$BRANCH..$BRANCH" | head -20
fi
if [ "$THEIRS" -gt 0 ]; then
  echo ""
  echo "Upstream commits:"
  git log --oneline "$BRANCH..upstream/$BRANCH" | head -20
fi

# 4. Sync
case "$BRANCH" in
  develop)
    if [ "$THEIRS" -gt 0 ]; then
      echo ""
      echo "[4/6] Merging upstream/develop into local (preserves local history)..."
      git merge upstream/develop --no-edit
    else
      echo ""
      echo "[4/6] Up to date with upstream/develop"
    fi
    ;;
  main)
    echo ""
    echo "[4/6] main follows upstream/main (upstream may rewrite history)..."
    if [ "$OURS" -gt 0 ]; then
      echo "  WARNING: local main is ahead of upstream/main by $OURS commit(s)."
      echo "  Verify those commits' content already entered upstream via PRs"
      echo "  before proceeding. Resetting to upstream/main now."
    fi
    git reset --hard upstream/main
    ;;
esac

# 5. Push
echo ""
echo "[5/6] Pushing to origin/$BRANCH..."
case "$BRANCH" in
  main)
    # upstream may have force-pushed; fork main should mirror upstream exactly
    git push --force-with-lease origin "$BRANCH"
    ;;
  develop)
    git push origin "$BRANCH"
    ;;
esac

# 6. PR link (develop only)
echo ""
echo "[6/6] Done."
if [ "$BRANCH" = develop ]; then
  OURS_AFTER=$(git rev-list --count upstream/develop..develop 2>/dev/null || echo 0)
  if [ "$OURS_AFTER" -gt 0 ]; then
    ORIGIN_URL=$(git remote get-url origin)
    case "$ORIGIN_URL" in
      git@github.com:*) ORIGIN_REPO="${ORIGIN_URL#git@github.com:}" ;;
      https://github.com/*) ORIGIN_REPO="${ORIGIN_URL#https://github.com/}" ;;
      *) ORIGIN_REPO="" ;;
    esac
    if [ -n "$ORIGIN_REPO" ]; then
      ORIGIN_REPO="${ORIGIN_REPO%.git}"
      FORK_OWNER="${ORIGIN_REPO%%/*}"
      FORK_NAME="${ORIGIN_REPO#*/}"
      echo "PR link: https://github.com/zyw02/CoNest/compare/develop...${FORK_OWNER}:${FORK_NAME}:develop"
    fi
  else
    echo "develop content matches upstream/develop; no PR needed."
  fi
fi
