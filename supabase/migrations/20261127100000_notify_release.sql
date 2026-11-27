-- Aviso de novidades: cada release inserida em `release_notes` gera uma notificação
-- (tipo `release`) para todos os utilizadores existentes, numa só instrução.
-- Respeita `notification_preferences.system_updates` (defeito true). Idempotente por (user, link).
-- Uma falha no fan-out nunca bloqueia a release: fica só um WARNING.

CREATE UNIQUE INDEX IF NOT EXISTS notifications_release_user_link_key
  ON public.notifications (user_id, link)
  WHERE type = 'release';

CREATE OR REPLACE FUNCTION public.notify_release()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
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

REVOKE ALL ON FUNCTION public.notify_release() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.notify_release() TO service_role;

DROP TRIGGER IF EXISTS release_notes_notify ON public.release_notes;
CREATE TRIGGER release_notes_notify
  AFTER INSERT ON public.release_notes
  FOR EACH ROW EXECUTE FUNCTION public.notify_release();

COMMENT ON FUNCTION public.notify_release() IS 'Fan-out de notificações «release» ao publicar em release_notes.';
