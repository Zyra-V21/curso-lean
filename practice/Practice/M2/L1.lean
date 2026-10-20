/-!
# Laboratorio 2.1: tipos

Cómo usar este archivo:
* Pon el cursor en una línea que empieza por `#eval` o `#check` y mira el
  panel Lean Infoview: ahí aparece lo que responde Lean.
* Antes de mirar, intenta adivinar la respuesta. Luego comprueba.
* Puedes cambiar lo que quieras: Ctrl+Z lo deja como estaba.
-/

-- Paso 1. Cada cosa tiene su tipo. ¿Qué etiqueta le pone Lean a cada una?
#check 5
#check (5 : Int)
#check "hola"
#check true
#check 2 + 2 = 4

-- Paso 2. Restas y divisiones. Compara naturales (Nat) con enteros (Int).
#eval 3 - 5
#eval (3 - 5 : Int)
#eval 7 / 0
#eval (-7 : Int) / 2
-- Prueba: cambia «(-7 : Int) / 2» por «Int.tdiv (-7) 2». Luego Ctrl+Z.

-- Paso 3. Tipos con máximo: se pasan y dan la vuelta.
-- Prueba: en la primera línea, cambia UInt8 por UInt16.
#eval (255 : UInt8) + 1
#eval (0 : UInt8) - 1
#eval (0 : UInt64) - 1

-- Paso 4. Nat no tiene máximo: nunca da la vuelta.
#eval 2 ^ 256
