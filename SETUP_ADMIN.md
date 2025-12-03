# Admin Panel Setup Guide

## 1. Apply Database Migration
You need to add the `role` column and admin policies to your Supabase database.

1.  Go to the [Supabase Dashboard](https://supabase.com/dashboard).
2.  Open the **SQL Editor**.
3.  Copy and paste the content of `supabase/migrations/20251201000050_add_admin_role.sql`.
4.  Run the query.

## 2. Grant Yourself Admin Access
Since there is no initial admin, you must manually promote your user.

1.  Log in to your LootVibe app.
2.  Go to the [Supabase Table Editor](https://supabase.com/dashboard/project/_/editor/users).
3.  Find your user row in the `users` table.
4.  Change the `role` column from `user` to `admin`.
5.  Save the change.

## 3. Access the Admin Panel
1.  Refresh the LootVibe app.
2.  You should now see an **ADMIN** link in the navigation bar (next to Affiliates).
3.  Click it to access the secure dashboard.

## Troubleshooting
-   **Access Denied**: Ensure your `role` is exactly `admin` (lowercase) in the `users` table.
-   **Database Error**: Check the browser console. If it says "column role does not exist", re-run the migration.
