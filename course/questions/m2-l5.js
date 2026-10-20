window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "m2-l5.implicit",
    "type": "mcq",
    "concept": "implicit-arguments",
    "prompt": "Con <code class=\"l\">def pair {α : Type} (a b : α) : List α := [a, b]</code>, ¿por qué puedes escribir <code class=\"l\">pair 3 7</code> sin decir qué tipo es α?",
    "options": [
      { "t": "Porque α va entre llaves: es implícito y Lean lo deduce de 3 y 7.", "ok": true, "why": "Las llaves significan «esto lo deduce Lean». Al ver números, decide que α es <code class=\"l\">Nat</code>." },
      { "t": "Porque α siempre vale <code class=\"l\">Nat</code>.", "why": "α puede ser cualquier tipo. Con <code class=\"l\">pair \"hola\" \"adiós\"</code> Lean deduce <code class=\"l\">String</code>." },
      { "t": "Porque los argumentos entre llaves son opcionales y se pueden quedar vacíos.", "why": "No se quedan vacíos: Lean los rellena. Si no pudiera deducirlos, daría un error." }
    ]
  },
  {
    "id": "m2-l5.instance-mul",
    "type": "mcq",
    "concept": "instance-arguments",
    "prompt": "¿Qué pide <code class=\"l\">[Mul α]</code> en esta definición?",
    "code": "def square {α : Type} [Mul α] (x : α) : α := x * x",
    "check": "ok",
    "options": [
      { "t": "Que el tipo α sepa multiplicar. Si no, no puedes usar <code class=\"l\">square</code> con él.", "ok": true, "why": "Los corchetes son requisitos sobre el tipo. <code class=\"l\">Mul</code> es multiplicar, igual que <code class=\"l\">Add</code> es sumar." },
      { "t": "Un número que tienes que escribir tú al llamar a la función.", "why": "Los corchetes no son un dato que escribas. Lean busca solo si el tipo cumple el requisito." },
      { "t": "Que x sea mayor que cero.", "why": "Eso sería una hipótesis sobre x. <code class=\"l\">[Mul α]</code> habla del tipo, no del valor." }
    ]
  },
  {
    "id": "m2-l5.commring",
    "type": "mcq",
    "concept": "commring",
    "prompt": "Ves <code class=\"l\">{R : Type*} [CommRing R]</code> en un archivo con Mathlib. ¿Qué te dice sobre R?",
    "options": [
      { "t": "Un tipo cualquiera con suma, resta y producto con las reglas de siempre.", "ok": true, "why": "Eso es un anillo conmutativo. Valen los enteros, las fracciones o un cuerpo finito de los que se usan en criptografía." },
      { "t": "R son los números enteros, que son el ejemplo típico de anillo.", "why": "Los enteros cumplen el requisito, pero no son los únicos. R puede ser cualquier tipo que lo cumpla." },
      { "t": "Un tipo que sabe sumar y multiplicar, aunque no sepa restar.", "why": "Sin resta no hay anillo: <code class=\"l\">[CommRing R]</code> incluye la resta. Por eso <code class=\"l\">Nat</code> no cumple (3 - 5 da 0)." }
    ]
  },
  {
    "id": "m2-l5.variable-hidden",
    "type": "mcq",
    "concept": "variable-hidden-hypotheses",
    "prompt": "En el archivo pone esto. ¿Qué afirma de verdad <code class=\"l\">broke_is_rich</code>?",
    "code": [
      "variable (balance : Nat) (h : balance < 0)",
      "include h",
      "theorem broke_is_rich : balance = 1000000 := by omega"
    ],
    "check": "ok",
    "options": [
      { "t": "Si un saldo es menor que 0, vale un millón: no habla de ningún saldo real.", "ok": true, "why": "<code class=\"l\">include h</code> mete la hipótesis de la línea <code class=\"l\">variable</code> en el teorema, aunque no se vea en su línea." },
      { "t": "Que cualquier saldo vale un millón: su línea no pone ninguna condición.", "why": "Eso parece si solo lees la línea del teorema. Pero la hipótesis <code class=\"l\">h</code> viaja escondida desde la línea <code class=\"l\">variable</code>." },
      { "t": "Nada, porque Lean rechaza un teorema que dice algo tan raro.", "why": "Lean lo acepta, porque está demostrado: con una hipótesis imposible se puede demostrar cualquier cosa. Por eso es una trampa." }
    ]
  },
  {
    "id": "m2-l5.full-name",
    "type": "mcq",
    "concept": "namespaces",
    "prompt": "<code class=\"l\">whir_subverifier_soundness</code> está definido entre <code class=\"l\">namespace Whir</code> y <code class=\"l\">end Whir</code>. ¿Cuál es su nombre completo?",
    "options": [
      { "t": "<code>Whir.whir_subverifier_soundness</code>", "ok": true, "why": "El namespace funciona como un apellido que va delante del nombre." },
      { "t": "<code>whir_subverifier_soundness</code>, y no hay otro.", "why": "Ese es el nombre corto. Solo funciona dentro del namespace o con <code class=\"l\">open Whir</code>." },
      { "t": "<code>whir_subverifier_soundness.Whir</code>", "why": "El apellido va delante, no detrás: como <code class=\"l\">Bank.fee</code>." }
    ]
  },
  {
    "id": "m2-l5.boss-generic",
    "type": "mcq",
    "concept": "generic-theorem",
    "prompt": "El jefe vale para cualquier R que cumpla <code class=\"l\">[CommRing R]</code>. ¿Qué significa eso para el auditor?",
    "options": [
      { "t": "Que vale para todos esos R a la vez, también para EF8.", "ok": true, "why": "Un teorema genérico se demuestra una vez y vale para cada R que cumpla el requisito, como EF8 con <code class=\"l\">(R := EF8)</code>." },
      { "t": "Que solo vale para los enteros, que son el anillo de ejemplo.", "why": "Los enteros son un ejemplo, no el único. Vale para cualquier anillo conmutativo." },
      { "t": "Que el teorema no tiene requisitos: vale para cualquier tipo.", "why": "<code class=\"l\">[CommRing R]</code> es un requisito. Con un tipo que no lo cumpla, el teorema no se puede usar." }
    ]
  },
  {
    "id": "m2-l5.lab-bool",
    "type": "mcq",
    "concept": "instance-arguments",
    "prompt": "En el laboratorio, al cambiar <code class=\"l\">#eval double 21</code> por <code class=\"l\">#eval double true</code>, ¿qué te dijo Lean?",
    "options": [
      { "t": "Un error en rojo: <code class=\"l\">Bool</code> no cumple <code class=\"l\">[Add α]</code>.", "ok": true, "why": "El mensaje es <code>failed to synthesize ... Add Bool</code>: <code class=\"l\">true</code> es de tipo <code class=\"l\">Bool</code>, y <code class=\"l\">Bool</code> no sabe sumar." },
      { "t": "Una respuesta en azul: <code>true</code>, porque true + true sigue siendo true.", "why": "Para eso Lean tendría que saber sumar <code class=\"l\">true + true</code>, y no sabe." },
      { "t": "Un aviso amarillo: compila, pero con alguna pega.", "why": "No es un aviso: es un error en rojo. El tipo no cumple el requisito y Lean se niega." }
    ]
  }
]
);
