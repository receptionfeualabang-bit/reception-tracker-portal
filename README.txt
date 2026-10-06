FEU ALABANG RECEPTION PORTAL - OPTIMIZED ARCADE UPDATE

This version is based on the supplied index-19-25mb-3.html.

Updates in this revision:
- Fixed Visitor ID Snake: restored the initial requestAnimationFrame start so the game actually runs.
- Kept all 9 existing arcade games.
- Replaced the previous arcade game logos with a new minimalist 3D visual set.
- Removed the large game logo from the active-game header and instruction modal.
- Kept the new logos on the game-selection cards.
- Retained the existing portal architecture, game mechanics, localStorage keys, and Google Apps Script integration.

GitHub structure:
index.html
assets/
  game-logo-speed-run.webp
  game-logo-survival.webp
  game-logo-social.webp
  game-logo-detective.webp
  game-logo-rush-hour.webp
  game-logo-memory.webp
  game-logo-cleanup.webp
  game-logo-seating.webp
  game-logo-delivery.webp
  plus the existing arcade scene assets and other assets.

Upload the extracted index.html and the entire assets folder to the same GitHub repository.


UPDATED v4 POLISH (2026-10-06)
- Website Sign-In / Sign-Out is separate from manual Reception Time-In / Time-Out.
- Receptionist Certification added with 20 randomized questions, randomized answer order, 80% passing score, and FEU Alabang certificate.
- Arcade is compact by default; browser fullscreen is optional via Full Screen / Exit Full Screen.
- Arcade player name field added; player name is displayed large with receptionist name as subtitle.
- FrontDesk AI suggested questions use expandable dropdown groups; answers use wider readable chat bubbles.
- FrontDesk AI Rant Mode added with local one-hour auto-expiring rant storage and no Activity Log entry.


FINAL AUDIT NOTES
=================
- Website Sign-In / Sign-Out is separate from Manual Time-In / Time-Out attendance.
- Manual Time-In writes the active shift to the attendance store, including receptionist profile photo.
- Dashboard “Receptionist on Duty” reads the active manual shift and displays name, ID, time, status, and photo.
- Website Sign-In alone does not create a duty attendance record.
- Certification navigation and start controls are wired; 100-question bank supports 20 randomized missions with shuffled choices and 80% passing.
- Certification result includes FEU Alabang branding, score, issue date, credential ID, and print/save action.
- Arcade fullscreen is in-portal and opt-in; browser fullscreen is never forced.
- AI suggested questions use expandable categories; Rant Mode is local and expires after 1 hour.
- HTML ID audit: no duplicate IDs detected.
- Inline JavaScript audit: no syntax errors detected.
- ZIP integrity audit: passed.
- Production runtime was additionally inspected against the actual data paths.
