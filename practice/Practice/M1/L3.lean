/-!
# Laboratorio 1.3: si... entonces

Cómo usar este archivo:
* Pon el cursor en una línea que empieza por `#eval` y mira el panel
  Lean Infoview: ahí aparece lo que responde Lean.
* Antes de mirar, intenta adivinar la respuesta. Luego comprueba.
* Puedes cambiar lo que quieras: Ctrl+Z lo deja como estaba.
-/

-- Paso 1. La tabla del «si... entonces».
-- Una de estas tres líneas responde false. ¿Cuál?
#eval decide (2 + 2 = 4 → 1 = 2)
#eval decide (2 + 2 = 5 → 1 = 2)
#eval decide (2 + 2 = 5 → 1 = 1)

-- Paso 2. Una hipótesis imposible: para un número natural,
-- «fee < 0» no se cumple nunca. Fíjate en que no sale nada en rojo.
-- Prueba: borra «(h : fee < 0)» y mira qué pasa. Luego Ctrl+Z.
theorem fee_capped (fee : Nat) (h : fee < 0) : fee = 1000000 := by omega

-- Paso 3. Varias flechas seguidas: lo de antes de la última son hipótesis.
-- Cambia el 4 por un 3 y mira cómo cambia la respuesta.
#eval decide (1 = 1 → 2 = 2 → 3 = 4)

-- Paso 4. Si y solo si: es verdad cuando los dos lados valen lo mismo.
#eval decide (2 = 2 ↔ 5 < 1)
#eval decide (2 = 3 ↔ 5 < 1)
