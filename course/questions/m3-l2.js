window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "m3-l2.impossible",
    "type": "mcq",
    "concept": "impossible-hypothesis",
    "prompt": "Lean acepta este teorema. ¿Qué te dice sobre las transferencias de verdad?",
    "code": [
      "def transferFee (amount : Nat) : Nat := amount / 100 + 1",
      "",
      "theorem free_transfer (amount : Nat) (h : transferFee amount = 0) : amount = 1000000 := by",
      "  unfold transferFee at h",
      "  omega"
    ],
    "check": "ok",
    "options": [
      { "t": "Nada: por la definición, ninguna comisión vale 0.", "ok": true, "why": "<code class=\"l\">transferFee</code> siempre suma 1, así que la hipótesis <code class=\"l\">h</code> no la cumple ninguna cantidad. Con una hipótesis imposible, el «si... entonces» no dice nada." },
      { "t": "Que las transferencias sin comisión son de un millón.", "why": "Solo lo promete para cantidades con comisión 0, y por la definición no hay ninguna." },
      { "t": "Que hay un fallo, porque Lean no debería aceptar algo así.", "why": "Lean lo acepta porque está demostrado: con una hipótesis imposible se puede demostrar cualquier cosa. El problema está en el enunciado, no en Lean." }
    ]
  },
  {
    "id": "m3-l2.contradiction-spot",
    "type": "spot",
    "concept": "contradictory-hypotheses",
    "prompt": "La hipótesis de la línea 2 se puede cumplir. ¿Qué línea hace que, junto con ella, ya no se pueda?",
    "code": [
      "theorem withdraw_ok (balance amount : Nat)",
      "    (h1 : amount ≤ balance)",
      "    (h2 : balance < amount) :",
      "    balance - amount + amount = balance := by",
      "  omega"
    ],
    "check": "ok",
    "answer": [3],
    "why": "<code class=\"l\">h1</code> dice que la cantidad cabe en el saldo y <code class=\"l\">h2</code> dice que no cabe. No pueden ser verdad a la vez, así que el teorema no habla de ningún caso real."
  },
  {
    "id": "m3-l2.true-anyway",
    "allowWarn": true,
    "type": "mcq",
    "concept": "conclusion-true-anyway",
    "prompt": "¿Qué problema tiene este enunciado?",
    "code": "theorem big_balance_ok (x : Nat) (h : x > 1000) : x + 0 = x := by simp",
    "check": "ok",
    "options": [
      { "t": "La conclusión vale para cualquier x: <code class=\"l\">h</code> sobra.", "ok": true, "why": "Sumar 0 nunca cambia nada. El teorema no dice nada especial sobre los x mayores que 1000." },
      { "t": "La hipótesis es imposible: los saldos no pasan de 1000.", "why": "Hay muchos naturales mayores que 1000. El problema no está en la hipótesis, sino en que la conclusión no la necesita." },
      { "t": "Ninguno: si Lean lo acepta sin errores, está bien.", "why": "Lean acepta lo que está demostrado (dando por buenos los axiomas). Que además diga algo útil es cosa tuya." }
    ]
  },
  {
    "id": "m3-l2.weakened",
    "type": "mcq",
    "concept": "weakened-conclusion",
    "prompt": "Le pediste a la IA: <code class=\"l\">∀ x : Nat, x &lt; 10 → x * x &lt; 100</code>. ¿Cuál de estas versiones promete menos?",
    "options": [
      { "t": "<code class=\"l\">∃ x : Nat, x &lt; 10 ∧ x * x &lt; 100</code>", "ok": true, "why": "Solo promete que hay un x que cumple (por ejemplo, 0). De los demás no dice nada." },
      { "t": "<code class=\"l\">∀ x : Nat, x &lt; 10 → x * x &lt; 100</code>", "why": "Es exactamente lo que pediste." },
      { "t": "<code class=\"l\">∀ x : Nat, x &lt; 10 → x * x &lt; 100 ∧ x + x &lt; 20</code>", "why": "Esta promete más, no menos: añade otra condición con <code class=\"l\">∧</code>." }
    ]
  },
  {
    "id": "m3-l2.checklist-spot",
    "allowWarn": true,
    "type": "spot",
    "concept": "audit-checklist",
    "prompt": "Pregunta 1 de la checklist: las líneas 2 y 3 se pueden cumplir juntas. ¿Qué línea hace que las hipótesis ya no se puedan cumplir a la vez?",
    "code": [
      "theorem transfer_safe (balance amount fee : Nat)",
      "    (h1 : amount + fee ≤ balance)",
      "    (h2 : fee ≥ 1)",
      "    (h3 : fee = 0) :",
      "    balance - amount - fee ≤ balance := by",
      "  omega"
    ],
    "check": "ok",
    "answer": [4],
    "why": "<code class=\"l\">h2</code> pide una comisión de al menos 1 y <code class=\"l\">h3</code> dice que es 0. Y de regalo falla también la pregunta 2: con naturales, restar nunca hace crecer, así que la conclusión es verdad siempre."
  },
  {
    "id": "m3-l2.boss-free",
    "type": "mcq",
    "concept": "conclusion-true-anyway",
    "prompt": "¿Qué aporta la parte (1) del jefe, <code class=\"l\">RoundsConsistent acc.initialClaim acc.rounds</code>, como prueba de que el verificador WHIR acepta solo lo que debe?",
    "options": [
      { "t": "Nada nuevo: se cumple para cualquier lista de rondas.", "ok": true, "why": "<code class=\"l\">rounds_preserve_invariant</code> no tiene hipótesis. Es útil saberlo, pero no distingue una ejecución buena de una mala. Lo nuevo de verdad está en la ecuación final de la parte (2)." },
      { "t": "Demuestra que el verificador real comprobó bien cada ronda.", "why": "Se cumple por construcción para cualquier entrada, también para una que habría que rechazar. No distingue." },
      { "t": "Es falsa: la IA la coló para que pareciera demostrada.", "why": "Está demostrada y Lean lo ha comprobado. El problema no es que sea falsa, sino que no informa." }
    ]
  },
  {
    "id": "m3-l2.lab-decide",
    "type": "mcq",
    "concept": "contradictory-hypotheses",
    "prompt": "En el paso 2 del laboratorio, ¿qué respondió Lean a <code class=\"l\">decide (3 &lt; 5 ∧ 10 &lt; 3)</code> y a <code class=\"l\">decide (11 &lt; 5 ∧ 10 &lt; 11)</code>?",
    "options": [
      { "t": "<code>false</code> las dos veces: ninguno cumple las dos.", "ok": true, "why": "Y no es mala suerte: para cumplir <code class=\"l\">h1</code> hay que ser menor que 5 y para <code class=\"l\">h2</code> mayor que 10. No hay ningún número así." },
      { "t": "<code>true</code> las dos veces: cada uno cumple una de ellas.", "why": "3 es menor que 5, pero no mayor que 10. Y 11 es mayor que 10, pero no menor que 5. Con <code class=\"l\">∧</code> hacen falta las dos." },
      { "t": "<code>true</code> para 3 y <code>false</code> para 11: 3 es menor que 5.", "why": "Con 3 falla la segunda parte (10 &lt; 3 es falso), así que el <code class=\"l\">∧</code> entero es falso." }
    ]
  },
  {
    "id": "m3-l2.lab-warning",
    "type": "mcq",
    "concept": "unused-hypothesis",
    "prompt": "En el paso 3 del laboratorio, ¿qué decía el aviso amarillo bajo <code class=\"l\">h</code> en <code class=\"l\">audit_ok</code>?",
    "options": [
      { "t": "Que la variable <code class=\"l\">h</code> no se usa en ningún sitio.", "ok": true, "why": "<code>Variable name `h` is not explicitly referenced</code>: la demostración no necesita <code class=\"l\">h</code>, porque la conclusión es verdad sin ella." },
      { "t": "Que hay un <code class=\"l\">sorry</code> en la demostración.", "why": "No hay ningún <code class=\"l\">sorry</code>: la demostración es <code class=\"l\">rfl</code> y está completa." },
      { "t": "Que el teorema es falso aunque compile.", "why": "Si no estuviera demostrado saldría en rojo. El amarillo es un aviso: compila, pero algo huele raro." }
    ]
  }
]
);
