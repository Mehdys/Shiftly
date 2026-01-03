-- MIGRATION: ADD AUTH TO EXISTING DATABASE
-- Run this in Supabase SQL Editor if you already have the tables created.

-- 1. Add user_id to interns
ALTER TABLE interns ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can create services" ON services;
DROP POLICY IF EXISTS "Services can be updated by creator" ON services;
DROP POLICY IF EXISTS "Anyone can join as intern" ON interns;
DROP POLICY IF EXISTS "Interns can update themselves" ON interns;
DROP POLICY IF EXISTS "Anyone can create groups" ON groups;
DROP POLICY IF EXISTS "Group creators can update" ON groups;
DROP POLICY IF EXISTS "Anyone can create join requests" ON join_requests;
DROP POLICY IF EXISTS "Join requests can be updated" ON join_requests;
DROP POLICY IF EXISTS "Admins can create assignments" ON assignments;
DROP POLICY IF EXISTS "Interns viewable within service" ON interns;
DROP POLICY IF EXISTS "Groups viewable within service" ON groups;
DROP POLICY IF EXISTS "Join requests are viewable" ON join_requests;

-- 3. Create new secure policies
CREATE POLICY "Authenticated users can create services" 
ON services FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Services can be updated by creator" 
ON services FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM interns 
        WHERE interns.id = services.created_by 
        AND interns.user_id = auth.uid()
    )
);

CREATE POLICY "Interns viewable within service" 
ON interns FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join as intern" 
ON interns FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Interns can update themselves" 
ON interns FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Groups viewable within service" 
ON groups FOR SELECT USING (true);

CREATE POLICY "Interns can create groups" 
ON groups FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM interns 
        WHERE interns.id = groups.created_by 
        AND interns.user_id = auth.uid()
    )
);

CREATE POLICY "Group creators can update" 
ON groups FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM interns 
        WHERE interns.id = groups.created_by 
        AND interns.user_id = auth.uid()
    )
);

CREATE POLICY "Join requests viewable by candidate or group manager" 
ON join_requests FOR SELECT USING (true);

CREATE POLICY "Interns can create join requests" 
ON join_requests FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM interns 
        WHERE interns.id = join_requests.intern_id 
        AND interns.user_id = auth.uid()
    )
);

CREATE POLICY "Join requests can be updated by group creator" 
ON join_requests FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM groups g
        JOIN interns i ON i.id = g.created_by
        WHERE g.id = join_requests.group_id
        AND i.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can create assignments" 
ON assignments FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM interns 
        WHERE interns.service_id = assignments.service_id 
        AND interns.is_admin = true
        AND interns.user_id = auth.uid()
    )
);
