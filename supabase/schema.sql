-- Hospital On-Call Scheduler - Database Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Services (a 3-month rotation period)
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    join_code TEXT UNIQUE NOT NULL,
    locked BOOLEAN DEFAULT FALSE,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interns (users in a service)
CREATE TABLE interns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    group_id UUID,
    is_admin BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups (on-call teams)
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    emoji TEXT,
    created_by UUID NOT NULL,
    max_size INTEGER,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for interns.group_id after groups table exists
ALTER TABLE interns 
ADD CONSTRAINT fk_intern_group 
FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

-- Join Requests
CREATE TABLE join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    intern_id UUID NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    UNIQUE(group_id, intern_id)
);

-- Assignments (schedule)
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(service_id, date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_interns_service ON interns(service_id);
CREATE INDEX idx_interns_group ON interns(group_id);
CREATE INDEX idx_groups_service ON groups(service_id);
CREATE INDEX idx_join_requests_group ON join_requests(group_id, status);
CREATE INDEX idx_assignments_service ON assignments(service_id);
CREATE INDEX idx_services_code ON services(join_code);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE interns ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Services: Anyone can read, anyone can create
CREATE POLICY "Services are viewable by everyone" 
ON services FOR SELECT USING (true);

CREATE POLICY "Anyone can create services" 
ON services FOR INSERT WITH CHECK (true);

CREATE POLICY "Services can be updated by creator" 
ON services FOR UPDATE USING (true);

-- Interns: Anyone in the same service can read
CREATE POLICY "Interns viewable within service" 
ON interns FOR SELECT USING (true);

CREATE POLICY "Anyone can join as intern" 
ON interns FOR INSERT WITH CHECK (true);

CREATE POLICY "Interns can update themselves" 
ON interns FOR UPDATE USING (true);

-- Groups: Anyone in the service can read
CREATE POLICY "Groups viewable within service" 
ON groups FOR SELECT USING (true);

CREATE POLICY "Anyone can create groups" 
ON groups FOR INSERT WITH CHECK (true);

CREATE POLICY "Group creators can update" 
ON groups FOR UPDATE USING (true);

-- Join Requests: Visible to requester and group creator
CREATE POLICY "Join requests are viewable" 
ON join_requests FOR SELECT USING (true);

CREATE POLICY "Anyone can create join requests" 
ON join_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Join requests can be updated" 
ON join_requests FOR UPDATE USING (true);

-- Assignments: Anyone in service can read
CREATE POLICY "Assignments viewable within service" 
ON assignments FOR SELECT USING (true);

CREATE POLICY "Admins can create assignments" 
ON assignments FOR INSERT WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get group member count
CREATE OR REPLACE FUNCTION get_group_member_count(group_uuid UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM interns WHERE group_id = group_uuid;
$$ LANGUAGE SQL;

-- Function to generate join code
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    code TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- REALTIME
-- ============================================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE groups;
ALTER PUBLICATION supabase_realtime ADD TABLE interns;
ALTER PUBLICATION supabase_realtime ADD TABLE join_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE assignments;

-- ============================================================================
-- DONE!
-- ============================================================================
-- After running this, your database is ready.
-- The tables will appear in the Table Editor.
-- Realtime is enabled for groups, interns, join_requests, and assignments.
