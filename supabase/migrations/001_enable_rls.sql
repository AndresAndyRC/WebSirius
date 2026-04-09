-- ============================================================
-- SIRIUS Premium LED — Row Level Security (RLS)
-- Ejecutar en Supabase Dashboard > SQL Editor
-- Referencia: OWASP 2025 A01 (Broken Access Control)
-- ============================================================

-- 1. Habilitar RLS en la tabla productos
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- 2. Permitir SELECT publico (el catalogo es contenido publico)
CREATE POLICY "Lectura publica de productos"
  ON public.productos FOR SELECT
  USING (true);

-- 3. Bloquear INSERT/UPDATE/DELETE para anon key
-- Con RLS habilitado y sin politicas de escritura, la anon key
-- NO puede insertar, actualizar ni eliminar filas.
-- Solo service_role (usado por API routes en Vercel) puede modificar datos.

-- 4. Si existe la tabla ordenes, aplicar RLS equivalente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ordenes'
  ) THEN
    ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;

    -- Bloquear acceso de lectura para anon key en ordenes
    EXECUTE 'CREATE POLICY "Bloquear lectura anon en ordenes"
      ON public.ordenes FOR SELECT
      USING (false)';

    -- Bloquear escritura para anon key en ordenes
    EXECUTE 'CREATE POLICY "Bloquear escritura anon en ordenes"
      ON public.ordenes FOR INSERT
      WITH CHECK (false)';
  END IF;
END $$;

-- 5. Auditoria: verificar que no existan politicas USING(true) en operaciones de escritura
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
