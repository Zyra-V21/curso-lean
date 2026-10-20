window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "m0-l1.checker-rejects",
    "type": "mcq",
    "concept": "lean-checks-proofs",
    "prompt": "La IA te entrega una demostración larguísima con un paso mal en mitad. ¿Qué hace Lean?",
    "options": [
      { "t": "La rechaza y marca el paso que falla.", "ok": true, "why": "Lean revisa cada paso. Basta uno incorrecto para que no la acepte." },
      { "t": "La acepta, porque casi todos los pasos están bien.", "why": "No existe el «casi». Un paso mal y la demostración no vale." },
      { "t": "Te pregunta si te fías de la IA.", "why": "Lean no pregunta ni confía: comprueba. Por eso es útil." }
    ]
  },
  {
    "id": "m0-l1.what-was-proved",
    "type": "mcq",
    "concept": "statement-vs-intent",
    "prompt": "Lean ha aceptado <code class=\"l\">fee_ok</code> sin errores. ¿Qué sabes ahora con seguridad?",
    "code": "theorem fee_ok : 100 ≤ 100 := by decide",
    "check": "ok",
    "options": [
      { "t": "Que 100 es menor o igual que 100. Nada más.", "ok": true, "why": "Lean garantiza exactamente el enunciado escrito. Y el enunciado no habla de ninguna comisión." },
      { "t": "Que la comisión del contrato nunca pasa de 100.", "why": "Eso es lo que pediste, pero no lo que se escribió. El enunciado ni menciona la comisión." },
      { "t": "Que el código del contrato no tiene errores.", "why": "Lean no ha mirado tu contrato. Solo ha comprobado que 100 ≤ 100." }
    ]
  },
  {
    "id": "m0-l1.which-question",
    "type": "mcq",
    "concept": "three-audit-questions",
    "prompt": "En el ejemplo de <code class=\"l\">fee</code> que siempre devuelve 0, el enunciado suena bien y Lean lo acepta. ¿Cuál de tus tres preguntas de auditor destapa el problema?",
    "options": [
      { "t": "Las definiciones: ¿significa <code class=\"l\">fee</code> lo que creo?", "ok": true, "why": "El enunciado está bien escrito, pero usa una definición que no es la comisión real." },
      { "t": "El enunciado: ¿dice lo que quería?", "why": "El enunciado sí dice lo que querías (comisión ≤ 100). El fallo está en lo que significa <code class=\"l\">fee</code>." },
      { "t": "Ninguna: si Lean lo acepta, está bien.", "why": "Lean acepta lo que está escrito. Que <code class=\"l\">fee</code> sea un cero disfrazado no es asunto suyo: es tuyo." }
    ]
  },
  {
    "id": "m0-l1.sorry-not-proved",
    "type": "mcq",
    "concept": "sorry",
    "prompt": "Abres un archivo y ves un aviso amarillo: <code>declaration uses `sorry`</code>. ¿Ese teorema está demostrado?",
    "code": "theorem big_claim : 2 + 2 = 5 := by sorry",
    "check": "sorry",
    "options": [
      { "t": "No: hay un hueco sin demostrar.", "ok": true, "why": "<code class=\"l\">sorry</code> significa «confía en mí». Con eso se puede «demostrar» hasta que 2 + 2 = 5." },
      { "t": "Sí, porque sale en amarillo y no en rojo.", "why": "Amarillo no es «está bien». Es «aquí falta algo». Un auditor nunca da por bueno un sorry." },
      { "t": "Sí, si el resto del archivo está limpio.", "why": "Un solo sorry basta para que lo que depende de él no esté demostrado." }
    ]
  },
  {
    "id": "m0-l1.boss-border",
    "type": "mcq",
    "concept": "statement-vs-proof",
    "prompt": "En un teorema escrito por la IA, ¿qué parte tiene que leer primero el auditor?",
    "options": [
      { "t": "Lo que va antes de <code class=\"l\">:= by</code>: lo que se promete.", "ok": true, "why": "La demostración ya la comprueba Lean. Lo que nadie más que tú puede revisar es qué se promete. Después, en la demostración, solo buscarás sorry y axiomas (módulo 5)." },
      { "t": "Lo que va después de <code class=\"l\">:= by</code>: la demostración.", "why": "Lean ya revisa cada paso de esa parte. Ahí abajo solo te tocará buscar sorry y axiomas (lo verás en el módulo 5), pero lo primero es saber qué se promete." },
      { "t": "Los comentarios, porque explican qué hace.", "why": "Los comentarios los escribe la IA y Lean no los comprueba. Pueden prometer más de lo que el código dice." }
    ]
  },
  {
    "id": "m0-l1.your-job",
    "type": "mcq",
    "concept": "role-split",
    "prompt": "¿Qué parte del trabajo no puede hacer Lean por ti?",
    "options": [
      { "t": "Decidir si el enunciado es lo que de verdad querías demostrar.", "ok": true, "why": "Exacto. Lean no sabe qué querías: solo comprueba lo que está escrito." },
      { "t": "Comprobar que cada paso de la demostración es correcto.", "why": "Eso es justo lo que Lean hace, y sin cansarse." },
      { "t": "Detectar un paso incorrecto en mitad de una demostración larga.", "why": "Lean lo detecta siempre. Es su trabajo." }
    ]
  }
]
);
