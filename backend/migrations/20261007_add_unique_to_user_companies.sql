-- Förhindrar dubbla tilldelningar av samma företag till samma användare (krav i SECURITY.md)
ALTER TABLE user_companies
ADD CONSTRAINT user_companies_user_id_company_id_key UNIQUE (user_id, company_id);
