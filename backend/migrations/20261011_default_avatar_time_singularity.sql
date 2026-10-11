-- Appens logga är standardavatar: för nya användare och för de som saknar avatar
ALTER TABLE users
ALTER COLUMN avatar SET DEFAULT 'time-singularity';

UPDATE users
SET avatar = 'time-singularity'
WHERE avatar IS NULL OR avatar = '';
