/-!
# Laboratorio 3.2: cazar trampas

Todos estos teoremas compilan. Tu trabajo es ver qué prometen de verdad.
Las respuestas de Lean salen en el panel Lean Infoview cuando pones el
cursor en una línea con `#eval`.
-/

-- Paso 1. ¿Hay alguna cantidad cuya comisión sea 0, como pide `h`?
-- Pon el cursor en los `#eval`: prueban con 0 y con 250.
def transferFee (amount : Nat) : Nat := amount / 100 + 1

theorem free_transfer (amount : Nat) (h : transferFee amount = 0) : amount = 1000000 := by
  unfold transferFee at h
  omega

#eval transferFee 0
#eval transferFee 250

-- Paso 2. ¿Hay algún `fee` que cumpla `h1` y `h2` a la vez?
-- Los dos `#eval` prueban con 3 y con 11.
theorem fee_bound (fee : Nat) (h1 : fee < 5) (h2 : 10 < fee) : fee = 0 := by omega

#eval decide (3 < 5 ∧ 10 < 3)
#eval decide (11 < 5 ∧ 10 < 11)

-- Paso 3. Mira el subrayado amarillo bajo `h` y pasa el ratón por encima.
-- La conclusión es verdad sin `h`: la hipótesis sobra.
theorem audit_ok (total : Nat) (h : total ≤ 100) : total = total := rfl

-- check: allow-warn (the unused-variable warning is part of the lab)
