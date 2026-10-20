/-!
# Laboratorio 2.5: llaves, corchetes y namespaces

Cómo usar este archivo:
* Las respuestas de Lean salen en el panel Lean Infoview (a la derecha)
  cuando pones el cursor en una línea con `#eval` o `#check`.
* Si cambias algo y sale rojo, no pasa nada: Ctrl+Z lo deshace.
-/

-- Paso 1. Pon el cursor en cada `#eval`.
-- No escribes el tipo `α`: Lean lo deduce (va entre llaves).
def pair {α : Type} (a b : α) : List α := [a, b]

#eval pair 3 7
#eval pair "hola" "adiós"

-- Paso 2. `double` pide `[Add α]`: el tipo tiene que saber sumar.
def double {α : Type} [Add α] (x : α) : α := x + x

#eval double 21

-- Paso 3. Cambia el `21` de arriba por `true`.
-- Pasa el ratón por el subrayado rojo y lee el mensaje. Luego Ctrl+Z.

-- Paso 4. La línea de `square` no escribe `{α : Type} [Mul α]`,
-- pero los tiene: vienen de la línea `variable`. Míralo con `#check @square`.
section
variable {α : Type} [Mul α]

def square (x : α) : α := x * x

end

#check @square

-- Paso 5. Nombres con apellido.
namespace Bank

def fee : Nat := 3

end Bank

#eval Bank.fee
