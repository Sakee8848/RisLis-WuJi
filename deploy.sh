#!/bin/bash

# RisLis One-Click Deployment Script
# Usage: ./deploy.sh "Your update message"

# 1. 检查是否提供了更新说明
SUMMARY=$1
if [ -z "$SUMMARY" ]; then
  echo "❌ 错误：请提供更新说明。"
  echo "👉 用法示例: ./deploy.sh \"优化了连接动画\""
  exit 1
fi

# 获取当前时间
DATE=$(date "+%Y-%m-%d %H:%M:%S")

# 2. 自动更新 CHANGELOG.md
# 如果文件不存在，创建表头
if [ ! -f CHANGELOG.md ]; then
  echo "# RisLis 版本更新记录 (Changelog)" > CHANGELOG.md
  echo "" >> CHANGELOG.md
fi

# 将新日志插入到文件第二行（标题之后），保持最新在最前
# 使用临时文件来实现 prepend 效果
echo "## [$DATE] Update" > temp_log.md
echo "- $SUMMARY" >> temp_log.md
echo "" >> temp_log.md
cat CHANGELOG.md >> temp_log.md
mv temp_log.md CHANGELOG.md

echo "📝 已更新 CHANGELOG.md"

# 3. Git 操作流水线
echo "📦 正在打包代码..."
git add .

echo "💾 正在提交本地仓库..."
git commit -m "$SUMMARY"

echo "🚀 正在推送至 GitHub (RisLis-WuJi)..."
# 注意：确保 Git 缓冲区配置正确，避免大文件报错
git config http.postBuffer 524288000
git push origin main

# 4. 部署完成提示
echo ""
echo "----------------------------------------------------------------"
echo "✅  发布成功！(Release Deployed)"
echo "----------------------------------------------------------------"
echo "🌐 访问地址 (GitHub Pages):"
echo "   https://Sakee8848.github.io/RisLis-WuJi/"
echo ""
echo "💡 提示：如果您是第一次部署，请去 GitHub 仓库的 [Settings] -> [Pages]"
echo "   确保 'Build and deployment' Source 选为 'Deploy from a branch'"
echo "   Branch 选为 'main' /root，并点击 Save。"
echo "----------------------------------------------------------------"
