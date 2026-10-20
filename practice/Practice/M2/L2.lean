/-!
# Laboratorio 2.2: funciones

Cómo usar este archivo:
* A la derecha tienes el panel Lean Infoview. Si no lo ves, pulsa Ctrl+Shift+Enter.
* Pon el cursor al final de una línea `#eval` y el panel te dice qué ha calculado Lean.
* Aquí no tienes que escribir nada: lee, calcula a mano y compara.
-/

def double (n : Nat) : Nat := 2 * n

def add (a b : Nat) : Nat := a + b

def fee (amount : Nat) : Nat := amount / 100

-- Paso 1. Calcula a mano qué sale en cada línea. Luego mira el panel.
#eval double 7
#eval double 2 + 1
#eval double (2 + 1)

-- Paso 2. Lee el tipo de cada función: ¿cuántas entradas tiene?, ¿qué devuelve?
-- (Los paréntesis alrededor del nombre piden la forma corta, solo con tipos.)
#check (add)
#check (fee)

-- Paso 3. ¿Cuánta comisión paga una cantidad de 250? ¿Y una de 99?
#eval fee 250
#eval fee 99

-- Paso 4. Rompe algo a propósito: en la definición de `double`, cambia `2 * n`
-- por `2 * m`. Saldrá en rojo, porque Lean no sabe qué es `m`. También se ponen
-- en rojo los `#eval` de `double`: cuando una definición tiene un error, Lean la
-- sustituye por dentro por un `sorry` y se niega a calcular con ella (por eso
-- esos mensajes hablan de 'sorry'). El error de verdad es el primero.
-- Pon el cursor encima para leer el error y luego deshazlo con Ctrl+Z.
