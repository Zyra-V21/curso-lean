window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "m3-l1.conclusion",
    "type": "mcq",
    "concept": "theorem-anatomy",
    "prompt": "¿Cuál es la conclusión de este teorema?",
    "code": "theorem le_of_lt_example (a b : Nat) (h : a < b) : a ≤ b := by omega",
    "check": "ok",
    "options": [
      { "t": "<code class=\"l\">a ≤ b</code>", "ok": true, "why": "La conclusión va entre los dos puntos de fuera de los paréntesis y el <code class=\"l\">:=</code>." },
      { "t": "<code class=\"l\">a &lt; b</code>", "why": "Esa es la hipótesis <code class=\"l\">h</code>: está dentro de un paréntesis, antes de los dos puntos." },
      { "t": "<code class=\"l\">omega</code>", "why": "<code class=\"l\">omega</code> es la demostración, que va detrás de <code class=\"l\">:=</code>." }
    ]
  },
  {
    "id": "m3-l1.which-hyps",
    "type": "mcq",
    "concept": "data-vs-hypotheses",
    "prompt": "En este teorema, ¿qué argumentos son hipótesis?",
    "code": "theorem take_ok (xs : List Nat) (hlen : xs.length = 3) (n : Nat) (hn : n < 10) : n < 10 + xs.length := by omega",
    "check": "ok",
    "options": [
      { "t": "<code class=\"l\">hlen</code> y <code class=\"l\">hn</code>", "ok": true, "why": "Sus tipos son proposiciones: <code class=\"l\">xs.length = 3</code> y <code class=\"l\">n &lt; 10</code> pueden ser verdad o mentira." },
      { "t": "<code class=\"l\">xs</code> y <code class=\"l\">n</code>", "why": "Esos son datos: una lista y un número. Su tipo es un tipo de cosas, no una afirmación." },
      { "t": "Todos: cualquier cosa entre paréntesis es una hipótesis.", "why": "Entre paréntesis hay datos y también hipótesis. Se distinguen por su tipo." }
    ]
  },
  {
    "id": "m3-l1.translate",
    "type": "mcq",
    "concept": "reading-recipe",
    "prompt": "¿Cómo se lee este teorema en español?",
    "code": "theorem one_le_of_pos (n : Nat) (h : 0 < n) : 1 ≤ n := by omega",
    "check": "ok",
    "options": [
      { "t": "Para todo natural n, si 0 &lt; n, entonces 1 ≤ n.", "ok": true, "why": "Dato: «para todo n». Hipótesis: «si 0 &lt; n». Conclusión: «entonces 1 ≤ n»." },
      { "t": "Para todo natural n, 0 &lt; n y 1 ≤ n.", "why": "Eso afirmaría las dos cosas para cualquier n, también para 0. La hipótesis es una condición («si»), no una afirmación más." },
      { "t": "Existe un natural n tal que 0 &lt; n.", "why": "Los argumentos se leen «para todo», no «existe». Y la conclusión es 1 ≤ n." }
    ]
  },
  {
    "id": "m3-l1.example-vs-theorem",
    "type": "mcq",
    "concept": "example-lemma",
    "prompt": "¿Qué diferencia hay entre <code class=\"l\">theorem</code> y <code class=\"l\">example</code>?",
    "options": [
      { "t": "<code class=\"l\">example</code> no tiene nombre, así que no se puede usar después.", "ok": true, "why": "Por eso se usa para ejemplos. Lean lo comprueba con la misma exigencia que un <code class=\"l\">theorem</code>." },
      { "t": "<code class=\"l\">example</code> no se comprueba: es solo un ejemplo para leer.", "why": "Lean comprueba un <code class=\"l\">example</code> exactamente igual que un <code class=\"l\">theorem</code>." },
      { "t": "<code class=\"l\">example</code> es lo mismo que <code class=\"l\">lemma</code>: un teorema pequeño con nombre.", "why": "<code class=\"l\">lemma</code> es como <code class=\"l\">theorem</code>, con nombre. <code class=\"l\">example</code> es el que no lo tiene." }
    ]
  },
  {
    "id": "m3-l1.turnstile",
    "type": "mcq",
    "concept": "goal-turnstile",
    "prompt": "En el panel de Lean ves <code class=\"l\">h : a &lt; b</code> y, debajo, <code class=\"l\">⊢ a ≤ b</code>. ¿Qué es <code class=\"l\">a ≤ b</code>?",
    "options": [
      { "t": "El objetivo: lo que falta por demostrar.", "ok": true, "why": "Lo que va tras <code class=\"l\">⊢</code> es lo que queda por demostrar. Al empezar, es la conclusión." },
      { "t": "Una hipótesis que ya tienes.", "why": "Las hipótesis están arriba, con nombre (como <code class=\"l\">h</code>). Lo de abajo, tras <code class=\"l\">⊢</code>, es lo que falta." },
      { "t": "Un error que Lean ha encontrado.", "why": "Los errores salen en rojo. <code class=\"l\">⊢</code> marca el objetivo, no un fallo." }
    ]
  },
  {
    "id": "m3-l1.boss-hyps",
    "type": "mcq",
    "concept": "hidden-hypotheses",
    "prompt": "La cabecera del jefe es <code class=\"l\">theorem whir_subverifier_soundness (acc : WhirAccept R) :</code>. ¿Dónde están sus hipótesis?",
    "options": [
      { "t": "Dentro de <code class=\"l\">acc</code>: son los campos-promesa de <code class=\"l\">WhirAccept</code>.", "ok": true, "why": "Para tener un <code class=\"l\">acc</code> hay que haber cumplido <code class=\"l\">hlen</code>, <code class=\"l\">opens</code> e <code class=\"l\">identity</code>. Son las condiciones del teorema, empaquetadas." },
      { "t": "No tiene: vale sin ninguna condición.", "why": "No hay ningún <code class=\"l\">(h : ...)</code> a la vista, pero las condiciones viajan dentro de <code class=\"l\">acc</code>." },
      { "t": "En el nombre: «soundness» ya dice lo que se cumple.", "why": "El nombre es una etiqueta. No añade ni quita condiciones." }
    ]
  },
  {
    "id": "m3-l1.lab-goal",
    "type": "mcq",
    "concept": "goal-turnstile",
    "prompt": "En el laboratorio, con el cursor justo antes de <code class=\"l\">omega</code> en <code class=\"l\">le_of_lt_example</code>, ¿qué aparecía debajo de <code class=\"l\">⊢</code>?",
    "options": [
      { "t": "<code class=\"l\">a ≤ b</code>", "ok": true, "why": "Antes de <code class=\"l\">omega</code> aún no se ha demostrado nada, así que el objetivo es la conclusión entera." },
      { "t": "<code class=\"l\">a &lt; b</code>", "why": "Eso aparecía arriba, como hipótesis <code class=\"l\">h</code>. Debajo de <code class=\"l\">⊢</code> va lo que falta." },
      { "t": "<code>No goals</code>", "why": "Eso sale después de <code class=\"l\">omega</code>, cuando ya no queda nada por demostrar." }
    ]
  },
  {
    "id": "m3-l1.lab-nogoals",
    "type": "mcq",
    "concept": "goal-turnstile",
    "prompt": "¿Y con el cursor al final de la línea, después de <code class=\"l\">omega</code>?",
    "options": [
      { "t": "<code>No goals</code>: no queda nada por demostrar.", "ok": true, "why": "<code class=\"l\">omega</code> resolvió el objetivo. Es lo que dice Lean cuando una demostración está completa." },
      { "t": "El mismo objetivo, <code class=\"l\">⊢ a ≤ b</code>, porque el panel no cambia.", "why": "Después de <code class=\"l\">omega</code> el objetivo ya está resuelto, así que desaparece." },
      { "t": "Un aviso amarillo de <code>sorry</code>, porque falta algo.", "why": "En el archivo no hay ningún <code class=\"l\">sorry</code>: la demostración está completa." }
    ]
  }
]
);
