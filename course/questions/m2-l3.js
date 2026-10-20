window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "m2-l3.if-fee",
    "type": "mcq",
    "concept": "if-then-else",
    "prompt": "Con esta definición, ¿qué devuelve <code class=\"l\">fee 199</code>?",
    "code": ["def fee (amount : Nat) : Nat :=", "  if amount < 100 then 1 else amount / 100"],
    "check": "ok",
    "options": [
      { "t": "1", "ok": true, "why": "199 no es menor que 100, así que va por el <code class=\"l\">else</code>: 199 / 100 = 1, porque en <code class=\"l\">Nat</code> la división redondea hacia abajo." },
      { "t": "2", "why": "La división de <code class=\"l\">Nat</code> no redondea al más cercano: corta hacia abajo. 199 / 100 = 1." },
      { "t": "1,99", "why": "Un <code class=\"l\">Nat</code> no tiene decimales." }
    ]
  },
  {
    "id": "m2-l3.match-any",
    "type": "mcq",
    "concept": "match",
    "prompt": "Con la función <code class=\"l\">describe</code> de arriba, ¿qué devuelve <code class=\"l\">describe 2</code>?",
    "options": [
      { "t": "\"many\"", "ok": true, "why": "2 no encaja con el caso 0 ni con el caso 1, así que cae en <code class=\"l\">_</code>, «cualquier otra cosa»." },
      { "t": "\"two\"", "why": "No hay ningún caso que devuelva \"two\". La función solo puede devolver lo que está escrito en sus casos." },
      { "t": "Un error, porque no hay caso para el 2.", "why": "Sí lo hay: <code class=\"l\">_</code> recoge todo lo que no encajó antes." }
    ]
  },
  {
    "id": "m2-l3.sumto-four",
    "type": "mcq",
    "concept": "recursion-unfolding",
    "prompt": "Desenrolla a mano: ¿qué devuelve <code class=\"l\">sumTo 4</code>?",
    "options": [
      { "t": "10", "ok": true, "why": "4 + sumTo 3 = 4 + 6 = 10. O, desenrollado del todo, 4 + 3 + 2 + 1 + 0." },
      { "t": "6", "why": "Eso es <code class=\"l\">sumTo 3</code>. A <code class=\"l\">sumTo 4</code> le falta sumar el 4." },
      { "t": "4", "why": "La función no devuelve la entrada: suma todos los números desde 1 hasta ella." },
      { "t": "24", "why": "Eso sería multiplicar (4 · 3 · 2 · 1). El cuerpo suma." }
    ]
  },
  {
    "id": "m2-l3.count-spot",
    "type": "spot",
    "concept": "base-case",
    "prompt": "Esta función debería contar cuántos elementos tiene una lista. ¿Qué línea tiene el error?",
    "code": ["def count : List Nat → Nat", "  | [] => 1", "  | x :: xs => 1 + count xs"],
    "answer": [2],
    "why": "Una lista vacía tiene 0 elementos, no 1. Con ese caso base, <code class=\"l\">count</code> siempre cuenta uno de más: <code class=\"l\">count [7]</code> daría 2. Lean lo acepta igual, porque es una definición válida.",
    "check": "skip"
  },
  {
    "id": "m2-l3.partial-meaning",
    "type": "mcq",
    "concept": "partial-def",
    "prompt": "Ves <code class=\"l\">partial def</code> en una función que aparece en un teorema importante. ¿Qué significa para ti como auditor?",
    "options": [
      { "t": "Una caja negra: Lean no comprobó que termine ni puede razonar sobre ella.", "ok": true, "why": "Lean puede calcular con ella, pero no demostrar cosas sobre su contenido. Un teorema sobre ella probablemente dice poco: toca preguntar por qué no se demostró que termina." },
      { "t": "Que tiene un error: Lean la ha rechazado y no se puede usar.", "why": "Al contrario: <code class=\"l\">partial</code> hace que Lean la acepte sin comprobar que termina." },
      { "t": "Que con ella se puede demostrar cualquier cosa, como con <code class=\"l\">sorry</code>.", "why": "No: <code class=\"l\">partial</code> no permite demostrar cosas falsas. Lo que hace es dejar la función cerrada, sin que Lean pueda mirar dentro." },
      { "t": "Nada importante: es una forma más corta de escribir <code class=\"l\">def</code>.", "why": "Cambia mucho: sin la comprobación de que termina, Lean no puede desenrollar la función en una demostración." }
    ]
  },
  {
    "id": "m2-l3.boss-empty",
    "type": "mcq",
    "concept": "base-case",
    "prompt": "Según esta definición, ¿qué es <code class=\"l\">RoundsConsistent claim []</code>, con la lista de rondas vacía?",
    "options": [
      { "t": "<code class=\"l\">True</code>: con cero rondas se cumple sin comprobar nada.", "ok": true, "why": "Es el caso base: <code class=\"l\">| [] => True</code>. Una lista vacía de rondas es consistente sin más." },
      { "t": "<code class=\"l\">False</code>: si no hay rondas, no hay nada que sea consistente.", "why": "Mira el caso <code class=\"l\">[]</code>: devuelve <code class=\"l\">True</code>, no <code class=\"l\">False</code>." },
      { "t": "Un error: la función no acepta listas vacías.", "why": "Sí las acepta: el primer caso es justo para la lista vacía." },
      { "t": "0", "why": "Esta función devuelve una proposición (<code class=\"l\">Prop</code>), no un número." }
    ]
  },
  {
    "id": "m2-l3.lab-base",
    "type": "mcq",
    "concept": "base-case",
    "prompt": "En el laboratorio cambiaste el caso base de <code class=\"l\">total</code> de 0 a 1. ¿Qué pasó con <code class=\"l\">#eval total [1, 2, 3, 4]</code>?",
    "options": [
      { "t": "Dio 11 en vez de 10, sin ningún error en rojo.", "ok": true, "why": "Ese 1 se suma al final de todo. Lean no ve nada raro: la definición sigue siendo válida, solo que ya no es la suma." },
      { "t": "Lean marcó un error en rojo.", "why": "No hay error: Lean solo comprueba que la definición tenga sentido, no que haga lo que querías." },
      { "t": "Siguió dando 10.", "why": "El caso base se usa siempre, al final del desenrollado, así que el resultado cambia." },
      { "t": "Dio 14, porque suma 1 por cada elemento.", "why": "El caso base solo se usa una vez, cuando la lista ya está vacía. Suma 1 en total, no uno por elemento." }
    ]
  }
]
);
