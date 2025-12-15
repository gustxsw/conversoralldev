/*
  # Create Operations History Schema

  1. New Tables
    - `operation_history`
      - `id` (uuid, primary key) - Unique identifier for each operation
      - `operation_type` (text) - Type of operation (update, insert)
      - `table_name` (text) - Name of the target table
      - `records_affected` (integer) - Number of records processed
      - `records_success` (integer) - Number of successful updates
      - `records_failed` (integer) - Number of failed updates
      - `file_name` (text) - Original Excel file name
      - `mapping_config` (jsonb) - Column mapping configuration
      - `error_log` (jsonb) - Errors that occurred during execution
      - `executed_at` (timestamptz) - When the operation was executed
      - `created_by` (uuid) - User who executed the operation (nullable for now)
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `operation_history` table
    - Add policy for public access (since no auth is implemented yet)
*/

CREATE TABLE IF NOT EXISTS operation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL,
  table_name text NOT NULL,
  records_affected integer DEFAULT 0,
  records_success integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  file_name text,
  mapping_config jsonb,
  error_log jsonb,
  executed_at timestamptz DEFAULT now(),
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE operation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to operation history"
  ON operation_history
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to operation history"
  ON operation_history
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_operation_history_executed_at ON operation_history(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_operation_history_table_name ON operation_history(table_name);
