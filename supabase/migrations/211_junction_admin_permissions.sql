-- 211: T86 - caracteristicas do restaurante desapareciam ao editar como admin.
-- As policies de escrita nas tabelas de juncao exigiam creator_id = auth.uid()
-- sem braco de admin, enquanto restaurants_update_policy (mig 064) permite
-- creator OR current_user_is_admin(). O form grava as juncoes via Supabase
-- client direto (RLS e o gate real), logo um admin nao-criador falhava o
-- DELETE+INSERT silenciosamente e as caracteristicas nunca chegavam a DB.
-- Fix: consolidar INSERT/UPDATE/DELETE numa policy ALL owner-or-admin por
-- tabela, espelhando o padrao da mig 064. SELECT publico e service_role
-- ficam intocados. Idempotente (drops no topo).
-- NOTA: aplicar via supabase db push / dashboard SQL editor.

DO $$
BEGIN
  -- restaurant_cuisine_types: substitui a ALL creator-only
  DROP POLICY IF EXISTS restaurant_cuisine_types_own_restaurants ON public.restaurant_cuisine_types;
  DROP POLICY IF EXISTS restaurant_cuisine_types_write_owner_or_admin ON public.restaurant_cuisine_types;

  -- restaurant_dietary_options_junction: remove as 3 policies de escrita separadas
  DROP POLICY IF EXISTS restaurant_dietary_options_junction_insert_authenticated ON public.restaurant_dietary_options_junction;
  DROP POLICY IF EXISTS restaurant_dietary_options_junction_delete_authenticated ON public.restaurant_dietary_options_junction;
  DROP POLICY IF EXISTS restaurant_dietary_options_junction_update_authenticated ON public.restaurant_dietary_options_junction;
  DROP POLICY IF EXISTS restaurant_dietary_options_junction_write_owner_or_admin ON public.restaurant_dietary_options_junction;

  -- restaurant_restaurant_features: remove as 3 policies de escrita separadas
  DROP POLICY IF EXISTS restaurant_features_junction_insert_authenticated ON public.restaurant_restaurant_features;
  DROP POLICY IF EXISTS restaurant_features_junction_delete_authenticated ON public.restaurant_restaurant_features;
  DROP POLICY IF EXISTS restaurant_features_junction_update_authenticated ON public.restaurant_restaurant_features;
  DROP POLICY IF EXISTS restaurant_restaurant_features_write_owner_or_admin ON public.restaurant_restaurant_features;
END $$;

-- Para policy ALL sem WITH CHECK explicito, o USING aplica-se tambem como
-- WITH CHECK em INSERT/UPDATE => owner ou admin conseguem escrever.
CREATE POLICY restaurant_cuisine_types_write_owner_or_admin
  ON public.restaurant_cuisine_types
  FOR ALL
  USING (
    (SELECT auth.role()) = 'authenticated'
    AND (
      public.current_user_is_admin()
      OR EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = restaurant_cuisine_types.restaurant_id
          AND r.creator_id = (SELECT auth.uid())
      )
    )
  )
  WITH CHECK (
    (SELECT auth.role()) = 'authenticated'
    AND (
      public.current_user_is_admin()
      OR EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = restaurant_cuisine_types.restaurant_id
          AND r.creator_id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY restaurant_dietary_options_junction_write_owner_or_admin
  ON public.restaurant_dietary_options_junction
  FOR ALL
  USING (
    (SELECT auth.role()) = 'authenticated'
    AND (
      public.current_user_is_admin()
      OR EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = restaurant_dietary_options_junction.restaurant_id
          AND r.creator_id = (SELECT auth.uid())
      )
    )
  )
  WITH CHECK (
    (SELECT auth.role()) = 'authenticated'
    AND (
      public.current_user_is_admin()
      OR EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = restaurant_dietary_options_junction.restaurant_id
          AND r.creator_id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY restaurant_restaurant_features_write_owner_or_admin
  ON public.restaurant_restaurant_features
  FOR ALL
  USING (
    (SELECT auth.role()) = 'authenticated'
    AND (
      public.current_user_is_admin()
      OR EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = restaurant_restaurant_features.restaurant_id
          AND r.creator_id = (SELECT auth.uid())
      )
    )
  )
  WITH CHECK (
    (SELECT auth.role()) = 'authenticated'
    AND (
      public.current_user_is_admin()
      OR EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = restaurant_restaurant_features.restaurant_id
          AND r.creator_id = (SELECT auth.uid())
      )
    )
  );
