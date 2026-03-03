-- Migration: Fix RLS policies for production security
-- All tables require authenticated users. Public access is removed.

-- ============================================================
-- incidents
-- ============================================================
DROP POLICY IF EXISTS "Allow all operations on incidents" ON incidents;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON incidents;
DROP POLICY IF EXISTS "Enable read access for all users" ON incidents;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON incidents;

CREATE POLICY "Authenticated users can view incidents"
  ON incidents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert incidents"
  ON incidents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update incidents"
  ON incidents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete incidents"
  ON incidents FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- epis
-- ============================================================
DROP POLICY IF EXISTS "Allow all operations on epis" ON epis;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON epis;
DROP POLICY IF EXISTS "Enable read access for all users" ON epis;

CREATE POLICY "Authenticated users can view epis"
  ON epis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert epis"
  ON epis FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update epis"
  ON epis FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete epis"
  ON epis FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- trainings
-- ============================================================
DROP POLICY IF EXISTS "Allow all operations on trainings" ON trainings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON trainings;
DROP POLICY IF EXISTS "Enable read access for all users" ON trainings;

CREATE POLICY "Authenticated users can view trainings"
  ON trainings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert trainings"
  ON trainings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update trainings"
  ON trainings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete trainings"
  ON trainings FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- collaborators
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert collaborators." ON collaborators;
DROP POLICY IF EXISTS "Anyone can update collaborators." ON collaborators;
DROP POLICY IF EXISTS "Anyone can delete collaborators." ON collaborators;
DROP POLICY IF EXISTS "Allow all read access on collaborators" ON collaborators;
DROP POLICY IF EXISTS "Enable read access for all users" ON collaborators;

CREATE POLICY "Authenticated users can view collaborators"
  ON collaborators FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert collaborators"
  ON collaborators FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update collaborators"
  ON collaborators FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete collaborators"
  ON collaborators FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- dds_records
-- ============================================================
DROP POLICY IF EXISTS "Allow all operations on dds_records" ON dds_records;
DROP POLICY IF EXISTS "Enable read access for all users" ON dds_records;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON dds_records;

CREATE POLICY "Authenticated users can view dds_records"
  ON dds_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert dds_records"
  ON dds_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update dds_records"
  ON dds_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete dds_records"
  ON dds_records FOR DELETE
  TO authenticated
  USING (true);
