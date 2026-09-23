# Sentinel / SIEM

Application and infrastructure telemetry should flow to centralized logging and then Microsoft Sentinel (or an equivalent SIEM).

Recommended events:
- authentication and MFA events
- role/permission changes
- tender creation/edit/publish
- bid submission
- document upload/download/access
- malware scan result
- OCR/AI failures
- government adapter calls/failures
- compliance-result changes
- AI recommendations
- officer qualification/disqualification
- audit access
- infrastructure/security alerts

Never send passwords, private keys or unnecessary raw sensitive document content to the SIEM.
