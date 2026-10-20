# Leer Lean

Un curso interactivo para aprender a **leer y auditar demostraciones de
Lean 4 escritas por una IA**, desde cero, con mates intercaladas. Está pensado
para personas con TDAH: pasos cortos, una idea cada vez, respuesta inmediata
y repaso espaciado. Lean comprueba la demostración; tú compruebas el
enunciado, las definiciones y lo que se da por bueno sin demostrar.

## Qué hay dentro

- 13 lecciones de Lean (módulos 0 a 3.2): qué es Lean, VS Code, lógica,
  tipos, funciones, estructuras, leer teoremas y detectar trampas. Los
  módulos siguientes están planificados en `course/SYLLABUS.md` y el tutor los
  construye cuando te acercas a ellos.
- Una parte de mates (`course/MATH.md`): teoremas con historia entre los
  módulos de Lean (el primero, dividir con resto), respuestas escritas con
  ejercicios generados, soluciones paso a paso y chequeos de mates cortos.
- Un «jefe final»: el teorema principal de un verificador WHIR real, escrito
  por una IA, que empieza tapado por niebla. Cada lección despeja las piezas
  que te enseña a leer.
- Dominio al 80 %, «Ya me lo sé» para saltarte lo que ya sabes, repasos
  espaciados con números nuevos, prueba de nivel y chuleta de símbolos.

## Empezar

Necesitas Python 3, Lean 4 con [elan](https://github.com/leanprover/elan) (el
proyecto de prácticas fija la versión 4.35.0) y VS Code con la extensión
`leanprover.lean4`. La carpeta también recomienda `usernamehw.errorlens`, que
escribe las respuestas de Lean al final de cada línea. Node.js solo hace falta
para el comprobador del curso.

```bash
git clone https://github.com/Zyra-V21/curso-lean.git
cd curso-lean
(cd practice && lake build)   # solo la primera vez: descarga Lean
./start-course.sh             # arranca el servidor local y abre el mapa del curso
./start-course.sh lab         # abre el proyecto de prácticas en VS Code
./start-course.sh stop        # para el servidor
```

Atajo opcional: `ln -s "$PWD/start-course.sh" ~/.local/bin/curso-lean`.

## El tutor

El servidor local guarda cada respuesta en `tutor/events.jsonl`. Abre una IA
de programación en esta carpeta (por ejemplo Claude Code, que lee
`CLAUDE.md`; otras leen `AGENTS.md`, que es el mismo archivo) y escribe
«tutor». La primera vez te hace unas preguntas y crea `tutor/profile.md`.
Después lee tu progreso con `tools/progress_report.py`, contesta las notas que
dejas al final de cada lección, te vuelve a explicar lo que fallas, añade
preguntas de repaso y prepara las siguientes lecciones adaptadas a ti.

Privacidad: todo lo tuyo (`tutor/events.jsonl`, `tutor/notes.md`,
`tutor/profile.md`) está fuera de git y no sale de tu ordenador salvo que tú
lo envíes a algún sitio.

## Qué hay en cada sitio

- `course/`: lecciones (`lessons/`), bancos de preguntas (`questions/`), el
  catálogo y el motor (`assets/`; `assets/math.js` tiene el lector de
  respuestas de mates y los generadores de ejercicios). Mira
  `course/AUTHORING.md`, `course/SYLLABUS.md` y `course/MATH.md` (en inglés,
  para quien construye lecciones).
- `practice/`: proyecto de Lake con un archivo de laboratorio por lección.
- `server/server.py`: servidor local en 127.0.0.1:8642; guarda las respuestas.
- `tools/check_course.py`: comprueba con Lean cada fragmento de código y cada
  resultado que afirma el curso, y revisa los generadores de mates
  (`tools/math_selftest.js`).
- `tools/progress_report.py`: resumen del progreso para el tutor.
- `tools/walk_lessons.js`: recorre las páginas en un navegador automático.

## Licencia

MIT, mira `LICENSE`. Fuentes: Atkinson Hyperlegible Next, JuliaMono (subconjunto)
y Noto Sans Math (subconjunto), con licencia SIL Open Font License, incluidas
con sus licencias en `course/assets/fonts/`.
