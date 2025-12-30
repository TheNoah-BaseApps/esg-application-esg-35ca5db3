CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS energy_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  energy_record_id text NOT NULL UNIQUE,
  site_name text NOT NULL,
  reporting_period_start date NOT NULL,
  reporting_period_end date NOT NULL,
  energy_type text NOT NULL,
  consumption_mwh decimal(10,2) NOT NULL,
  cost decimal(12,2) NOT NULL,
  supplier_name text,
  energy_source_mix text,
  reduction_target_mwh decimal(10,2),
  remarks text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_energy_record_id ON energy_records (energy_record_id);
CREATE INDEX IF NOT EXISTS idx_energy_site_name ON energy_records (site_name);
CREATE INDEX IF NOT EXISTS idx_energy_created_by ON energy_records (created_by);
CREATE INDEX IF NOT EXISTS idx_energy_reporting_period ON energy_records (reporting_period_start, reporting_period_end);

CREATE TABLE IF NOT EXISTS waste_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  waste_record_id text NOT NULL UNIQUE,
  site_name text NOT NULL,
  waste_type text NOT NULL,
  quantity_tons decimal(10,2) NOT NULL,
  disposal_method text NOT NULL,
  reporting_period_start date NOT NULL,
  reporting_period_end date NOT NULL,
  disposal_date date NOT NULL,
  contractor_name text,
  regulatory_compliance text NOT NULL,
  remarks text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_waste_record_id ON waste_records (waste_record_id);
CREATE INDEX IF NOT EXISTS idx_waste_site_name ON waste_records (site_name);
CREATE INDEX IF NOT EXISTS idx_waste_created_by ON waste_records (created_by);
CREATE INDEX IF NOT EXISTS idx_waste_reporting_period ON waste_records (reporting_period_start, reporting_period_end);
CREATE INDEX IF NOT EXISTS idx_waste_compliance ON waste_records (regulatory_compliance);