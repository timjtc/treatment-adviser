-- Postgres schema for patient data persistence
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  sex TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  primary_complaint TEXT NOT NULL,
  risk_score TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  purpose TEXT
);

CREATE TABLE IF NOT EXISTS conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  severity TEXT,
  diagnosed_date DATE
);

CREATE INDEX IF NOT EXISTS idx_visits_patient_date ON visits(patient_id, visit_date DESC);

-- Sample inserts: two patients, one with a return visit
WITH p AS (
  INSERT INTO patients (first_name, last_name, date_of_birth, sex, email, phone)
  VALUES
    ('Alice', 'Nguyen', '1985-04-02', 'F', 'alice@example.com', '+1-555-1001'),
    ('Brian', 'Lopez', '1978-11-19', 'M', 'brian@example.com', '+1-555-1002')
  RETURNING id, first_name
),
visits_ins AS (
  INSERT INTO visits (patient_id, visit_date, primary_complaint, risk_score, notes)
  SELECT id, NOW() - INTERVAL '14 days', 'Hair loss', 'LOW', 'Initial consult' FROM p WHERE first_name = 'Alice'
  UNION ALL
  SELECT id, NOW(), 'Hair loss follow-up', 'LOW', 'Review response to minoxidil' FROM p WHERE first_name = 'Alice'
  UNION ALL
  SELECT id, NOW(), 'Erectile dysfunction', 'MEDIUM', 'On nitrate therapy, caution' FROM p WHERE first_name = 'Brian'
  RETURNING id, patient_id, primary_complaint
)
INSERT INTO medications (visit_id, name, dosage, frequency, duration, purpose)
SELECT v.id, d.name, d.dosage, d.frequency, d.duration, d.purpose
FROM visits_ins v
CROSS JOIN LATERAL (
  VALUES
    ('minoxidil 5% topical', '1 mL', 'daily', '90 days', 'androgenic alopecia'),
    ('tadalafil', '5 mg', 'daily', '30 days', 'erectile dysfunction')
) AS d(name, dosage, frequency, duration, purpose)
WHERE
  (v.primary_complaint ILIKE '%hair%') = (d.name ILIKE 'minoxidil%')
  OR (v.primary_complaint ILIKE '%erectile%') = (d.name ILIKE 'tadalafil%');
