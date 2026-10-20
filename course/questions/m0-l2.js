window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "m0-l2.infoview-role",
    "type": "mcq",
    "concept": "infoview",
    "prompt": "¿Para qué sirve el panel Lean Infoview, el de la derecha?",
    "options": [
      { "t": "Es donde Lean te contesta sobre la línea del cursor.", "ok": true, "why": "Resultados, errores, avisos y, más adelante, lo que falta por demostrar: todo sale ahí." },
      { "t": "Es una vista previa del código, en grande y con colores.", "why": "No repite el código: muestra lo que Lean dice de él." },
      { "t": "Es donde la IA de VS Code te explica el código que escribe.", "why": "La IA no escribe en el panel. Lo que ves ahí lo produce Lean al comprobar el archivo." }
    ]
  },
  {
    "id": "m0-l2.eval-result",
    "type": "mcq",
    "concept": "eval",
    "prompt": "¿Qué te contesta Lean en el panel con el cursor en esta línea?",
    "code": "#eval 3 * 4",
    "check": "ok",
    "options": [
      { "t": "<code>12</code>", "ok": true, "why": "<code class=\"l\">#eval</code> calcula: 3 por 4 son 12." },
      { "t": "<code>3 * 4 : Nat</code>", "why": "Eso sería la respuesta de <code class=\"l\">#check</code>, que da el tipo en vez del resultado." },
      { "t": "Nada: <code class=\"l\">#eval</code> solo comprueba que no haya errores.", "why": "<code class=\"l\">#eval</code> siempre contesta con el resultado del cálculo." }
    ]
  },
  {
    "id": "m0-l2.check-what",
    "type": "mcq",
    "concept": "check",
    "prompt": "Lean responde <code>\"hola\" : String</code>. ¿Qué te está diciendo?",
    "code": "#check \"hola\"  --> \"hola\" : String",
    "check": "ok",
    "options": [
      { "t": "Que <code>\"hola\"</code> es un texto (su tipo es <code>String</code>).", "ok": true, "why": "<code class=\"l\">#check</code> te dice qué clase de cosa es: aquí, texto." },
      { "t": "Que ha calculado <code>\"hola\"</code> y el resultado es <code>String</code>.", "why": "<code class=\"l\">#check</code> no calcula. Lo que va tras los dos puntos es el tipo." },
      { "t": "Que hay un error, porque los textos no se pueden comprobar.", "why": "No hay error: la respuesta sale en azul, es información." }
    ]
  },
  {
    "id": "m0-l2.yellow-squiggle",
    "type": "mcq",
    "concept": "sorry",
    "prompt": "Abres un archivo de la IA: nada en rojo, pero hay una línea ondulada amarilla bajo el nombre de un teorema. ¿Qué haces?",
    "options": [
      { "t": "Leo el aviso: si es de <code class=\"l\">sorry</code>, ese teorema no está demostrado.", "ok": true, "why": "Amarillo es aviso, y el aviso de sorry es justo el que un auditor no puede dejar pasar." },
      { "t": "Nada: si no hay nada en rojo, el archivo está demostrado entero.", "why": "Un sorry compila sin rojo. Por eso el amarillo es tan peligroso: parece que todo va bien." },
      { "t": "Lo ignoro: el amarillo son sugerencias de estilo, como las de un corrector.", "why": "Algunos avisos son de estilo, pero el de sorry significa que falta la demostración. Siempre hay que leerlo." }
    ]
  },
  {
    "id": "m0-l2.comment-vs-code",
    "type": "mcq",
    "concept": "comments-unchecked",
    "prompt": "El comentario dice que el resultado es 5, pero Lean responde 4. ¿A quién crees?",
    "code": ["-- this gives 5", "#eval 2 + 2  --> 4"],
    "check": "ok",
    "options": [
      { "t": "A Lean: el comentario es texto para humanos y nadie lo comprueba.", "ok": true, "why": "Lean ignora los comentarios. Lo que calcula y comprueba es el código." },
      { "t": "Al comentario: lo ha escrito alguien que sabe lo que hace.", "why": "El comentario puede estar desactualizado o equivocado, y Lean no lo revisa nunca." },
      { "t": "A ninguno: si no coinciden, Lean marcaría un error.", "why": "Lean no compara comentarios con código. Pueden contradecirse sin ningún aviso." }
    ]
  },
  {
    "id": "m0-l2.boss-doc",
    "type": "mcq",
    "concept": "comments-unchecked",
    "prompt": "El comentario de documentación del jefe dice que existe un testigo único. ¿Está eso garantizado por estar escrito en el comentario?",
    "options": [
      { "t": "No. Lo garantizado es el enunciado del teorema; el comentario solo lo describe.", "ok": true, "why": "El comentario puede prometer más o menos que el código. Por eso el auditor lee el enunciado." },
      { "t": "Sí, porque está dentro de un archivo que compila sin errores.", "why": "Compilar sin errores no dice nada de los comentarios: Lean ni los mira." },
      { "t": "Sí, porque los comentarios de documentación (<code class=\"l\">/-- -/</code>) sí se comprueban.", "why": "Ningún comentario se comprueba, tampoco los de documentación." }
    ]
  },
  {
    "id": "m0-l2.lab-eval",
    "type": "mcq",
    "concept": "eval",
    "prompt": "En el laboratorio, ¿qué responde Lean en el panel con el cursor en la línea <code class=\"l\">#eval 17 * 3</code>?",
    "code": "#eval 17 * 3",
    "check": "ok",
    "options": [
      { "t": "<code>51</code>", "ok": true, "why": "17 por 3 son 51, y eso es lo que muestra el panel." },
      { "t": "<code>17 * 3 : Nat</code>", "why": "Eso lo diría <code class=\"l\">#check</code>, no <code class=\"l\">#eval</code>." },
      { "t": "Un error en rojo.", "why": "La línea es correcta: Lean contesta en azul con el resultado." }
    ]
  },
  {
    "id": "m0-l2.lab-red",
    "type": "mcq",
    "concept": "error-colours",
    "prompt": "En el laboratorio cambias el 4 por un 5 en <code class=\"l\">two_plus_two</code>. ¿Qué pasa?",
    "code": "theorem two_plus_two : 2 + 2 = 5 := by decide",
    "check": "error",
    "error": "is false",
    "options": [
      { "t": "Sale rojo: Lean rechaza la demostración.", "ok": true, "why": "Rojo es error. El mensaje dice que <code class=\"l\">decide</code> ha comprobado que es falso." },
      { "t": "Sale amarillo: Lean avisa, pero lo deja pasar como con un sorry.", "why": "Aquí no hay ningún hueco: hay una demostración que falla, y eso es rojo." },
      { "t": "No pasa nada hasta que guardas el archivo con Ctrl+S.", "why": "Lean comprueba mientras escribes; el rojo aparece en cuanto cambias el número." }
    ]
  }
]
);
