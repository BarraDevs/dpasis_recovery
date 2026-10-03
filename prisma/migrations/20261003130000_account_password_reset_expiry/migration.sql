-- Expiração do token de redefinição de senha.
-- O token passa a ser gravado como hash SHA-256 (64 hex, cabe em VARCHAR(64)); sem prazo ele valeria para sempre.
ALTER TABLE "accounts" ADD COLUMN "passwordResetTokenExpiresAt" TIMESTAMP(3);
