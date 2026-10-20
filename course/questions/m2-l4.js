window.QUESTIONS = (window.QUESTIONS || []).concat(
[
  {
    "id": "m2-l4.field-access",
    "type": "mcq",
    "concept": "structure-fields",
    "prompt": "Con la <code class=\"l\">structure Account</code> de arriba, ¿qué responde Lean a la última línea?",
    "code": ["def bob : Account := { owner := \"bob\", balance := 3 }", "#eval bob.owner"],
    "uses": ["account"],
    "check": "ok",
    "options": [
      { "t": "\"bob\"", "ok": true, "why": "<code class=\"l\">bob.owner</code> es el campo <code class=\"l\">owner</code> de <code class=\"l\">bob</code>, y se rellenó con \"bob\"." },
      { "t": "3", "why": "3 es el <code class=\"l\">balance</code>. El punto elige el campo por su nombre: aquí, <code class=\"l\">owner</code>." },
      { "t": "\"owner\"", "why": "<code class=\"l\">owner</code> es el nombre de la casilla, no lo que guarda dentro." },
      { "t": "Un error: no se puede leer un campo con un punto.", "why": "El punto es justo la forma de leer un campo." }
    ]
  },
  {
    "id": "m2-l4.anon-order",
    "type": "mcq",
    "concept": "anonymous-constructor",
    "prompt": "Mira esta estructura. ¿Qué es el 2 en <code class=\"l\">⟨100, 2⟩</code>?",
    "code": ["structure Transfer where", "  amount : Nat", "  fee : Nat", "", "def t : Transfer := ⟨100, 2⟩"],
    "check": "ok",
    "options": [
      { "t": "La comisión, <code class=\"l\">fee</code>: es el segundo campo declarado.", "ok": true, "why": "<code class=\"l\">⟨ ⟩</code> rellena los campos en el orden de la <code class=\"l\">structure</code>: primero <code class=\"l\">amount</code>, luego <code class=\"l\">fee</code>." },
      { "t": "La cantidad, <code class=\"l\">amount</code>.", "why": "La cantidad es el primer campo, así que es el 100." },
      { "t": "Nada: Lean ignora el segundo número.", "why": "Cada número rellena un campo. Ninguno se ignora." },
      { "t": "Depende: Lean adivina qué campo es por el tamaño del número.", "why": "Lean no adivina: usa el orden de declaración. Por eso hay que mirar la <code class=\"l\">structure</code>." }
    ]
  },
  {
    "id": "m2-l4.promise-meaning",
    "type": "mcq",
    "concept": "prop-fields",
    "prompt": "Un teorema recibe <code class=\"l\">(p : PositiveAmount)</code>. ¿Qué sabe con seguridad sobre <code class=\"l\">p.value</code>?",
    "options": [
      { "t": "Que es mayor que 0: lo garantiza el campo <code class=\"l\">pos</code>.", "ok": true, "why": "No se puede construir un <code class=\"l\">PositiveAmount</code> sin demostrar <code class=\"l\">0 &lt; value</code>. Quien tenga uno, tiene esa garantía." },
      { "t": "Nada: solo que es un <code class=\"l\">Nat</code>.", "why": "Sabe más: el campo <code class=\"l\">pos</code> es una demostración de que <code class=\"l\">value</code> es mayor que 0." },
      { "t": "Que vale exactamente 5.", "why": "5 era un ejemplo. La promesa solo dice «mayor que 0»." },
      { "t": "Que es mayor que 0 solo si alguien lo comprueba más tarde.", "why": "La comprobación ya se hizo al construir el valor. Sin ella, Lean no habría dejado crearlo." }
    ]
  },
  {
    "id": "m2-l4.who-guarantees",
    "type": "mcq",
    "concept": "hidden-hypotheses",
    "prompt": "Lean ha aceptado <code class=\"l\">withdraw_add</code>. Pero el contrato real resta sin comprobar que la cantidad no pase del saldo. ¿Qué te dice el teorema sobre una retirada de 8 con saldo 5 en ese contrato?",
    "options": [
      { "t": "Nada: ese caso no cumple la promesa <code class=\"l\">enough</code>, así que el teorema no habla de él.", "ok": true, "why": "El teorema solo cubre valores de tipo <code class=\"l\">ValidTransfer</code>. Una retirada de 8 con saldo 5 no se puede ni construir como <code class=\"l\">ValidTransfer</code>." },
      { "t": "Que todo está bien, porque Lean lo ha comprobado.", "why": "Lean comprobó el teorema, que da por supuesta la promesa. Si el contrato no la cumple, el teorema no lo protege." },
      { "t": "Que el saldo final será 5, como dice el teorema.", "why": "El teorema solo vale con la promesa. Sin ella, la cuenta en <code class=\"l\">Nat</code> da 8, no 5." },
      { "t": "Que el contrato tiene un error, porque el teorema lo detecta.", "why": "El teorema no mira el contrato. Detectar ese hueco es tu trabajo, no el de Lean." }
    ]
  },
  {
    "id": "m2-l4.inductive-missing",
    "type": "mcq",
    "concept": "inductive-exhaustive",
    "prompt": "La IA escribe esta función sobre <code class=\"l\">Status</code>. ¿Qué hace Lean?",
    "code": ["def isFinal : Status → Bool", "  | Status.pending => false", "  | Status.accepted => true"],
    "uses": ["status-type"],
    "check": "error",
    "error": "Missing cases",
    "options": [
      { "t": "Da un error en rojo: falta el caso <code class=\"l\">rejected</code>.", "ok": true, "why": "Con <code class=\"l\">inductive</code> las opciones son cerradas, y Lean exige que el <code class=\"l\">match</code> las cubra todas. El mensaje es <code>Missing cases</code>." },
      { "t": "La acepta: si llega un <code class=\"l\">rejected</code>, devuelve <code class=\"l\">false</code>.", "why": "Lean no se inventa casos. Si falta uno, la definición no se acepta." },
      { "t": "La acepta con un aviso amarillo.", "why": "No es un aviso: es un error. Un caso olvidado no pasa." }
    ]
  },
  {
    "id": "m2-l4.boss-promises",
    "type": "mcq",
    "concept": "prop-fields",
    "prompt": "En <code class=\"l\">WhirAccept</code>, ¿qué campos son promesas (su tipo es una proposición) y no datos?",
    "options": [
      { "t": "<code class=\"l\">hlen</code>, <code class=\"l\">opens</code> e <code class=\"l\">identity</code>.", "ok": true, "why": "Sus tipos son afirmaciones: una igualdad, «el compromiso se abre con esta lista» y «la comprobación final pasó». Son las hipótesis del teorema." },
      { "t": "<code class=\"l\">commitment</code>, <code class=\"l\">weights</code> e <code class=\"l\">initialClaim</code>.", "why": "Esos guardan datos: un compromiso y valores de tipo <code class=\"l\">R</code>." },
      { "t": "Todos los campos.", "why": "Los seis primeros son datos (de tipo <code class=\"l\">R</code>, <code class=\"l\">List R</code>, <code class=\"l\">Commitment</code>...). Solo los tres últimos son promesas." },
      { "t": "Ninguno: una estructura solo guarda datos.", "why": "Una estructura puede guardar demostraciones, como <code class=\"l\">pos</code> en <code class=\"l\">PositiveAmount</code>." }
    ]
  },
  {
    "id": "m2-l4.lab-zero",
    "type": "mcq",
    "concept": "prop-fields",
    "prompt": "En el laboratorio, al cambiar <code class=\"l\">⟨5, by decide⟩</code> por <code class=\"l\">⟨0, by decide⟩</code>, ¿qué te dijo Lean?",
    "options": [
      { "t": "Error en rojo: <code class=\"l\">0 &lt; 0</code> es falso.", "ok": true, "why": "La promesa no se puede cumplir con 0, así que Lean no deja construir el valor. (El <code class=\"l\">#eval</code> de abajo también se pone en rojo porque Lean no calcula con una definición rota.)" },
      { "t": "Nada: lo aceptó y <code class=\"l\">five.value</code> pasó a valer 0.", "why": "Si lo aceptara, la promesa no valdría nada. Lean exige la demostración, y con 0 no existe." },
      { "t": "Un aviso amarillo, pero dejó pasar la definición.", "why": "No es un aviso: es un error en rojo, y la definición no se acepta." },
      { "t": "Lo arregló solo: <code class=\"l\">value</code> pasó a valer 1.", "why": "Lean nunca cambia tus datos para que encajen: se niega y te dice por qué." }
    ]
  }
]
);
