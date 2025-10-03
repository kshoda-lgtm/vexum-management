#!/usr/bin/env sh

# エラーが発生したら停止
set -e

# ビルド
npm run build

# distディレクトリに移動
cd dist

# GitHubリポジトリにデプロイ
git init
git add -A
git commit -m 'deploy'

# GitHubリポジトリのURLを設定（後で実際のURLに変更してください）
# git push -f git@github.com:ユーザー名/progress-management-system.git main:gh-pages

cd -
