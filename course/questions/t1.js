window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "t1.seven-days",
    "type": "mcq",
    "concept": "days-mod-7",
    "prompt": "Hoy es jueves. ¿Qué día de la semana será dentro de 21 días?",
    "options": [
      { "t": "Jueves", "ok": true, "why": "21 = 7 · 3: son 3 semanas justas, así que vuelve a ser jueves." },
      { "t": "Viernes", "why": "21 días son 3 semanas exactas: no sobra ningún día, así que no se mueve." },
      { "t": "Domingo", "why": "Has avanzado 3 días, uno por semana. Pero 3 semanas completas te dejan en el mismo día." }
    ]
  },
  {
    "id": "t1.divmod-a",
    "type": "num",
    "gen": "divmod",
    "concept": "division-remainder"
  },
  {
    "id": "t1.remainder-bound",
    "type": "mcq",
    "concept": "remainder-bound",
    "prompt": "Divides un número natural entre 7. ¿Qué restos pueden salir?",
    "options": [
      { "t": "0, 1, 2, 3, 4, 5 o 6", "ok": true, "why": "El resto siempre es menor que 7, y puede ser 0: 21 entre 7 no deja nada." },
      { "t": "1, 2, 3, 4, 5, 6 o 7", "why": "7 no puede ser resto: con 7 sueltos llenas otra bolsa. Y 0 sí puede: 21 entre 7 no deja nada." },
      { "t": "Cualquier número natural", "why": "Si sobraran 7 o más, cabría otra vez. El resto siempre es menor que 7." }
    ]
  },
  {
    "id": "t1.days-a",
    "type": "mcq",
    "gen": "daysLater",
    "concept": "days-mod-7"
  },
  {
    "id": "t1.lean-div",
    "type": "mcq",
    "concept": "nat-division",
    "prompt": "¿Qué responde Lean a esta línea?",
    "code": "#eval 9 / 4",
    "check": "ok",
    "options": [
      { "t": "<code>2</code>", "ok": true, "why": "9 = 4 · 2 + 1: el 4 cabe 2 veces. Entre naturales, <code class=\"l\">/</code> da el cociente." },
      { "t": "<code>2,25</code>", "why": "Eso daría una calculadora. Entre naturales Lean no usa decimales: <code class=\"l\">/</code> da el cociente, 2." },
      { "t": "<code>1</code>", "why": "1 es lo que sobra: eso lo da <code class=\"l\">9 % 4</code>. <code class=\"l\">/</code> da el cociente, 2." }
    ]
  },
  {
    "id": "t1.read-thm",
    "type": "mcq",
    "concept": "statement-says-what-it-says",
    "prompt": "¿Qué afirma <code class=\"l\">div_with_remainder</code>?",
    "code": "theorem div_with_remainder (m n : Nat) :\n    n * (m / n) + m % n = m := Nat.div_add_mod m n",
    "check": "ok",
    "options": [
      { "t": "Que el divisor por el cociente, más el resto, da el número del principio.", "ok": true, "why": "Eso es exactamente <code class=\"l\">n * (m / n) + m % n = m</code>: <em>b</em> · <em>q</em> + <em>r</em> = <em>a</em>." },
      { "t": "Que el resto de dividir m entre n siempre es menor que n.", "why": "Eso es cierto (si n es mayor que 0), pero este enunciado no lo dice. Es otro teorema, <code class=\"l\">Nat.mod_lt</code>." },
      { "t": "Cómo se calculan paso a paso el cociente y el resto.", "why": "Un teorema afirma algo que es verdad; no es una receta de cálculo." }
    ]
  },
  {
    "id": "t1.lab-365",
    "type": "num",
    "concept": "nat-mod",
    "prompt": "En el laboratorio: ¿qué responde Lean a <code class=\"l\">#eval 365 % 7</code>?",
    "code": "#eval 365 % 7",
    "check": "ok",
    "parts": [{ "label": "Lean responde", "form": "integer", "answer": "1" }],
    "steps": [
      "365 = 7 · 52 + 1: un año son 52 semanas y 1 día.",
      "Por eso tu cumpleaños cae cada año un día de la semana más tarde (dos, si por medio hay un 29 de febrero)."
    ],
    "traps": [{ "part": 0, "value": "52", "code": "quotient-instead", "msg": "52 son las semanas completas, lo que da <code class=\"l\">365 / 7</code>. <code class=\"l\">%</code> da lo que sobra." }]
  },
  {
    "id": "t1.remainder-zero",
    "type": "num",
    "reviewOnly": true,
    "concept": "remainder-bound",
    "prompt": "¿Qué responde Lean a <code class=\"l\">#eval 35 % 7</code>?",
    "code": "#eval 35 % 7",
    "check": "ok",
    "parts": [{ "label": "Lean responde", "form": "integer", "answer": "0" }],
    "steps": [
      "35 = 7 · 5 + 0: el 7 cabe 5 veces justas.",
      "No sobra nada, así que el resto es 0. Un resto 0 es normal: significa «cae justo»."
    ],
    "traps": [
      { "part": 0, "value": "7", "code": "remainder-equals-divisor", "msg": "Si sobraran 7, cabría otra vez. Cuando cabe justo, el resto es 0." },
      { "part": 0, "value": "5", "code": "quotient-instead", "msg": "5 es el cociente, lo que da <code class=\"l\">35 / 7</code>. <code class=\"l\">%</code> da lo que sobra: nada." }
    ]
  },
  {
    "id": "t1.remainder-not-divisor",
    "type": "mcq",
    "reviewOnly": true,
    "concept": "remainder-bound",
    "prompt": "Divides un número natural entre 4. ¿Cuál de estos NO puede ser el resto?",
    "options": [
      { "t": "4", "ok": true, "why": "Con 4 sueltos llenas otro grupo de 4, así que nunca sobran 4. Los restos posibles son 0, 1, 2 y 3." },
      { "t": "0", "why": "0 sí puede ser resto: 8 entre 4 cabe justo y no sobra nada." },
      { "t": "3", "why": "3 sí puede ser resto: 7 entre 4 cabe 1 vez y sobran 3." }
    ]
  }
]
);
