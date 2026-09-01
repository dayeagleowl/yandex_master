#!/bin/sh
# Отправить работу в общий репозиторий одной командой.
#
#   ./docs/sync.sh                     — с автоматическим описанием
#   ./docs/sync.sh "правил гейт зон"   — со своим описанием
#
# Что делает: подтягивает чужие изменения (rebase, чтобы история осталась
# прямой), добавляет всё, коммитит, пушит. Перед запуском СОХРАНИ проект в
# TouchDesigner — git берёт то, что лежит на диске.
#
# То же самое делает кнопка ОТПРАВИТЬ В GIT в пульте мастера.

set -e
cd "$(dirname "$0")/.."

MSG="${1:-обновление $(date '+%d.%m %H:%M')}"

if [ -z "$(git status --porcelain)" ]; then
  echo "Нечего отправлять — рабочая копия чистая."
else
  git add -A
  git commit -m "$MSG"
  echo "Закоммичено: $MSG"
fi

if git remote | grep -q origin; then
  echo "Подтягиваю чужие изменения…"
  git pull --rebase origin "$(git branch --show-current)"
  git push origin "$(git branch --show-current)"
  echo "Отправлено в origin."
else
  echo "origin не настроен — коммит остался локальным."
  echo "Подключить: git remote add origin <URL> && git push -u origin main"
fi
