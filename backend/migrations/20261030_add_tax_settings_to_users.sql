-- Användarens egen skattesats för uppskattad nettolön (NULL = inte angiven)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(4,1),
ADD COLUMN IF NOT EXISTS church_fee BOOLEAN NOT NULL DEFAULT false;
