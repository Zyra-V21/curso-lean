window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "m1-l4.counterexample",
    "type": "mcq",
    "concept": "counterexample",
    "prompt": "¿Cuál de estos números es un contraejemplo de esta afirmación?",
    "code": "#eval decide (∀ n, n < 10 → n * n < 50)",
    "check": "ok",
    "options": [
      { "t": "8", "ok": true, "why": "8 es menor que 10 (cumple la hipótesis) y 8 por 8 son 64, que no es menor que 50. Rompe la promesa." },
      { "t": "3", "why": "3 por 3 son 9, menor que 50: el 3 cumple la afirmación, no la rompe." },
      { "t": "12", "why": "12 por 12 son 144, pero 12 no es menor que 10: no cumple la hipótesis. Como viste en la lección anterior, con la hipótesis falsa la promesa no se rompe." }
    ]
  },
  {
    "id": "m1-l4.exists-weaker",
    "type": "mcq",
    "concept": "exists-vs-forall",
    "prompt": "Pediste: «para toda retirada, el saldo no queda negativo». La IA demuestra: «existe una retirada tras la cual el saldo no queda negativo». ¿Qué opinas?",
    "options": [
      { "t": "Promete mucho menos: basta con que una retirada salga bien.", "ok": true, "why": "Un «existe» se demuestra con un solo testigo. Todas las demás retiradas podrían dejar el saldo en negativo." },
      { "t": "Es lo mismo: «existe» y «para toda» son casi sinónimos.", "why": "No: «para toda» exige que se cumpla siempre; «existe una» solo exige un caso." },
      { "t": "Es mejor: un ejemplo concreto vale más que una promesa general.", "why": "Un ejemplo concreto no dice nada de los demás casos. Para un auditor, un «existe» donde pediste un «para todo» es una señal de alarma." }
    ]
  },
  {
    "id": "m1-l4.domain",
    "type": "mcq",
    "concept": "domain",
    "prompt": "¿Es verdad esta proposición?",
    "code": "#check ∀ n : Int, 0 ≤ n",
    "check": "ok",
    "options": [
      { "t": "No. El -1 es un entero y no es mayor o igual que 0: es un contraejemplo.", "ok": true, "why": "Con <code class=\"l\">Int</code> el dominio incluye los negativos, y basta uno para tumbar el «para todo»." },
      { "t": "Sí, igual que con <code class=\"l\">Nat</code>.", "why": "Con <code class=\"l\">Nat</code> sí es verdad, porque los naturales no tienen negativos. Cambiar el dominio cambia la verdad." },
      { "t": "No se puede saber, porque Lean no puede comprobar infinitos números.", "why": "Lean no puede comprobarlos uno a uno con <code class=\"l\">decide</code>, pero tú sí sabes la respuesta: el -1 la tumba." }
    ]
  },
  {
    "id": "m1-l4.order",
    "type": "mcq",
    "concept": "quantifier-order",
    "prompt": "<code class=\"l\">opens p c</code> significa «la contraseña <code>p</code> abre la caja <code>c</code>». ¿Cuál dice «hay una contraseña que abre todas las cajas»?",
    "options": [
      { "t": "<code class=\"l\">∃ p, ∀ c, opens p c</code>", "ok": true, "why": "Primero se elige una contraseña <code>p</code>, y esa misma tiene que abrir cada caja." },
      { "t": "<code class=\"l\">∀ c, ∃ p, opens p c</code>", "why": "Esto dice que cada caja tiene alguna contraseña que la abre, y puede ser distinta para cada caja." },
      { "t": "<code class=\"l\">∀ c, ∀ p, opens p c</code>", "why": "Esto dice que cualquier contraseña abre cualquier caja. Mucho más fuerte, y no es lo pedido." }
    ]
  },
  {
    "id": "m1-l4.negation",
    "type": "mcq",
    "concept": "quantifier-negation",
    "prompt": "¿Qué significa «no todos los contratos están auditados»?",
    "options": [
      { "t": "Hay al menos un contrato sin auditar.", "ok": true, "why": "Negar un «para todo» da «existe uno que no»." },
      { "t": "Ningún contrato está auditado.", "why": "Eso es mucho más fuerte. Puede que casi todos estén auditados y falte uno solo." },
      { "t": "Todos los contratos están sin auditar.", "why": "Es lo mismo que «ninguno está auditado»: demasiado fuerte. Basta con que falte uno." }
    ]
  },
  {
    "id": "m1-l4.boss-unique",
    "type": "mcq",
    "concept": "uniqueness",
    "prompt": "En el jefe, ¿qué garantiza la parte <code class=\"l\">∀ w', OpensTo acc.commitment w' → w' = witness</code>?",
    "options": [
      { "t": "Que el testigo es único: ninguna otra lista abre el compromiso.", "ok": true, "why": "Para todo <code>w'</code> que abra el compromiso, <code>w'</code> es el testigo. Así que solo hay uno." },
      { "t": "Que cualquier lista de valores de R abre el compromiso.", "why": "No dice que todas lo abran. Dice que si alguna lo abre, es el testigo." },
      { "t": "Que existe al menos un testigo que abre el compromiso.", "why": "Eso lo dice la otra pieza, <code class=\"l\">∃ witness</code>. Esta añade que es el único." }
    ]
  },
  {
    "id": "m1-l4.lab-bound",
    "type": "mcq",
    "concept": "counterexample",
    "prompt": "En el laboratorio cambias el 10 por un 8. ¿Qué responde Lean ahora?",
    "code": "#eval decide (∀ n, n < 8 → n * n < 50)",
    "check": "ok",
    "options": [
      { "t": "<code class=\"l\">true</code>: el 8 y el 9 ya no entran, y 7 por 7 son 49.", "ok": true, "why": "Los contraejemplos menores que 10 eran el 8 y el 9 (64 y 81 no son menores que 50). Con el tope en 8, todos los que quedan cumplen." },
      { "t": "<code class=\"l\">false</code>, porque sigue habiendo un contraejemplo.", "why": "Quedan del 0 al 7, y el mayor cuadrado es 49, menor que 50. Los contraejemplos (8 y 9) se han quedado fuera." },
      { "t": "Un error en rojo.", "why": "Sigue habiendo un tope (n &lt; 8), así que <code class=\"l\">decide</code> puede comprobarlo sin problema." }
    ]
  },
  {
    "id": "m1-l4.lab-witness",
    "type": "mcq",
    "concept": "witness",
    "prompt": "En el laboratorio cambias el testigo <code class=\"l\">exists 3</code> por <code class=\"l\">exists 4</code>. ¿Qué pasa?",
    "code": "example : ∃ n : Nat, n * n = 9 := by exists 4",
    "check": "error",
    "error": "unsolved goals",
    "options": [
      { "t": "Error en rojo: 4 por 4 son 16, no 9.", "ok": true, "why": "Lean comprueba el testigo que le das. El 4 no cumple, así que no hay demostración." },
      { "t": "Lean lo acepta: ya sabe que el 3 sí funciona.", "why": "Lean no busca otro testigo por su cuenta: comprueba el que le das, y el 4 falla." },
      { "t": "Un aviso amarillo, pero lo da por bueno.", "why": "No es un aviso: es un error en rojo. La demostración no vale." }
    ]
  }
]
);
