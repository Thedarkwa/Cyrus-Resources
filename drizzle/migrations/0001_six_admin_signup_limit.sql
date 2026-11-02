CREATE OR REPLACE FUNCTION public.enforce_admin_signup_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(424242);
  IF (SELECT count(*) FROM auth.users) >= 6 THEN
    RAISE EXCEPTION 'Admin sign-up is closed: all 6 admin places are taken';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_before_create_limit
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.enforce_admin_signup_limit();

CREATE OR REPLACE FUNCTION public.grant_admin_from_allowlist()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.user_roles WHERE role = 'admin') < 6 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_slots_left()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT GREATEST(0, 6 - (SELECT count(*)::int FROM auth.users));
$$;
GRANT EXECUTE ON FUNCTION public.admin_slots_left() TO anon, authenticated;