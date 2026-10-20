/-!
# Laboratorio 1.2: y, o, no

Pon el cursor en cada línea con `#eval` y mira el panel Lean Infoview.
Antes de mirar, intenta adivinar si saldrá `true` o `false`.
Ctrl+Z deshace cualquier cambio.
-/

-- Paso 1. ∧ necesita las dos; ∨ se conforma con una.
#eval decide (2 < 3 ∧ 3 < 4)
#eval decide (2 < 3 ∧ 4 < 3)
#eval decide (2 < 3 ∨ 4 < 3)
#eval decide (4 < 3 ∨ 5 < 3)

-- Paso 2. «A o no A». Te lo preguntan en la lección.
#eval decide (5 < 3 ∨ ¬ (5 < 3))

-- Paso 3. La misma frase sin y con paréntesis. ¿Qué niega el ¬ en cada una?
#eval decide (¬ 3 = 4 ∧ 3 = 4)
#eval decide (¬ (3 = 4 ∧ 3 = 4))

-- Paso 4. De Morgan: negar un «o» da un «y» de negaciones.
-- Las dos líneas deberían responder lo mismo.
#eval decide (¬ (2 < 3 ∨ 4 < 3))
#eval decide (¬ (2 < 3) ∧ ¬ (4 < 3))

-- Paso 5. Experimenta: en el paso 1, cambia un ∧ por ∨ (o al revés) y mira
-- qué cambia. Para escribir ∧ teclea \and y un espacio; para ∨, \or; para ¬, \not.
-- Luego Ctrl+Z.
