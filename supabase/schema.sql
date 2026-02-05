-- EDU NEXUS DATABASE SCHEMA (PHASE 1-3)
-- Reordered to avoid "relation does not exist" errors

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS TABLE
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    primary_color TEXT DEFAULT '#6366f1',
    region TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROFILES TABLE (Required for RLS policies)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id),
    full_name TEXT,
    role TEXT DEFAULT 'TEACHER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CORE SCHOOL TABLES
CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    grade TEXT NOT NULL,
    section TEXT NOT NULL,
    class_teacher_id TEXT,
    room_number TEXT,
    capacity INTEGER DEFAULT 30,
    stream TEXT,
    school_section TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    admission_no TEXT UNIQUE,
    email TEXT,
    dob DATE,
    gender TEXT,
    blood_group TEXT,
    grade TEXT NOT NULL,
    section TEXT,
    stream TEXT,
    parent_name TEXT,
    parent_phone TEXT,
    address TEXT,
    medical_notes TEXT,
    allergies TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    profile_picture TEXT,
    advisor TEXT,
    admission_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    teacher_id TEXT,
    progress INTEGER DEFAULT 0,
    syllabus JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL, 
    term TEXT NOT NULL, 
    sub_type TEXT, 
    max_marks INTEGER DEFAULT 100,
    weightage INTEGER DEFAULT 50,
    date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    score NUMERIC,
    UNIQUE(assessment_id, student_id)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SECURITY (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES
-- Public read for tenants to allow school selection/login
CREATE POLICY "Public read for tenants" ON tenants FOR SELECT USING (true);

-- Users can only see/update their own profile
CREATE POLICY "Users can see their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Tenant Isolation Policies (Dependent on profiles table)
CREATE POLICY "Tenant isolation for classrooms" ON classrooms USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Tenant isolation for students" ON students USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Tenant isolation for subjects" ON subjects USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Tenant isolation for assessments" ON assessments USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Tenant isolation for notifications" ON notifications USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- 6. AUTH TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'TEACHER'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TABLE admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    parent_name TEXT,
    parent_phone TEXT,
    grade_applying TEXT,
    status TEXT DEFAULT 'PENDING',
    date_applied DATE DEFAULT CURRENT_DATE,
    dob DATE,
    gender TEXT,
    blood_group TEXT,
    address TEXT,
    medical_notes TEXT,
    profile_picture TEXT,
    student_id UUID REFERENCES students(id), -- Nullable until accepted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Admissions
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants can see their own admissions" ON admissions FOR SELECT USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Tenants can update their own admissions" ON admissions FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- 7. SEED DATA
INSERT INTO tenants (id, name, domain, primary_color, region) VALUES
('5966d510-7264-469b-980b-f3513a936a28', 'Springfield Academy', 'springfield.edu', '#6366f1', 'North Region'),
('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'Oakwood High', 'oakwood.edu', '#10b981', 'West Region'),
('c53f86e3-f012-4a00-9993-9c8e19b88931', 'Riverdale International', 'riverdale.edu', '#f59e0b', 'East Region')
ON CONFLICT (id) DO NOTHING;
