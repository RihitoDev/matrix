-- Extensión necesaria para combinar la igualdad de "mentor_id" con el solapamiento
-- de rangos dentro de una restricción EXCLUDE.
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;

-- El fin del bloque debe ser posterior al inicio.
ALTER TABLE "availability_blocks"
  ADD CONSTRAINT "availability_blocks_end_after_start_chk"
  CHECK ("end_at" > "start_at");

-- Un mentor no puede tener dos bloques que se solapen en el tiempo.
-- El rango es '[)' para dejar el fin abierto: 18:00-20:00 y 20:00-21:00 no se solapan.
ALTER TABLE "availability_blocks"
  ADD CONSTRAINT "availability_blocks_no_overlap_excl"
  EXCLUDE USING gist (
    "mentor_id" WITH =,
    tstzrange("start_at", "end_at", '[)') WITH &&
  );
