# Shiftly Testing Guide & Test Data

To verify that the calendar and assignment logic works correctly with the new authentication system, follow these steps.

## 1. Create a Test Account
First, you need a real user account in Supabase to link the test data to.

- **Email**: `test@shiftly.com`
- **Password**: `ShiftlyTest2026`

Go to your application (locally or on Vercel) and **Sign Up** with these credentials. Don't forget to click the confirmation link in your email (or use the "Auth" tab in Supabase to force confirm the user).

## 2. Run the SQL Seed Script
Once the user is created, run the following SQL script in your **Supabase SQL Editor**. This script will find your user, create a "Shiftly Internal Test" service, and assign you to shifts for the next 7 days.

```sql
DO $$
DECLARE
  v_user_id UUID;
  v_service_id UUID := gen_random_uuid();
  v_group_id UUID := gen_random_uuid();
  v_intern_id UUID := gen_random_uuid();
BEGIN
  -- 1. Find the test user by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'test@shiftly.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User test@shiftly.com not found. Please sign up in the app first.';
  END IF;

  -- 2. Clean up old test data for this specific service name if it exists
  -- This allows you to run the script multiple times to reset the test environment
  DELETE FROM services WHERE name = 'Shiftly Internal Test';

  -- 3. Create Service
  INSERT INTO services (id, name, start_date, end_date, join_code)
  VALUES (v_service_id, 'Shiftly Internal Test', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', 'SHIFT-TEST');

  -- 4. Create Group
  -- We use a placeholder for created_by and update it later
  INSERT INTO groups (id, service_id, name, emoji, created_by)
  VALUES (v_group_id, v_service_id, 'Guardiens du Temps', '🛡️', v_intern_id);

  -- 5. Create Intern (linked to our test user)
  INSERT INTO interns (id, user_id, service_id, name, is_admin, group_id)
  VALUES (v_intern_id, v_user_id, v_service_id, 'Dr. Test Assistant', true, v_group_id);

  -- 6. Update service created_by
  UPDATE services SET created_by = v_intern_id WHERE id = v_service_id;

  -- 7. Seed assignments for the next 7 days specifically for this group
  -- This will ensure the "Today" view and "Calendar" view show active assignments
  FOR i IN 0..6 LOOP
    INSERT INTO assignments (service_id, group_id, date)
    VALUES (v_service_id, v_group_id, CURRENT_DATE + (i || ' day')::interval)
    ON CONFLICT (service_id, date) DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Test environment ready!';
  RAISE NOTICE 'Join Code: SHIFT-TEST';
END $$;
```

## 3. Verify the Results
Now that the data is seeded, log in to the application:

1.  **Log In** with `test@shiftly.com` / `ShiftlyTest2026`.
2.  You should be automatically redirected to the **Dashboard**.
3.  Because you are already associated with the `Shiftly Internal Test` service in the database, you should see:
    -   **Today's Guard**: "Guardiens du Temps" (shield emoji).
    -   **Calendar**: Your group should be assigned to the current day and the next 6 days.
    -   **Profile**: Your name should be "Dr. Test Assistant".

## 4. Default Credentials (Summary)
| Field | Value |
| :--- | :--- |
| **Service Name** | Shiftly Internal Test |
| **Join Code** | `SHIFT-TEST` |
| **Email** | `test@shiftly.com` |
| **Password** | `ShiftlyTest2026` |
