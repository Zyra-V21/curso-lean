/-!
# Laboratorio 1.4: para todo y existe

Cómo usar este archivo:
* Pon el cursor en una línea que empieza por `#eval` o `#check` y mira el
  panel Lean Infoview: ahí aparece lo que responde Lean.
* Antes de mirar, intenta adivinar la respuesta. Luego comprueba.
* Puedes cambiar lo que quieras: Ctrl+Z lo deja como estaba.
-/

-- Paso 1. «Para todo» con un tope: Lean puede comprobarlos uno a uno.
#eval decide (∀ n, n < 5 → n * n < 25)
#eval decide (∀ n, n < 10 → n * n < 50)

-- Paso 2. Aquí el 8 y el 9 son contraejemplos (64 y 81 no son menores que 50).
-- Cambia el 10 por un 8: ¿qué responde Lean ahora?
#eval decide (∀ n, n < 10 → n * n < 50)

-- Paso 3. Un «existe» se demuestra dando un testigo.
-- Cambia el 3 por un 4 y mira qué pasa. Luego Ctrl+Z.
example : ∃ n : Nat, n * n = 9 := by exists 3

-- Paso 4. El orden importa. Lee las dos y compara.
#check ∀ x : Nat, ∃ y : Nat, x < y
#check ∃ y : Nat, ∀ x : Nat, x < y
