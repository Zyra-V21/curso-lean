window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "placement.algebra-solve",
    "type": "mcq",
    "area": "algebra",
    "areaLabel": "Álgebra",
    "lessons": [],
    "prompt": "Si 2x + 3 = 11, ¿cuánto vale x?",
    "options": [
      { "t": "4", "ok": true, "why": "2x = 11 - 3 = 8, así que x = 4." },
      { "t": "7", "why": "7 sale de restar 11 - 3 - 1. Hay que restar 3 y luego dividir entre 2." },
      { "t": "5,5", "why": "Eso es 11 / 2: falta restar el 3 antes de dividir." }
    ]
  },
  {
    "id": "placement.proposition",
    "type": "mcq",
    "area": "propositions",
    "areaLabel": "Proposiciones",
    "lessons": ["m1-l1"],
    "prompt": "¿Cuál de estas frases es verdadera o falsa (y no otra cosa)?",
    "options": [
      { "t": "7 es mayor que 10.", "ok": true, "why": "Es falsa, pero es una afirmación: se puede decir si es verdad o mentira." },
      { "t": "¿Qué hora es?", "why": "Es una pregunta: no es ni verdadera ni falsa." },
      { "t": "Cierra la puerta.", "why": "Es una orden: no tiene sentido decir que es verdadera o falsa." }
    ]
  },
  {
    "id": "placement.and",
    "type": "mcq",
    "area": "and-or-not",
    "areaLabel": "Y, o, no",
    "lessons": ["m1-l2"],
    "prompt": "«Hace sol y es lunes». Hoy hace sol pero es martes. ¿La frase es verdadera?",
    "options": [
      { "t": "No: con «y» deben cumplirse las dos.", "ok": true, "why": "Falla una de las dos partes, así que la frase entera es falsa." },
      { "t": "Sí: con que una se cumpla, basta.", "why": "Eso valdría para «o», no para «y»." },
      { "t": "No se puede saber sin más datos.", "why": "Sabemos todo lo necesario: hace sol (V) y no es lunes (F)." }
    ]
  },
  {
    "id": "placement.or-inclusive",
    "type": "mcq",
    "area": "and-or-not",
    "areaLabel": "Y, o, no",
    "lessons": ["m1-l2"],
    "prompt": "En matemáticas, «llevo paraguas o llevo abrigo». Si llevas las dos cosas, ¿la frase es verdadera?",
    "options": [
      { "t": "Sí: el «o» de las matemáticas incluye el caso de las dos.", "ok": true, "why": "El «o» lógico significa «al menos una». Con las dos se cumple." },
      { "t": "No: «o» significa una u otra, pero no las dos.", "why": "Ese es el «o» de la vida diaria («¿café o té?»). En lógica el «o» admite las dos." },
      { "t": "Depende del tiempo que haga.", "why": "Solo importa qué llevas, no el tiempo." }
    ]
  },
  {
    "id": "placement.implication-converse",
    "type": "mcq",
    "area": "implication",
    "areaLabel": "Si... entonces",
    "lessons": ["m1-l3"],
    "prompt": "Es verdad que «si llueve, el suelo se moja». Hoy el suelo está mojado. ¿Puedes asegurar que ha llovido?",
    "options": [
      { "t": "No: el suelo puede estar mojado por otra razón.", "ok": true, "why": "«Si A entonces B» no dice nada de «si B entonces A». Alguien pudo regar." },
      { "t": "Sí: si el suelo está mojado es que ha llovido.", "why": "Eso es darle la vuelta a la frase, y es otra afirmación distinta." },
      { "t": "Sí, siempre que sea de día.", "why": "La hora no cambia nada: la frase solo habla de qué pasa cuando llueve." }
    ]
  },
  {
    "id": "placement.implication-vacuous",
    "type": "mcq",
    "area": "implication",
    "areaLabel": "Si... entonces",
    "lessons": ["m1-l3"],
    "prompt": "En lógica, la frase «si 2 + 2 = 5, entonces la Luna es de queso», ¿es verdadera o falsa?",
    "options": [
      { "t": "Verdadera.", "ok": true, "why": "Un «si... entonces» solo es falso cuando la primera parte se cumple y la segunda no. Aquí la primera parte nunca se cumple." },
      { "t": "Falsa, porque la Luna no es de queso.", "why": "Es lo que dice la intuición, y por eso esta pregunta es importante: la lógica funciona distinto, lo verás en 1.3." },
      { "t": "No es una proposición.", "why": "Sí lo es: es una afirmación que la lógica clasifica como verdadera o falsa." }
    ]
  },
  {
    "id": "placement.forall-negation",
    "type": "mcq",
    "area": "quantifiers",
    "areaLabel": "Para todo y existe",
    "lessons": ["m1-l4"],
    "prompt": "¿Qué significa exactamente «no es verdad que todos los gatos sean negros»?",
    "options": [
      { "t": "Que al menos un gato no es negro.", "ok": true, "why": "Para romper un «todos» basta un caso que no cumpla." },
      { "t": "Que ningún gato es negro.", "why": "Eso es mucho más fuerte. Basta con que uno no sea negro." },
      { "t": "Que todos los gatos son blancos.", "why": "Ni siquiera hace falta que haya gatos blancos: solo uno que no sea negro." }
    ]
  },
  {
    "id": "placement.quantifier-order",
    "type": "mcq",
    "area": "quantifiers",
    "areaLabel": "Para todo y existe",
    "lessons": ["m1-l4"],
    "prompt": "¿Cuál de estas dos frases sobre números naturales (0, 1, 2...) es verdadera? A: «para cada número existe otro mayor». B: «existe un número mayor que todos».",
    "options": [
      { "t": "Solo A.", "ok": true, "why": "A cada número le sigue uno mayor (sumando 1), pero no hay un número que sea el mayor de todos." },
      { "t": "Solo B.", "why": "Si existiera ese número, sumándole 1 tendrías uno mayor todavía." },
      { "t": "Las dos dicen lo mismo.", "why": "Usan las mismas palabras en distinto orden, y el orden lo cambia todo." }
    ]
  },
  {
    "id": "placement.function-eval",
    "type": "mcq",
    "area": "functions",
    "areaLabel": "Funciones",
    "lessons": ["m2-l2"],
    "prompt": "Si f(x) = 2x + 1, ¿cuánto vale f(3)?",
    "options": [
      { "t": "7", "ok": true, "why": "Sustituyes x por 3: 2 · 3 + 1 = 7." },
      { "t": "9", "why": "Eso sería 2 · (3 + 1) + 1. Primero se multiplica, luego se suma." },
      { "t": "6", "why": "Te falta sumar el 1." }
    ]
  },
  {
    "id": "placement.read-rule",
    "type": "mcq",
    "area": "reading-rules",
    "areaLabel": "Leer reglas por casos",
    "lessons": ["m2-l3"],
    "prompt": "Regla de una comisión: «si la cantidad es menor que 100, la comisión es 1; si no, es la cantidad dividida entre 100». ¿Qué comisión paga una cantidad de 500?",
    "options": [
      { "t": "5", "ok": true, "why": "500 no es menor que 100, así que se usa la segunda parte: 500 / 100 = 5." },
      { "t": "1", "why": "El 1 es solo para cantidades menores que 100." },
      { "t": "6", "why": "No se suman las dos partes: se usa una u otra." }
    ]
  },
  {
    "id": "placement.integer-division",
    "type": "mcq",
    "area": "integer-division",
    "areaLabel": "División entera",
    "lessons": ["m2-l1"],
    "prompt": "Repartes 7 monedas entre 2 personas y no puedes partir monedas. ¿Cuántas recibe cada una?",
    "options": [
      { "t": "3", "ok": true, "why": "Es la división entera: 7 entre 2 da 3 y sobra 1. Lean divide así los números naturales." },
      { "t": "3,5", "why": "Eso sería partiendo monedas. Sin decimales, el resultado es 3." },
      { "t": "4", "why": "Con 4 cada una necesitarías 8 monedas." }
    ]
  }
]
);
