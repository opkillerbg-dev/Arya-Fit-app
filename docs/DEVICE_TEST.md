# AERUNO phone test (task T07)

For the owner. No technical knowledge needed: do the steps, tick the box, write what happened. About 30 minutes now, plus a few checks spread over a day. Send the filled list to any assistant afterwards.
Do not try to fix anything while testing. If something looks wrong, write the time and what you did, and take a screenshot.

**Before you start:** write these down.
- Phone model and Android version: ____________________
- App version (Me > About & help, bottom): ____________________
- Battery saver on or off right now: ____________________

Result key: PASS / FAIL / UNSURE. Notes can be short.

## Already confirmed (no action)
- [x] Installing a new build over the old one keeps your data (confirmed by the owner 2026-11-16).

## Part 1: do now, about 30 minutes

| # | Test | Steps | Should happen | Result | Notes |
|---|---|---|---|---|---|
| D1 | Backup round trip | Me > Data & backup > Export backup. Save the file. Then use Import on the same file. | Export makes a file. Import brings back the same plan, progress and history. Nothing disappears. | | |
| D2 | Free run, screen locked | Move > Start free run > Run. Lock the phone. Walk about 10 minutes. Unlock. | Timer kept going. Distance is about right. Route has no big gaps. | | |
| D3 | Run while using another app | Start a free run. Open Maps or YouTube for 5 minutes. Come back. | Run is still going. Distance kept growing. | | |
| D4 | Stop and save | Stop the run and save it. Open Progress > History and Overview. | Exactly ONE new run in History. Total km went up by about the run distance. | | |
| D5 | No GPS signal | Start a free run. Turn on airplane mode for 1 minute (or walk indoors), then turn it off. | App did not crash. Run carries on. Distance does not jump by a huge amount. | | |
| D6 | Location refused | Phone Settings > Apps > AERUNO > Permissions > Location > Don't allow. Start a free run. Then allow it again. | App does not crash and tells you something. Timer still works. Allowing again makes GPS work. | | |
| D7 | Notifications refused | Phone Settings > Apps > AERUNO > Notifications > turn OFF. Start a short free run. Turn it back ON. | App does not crash. Note whether the run keeps going with the screen locked for 3 minutes. | | |
| D8 | Battery saver | Turn on battery saver. Do a 3 minute free run with the screen locked. | Distance and timer still correct. | | |
| D9 | Hidden step notification | Pull down the notification shade. Then Phone Settings > Apps > AERUNO > Notifications. | No permanent "Counting your steps" notification. The category "Step counting (hidden)" is switched off. | | |

## Part 2: spread over a day

| # | Test | Steps | Should happen | Result | Notes |
|---|---|---|---|---|---|
| D10 | Steps with screen off | Note today's steps (Progress > Overview) and the time. Leave the phone in your pocket, screen off, for 1 hour of normal moving. Check again. | Steps went up by a believable amount. | | |
| D11 | Steps after closing the app | Swipe the app away from recent apps. Walk about 100 steps. Open the app. | Steps include the new walk. | | |
| D12 | Steps after restart | Restart the phone. Do NOT open the app. Walk about 100 steps. Open the app. | Steps include the walk after the restart. Earlier steps today are still there. | | |
| D13 | Midnight | Next morning open Progress. | Yesterday's steps are saved under yesterday. Today starts near 0. | | |
| D14 | Daily reminder | Me > Reminders & sound > Daily reminder: set it 5 minutes ahead. Lock the phone. | A notification arrives. Write how many minutes late or early: ______ | | |
| D15 | Widgets | Add each AERUNO widget to the home screen (Steps, Today, Overview). Walk a bit. | Widgets show data and the steps number moves after a while. | | |
| D16 | Time zone (optional) | Change the phone time zone, wait a minute, open the app, change it back. | Nothing is lost or doubled. | | |

## Extra things to note while testing
- Did the phone ever kill the app in the background? (Which test, how long?) ____________________
- Did the run or step count ever stop on its own? ____________________
- Any pop-up you did not expect (Play Protect, battery, permission)? ____________________
- Anything confusing or hard to find? ____________________

## When you are done
Send a message with the phone model, Android version, and the Result column (D1 to D16, plus notes for anything not PASS) to any assistant. Say "T11 results". The assistant writes them into `docs/log/` and opens a task card for each FAIL or UNSURE. Nothing gets changed on your phone's data by that.

## For the assistant reading the results
- D9, D10, D11 and D12 test the hidden step-service notification (channel `arya_steps_off`, importance NONE). A FAIL there means the service may be killed when the notification is hidden. Do not change the channel without the owner's OK; propose options (for example a minimal visible notification) in a card.
- D6, D7 test permission denial paths (see `docs/PERMISSIONS.md`).
- D14 depends on exact-alarm access (`SCHEDULE_EXACT_ALARM`, see PERMISSIONS.md section E).
