/-!
# Laboratorio 2.4: estructuras

Cómo usar este archivo:
* A la derecha tienes el panel Lean Infoview. Si no lo ves, pulsa Ctrl+Shift+Enter.
* Pon el cursor al final de una línea `#eval` y el panel te dice qué ha calculado Lean.
* Si algo sale en rojo, pon el cursor encima para leer el mensaje.
-/

structure Account where
  owner : String
  balance : Nat

def alice : Account := { owner := "alice", balance := 10 }

def bob : Account := ⟨"bob", 20⟩

structure PositiveAmount where
  value : Nat
  pos : 0 < value

def five : PositiveAmount := ⟨5, by decide⟩

-- Paso 1. Lee los campos. ¿Qué esperas en cada línea?
#eval alice.owner
#eval bob.balance

-- Paso 2. Una copia con un cambio. ¿Cambia la `alice` original?
#eval ({ alice with balance := 5 } : Account).balance
#eval alice.balance

-- Paso 3. En la definición de `five`, cambia `⟨5, by decide⟩` por `⟨0, by decide⟩`.
-- Pon el cursor sobre lo rojo y lee el mensaje. También se pondrá en rojo el
-- `#eval five.value` de abajo: cuando una definición tiene un error, Lean la
-- sustituye por dentro por un `sorry` y se niega a calcular con ella (por eso ese
-- mensaje habla de 'sorry'). El error de verdad es el primero. Después, Ctrl+Z.
#eval five.value

-- Paso 4. En la definición de `bob`, da la vuelta a los datos: `⟨20, "bob"⟩`.
-- ¿Qué pasa? (Pista: el primer campo de Account es un texto.) Igual que antes,
-- el `#eval bob.balance` de arriba también se pone en rojo. Después, Ctrl+Z.
