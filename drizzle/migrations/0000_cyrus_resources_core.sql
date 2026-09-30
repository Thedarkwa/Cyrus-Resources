-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Allowlist of admin emails: a new auth user with a listed email becomes admin
CREATE TABLE public.admin_allowlist (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_allowlist TO service_role;
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.grant_admin_from_allowlist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.admin_allowlist a WHERE lower(a.email) = lower(NEW.email)) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_grant_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_admin_from_allowlist();

-- Timestamps helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Subjects
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subjects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subjects are publicly readable" ON public.subjects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage subjects" ON public.subjects FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON public.subjects
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Resource types
CREATE TABLE public.resource_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.resource_types TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resource_types TO authenticated;
GRANT ALL ON public.resource_types TO service_role;
ALTER TABLE public.resource_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Resource types are publicly readable" ON public.resource_types FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage resource types" ON public.resource_types FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER resource_types_updated_at BEFORE UPDATE ON public.resource_types
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Resources
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  resource_type_id uuid REFERENCES public.resource_types(id) ON DELETE SET NULL,
  stage text NOT NULL,
  years text[] NOT NULL DEFAULT '{}',
  thumbnail_url text,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published resources are publicly readable" ON public.resources
FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins read all resources" ON public.resources
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert resources" ON public.resources
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update resources" ON public.resources
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete resources" ON public.resources
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER resources_updated_at BEFORE UPDATE ON public.resources
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX resources_published_idx ON public.resources (is_published, created_at DESC);
CREATE INDEX resources_subject_idx ON public.resources (subject_id);
CREATE INDEX resources_stage_idx ON public.resources (stage);

-- Seed subjects
INSERT INTO public.subjects (name) VALUES
('English'),('Mathematics'),('Computing'),('Science'),('Biology'),('Chemistry'),
('Physics'),('Social Studies'),('Geography'),('History'),('Religious Studies'),
('Creative Arts'),('Physical Education'),('Business'),('Economics'),('Other');

-- Seed resource types
INSERT INTO public.resource_types (name) VALUES
('Educational Website'),('Learning Platform'),('Video'),('Digital Tool'),('Online Course'),
('Educational Game'),('Simulation'),('E-book'),('Revision Resource'),('Reference Material'),('Other');

-- Seed starter resources
INSERT INTO public.resources (title, description, url, subject_id, resource_type_id, stage, years, is_featured, is_published)
VALUES
('Khan Academy','Free educational lessons, exercises and learning materials across a range of subjects.','https://www.khanacademy.org',
  (SELECT id FROM public.subjects WHERE name='Mathematics'),
  (SELECT id FROM public.resource_types WHERE name='Educational Website'),
  'Primary', ARRAY['Year 4','Year 5','Year 6'], true, true),
('Scratch','Learn programming through creative projects, games and animations.','https://scratch.mit.edu',
  (SELECT id FROM public.subjects WHERE name='Computing'),
  (SELECT id FROM public.resource_types WHERE name='Digital Tool'),
  'Primary', ARRAY['Year 4','Year 5','Year 6'], true, true),
('PhET Simulations','Interactive science and mathematics simulations for exploring concepts.','https://phet.colorado.edu',
  (SELECT id FROM public.subjects WHERE name='Physics'),
  (SELECT id FROM public.resource_types WHERE name='Simulation'),
  'O Level', ARRAY['Year 7','Year 8','Year 9'], true, true),
('BBC Bitesize','Revision guides, lessons and activities organised by subject.','https://www.bbc.co.uk/bitesize',
  (SELECT id FROM public.subjects WHERE name='English'),
  (SELECT id FROM public.resource_types WHERE name='Revision Resource'),
  'O Level', ARRAY['Year 7','Year 8','Year 9'], false, true),
('GeoGebra','Interactive geometry, algebra and calculus tools for maths learners.','https://www.geogebra.org',
  (SELECT id FROM public.subjects WHERE name='Mathematics'),
  (SELECT id FROM public.resource_types WHERE name='Digital Tool'),
  'A Level', ARRAY['Year 10','Year 11','Year 12'], false, true),
('Starfall','Phonics, reading and early number activities for young learners.','https://www.starfall.com',
  (SELECT id FROM public.subjects WHERE name='English'),
  (SELECT id FROM public.resource_types WHERE name='Educational Game'),
  'Pre-School', ARRAY['Pre-School'], false, true),
('Project Gutenberg','Thousands of free e-books including classic literature.','https://www.gutenberg.org',
  (SELECT id FROM public.subjects WHERE name='English'),
  (SELECT id FROM public.resource_types WHERE name='E-book'),
  'A Level', ARRAY['Year 10','Year 11','Year 12'], false, true),
('CK-12','Free science and mathematics textbooks, practice and simulations.','https://www.ck12.org',
  (SELECT id FROM public.subjects WHERE name='Science'),
  (SELECT id FROM public.resource_types WHERE name='Learning Platform'),
  'O Level', ARRAY['Year 7','Year 8','Year 9'], false, true);