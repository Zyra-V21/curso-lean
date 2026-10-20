#!/usr/bin/env bash
# Start (or reuse) the local course server and open the course.
#   start-course.sh          open the course map in the browser
#   start-course.sh lab      open the Lean practice project in VS Code
#   start-course.sh stop     stop the server
#   start-course.sh status   show whether the server is running
set -euo pipefail

ROOT="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)"
PORT="${LEAN_COURSE_PORT:-8642}"
URL="http://127.0.0.1:${PORT}/"
PIDFILE="${ROOT}/tutor/server.pid"
LOGFILE="${ROOT}/tutor/server.log"

is_up() { curl -fsS --max-time 1 "${URL}api/health" >/dev/null 2>&1; }

start_server() {
  if is_up; then return 0; fi
  mkdir -p "${ROOT}/tutor"
  nohup python3 "${ROOT}/server/server.py" --port "${PORT}" >>"${LOGFILE}" 2>&1 &
  echo $! >"${PIDFILE}"
  for _ in $(seq 1 50); do
    if is_up; then return 0; fi
    sleep 0.1
  done
  echo "El servidor no ha arrancado. Mira ${LOGFILE}" >&2
  exit 1
}

case "${1:-open}" in
  open)
    start_server
    xdg-open "${URL}" >/dev/null 2>&1 &
    echo "Curso abierto en ${URL}"
    ;;
  lab)
    code "${ROOT}/practice"
    ;;
  stop)
    if [[ -f "${PIDFILE}" ]] && kill -0 "$(cat "${PIDFILE}")" 2>/dev/null; then
      kill "$(cat "${PIDFILE}")"
      rm -f "${PIDFILE}"
      echo "Servidor parado"
    else
      echo "El servidor no estaba en marcha"
    fi
    ;;
  status)
    if is_up; then echo "En marcha en ${URL}"; else echo "Parado"; fi
    ;;
  *)
    echo "Uso: $(basename "$0") [open|lab|stop|status]" >&2
    exit 2
    ;;
esac
