CREATE OR REPLACE FUNCTION public.enforce_admin_signup_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(424242);
  IF (SELECT count(*) FROM auth.users) >= 30 THEN
    RAISE EXCEPTION 'Admin sign-up is closed: all 30 admin places are taken';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_admin_from_allowlist()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.user_roles WHERE role = 'admin') < 30 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_slots_left()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT GREATEST(0, 30 - (SELECT count(*)::int FROM auth.users));
$$;