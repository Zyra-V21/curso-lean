/-!
# Laboratorio 3.1: anatomía de un teorema

Aquí no tienes que escribir nada: solo mover el cursor y mirar
el panel Lean Infoview (a la derecha).
-/

-- Paso 1. Pon el cursor al principio de la línea de `omega` (justo antes de la o).
-- En el panel verás arriba `a b : Nat` y `h : a < b`,
-- y abajo, tras `⊢`, lo que falta por demostrar.
theorem le_of_lt_example (a b : Nat) (h : a < b) : a ≤ b := by
  omega

-- Paso 2. Ahora pon el cursor al final de la línea de `omega`, después de la última a.
-- El panel dice `No goals`: no queda nada por demostrar.

-- Paso 3. Este teorema no tiene hipótesis. Pon el cursor antes de `omega`:
-- arriba solo están los datos.
theorem add_comm_example (a b : Nat) : a + b = b + a := by
  omega

-- Paso 4. `#check` enseña el enunciado sin la demostración.
-- Con `@` lo escribe con `∀` y `→`.
#check le_of_lt_example
#check @le_of_lt_example
