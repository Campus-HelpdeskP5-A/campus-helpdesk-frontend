# Test Execution Report

## HLP-FR-01

| TC ID | Test Case | Status | Description |
|---|---|---|---|
| TC1 | Valid sign-in | T | |
| TC2 | Invalid sign-in rejected | T | |
| TC3 | Sign-up with valid data | T | |
| TC4 | Sign-up with missing required field | T | |
| TC5 | Sign-up with invalid email format | T | |
| TC6 | Sign-up with duplicate email | T | |
| TC7 | Password masking | T | |
| TC8 | Logout terminates session | F | There is no Logout option (button) |
| TC9 | Unauthenticated access to protected route blocked | F | dependent on TC8|
| TC10 | New Reporter account — immediate access | T |
| TC11 | New Technician account — Pending state enforced | T |
| TC12 | New Manager account — Pending state enforced | T |
| TC13 | Bypass attempt on Pending account blocked | T |
| TC14 | Manager approves pending account | T |
| TC15 | Approved account gains access | T |
| TC16 | Manager rejects pending account | T |
| TC17 | Non-Manager cannot approve accounts | T |
| TC18 | Role-based dashboard routing | T | |
| TC19 | Dashboard content matches role | T | |
| TC20 | Cross-role dashboard access blocked | T | Works, but no blocked/denied component shown in the frontend |
| TC21 | Equal Manager permissions | T |
| TC22 | Auditor read-only access | T | 
| TC23 | Ticket submission form — required fields present | T | |
| TC24 | Submit ticket with all required fields | T | |
| TC25 | Submit ticket with missing required field blocked | T | |
| TC26 | Submit ticket without optional Asset ID | T | |
| TC27 | Attachment upload — valid file | F | Same root cause as attachment upload below |
| TC28 | Attachment upload — invalid file type rejected | F | Same root cause as attachment upload below |
| TC29 | Attachment upload — oversized file rejected | F | Attachment does not work at all — UI only shows that a file can be attached |
| TC30 | Unauthenticated ticket submission blocked | T | It works functionally, but in UI it shows me waiting without any warning component