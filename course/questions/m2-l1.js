window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "m2-l1.check-prop",
    "type": "mcq",
    "concept": "types-basic",
    "prompt": "¿Qué responde Lean a esta línea?",
    "code": "#check 2 + 2 = 4",
    "check": "ok",
    "options": [
      { "t": "<code class=\"l\">2 + 2 = 4 : Prop</code>", "ok": true, "why": "Es una afirmación, así que su tipo es <code class=\"l\">Prop</code>. <code class=\"l\">#check</code> no la calcula: te dice qué es." },
      { "t": "<code class=\"l\">2 + 2 = 4 : Bool</code>", "why": "<code class=\"l\">Bool</code> es para calcular <code class=\"l\">true</code> o <code class=\"l\">false</code>. Una afirmación como esta es de tipo <code class=\"l\">Prop</code>." },
      { "t": "<code class=\"l\">true : Bool</code>", "why": "<code class=\"l\">#check</code> no decide si es verdad: solo dice de qué tipo es. Y las afirmaciones son de tipo <code class=\"l\">Prop</code>." }
    ]
  },
  {
    "id": "m2-l1.nat-sub",
    "type": "mcq",
    "concept": "nat-truncated-sub",
    "prompt": "¿Qué responde Lean?",
    "code": "#eval 2 - 7",
    "check": "ok",
    "options": [
      { "t": "0", "ok": true, "why": "Sin decir otra cosa, 2 y 7 son <code class=\"l\">Nat</code>, y la resta de naturales se corta en el cero." },
      { "t": "-5", "why": "Eso daría con <code class=\"l\">Int</code>, por ejemplo <code class=\"l\">(2 - 7 : Int)</code>. Con <code class=\"l\">Nat</code> no hay negativos." },
      { "t": "Un error en rojo.", "why": "Lean no da error: da 0 en silencio. Por eso es una trampa." }
    ]
  },
  {
    "id": "m2-l1.int-div",
    "type": "mcq",
    "concept": "int-division",
    "prompt": "Un contrato en Solidity calcula <code>-7 / 2</code> con <code>int256</code> y da -3. El modelo de Lean hace <code class=\"l\">(-7 : Int) / 2</code>. ¿Qué da el modelo?",
    "options": [
      { "t": "-4, distinto de Solidity", "ok": true, "why": "Con divisor positivo, la <code class=\"l\">/</code> de Lean redondea hacia abajo. Modelo y contrato no coinciden con negativos; el equivalente en Lean sería <code class=\"l\">Int.tdiv</code>." },
      { "t": "-3, igual que Solidity", "why": "Eso daría <code class=\"l\">Int.tdiv (-7) 2</code>. La <code class=\"l\">/</code> normal de Lean da -4." },
      { "t": "-3,5, sin redondear", "why": "Los enteros no tienen decimales: la división siempre redondea a un entero. La pregunta es hacia dónde." }
    ]
  },
  {
    "id": "m2-l1.wrap",
    "type": "mcq",
    "concept": "overflow",
    "prompt": "Un <code class=\"l\">UInt8</code> guarda de 0 a 255. ¿Qué responde Lean?",
    "code": "#eval (250 : UInt8) + 10",
    "check": "ok",
    "options": [
      { "t": "4", "ok": true, "why": "250 + 10 = 260, que se pasa de 255. Da la vuelta: 260 - 256 = 4." },
      { "t": "260", "why": "260 no cabe en un <code class=\"l\">UInt8</code>. Con <code class=\"l\">Nat</code> sí daría 260." },
      { "t": "255, se queda en el máximo.", "why": "No se queda en el máximo: da la vuelta y empieza desde 0, como un cuentakilómetros." }
    ]
  },
  {
    "id": "m2-l1.model-type",
    "type": "mcq",
    "concept": "model-type-gap",
    "prompt": "Lean acepta <code class=\"l\">withdraw_le</code>, escrito con <code class=\"l\">Nat</code>. El contrato real es Solidity 0.8 con <code>uint256</code>, que revierte si retiras más de lo que hay. ¿Qué pasa al retirar 5 de un saldo de 3?",
    "code": [
      "def withdraw (balance amount : Nat) : Nat := balance - amount",
      "",
      "theorem withdraw_le (balance amount : Nat) :",
      "    withdraw balance amount ≤ balance := by",
      "  simp [withdraw]"
    ],
    "check": "ok",
    "options": [
      { "t": "El modelo da 0 como si todo fuera bien; el contrato revierte.", "ok": true, "why": "En ese caso límite, modelo y contrato no hacen lo mismo. El teorema está demostrado para el modelo, pero no dice nada de esa diferencia." },
      { "t": "Coinciden: los dos acaban con saldo 0 y nadie pierde nada.", "why": "El contrato no acaba en 0: revierte, la retirada no ocurre. El modelo, en cambio, la da por buena con saldo 0." },
      { "t": "El teorema lo cubre: dice que el saldo nunca crece al retirar.", "why": "El teorema habla del modelo. Que el modelo dé 0 en silencio y el contrato revierta es justo lo que no comprueba." }
    ]
  },
  {
    "id": "m2-l1.boss-rounds",
    "type": "mcq",
    "concept": "types-compound",
    "prompt": "En el jefe aparece <code class=\"l\">rounds : List (R × R × R)</code>. ¿Qué es <code>rounds</code>?",
    "options": [
      { "t": "Una lista de tríos: cada elemento son tres valores de <code class=\"l\">R</code>.", "ok": true, "why": "<code class=\"l\">List</code> es lista, y <code class=\"l\">R × R × R</code> son tres valores de <code class=\"l\">R</code> juntos. Cada ronda del protocolo guarda tres valores." },
      { "t": "Un valor de tipo <code class=\"l\">R</code> multiplicado por sí mismo tres veces.", "why": "Entre tipos, <code class=\"l\">×</code> no multiplica: junta valores en un trío." },
      { "t": "Tres listas distintas, cada una con valores de tipo <code class=\"l\">R</code>.", "why": "Es una sola lista. Lo que tiene tres partes es cada elemento de la lista." }
    ]
  },
  {
    "id": "m2-l1.lab-uint16",
    "type": "mcq",
    "concept": "overflow",
    "prompt": "En el laboratorio cambias <code class=\"l\">UInt8</code> por <code class=\"l\">UInt16</code>. Un <code class=\"l\">UInt16</code> llega hasta 65535. ¿Qué responde Lean?",
    "code": "#eval (255 : UInt16) + 1",
    "check": "ok",
    "options": [
      { "t": "256", "ok": true, "why": "256 cabe de sobra en un <code class=\"l\">UInt16</code>, así que no da la vuelta. Mismo cálculo, otro tipo, otro resultado." },
      { "t": "0", "why": "Eso pasaba con <code class=\"l\">UInt8</code>, cuyo máximo es 255. El de <code class=\"l\">UInt16</code> es 65535." },
      { "t": "Un error en rojo.", "why": "No hay error: el resultado cabe en el tipo." }
    ]
  },
  {
    "id": "m2-l1.lab-tdiv",
    "type": "mcq",
    "concept": "int-division",
    "prompt": "En el laboratorio cambias <code class=\"l\">(-7 : Int) / 2</code> por <code class=\"l\">Int.tdiv (-7) 2</code>. ¿Qué responde Lean?",
    "code": "#eval Int.tdiv (-7) 2",
    "check": "ok",
    "options": [
      { "t": "-3, como Solidity y Rust", "ok": true, "why": "<code class=\"l\">Int.tdiv</code> corta hacia el cero, igual que esos lenguajes." },
      { "t": "-4, como la <code class=\"l\">/</code> de Lean", "why": "La <code class=\"l\">/</code> redondea hacia abajo y da -4. <code class=\"l\">Int.tdiv</code> es justo la otra forma de redondear." },
      { "t": "-3,5, sin redondear", "why": "Con enteros no hay decimales: siempre se redondea a un entero." }
    ]
  }
]
);
