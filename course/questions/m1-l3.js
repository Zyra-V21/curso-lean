window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "m1-l3.umbrella",
    "type": "mcq",
    "concept": "implication-truth-table",
    "prompt": "Te prometo: «si llueve, llevo paraguas». Hoy no llueve y no llevo paraguas. ¿He roto la promesa?",
    "options": [
      { "t": "No: no llovió, así que hoy no prometí nada.", "ok": true, "why": "Una promesa «si A, entonces B» solo se rompe cuando A pasa y B no. Hoy A (que llueva) no pasó." },
      { "t": "Sí: no llevo paraguas, y eso era lo prometido.", "why": "El paraguas solo era obligatorio si llovía. Sin lluvia, no llevarlo no rompe nada." },
      { "t": "No se sabe: depende de si mañana llueve.", "why": "Sí se sabe: con la hipótesis falsa, «si A, entonces B» es verdad siempre. Es la cuarta fila de la tabla." }
    ]
  },
  {
    "id": "m1-l3.explosion",
    "type": "mcq",
    "concept": "vacuous-hypothesis",
    "prompt": "Lean acepta <code class=\"l\">fee_capped</code> sin errores. ¿Qué te dice sobre la comisión real de tu contrato?",
    "code": ["theorem fee_capped (fee : Nat) (h : fee < 0) :", "    fee = 1000000 := by omega"],
    "check": "ok",
    "options": [
      { "t": "Nada: la hipótesis <code class=\"l\">fee &lt; 0</code> no se cumple nunca.", "ok": true, "why": "Con una hipótesis imposible, la promesa no se puede romper y Lean acepta cualquier conclusión. Demostrado, pero inútil." },
      { "t": "Que la comisión vale un millón, porque Lean lo ha aceptado.", "why": "Eso solo se promete «si <code class=\"l\">fee &lt; 0</code>», y eso no pasa nunca. No se promete nada sobre ninguna comisión real." },
      { "t": "Que Lean tiene un fallo: ha aceptado un disparate.", "why": "Lean no falla: el enunciado está demostrado tal y como está escrito. El problema está en el enunciado, y eso lo revisas tú." }
    ]
  },
  {
    "id": "m1-l3.converse",
    "type": "mcq",
    "concept": "converse",
    "prompt": "Le pides a la IA: «demuestra que si el pago se confirma, el saldo baja». Te entrega un teorema que dice «si el saldo baja, el pago se confirmó». ¿Qué ha pasado?",
    "options": [
      { "t": "Le ha dado la vuelta a la flecha: es otra promesa.", "ok": true, "why": "Igual que «si llueve, el suelo se moja» no es lo mismo que «si el suelo está mojado, llueve». Hay que exigir la dirección que pediste." },
      { "t": "Nada: las dos frases dicen lo mismo, solo cambia el orden.", "why": "No dicen lo mismo. Una puede ser verdad y la otra falsa, como en el ejemplo del suelo mojado." },
      { "t": "Ha demostrado algo más fuerte, así que sirve igual o mejor.", "why": "No es más fuerte, es distinto. Ninguna de las dos direcciones implica la otra." }
    ]
  },
  {
    "id": "m1-l3.iff-stronger",
    "type": "mcq",
    "concept": "iff",
    "prompt": "Pediste «la cuenta está vacía si y solo si su saldo es 0». La IA demuestra solo «si la cuenta está vacía, su saldo es 0». ¿Qué falta?",
    "options": [
      { "t": "La otra dirección: si el saldo es 0, la cuenta está vacía.", "ok": true, "why": "<code class=\"l\">↔</code> son dos flechas. La IA ha entregado una sola." },
      { "t": "Nada, «si y solo si» es lo mismo que «si... entonces».", "why": "No: «si y solo si» promete las dos direcciones. Una sola flecha es la mitad." },
      { "t": "Demostrar también que el saldo nunca llega a ser 0.", "why": "Eso no se pidió. Lo que falta es la flecha en el otro sentido." }
    ]
  },
  {
    "id": "m1-l3.boss-arrow",
    "type": "mcq",
    "concept": "implication-reading",
    "prompt": "En la línea del jefe <code class=\"l\">OpensTo acc.commitment w' → w' = witness</code>, ¿cuál es la hipótesis?",
    "options": [
      { "t": "<code class=\"l\">OpensTo acc.commitment w'</code>, a la izquierda de la flecha", "ok": true, "why": "Lo que está a la izquierda de <code class=\"l\">→</code> es la condición: «si <code>w'</code> también abre el compromiso»." },
      { "t": "<code class=\"l\">w' = witness</code>, a la derecha de la flecha", "why": "Lo de la derecha de la flecha es la conclusión: lo que se promete si se cumple la condición." },
      { "t": "Ninguna: toda la línea es la conclusión del teorema.", "why": "La flecha <code class=\"l\">→</code> separa siempre una hipótesis (izquierda) de una conclusión (derecha)." }
    ]
  },
  {
    "id": "m1-l3.lab-false-line",
    "type": "spot",
    "concept": "implication-truth-table",
    "prompt": "Estas son las tres líneas del Paso 1 del laboratorio. ¿Cuál responde <code class=\"l\">false</code>?",
    "code": [
      "#eval decide (2 + 2 = 4 → 1 = 2)",
      "#eval decide (2 + 2 = 5 → 1 = 2)",
      "#eval decide (2 + 2 = 5 → 1 = 1)"
    ],
    "check": "ok",
    "answer": [1],
    "why": "Es la única con la hipótesis verdadera (2 + 2 = 4) y la conclusión falsa (1 = 2). En las otras dos la hipótesis es falsa, así que la promesa no se puede romper."
  },
  {
    "id": "m1-l3.lab-remove-hyp",
    "type": "mcq",
    "concept": "vacuous-hypothesis",
    "prompt": "En el laboratorio borras <code class=\"l\">(h : fee &lt; 0)</code> de <code class=\"l\">fee_capped</code>. ¿Qué hace Lean?",
    "options": [
      { "t": "Lo marca en rojo: ya no puede demostrarlo.", "ok": true, "why": "Toda la «demostración» venía de la hipótesis imposible. Sin ella, la conclusión es falsa y Lean la rechaza." },
      { "t": "Lo sigue aceptando: ya lo había comprobado antes.", "why": "Lean vuelve a revisar cada vez que cambias algo. Sin la hipótesis es otro enunciado, y no se puede demostrar." },
      { "t": "Sale un aviso amarillo de <code class=\"l\">sorry</code>, pero lo acepta.", "why": "No hay ningún <code class=\"l\">sorry</code> en el archivo. Lo que sale es un error en rojo." }
    ]
  }
]
);
