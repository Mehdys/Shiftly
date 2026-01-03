-- Seed script for Shiftly testing
-- This script creates a test service, 3 groups, and assignments for the next 30 days.

DO $$ 
DECLARE 
    temp_service_id UUID := '11111111-1111-4111-a111-111111111111';
    group_a_id UUID := gen_random_uuid();
    group_b_id UUID := gen_random_uuid();
    group_c_id UUID := gen_random_uuid();
    intern_admin_id UUID := gen_random_uuid();
    intern_test_id UUID := '22222222-2222-4222-b222-222222222222';
BEGIN 
    -- 1. Create Service
    INSERT INTO services (id, name, start_date, end_date, join_code)
    VALUES (temp_service_id, 'Service de Test CPU', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'TEST01');

    -- 2. Create Groups
    INSERT INTO groups (id, service_id, name, emoji, created_by)
    VALUES 
        (group_a_id, temp_service_id, 'Équipe Alpha', '🦁', intern_admin_id),
        (group_b_id, temp_service_id, 'Équipe Beta', '🦊', intern_admin_id),
        (group_c_id, temp_service_id, 'Équipe Gamma', '🐼', intern_admin_id);

    -- 3. Create Interns
    -- Admin (Creator)
    INSERT INTO interns (id, service_id, name, is_admin, group_id)
    VALUES (intern_admin_id, temp_service_id, 'Dr. Admin', true, group_a_id);
    
    -- Test User (The one you will use)
    INSERT INTO interns (id, service_id, name, is_admin, group_id)
    VALUES (intern_test_id, temp_service_id, 'Dr. Testeur', false, group_b_id);

    -- 4. Update service creator
    UPDATE services SET created_by = intern_admin_id WHERE id = temp_service_id;

    -- 5. Seed Assignments (30 days cycle between A, B, C)
    FOR i IN 0..29 LOOP
        INSERT INTO assignments (service_id, group_id, date)
        VALUES (
            temp_service_id, 
            CASE (i % 3)
                WHEN 0 THEN group_a_id
                WHEN 1 THEN group_b_id
                ELSE group_c_id
            END,
            CURRENT_DATE + (i || ' day')::interval
        );
    END LOOP;

    RAISE NOTICE 'Seed successful. Service Join Code: TEST01';
    RAISE NOTICE 'Test Intern ID: %', intern_test_id;
END $$;
