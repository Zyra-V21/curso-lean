window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "m1-l2.and-table",
    "type": "mcq",
    "concept": "and",
    "prompt": "A es verdadera y B es falsa. ¿Qué es <code class=\"l\">A ∧ B</code>?",
    "options": [
      { "t": "Falsa: <code class=\"l\">∧</code> necesita las dos.", "ok": true, "why": "Con que una falle, el «y» falla. Como nivel 60 sin llave: te quedas fuera." },
      { "t": "Verdadera: una de las dos se cumple.", "why": "Eso describe el <code class=\"l\">∨</code>. El <code class=\"l\">∧</code> exige las dos." },
      { "t": "Depende de qué digan A y B.", "why": "Para saber el valor de <code class=\"l\">A ∧ B</code> solo hace falta saber si A y B son verdad, y ya lo sabes." }
    ]
  },
  {
    "id": "m1-l2.or-inclusive",
    "type": "mcq",
    "concept": "or",
    "prompt": "Un contrato promete «te devuelvo los tokens <code class=\"l\">∨</code> te pago una compensación». Al final hace las dos cosas. ¿Ha cumplido la promesa?",
    "options": [
      { "t": "Sí: el <code class=\"l\">∨</code> de la lógica también es verdad cuando se cumplen las dos.", "ok": true, "why": "En lógica, «o» significa «al menos una». Las dos a la vez también cuenta." },
      { "t": "No: «o» significa una cosa o la otra, pero no las dos.", "why": "Eso es el «o» de «¿café o té?» de la vida diaria. El <code class=\"l\">∨</code> de Lean incluye el caso de las dos." },
      { "t": "Solo si la compensación es menor que los tokens.", "why": "El <code class=\"l\">∨</code> no compara cantidades: solo mira si al menos una de las dos partes se cumple." }
    ]
  },
  {
    "id": "m1-l2.not-precedence",
    "type": "mcq",
    "concept": "not-precedence",
    "prompt": "Sin paréntesis, ¿cómo lee Lean <code class=\"l\">¬ A ∧ B</code>?",
    "options": [
      { "t": "Como <code class=\"l\">(¬ A) ∧ B</code>: el <code class=\"l\">¬</code> solo niega A.", "ok": true, "why": "El <code class=\"l\">¬</code> abarca lo que tiene delante y se para en el siguiente <code class=\"l\">∧</code> o <code class=\"l\">∨</code>. Para negar todo hacen falta paréntesis: <code class=\"l\">¬ (A ∧ B)</code>." },
      { "t": "Como <code class=\"l\">¬ (A ∧ B)</code>: niega todo lo que viene detrás.", "why": "Eso necesitaría paréntesis. Sin ellos, el <code class=\"l\">¬</code> solo afecta a A." },
      { "t": "Da error: hay que poner paréntesis siempre.", "why": "No da error: Lean tiene una regla fija para leerlo, y por eso hay que conocerla." }
    ]
  },
  {
    "id": "m1-l2.de-morgan",
    "type": "mcq",
    "concept": "de-morgan",
    "prompt": "«No es verdad que el pago se haya hecho <strong>y</strong> se haya registrado.» ¿Qué sabes?",
    "options": [
      { "t": "Que falló al menos una: no se hizo, o no se registró.", "ok": true, "why": "Negar un «y» da un «o» de negaciones: es una ley de De Morgan." },
      { "t": "Que el pago no se hizo y que, además, tampoco se registró.", "why": "Eso es más fuerte de lo que sabes. Puede que el pago se hiciera y solo faltara registrarlo." },
      { "t": "Que el pago se hizo pero no se registró.", "why": "Es uno de los casos posibles, pero no el único. También puede ser que no se hiciera." }
    ]
  },
  {
    "id": "m1-l2.spot-weak-or",
    "type": "spot",
    "concept": "weak-or",
    "prompt": "Pediste las dos garantías a la vez: no pagar más de lo depositado <strong>y</strong> comisión como mucho 100. <code class=\"l\">vault.paidOut</code> es lo que ha pagado la bóveda, <code class=\"l\">vault.deposited</code> lo depositado. ¿En qué línea está la trampa?",
    "code": [
      "theorem vault_safe (vault : Vault) :",
      "    vault.paidOut ≤ vault.deposited",
      "    ∨ vault.fee ≤ 100 := by",
      "  omega"
    ],
    "check": "skip",
    "answer": [3],
    "why": "La línea 3 empieza con <code class=\"l\">∨</code>: basta con que la comisión sea como mucho 100 para que el teorema sea verdad, aunque la bóveda pague de más. Debería ser <code class=\"l\">∧</code>."
  },
  {
    "id": "m1-l2.boss-and",
    "type": "mcq",
    "concept": "and",
    "prompt": "Las partes de la conclusión del jefe van unidas con <code class=\"l\">∧</code>. ¿Qué significa eso para ti como auditor?",
    "options": [
      { "t": "Que el teorema promete todas las partes a la vez.", "ok": true, "why": "Con <code class=\"l\">∧</code>, si Lean acepta la demostración, se cumplen todas. Con <code class=\"l\">∨</code> bastaría una." },
      { "t": "Que basta con que se cumpla una de las partes.", "why": "Eso sería un <code class=\"l\">∨</code>. El <code class=\"l\">∧</code> exige todas." },
      { "t": "Que cada parte es un teorema distinto que hay que demostrar por separado en otro archivo.", "why": "Es un solo teorema con una conclusión hecha de varias partes. La demostración las cubre todas." }
    ]
  },
  {
    "id": "m1-l2.lab-excluded-middle",
    "type": "mcq",
    "concept": "or",
    "prompt": "En el laboratorio, ¿qué responde Lean a esta línea?",
    "code": "#eval decide (5 < 3 ∨ ¬ (5 < 3))",
    "check": "ok",
    "options": [
      { "t": "<code>true</code>", "ok": true, "why": "<code class=\"l\">5 &lt; 3</code> es falso, así que <code class=\"l\">¬ (5 &lt; 3)</code> es verdad. Con una verdadera, el <code class=\"l\">∨</code> es verdad." },
      { "t": "<code>false</code>", "why": "La primera parte es falsa, pero la segunda (su negación) es verdad, y al <code class=\"l\">∨</code> le basta una." },
      { "t": "Un error, porque se contradice.", "why": "No hay contradicción: dice «A o no A», y eso siempre se cumple." }
    ]
  },
  {
    "id": "m1-l2.lab-parens",
    "type": "mcq",
    "concept": "not-precedence",
    "prompt": "En el laboratorio, el paso 3 tiene la misma frase con y sin paréntesis. ¿Qué responde Lean a la versión <strong>con</strong> paréntesis?",
    "code": "#eval decide (¬ (3 = 4 ∧ 3 = 4))",
    "check": "ok",
    "options": [
      { "t": "<code>true</code>", "ok": true, "why": "<code class=\"l\">3 = 4 ∧ 3 = 4</code> es falso, y el <code class=\"l\">¬</code> lo niega entero: verdadero." },
      { "t": "<code>false</code>", "why": "Ese es el resultado sin paréntesis, donde el <code class=\"l\">¬</code> solo niega el primer <code class=\"l\">3 = 4</code>." },
      { "t": "Lo mismo que sin paréntesis: los paréntesis no cambian nada.", "why": "Aquí cambian el resultado. Esa es la gracia de este paso." }
    ]
  }
]
);
