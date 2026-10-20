window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "m2-l2.double-five",
    "type": "mcq",
    "concept": "function-evaluation",
    "prompt": "Con <code class=\"l\">def double (n : Nat) : Nat := 2 * n</code>, ¿qué devuelve <code class=\"l\">double 5</code>?",
    "options": [
      { "t": "10", "ok": true, "why": "Cambias <code class=\"l\">n</code> por 5 en el cuerpo: <code class=\"l\">2 * 5</code> = 10." },
      { "t": "7", "why": "Eso sería <code class=\"l\">2 + 5</code>. El cuerpo multiplica, no suma." },
      { "t": "25", "why": "Eso sería <code class=\"l\">5 * 5</code>. El cuerpo es <code class=\"l\">2 * n</code>: 2 por el número que entra." },
      { "t": "5", "why": "La función no devuelve la entrada tal cual: hace la cuenta del cuerpo con ella." }
    ]
  },
  {
    "id": "m2-l2.app-precedence",
    "type": "mcq",
    "concept": "application-precedence",
    "prompt": "¿Qué responde Lean a esta línea?",
    "code": "#eval double 4 + 1",
    "uses": ["double"],
    "check": "ok",
    "options": [
      { "t": "9", "ok": true, "why": "La función se queda con lo que tiene al lado: <code class=\"l\">(double 4) + 1</code> = 8 + 1 = 9." },
      { "t": "10", "why": "Eso sería <code class=\"l\">double (4 + 1)</code>. Sin paréntesis, primero se aplica la función y luego se suma." },
      { "t": "Un error, porque faltan paréntesis.", "why": "No falta nada: es una línea válida. Por eso es peligrosa: Lean no avisa, solo calcula otra cosa." }
    ]
  },
  {
    "id": "m2-l2.arrow-type",
    "type": "mcq",
    "concept": "function-types",
    "prompt": "Una función tiene el tipo <code class=\"l\">Nat → Nat → Bool</code>. ¿Qué hace?",
    "options": [
      { "t": "Recibe dos <code class=\"l\">Nat</code> y devuelve un <code class=\"l\">Bool</code>.", "ok": true, "why": "Lo de después de la última flecha es la salida; todo lo anterior son entradas." },
      { "t": "Recibe un <code class=\"l\">Nat</code> y devuelve dos cosas.", "why": "La salida es solo lo último, <code class=\"l\">Bool</code>. Los dos <code class=\"l\">Nat</code> de delante son entradas." },
      { "t": "Recibe tres cosas: dos <code class=\"l\">Nat</code> y un <code class=\"l\">Bool</code>.", "why": "El <code class=\"l\">Bool</code> del final no es una entrada: es lo que devuelve." },
      { "t": "Dice que si hay un Nat, entonces hay un Bool.", "why": "En un tipo, la flecha describe una función: qué entra y qué sale." }
    ]
  },
  {
    "id": "m2-l2.read-body",
    "type": "mcq",
    "concept": "read-the-body",
    "prompt": "La IA te dice: «<code class=\"l\">fee</code> cobra el 1 % de la cantidad». ¿Qué devuelve <code class=\"l\">fee 99</code>?",
    "code": "def fee (amount : Nat) : Nat := amount / 100",
    "check": "ok",
    "options": [
      { "t": "0", "ok": true, "why": "En <code class=\"l\">Nat</code> la división redondea hacia abajo: 99 / 100 = 0. Cualquier cantidad por debajo de 100 no paga nada. La descripción de la IA no lo cuenta." },
      { "t": "0,99", "why": "Un <code class=\"l\">Nat</code> no tiene decimales. La división entre naturales tira la parte decimal." },
      { "t": "1", "why": "No redondea hacia arriba: <code class=\"l\">Nat</code> siempre corta hacia abajo." },
      { "t": "99", "why": "El cuerpo divide entre 100; no devuelve la cantidad tal cual." }
    ]
  },
  {
    "id": "m2-l2.boss-apply",
    "type": "mcq",
    "concept": "function-application",
    "prompt": "En el jefe aparece <code class=\"l\">foldRounds acc.initialClaim acc.rounds</code>. ¿Cómo se lee?",
    "options": [
      { "t": "La función <code class=\"l\">foldRounds</code> aplicada a dos argumentos: <code class=\"l\">acc.initialClaim</code> y <code class=\"l\">acc.rounds</code>.", "ok": true, "why": "Lo primero es la función; lo que va detrás, separado por espacios, son sus argumentos." },
      { "t": "Tres funciones que se aplican una detrás de otra.", "why": "Solo la primera palabra hace de función aquí. Las otras dos son los datos que recibe." },
      { "t": "<code class=\"l\">foldRounds</code> multiplicado por <code class=\"l\">acc.initialClaim</code> y por <code class=\"l\">acc.rounds</code>.", "why": "La multiplicación se escribe con <code class=\"l\">*</code>. Un espacio entre cosas significa «aplicar la función»." }
    ]
  },
  {
    "id": "m2-l2.lab-fee",
    "type": "mcq",
    "concept": "function-evaluation",
    "prompt": "En el laboratorio, ¿qué responde Lean en el panel a <code class=\"l\">#eval fee 250</code>?",
    "options": [
      { "t": "2", "ok": true, "why": "250 / 100 en <code class=\"l\">Nat</code> es 2: la parte decimal (0,5) se tira." },
      { "t": "2,5", "why": "Los naturales no tienen decimales. Lean corta hacia abajo." },
      { "t": "3", "why": "No redondea al más cercano: siempre hacia abajo." },
      { "t": "250", "why": "El cuerpo divide entre 100. Mira la definición de <code class=\"l\">fee</code> en el archivo." }
    ]
  }
]
);
