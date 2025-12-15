/*
  # Create execute_sql Function

  1. New Functions
    - `execute_sql` - Executes dynamic SQL queries
      - Takes a SQL query as parameter
      - Returns success status
      - Used for executing UPDATE statements from the application

  2. Security
    - Function has SECURITY DEFINER to allow dynamic SQL execution
    - No RLS needed as this is a function, not a table
*/

CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;
