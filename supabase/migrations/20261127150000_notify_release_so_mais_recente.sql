-- Backfill seguro: só a release mais recente (maior released_at) notifica os utilizadores.
-- Versões antigas inseridas depois (backfill) não geram notificações.
-- Não é aplicada automaticamente: fazer backup antes (scripts/db-backup.mjs).

CREATE OR REPLACE FUNCTION public.notify_release()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.release_notes r WHERE r.released_at > NEW.released_at) THEN
    RETURN NEW;
  END IF;
  BEGIN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    SELECT u.id, 'release', 'Há novidades no FoodLister', NEW.title, '/novidades/' || NEW.version
    FROM auth.users u
    LEFT JOIN public.notification_preferences p ON p.user_id = u.id
    WHERE COALESCE(p.system_updates, true)
    ON CONFLICT DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'notify_release falhou para a versão %: %', NEW.version, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.notify_release() IS 'Fan-out de notificações «release» só se a nota for a mais recente por released_at.';
