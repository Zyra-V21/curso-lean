/-!
# Laboratorio 0.2: tu taller

Ve paso a paso. Pon el cursor en la línea que se indica y mira el panel
Lean Infoview, a la derecha. Si no lo ves, pulsa Ctrl+Shift+Enter.
Las respuestas cortas también salen escritas al final de cada línea.

No puedes romper nada: Ctrl+Z deshace cualquier cambio, y si cierras sin
guardar todo vuelve a estar como al principio.
-/

-- Paso 1. Pon el cursor en la línea de abajo. ¿Qué responde Lean en el panel?
#eval 2 + 2

-- Paso 2. Y en esta. Apunta el número: te lo preguntan en la lección.
#eval 17 * 3

-- Paso 3. #check no calcula: te dice el tipo. Compara con el paso 2.
#check 17 * 3
#check "hola"

-- Paso 4. Busca la línea ondulada amarilla en el nombre del teorema de abajo.
-- Pasa el ratón por encima y lee el aviso. Este teorema NO está demostrado.
theorem not_yet : 2 + 2 = 5 := by sorry

-- Paso 5. Este teorema sí está demostrado: no sale ningún color.
-- Cambia el 4 por un 5 y mira cómo aparece el rojo. Lee el mensaje en el
-- panel. Después pulsa Ctrl+Z para dejarlo como estaba.
theorem two_plus_two : 2 + 2 = 4 := by decide

-- Paso 6. El comentario de abajo miente: dice 5. ¿Qué calcula Lean?
-- this gives 5
#eval 2 + 2

-- check: sorry-allowed (nota para el comprobador del curso: el sorry del paso 4 es a propósito)
