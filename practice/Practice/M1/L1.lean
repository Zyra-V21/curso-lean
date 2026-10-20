/-!
# Laboratorio 1.1: proposiciones

Pon el cursor en cada línea con `#check` o `#eval` y mira el panel Lean
Infoview. Ctrl+Z deshace cualquier cambio.
-/

-- Paso 1. ¿Cuáles de estas son proposiciones (Prop) y cuál es un número (Nat)?
#check 2 + 2 = 4
#check 2 + 2 = 5
#check 2 + 2
#check 10 < 3

-- Paso 2. Ahora pregunta si son verdad. Apunta lo que sale en la última:
-- te lo preguntan en la lección.
#eval decide (2 + 2 = 4)
#eval decide (2 + 2 = 5)
#eval decide (10 < 3)

-- Paso 3. Un carácter cambia la promesa. Compara estas dos.
#eval decide (5 ≤ 5)
#eval decide (5 < 5)

-- Paso 4. Experimenta: cambia los números del paso 3 (prueba 4 y 5, o 6 y 5)
-- y mira cuándo sale true y cuándo false. Luego Ctrl+Z.

-- Paso 5. True y False con mayúscula son proposiciones, no respuestas.
#check True
#check False
