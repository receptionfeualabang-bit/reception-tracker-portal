FEU ALABANG RECEPTION PORTAL
FINAL LIVE OPERATIONS + NOTIFICATIONS + WEBSITE SESSION TRACKING FIX

Key fixes:
- Notification items use delegated click handling and open their target module reliably.
- Live Operational Control refreshes continuously and reflects current local/cloud state.
- Website sign-in creates a unique session record per login.
- Website sign-out closes only the exact session that belongs to the logged-in browser session.
- Website sessions now track sign-in, sign-out, duration, last-seen timestamp, and source.
- Website session records are included in Google Sheets cloud keys and local-first sync.
- Manual Time-In/Time-Out remains a separate attendance record.
- No broken Receptionist-on-Duty / Shift-Progress hero block was restored.
- Enhanced reception handbook included.

IMPORTANT:
Google Sheets shared synchronization still requires the portal's approved Apps Script Web App endpoint/token in Settings.
