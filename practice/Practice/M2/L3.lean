/-!
# Laboratorio 2.3: if, match y recursión

Cómo usar este archivo:
* A la derecha tienes el panel Lean Infoview. Si no lo ves, pulsa Ctrl+Shift+Enter.
* Pon el cursor al final de una línea `#eval` y el panel te dice qué ha calculado Lean.
* Calcula siempre a mano antes de mirar. El objetivo es seguir las definiciones tú.
-/

def fee (amount : Nat) : Nat :=
  if amount < 100 then 1 else amount / 100

def describe (n : Nat) : String :=
  match n with
  | 0 => "zero"
  | 1 => "one"
  | _ => "many"

def sumTo : Nat → Nat
  | 0 => 0
  | n + 1 => (n + 1) + sumTo n

def total : List Nat → Nat
  | [] => 0
  | x :: xs => x + total xs

-- Paso 1. Los límites del if: ¿por qué camino va cada una?
#eval fee 99
#eval fee 100
#eval fee 250

-- Paso 2. ¿Qué caso del match encaja?
#eval describe 0
#eval describe 2

-- Paso 3. Desenrolla a mano antes de mirar.
#eval sumTo 5
#eval total [1, 2, 3, 4]

-- Paso 4. En la definición de `total`, cambia `| [] => 0` por `| [] => 1`.
-- Vuelve a mirar `#eval total [1, 2, 3, 4]`: ¿cambia el resultado?, ¿sale algo en rojo?
-- Después, deshazlo con Ctrl+Z.
