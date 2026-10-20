/-!
# Laboratorio T1: dividir con resto

Ve paso a paso. Las respuestas salen al final de cada línea y en el panel
de la derecha cuando pones el cursor encima.
-/

-- Paso 1. Cociente y resto de 100 entre 7. ¿Cuadra con la lección?
#eval 100 / 7
#eval 100 % 7

-- Paso 2. Un año normal tiene 365 días. ¿Cuántas semanas completas son,
-- y cuántos días sobran? Apunta el resto: te lo preguntan en la lección.
#eval 365 / 7
#eval 365 % 7

-- Paso 3. Cambia el 100 por los días que quieras y mira cuánto sobra.
#eval 100 % 7

-- Paso 4. Este teorema está demostrado: decide hace la cuenta.
-- Cambia el 2 por un 3 y mira cómo se pone rojo. Luego Ctrl+Z.
theorem hundred_days : 100 % 7 = 2 := by decide
