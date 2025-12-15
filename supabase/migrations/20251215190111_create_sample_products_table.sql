/*
  # Create Sample Products Table for Testing

  1. New Tables
    - `produtos`
      - `codigo` (text, primary key) - Product code (6 digits)
      - `nome` (text) - Product name
      - `preco_custo` (decimal) - Cost price
      - `preco_venda` (decimal) - Selling price
      - `personal1` (text) - Custom field
      - `estoque` (integer) - Stock quantity
      - `ativo` (boolean) - Active status
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `produtos` table
    - Add policy for public access (for testing purposes)

  3. Sample Data
    - Insert some sample products for testing
*/

CREATE TABLE IF NOT EXISTS produtos (
  codigo text PRIMARY KEY,
  nome text NOT NULL,
  preco_custo decimal(10, 2) DEFAULT 0,
  preco_venda decimal(10, 2) DEFAULT 0,
  personal1 text,
  estoque integer DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to produtos"
  ON produtos
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public update to produtos"
  ON produtos
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public insert to produtos"
  ON produtos
  FOR INSERT
  WITH CHECK (true);

INSERT INTO produtos (codigo, nome, preco_custo, preco_venda, personal1, estoque)
VALUES
  ('000001', 'Produto Exemplo 1', 10.50, 25.00, 'Fornecedor A', 100),
  ('000002', 'Produto Exemplo 2', 15.75, 35.00, 'Fornecedor B', 50),
  ('000003', 'Produto Exemplo 3', 8.20, 18.90, 'Fornecedor A', 200),
  ('000004', 'Produto Exemplo 4', 22.30, 48.00, 'Fornecedor C', 75),
  ('000005', 'Produto Exemplo 5', 12.00, 28.50, 'Fornecedor B', 120)
ON CONFLICT (codigo) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos(codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos(nome);
