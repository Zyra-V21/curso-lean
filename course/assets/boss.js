// The boss: the main soundness theorem of a real WHIR verifier, written by
// AI (abridged doc comments). Every piece is tagged with the lesson that teaches how to read
// it; untaught pieces render fogged. Marker syntax: ⟪code|noteId⟫.
window.BOSS = {
  source: "Whir/Soundness.lean",
  code: `⟪/-- The conditions an accepting run of verifyWhir establishes. -/|doc⟫
⟪structure|struct⟫ ⟪WhirAccept|sname⟫ ⟪(R : Type*) [CommRing R]|generic⟫ ⟪where|struct⟫
  ⟪commitment|fname⟫ ⟪: Commitment|ftype⟫
  ⟪weights|fname⟫ ⟪: R|ftype⟫
  ⟪initialClaim|fname⟫ ⟪: R|ftype⟫
  ⟪rounds|fname⟫ ⟪: List (R × R × R)|ftype⟫
  ⟪finalPoly|fname⟫ ⟪: List R|ftype⟫
  ⟪finalRand|fname⟫ ⟪: List R|ftype⟫
  ⟪hlen :|pname⟫ ⟪finalPoly.length = 2 ^ finalRand.length|eqprop⟫
  ⟪opens :|pname⟫ ⟪OpensTo commitment finalPoly|apply⟫
  ⟪identity :|pname⟫ ⟪verifyIdentity weights (foldRounds initialClaim rounds) finalPoly finalRand|apply⟫

⟪/-- If the sub-verifier accepts then (1) every sum-check round was
consistent, and (2) a unique committed witness exists whose
evaluation equals the reduced claim. -/|doc⟫
⟪theorem|thm⟫ ⟪whir_subverifier_soundness|thmname⟫ ⟪(acc : WhirAccept R)|thmarg⟫ ⟪:|thmcolon⟫
    ⟪RoundsConsistent acc.initialClaim acc.rounds|free⟫
      ⟪∧|and⟫ ⟪∃ witness : List R,|exists⟫
          ⟪OpensTo acc.commitment witness|apply⟫
          ⟪∧|and⟫ (⟪∀ w',|forall⟫ ⟪OpensTo acc.commitment w'|apply⟫ ⟪→|imp⟫ ⟪w' = witness|eqcond⟫)
          ⟪∧|and⟫ ⟪foldRounds acc.initialClaim acc.rounds|apply⟫
              ⟪=|eq⟫ ⟪acc.weights * mleMSB witness acc.finalRand.reverse|apply⟫ ⟪:= by|split⟫
  ⟪refine ⟨|proof⟫⟪rounds_preserve_invariant acc.initialClaim acc.rounds|freeproof⟫⟪,
          acc.finalPoly, acc.opens,
          fun w' hw' =>|proof⟫ ⟪commitment_binding|axiom⟫ ⟪acc.commitment w' acc.finalPoly hw' acc.opens,
          ?_⟩
  obtain ⟨value, hval, hclaim⟩ :=
    final_identity_implies_witness acc.weights (foldRounds acc.initialClaim acc.rounds)
      acc.finalPoly acc.finalRand acc.hlen acc.identity
  rw [hclaim, hval]|proof⟫`,
  notes: {
    split: { lesson: "m0-l1", note: "<code>:= by</code> es la frontera. Lo de antes es lo que se promete (el enunciado): eso lo revisas tú. Lo de después es la demostración: esa la revisa Lean." },
    doc: { lesson: "m0-l2", note: "Un comentario de documentación (<code>/-- ... -/</code>) escrito para humanos. Lean no lo comprueba: si el comentario y el código dicen cosas distintas, manda el código." },
    eq: { lesson: "m1-l1", note: "<code>=</code> es una igualdad: una proposición que afirma que dos cosas son la misma. Puede ser verdad o mentira; aquí, como parte de la conclusión, el teorema afirma que se cumple." },
    eqcond: { lesson: "m1-l1", note: "Una igualdad: afirma que <code>w'</code> y <code>witness</code> son lo mismo. Ojo: el teorema no la afirma suelta. Depende de lo que tiene a su izquierda, y en la lección 1.3 verás exactamente cómo." },
    eqprop: { lesson: "m1-l1", note: "Una igualdad entre números: la longitud de <code>finalPoly</code> es 2 elevado a la longitud de <code>finalRand</code>. Es una proposición: una afirmación que puede ser verdad o mentira." },
    and: { lesson: "m1-l2", note: "<code>∧</code> es «y». El teorema promete varias cosas a la vez, y tienen que cumplirse todas." },
    imp: { lesson: "m1-l3", note: "<code>→</code> es «si... entonces»: si <code>w'</code> también abre el compromiso, entonces <code>w'</code> es el mismo testigo." },
    forall: { lesson: "m1-l4", note: "<code>∀ w',</code> se lee «para todo <code>w'</code>»: lo que sigue vale para cualquier <code>w'</code>, sin excepción." },
    exists: { lesson: "m1-l4", note: "<code>∃ witness : List R,</code> se lee «existe un <code>witness</code> (testigo), que es una lista de elementos de <code>R</code>, tal que...»." },
    ftype: { lesson: "m2-l1", note: "Dos puntos y un tipo: este campo es de tipo <code>R</code>, <code>List R</code> (lista de elementos de <code>R</code>) o <code>Commitment</code> (un compromiso: como un sobre cerrado que fija unos datos sin enseñarlos; en este verificador es una raíz de Merkle)." },
    apply: { lesson: "m2-l2", note: "Una función aplicada a sus argumentos, separados por espacios, sin comas. Por ejemplo <code>OpensTo acc.commitment witness</code> es <code>OpensTo</code> con dos entradas. Para saber qué significa hay que leer la definición de esa función." },
    struct: { lesson: "m2-l4", note: "<code>structure ... where</code> define un registro con campos. <code>WhirAccept</code> agrupa todo lo que el verificador ha comprobado cuando dice que sí." },
    sname: { lesson: "m2-l4", note: "<code>WhirAccept</code> es el nombre del registro. Representa una ejecución en la que el verificador WHIR (el contrato, no Lean) aceptó la prueba criptográfica que le enviaron. Ojo: aquí hay dos verificadores. El contrato verifica pruebas criptográficas; Lean verifica demostraciones matemáticas sobre ese contrato." },
    fname: { lesson: "m2-l4", note: "El nombre de un campo que guarda datos." },
    pname: { lesson: "m2-l4", note: "Un campo que no guarda datos sino una promesa: una proposición que tiene que cumplirse para poder construir un <code>WhirAccept</code>. Son hipótesis escondidas dentro de la estructura." },
    generic: { lesson: "m2-l5", note: "<code>R</code> es un tipo cualquiera con suma y producto que cumplen las reglas de siempre (un anillo conmutativo). Todo esto vale para cualquier <code>R</code> así a la vez." },
    thm: { lesson: "m3-l1", note: "<code>theorem</code> anuncia un teorema. Detrás vienen su nombre, sus argumentos y lo que afirma." },
    thmname: { lesson: "m3-l1", note: "El nombre del teorema. Es solo una etiqueta: el nombre no demuestra nada y puede prometer más de lo que dice el enunciado." },
    thmarg: { lesson: "m3-l1", note: "El único argumento: <code>acc</code>, una ejecución aceptada (de tipo <code>WhirAccept R</code>). Todas las hipótesis del teorema viajan escondidas aquí dentro, en sus campos-promesa." },
    thmcolon: { lesson: "m3-l1", note: "Estos dos puntos separan los argumentos de la conclusión: lo que viene después es lo que el teorema afirma." },
    free: { lesson: "m3-l2", note: "La primera parte de la conclusión. Ojo de auditor: es verdad para cualquier lista de rondas, acepte el verificador o no. No es falsa, pero no te dice nada sobre la aceptación." },
    freeproof: { lesson: "m3-l2", note: "<code>rounds_preserve_invariant</code> demuestra la parte (1) sin usar ninguna hipótesis de <code>acc</code>. Eso confirma que esa parte sale gratis." },
    proof: { lesson: "m4-l1", note: "La demostración. Lean la ha comprobado entera. En el módulo 4 aprenderás a seguirla paso a paso." },
    axiom: { lesson: "m5-l1", note: "<code>commitment_binding</code> es un axioma: algo que se acepta sin demostrar. Dice que nadie puede abrir el mismo compromiso con dos listas distintas. Lo verás en el módulo 5." },
  },
};
