window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "m1-l1.what-is-prop",
    "type": "mcq",
    "concept": "proposition",
    "prompt": "¿Cuál de estas es una proposición?",
    "options": [
      { "t": "«El contrato tiene más de 100 tokens.»", "ok": true, "why": "Afirma algo que puede ser verdad o mentira. Aunque no sepas cuál, es una proposición." },
      { "t": "«¡Envía 100 tokens al contrato ahora mismo!»", "why": "Es una orden. No afirma nada, así que no puede ser verdadera ni falsa." },
      { "t": "«¿Cuántos tokens tiene el contrato ahora?»", "why": "Es una pregunta. Una proposición afirma; una pregunta pide información." },
      { "t": "«Los 100 tokens del contrato»", "why": "Nombra una cantidad, pero no afirma nada sobre ella. Le falta el verbo: no hay nada que pueda ser verdad o mentira." }
    ]
  },
  {
    "id": "m1-l1.check-false-prop",
    "type": "mcq",
    "concept": "prop-type",
    "prompt": "¿Qué responde Lean a esta línea?",
    "code": "#check 3 = 7",
    "check": "ok",
    "options": [
      { "t": "<code>3 = 7 : Prop</code>", "ok": true, "why": "Es una proposición, aunque sea falsa. <code class=\"l\">#check</code> dice qué clase de cosa es, no si es verdad." },
      { "t": "Un error en rojo, porque 3 no es igual a 7.", "why": "Escribir una afirmación falsa está permitido: <code class=\"l\">#check</code> solo dice qué clase de cosa es." },
      { "t": "<code>false</code>", "why": "Eso lo diría <code class=\"l\">#eval decide (3 = 7)</code>. <code class=\"l\">#check</code> no averigua si es verdad." }
    ]
  },
  {
    "id": "m1-l1.check-not-proof",
    "type": "mcq",
    "concept": "writing-vs-proving",
    "prompt": "La IA te enseña esta línea y Lean no marca nada en rojo. ¿Está demostrado que 1 + 1 = 3?",
    "code": "#check 1 + 1 = 3  --> 1 + 1 = 3 : Prop",
    "check": "ok",
    "options": [
      { "t": "No. Solo dice que es una proposición; no hay ninguna demostración.", "ok": true, "why": "Escribir una proposición no es demostrarla. Para eso haría falta un teorema con su demostración, y aquí solo hay una afirmación." },
      { "t": "Sí, porque Lean no ha dado error.", "why": "<code class=\"l\">#check</code> no da error con afirmaciones falsas: solo te dice su tipo." },
      { "t": "Sí, porque Lean responde <code>Prop</code>, que significa «probado».", "why": "<code>Prop</code> significa «proposición», una afirmación, verdadera o falsa." }
    ]
  },
  {
    "id": "m1-l1.le-vs-lt",
    "type": "mcq",
    "concept": "comparison",
    "prompt": "¿Qué responde Lean?",
    "code": "#eval decide (7 < 7)",
    "check": "ok",
    "options": [
      { "t": "<code>false</code>", "ok": true, "why": "<code class=\"l\">&lt;</code> es «menor estricto»: 7 no es menor que sí mismo." },
      { "t": "<code>true</code>", "why": "Eso pasaría con <code class=\"l\">7 ≤ 7</code> (menor o igual). Con <code class=\"l\">&lt;</code>, la igualdad no vale." },
      { "t": "<code>7 &lt; 7 : Prop</code>", "why": "Eso sería <code class=\"l\">#check</code>. Con <code class=\"l\">#eval decide</code> Lean calcula si es verdad." }
    ]
  },
  {
    "id": "m1-l1.boss-eq",
    "type": "mcq",
    "concept": "proposition",
    "prompt": "En el jefe aparece <code class=\"l\">w' = witness</code>. ¿Qué clase de cosa es?",
    "options": [
      { "t": "Una proposición: afirma que los dos son la misma cosa.", "ok": true, "why": "Una igualdad siempre es una afirmación. Que sea verdad lo tiene que garantizar la demostración." },
      { "t": "Una orden: copia el valor de <code class=\"l\">witness</code> dentro de <code class=\"l\">w'</code>.", "why": "En Lean, <code class=\"l\">=</code> no copia ni asigna: afirma que dos cosas son iguales." },
      { "t": "Un número: el resultado de comparar los dos.", "why": "Comparar con <code class=\"l\">=</code> da una proposición, no un número." }
    ]
  },
  {
    "id": "m1-l1.lab-check-type",
    "type": "mcq",
    "concept": "prop-type",
    "prompt": "En el laboratorio, ¿qué tipo te da Lean para <code class=\"l\">#check 10 &lt; 3</code>?",
    "code": "#check 10 < 3",
    "check": "ok",
    "options": [
      { "t": "<code>Prop</code>: es una proposición, aunque falsa.", "ok": true, "why": "Lean contesta <code>10 &lt; 3 : Prop</code>. Que sea falsa no cambia su tipo." },
      { "t": "<code>Nat</code>, porque todo lo que lleva son números.", "why": "Lleva números, pero afirma algo sobre ellos. Lo que afirma es una <code>Prop</code>." },
      { "t": "Ninguno: sale un error, porque <code class=\"l\">10 &lt; 3</code> es falso.", "why": "Las proposiciones falsas se pueden escribir sin error." }
    ]
  },
  {
    "id": "m1-l1.lab-decide",
    "type": "mcq",
    "concept": "decide",
    "prompt": "En el laboratorio, ¿qué responde Lean a <code class=\"l\">#eval decide (10 &lt; 3)</code>?",
    "code": "#eval decide (10 < 3)",
    "check": "ok",
    "options": [
      { "t": "<code>false</code>", "ok": true, "why": "10 no es menor que 3, así que el cálculo sale falso." },
      { "t": "<code>true</code>", "why": "Lee el símbolo con calma: <code class=\"l\">10 &lt; 3</code> dice que 10 es menor que 3." },
      { "t": "<code>10 &lt; 3 : Prop</code>", "why": "Eso es lo que dice <code class=\"l\">#check</code>. <code class=\"l\">decide</code> calcula si es verdad." }
    ]
  }
]
);
