-- EDU NEXUS DATABASE SCHEMA (PHASE 1-3)
-- Reordered to avoid "relation does not exist" errors

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS TABLE
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    primary_color TEXT DEFAULT '#6366f1',
    region TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROFILES TABLE (Required for RLS policies)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id),
    full_name TEXT,
    role TEXT DEFAULT 'TEACHER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CORE SCHOOL TABLES
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'GENERAL',
    joining_date DATE DEFAULT CURRENT_DATE,
    salary INTEGER DEFAULT 3000,
    is_hod BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Staff
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for staff" ON staff;
CREATE POLICY "Tenant isolation for staff" ON staff USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
CREATE TABLE IF NOT EXISTS classrooms (
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

CREATE TABLE IF NOT EXISTS students (
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

CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    teacher_id TEXT,
    progress INTEGER DEFAULT 0,
    syllabus JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessments (
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

CREATE TABLE IF NOT EXISTS scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    score NUMERIC,
    UNIQUE(assessment_id, student_id)
);

CREATE TABLE IF NOT EXISTS notifications (
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
DROP POLICY IF EXISTS "Public read for tenants" ON tenants;
CREATE POLICY "Public read for tenants" ON tenants FOR SELECT USING (true);

-- Users can only see/update their own profile
DROP POLICY IF EXISTS "Users can see their own profile" ON profiles;
CREATE POLICY "Users can see their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Tenant Isolation Policies (Dependent on profiles table)
DROP POLICY IF EXISTS "Tenant isolation for classrooms" ON classrooms;
CREATE POLICY "Tenant isolation for classrooms" ON classrooms USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "Tenant isolation for students" ON students;
CREATE POLICY "Tenant isolation for students" ON students USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "Tenant isolation for subjects" ON subjects;
CREATE POLICY "Tenant isolation for subjects" ON subjects USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "Tenant isolation for assessments" ON assessments;
CREATE POLICY "Tenant isolation for assessments" ON assessments USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "Tenant isolation for notifications" ON notifications;
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

CREATE TABLE IF NOT EXISTS admissions (
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

-- 8. FINANCE TABLES
CREATE TABLE IF NOT EXISTS fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    due_date DATE,
    status TEXT DEFAULT 'PENDING', -- PENDING, PAID, OVERDUE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- INCOME, EXPENSE
    category TEXT NOT NULL, -- TUITION, SALARY, UTILITY, MAINTENANCE, etc.
    amount NUMERIC NOT NULL,
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. LIBRARY TABLES
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    category TEXT,
    status TEXT DEFAULT 'Available', -- Available, Borrowed, Reserved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    borrowed_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    returned_date DATE,
    status TEXT DEFAULT 'ON_TIME', -- ON_TIME, OVERDUE, RETURNED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'UNPAID', -- PAID, UNPAID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ADVANCED RLS
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant isolation for fees" ON fees;
CREATE POLICY "Tenant isolation for fees" ON fees USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Tenant isolation for transactions" ON transactions;
CREATE POLICY "Tenant isolation for transactions" ON transactions USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Tenant isolation for books" ON books;
CREATE POLICY "Tenant isolation for books" ON books USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Tenant isolation for loans" ON loans;
CREATE POLICY "Tenant isolation for loans" ON loans USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Tenant isolation for fines" ON fines;
CREATE POLICY "Tenant isolation for fines" ON fines USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- 7. SEED DATA
INSERT INTO tenants (id, name, domain, primary_color, region) VALUES
('5966d510-7264-469b-980b-f3513a936a28', 'Springfield Academy', 'springfield.edu', '#6366f1', 'North Region'),
('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'Oakwood High', 'oakwood.edu', '#10b981', 'West Region'),
('c53f86e3-f012-4a00-9993-9c8e19b88931', 'Riverdale International', 'riverdale.edu', '#f59e0b', 'East Region')
ON CONFLICT (id) DO NOTHING;
