# Arya Fit: picture prompts for the 77 exercises that have none (147 pictures)

Made at app v116. Goal: 147 square pictures in the SAME style as the existing 62 exercise pictures, ready for ChatGPT image generation. Colour-theme masks come afterwards (see the last section).

## How to use this file (ChatGPT)

1. Start a NEW chat. Attach 3 existing pictures as the style reference: `web/images/exercises/arya-ex-push-ups-a.webp`, `arya-ex-bodyweight-squats-a.webp`, `arya-ex-chair-dips-b.webp` (convert to PNG or JPG first if ChatGPT refuses webp).
2. Paste the **MASTER STYLE BLOCK** below once, as the first message. Say: "Remember this for the whole chat. Reply only OK."
3. For each picture, paste ONE **frame prompt** (the grey quoted text under each exercise). Ask for one image at a time.
4. Always generate frame **A** first. For frame **B/C**, attach the finished A picture and add: "Same character, same size, same position, same line weight, same colours. Only change the pose as described."
5. If the face, outfit colour or mat colour drifts, say: "Match the reference style exactly. Dark green tank top and shorts, sage mat, cream background." Do not accept pictures with text, arrows or logos.
6. Keep about 8 exercises per chat. Long chats drift; start a new chat and paste the master block again.
7. Save each result as 1024 x 1024 and name it exactly as shown (`arya-ex-<slug>-<letter>.webp`). A single-frame exercise has only `-a`.

## Existing look (what to match)

The existing set is a lean dark-haired man in side view, facing RIGHT, dark green tank and shorts, off-white shoes, sage mat with a thin gold edge, cream background, wooden chair, beige wall, dark green backpack. New weighted pictures use a CHARCOAL backpack instead (mask safety).

## MASTER STYLE BLOCK (paste once per chat)

```
You are making a set of consistent exercise illustrations for a fitness app. Follow these rules for EVERY image in this chat.

STYLE: Flat-colour editorial vector illustration, clean confident dark-brown outlines of even weight, soft cel shading with ONE shade step per colour (no gradients, no glossy highlights, no texture, no grain), warm and calm, like a premium fitness-book diagram. Square 1:1 canvas. Plain flat off-white cream background, exactly #FAF6EB, with nothing else on it (no vignette, no shadow blob, no floor gradient, no border, no text, no letters, no numbers, no arrows, no watermark, no logo).

THE ATHLETE (identical in every picture): one adult man, athletic and lean, short dark brown wavy hair, light-tan skin, simple minimal face (a small nose and a hint of brow only; no detailed eyes, no mouth detail, so the face never looks uncanny). He wears a DARK GREEN sleeveless tank top and DARK GREEN knee-length athletic shorts, both in the same flat deep green (about #1F5A3E) with only simple fold lines, white ankle socks, and off-white running shoes with pale green soles. No logos, stripes, prints, pockets, drawstrings or text on any clothing.

FLOOR: when exercising on the floor he is on a rectangular sage-green exercise mat (about #9DB8A6) drawn in perspective-free side view as a thin slab, with a very thin gold outline (about #B8923A). The mat is about 75% of the picture width and sits in the lower third. For standing, gym-machine or hanging exercises where the existing set uses no mat, use a very thin soft-grey floor line instead.

PROPS (keep the same look every time): chair = plain light-oak wooden chair with four slim legs and a flat seat. Wall = tall plain beige wall panel (#E6DCC6) with a slightly darker edge, as in the existing wall-sit picture. Dumbbell = hex dumbbell in dark charcoal metal with black handle, no text. Barbell = steel bar with two black plates on each side, no text. Pull-up bar / dip bar / rack = brushed steel, thin, with simple posts. Gym machines and cable stations = SIMPLE generic shapes in charcoal grey and light grey, black cables, black padded seats, no brand, no logos, no readout text. Resistance band = flat muted orange-red band. Backpack (for weighted work) = charcoal-grey, NOT green, so it can never be mistaken for clothing. NO prop may use the same dark green as the clothing.

COMPOSITION AND CONSISTENCY: the whole figure and every prop must fit inside the square with a clear margin of at least 6% on every side, centred. Figure height about 60-65% of the picture height when standing; lying or kneeling poses fill about 80% of the width. Same camera distance, same line weight and same colours in the A, B and C pictures of one exercise, and the figure must be the same size and in the same place in A and B so that flipping between them looks like one smooth movement (only the moving body parts change). Anatomically correct hands, feet and joint angles; every pose must be safe and show textbook form. Do NOT draw motion lines, arrows, dotted paths, sweat, sparkles, labels or captions.

MASK-FRIENDLY RULES (so the colour-theme masks work later): (1) the tank top and shorts must be single flat green shapes with thin fold lines, because the theme mask recolours exactly those two garments; (2) nothing else in the picture may be the same green; (3) keep the garments' outlines closed and clean, no overlap with hair, skin or props of the same colour; (4) no transparent background and no gradients inside the garments.

VIEW: unless an image says otherwise, use a true SIDE view of the athlete, facing RIGHT, full body visible from head to feet (or to the hands for floor poses), camera at mid-body height.

OUTPUT: one image per request, 1024 x 1024.
```

## Checklist for every finished picture

- Whole body and every prop inside the square, nothing cropped
- Same man, same green (#1F5A3E-ish) clothes, same cream background
- Joints and form correct for the exercise (see "Must show" and "Avoid" lines)
- No text, no arrows, no logos, no shadow blobs
- A/B pairs: same size and position, only the moving parts change
- Clothing is two clean flat green shapes (needed for the masks)

---

## Index

| # | Exercise | Files | Gear |
|---|---|---|---|
| 1 | Wall push-ups | `arya-ex-wall-push-ups-a.webp`, `arya-ex-wall-push-ups-b.webp` | none (wall) |
| 2 | Knee push-ups | `arya-ex-knee-push-ups-a.webp`, `arya-ex-knee-push-ups-b.webp` | none (mat) |
| 3 | Decline push-ups | `arya-ex-decline-push-ups-a.webp`, `arya-ex-decline-push-ups-b.webp` | chair |
| 4 | Archer push-ups | `arya-ex-archer-push-ups-a.webp`, `arya-ex-archer-push-ups-b.webp` | none (mat) |
| 5 | Pseudo-planche push-ups | `arya-ex-pseudo-planche-push-ups-a.webp`, `arya-ex-pseudo-planche-push-ups-b.webp` | none (mat) |
| 6 | Weighted push-ups | `arya-ex-weighted-push-ups-a.webp`, `arya-ex-weighted-push-ups-b.webp` | backpack |
| 7 | One-arm push-up negatives | `arya-ex-one-arm-push-up-negatives-a.webp`, `arya-ex-one-arm-push-up-negatives-b.webp` | none (mat) |
| 8 | Machine chest press | `arya-ex-machine-chest-press-a.webp`, `arya-ex-machine-chest-press-b.webp` | gym machine |
| 9 | Dumbbell bench press | `arya-ex-dumbbell-bench-press-a.webp`, `arya-ex-dumbbell-bench-press-b.webp` | dumbbells, flat bench |
| 10 | Dumbbell fly | `arya-ex-dumbbell-fly-a.webp`, `arya-ex-dumbbell-fly-b.webp` | dumbbells, flat bench |
| 11 | Cable fly | `arya-ex-cable-fly-a.webp`, `arya-ex-cable-fly-b.webp` | cable station |
| 12 | Barbell bench press | `arya-ex-barbell-bench-press-a.webp`, `arya-ex-barbell-bench-press-b.webp` | barbell, bench with rack |
| 13 | Parallel bar dips | `arya-ex-parallel-bar-dips-a.webp`, `arya-ex-parallel-bar-dips-b.webp` | dip bars |
| 14 | Weighted dips | `arya-ex-weighted-dips-a.webp`, `arya-ex-weighted-dips-b.webp` | dip bars, backpack |
| 15 | Machine shoulder press | `arya-ex-machine-shoulder-press-a.webp`, `arya-ex-machine-shoulder-press-b.webp` | gym machine |
| 16 | Lateral raises | `arya-ex-lateral-raises-a.webp`, `arya-ex-lateral-raises-b.webp` | light dumbbells |
| 17 | Dumbbell shoulder press | `arya-ex-dumbbell-shoulder-press-a.webp`, `arya-ex-dumbbell-shoulder-press-b.webp` | dumbbells |
| 18 | Elevated pike push-ups | `arya-ex-elevated-pike-push-ups-a.webp`, `arya-ex-elevated-pike-push-ups-b.webp` | chair |
| 19 | Barbell overhead press | `arya-ex-barbell-overhead-press-a.webp`, `arya-ex-barbell-overhead-press-b.webp` | barbell |
| 20 | Wall handstand hold | `arya-ex-wall-handstand-hold-a.webp` | wall |
| 21 | Handstand push-up negatives | `arya-ex-handstand-push-up-negatives-a.webp`, `arya-ex-handstand-push-up-negatives-b.webp` | wall, thick mat |
| 22 | Dead hang | `arya-ex-dead-hang-a.webp` | pull-up bar |
| 23 | Scapular pull-ups | `arya-ex-scapular-pull-ups-a.webp`, `arya-ex-scapular-pull-ups-b.webp` | pull-up bar |
| 24 | Band-assisted pull-ups | `arya-ex-band-assisted-pull-ups-a.webp`, `arya-ex-band-assisted-pull-ups-b.webp` | pull-up bar, resistance band |
| 25 | Negative pull-ups | `arya-ex-negative-pull-ups-a.webp`, `arya-ex-negative-pull-ups-b.webp` | pull-up bar, step/box |
| 26 | Lat pulldown | `arya-ex-lat-pulldown-a.webp`, `arya-ex-lat-pulldown-b.webp` | cable machine |
| 27 | Assisted pull-up machine | `arya-ex-assisted-pull-up-machine-a.webp`, `arya-ex-assisted-pull-up-machine-b.webp` | assisted pull-up machine |
| 28 | Chin-ups | `arya-ex-chin-ups-a.webp`, `arya-ex-chin-ups-b.webp` | pull-up bar |
| 29 | Pull-ups | `arya-ex-pull-ups-a.webp`, `arya-ex-pull-ups-b.webp` | pull-up bar |
| 30 | Wide pull-ups | `arya-ex-wide-pull-ups-a.webp`, `arya-ex-wide-pull-ups-b.webp` | pull-up bar |
| 31 | Weighted pull-ups | `arya-ex-weighted-pull-ups-a.webp`, `arya-ex-weighted-pull-ups-b.webp` | pull-up bar, backpack |
| 32 | Archer pull-ups | `arya-ex-archer-pull-ups-a.webp`, `arya-ex-archer-pull-ups-b.webp` | pull-up bar |
| 33 | L-sit pull-ups | `arya-ex-l-sit-pull-ups-a.webp`, `arya-ex-l-sit-pull-ups-b.webp` | pull-up bar |
| 34 | One-arm pull-up negatives | `arya-ex-one-arm-pull-up-negatives-a.webp`, `arya-ex-one-arm-pull-up-negatives-b.webp` | pull-up bar, box |
| 35 | Inverted rows | `arya-ex-inverted-rows-a.webp`, `arya-ex-inverted-rows-b.webp` | low bar (rack or smith bar) |
| 36 | Seated cable row | `arya-ex-seated-cable-row-a.webp`, `arya-ex-seated-cable-row-b.webp` | cable machine |
| 37 | Feet-elevated inverted rows | `arya-ex-feet-elevated-inverted-rows-a.webp`, `arya-ex-feet-elevated-inverted-rows-b.webp` | low bar, chair |
| 38 | Dumbbell row | `arya-ex-dumbbell-row-a.webp`, `arya-ex-dumbbell-row-b.webp` | dumbbell, flat bench |
| 39 | Barbell row | `arya-ex-barbell-row-a.webp`, `arya-ex-barbell-row-b.webp` | barbell |
| 40 | Band pull-aparts | `arya-ex-band-pull-aparts-a.webp`, `arya-ex-band-pull-aparts-b.webp` | resistance band |
| 41 | Face pulls | `arya-ex-face-pulls-a.webp`, `arya-ex-face-pulls-b.webp` | resistance band |
| 42 | Dumbbell curl | `arya-ex-dumbbell-curl-a.webp`, `arya-ex-dumbbell-curl-b.webp` | dumbbells |
| 43 | Chair squat | `arya-ex-chair-squat-a.webp`, `arya-ex-chair-squat-b.webp` | chair |
| 44 | Leg press | `arya-ex-leg-press-a.webp`, `arya-ex-leg-press-b.webp` | leg press machine |
| 45 | Goblet squat | `arya-ex-goblet-squat-a.webp`, `arya-ex-goblet-squat-b.webp` | dumbbell |
| 46 | Barbell back squat | `arya-ex-barbell-back-squat-a.webp`, `arya-ex-barbell-back-squat-b.webp` | barbell, squat rack |
| 47 | Step-ups | `arya-ex-step-ups-a.webp`, `arya-ex-step-ups-b.webp` | chair/step |
| 48 | Walking lunges | `arya-ex-walking-lunges-a.webp`, `arya-ex-walking-lunges-b.webp` | none (mat) |
| 49 | Bulgarian split squats | `arya-ex-bulgarian-split-squats-a.webp`, `arya-ex-bulgarian-split-squats-b.webp` | chair |
| 50 | Shrimp squat progression | `arya-ex-shrimp-squat-progression-a.webp`, `arya-ex-shrimp-squat-progression-b.webp` | none (mat) |
| 51 | Pistol squat negatives | `arya-ex-pistol-squat-negatives-a.webp`, `arya-ex-pistol-squat-negatives-b.webp` | chair |
| 52 | Pistol squat | `arya-ex-pistol-squat-a.webp`, `arya-ex-pistol-squat-b.webp` | none (mat) |
| 53 | Single-leg glute bridge | `arya-ex-single-leg-glute-bridge-a.webp`, `arya-ex-single-leg-glute-bridge-b.webp` | none (mat) |
| 54 | Hamstring walkouts | `arya-ex-hamstring-walkouts-a.webp`, `arya-ex-hamstring-walkouts-b.webp` | none (mat) |
| 55 | Romanian deadlift | `arya-ex-romanian-deadlift-a.webp`, `arya-ex-romanian-deadlift-b.webp` | dumbbells |
| 56 | Hip thrust | `arya-ex-hip-thrust-a.webp`, `arya-ex-hip-thrust-b.webp` | bench, barbell |
| 57 | Barbell deadlift | `arya-ex-barbell-deadlift-a.webp`, `arya-ex-barbell-deadlift-b.webp` | barbell |
| 58 | Nordic curl negatives | `arya-ex-nordic-curl-negatives-a.webp`, `arya-ex-nordic-curl-negatives-b.webp` | none (mat, anchor) |
| 59 | Single-leg calf raise | `arya-ex-single-leg-calf-raise-a.webp`, `arya-ex-single-leg-calf-raise-b.webp` | wall (support) |
| 60 | Pallof press | `arya-ex-pallof-press-a.webp`, `arya-ex-pallof-press-b.webp` | resistance band |
| 61 | Cable crunch | `arya-ex-cable-crunch-a.webp`, `arya-ex-cable-crunch-b.webp` | cable machine |
| 62 | Hollow body hold | `arya-ex-hollow-body-hold-a.webp` | none (mat) |
| 63 | Hanging knee raises | `arya-ex-hanging-knee-raises-a.webp`, `arya-ex-hanging-knee-raises-b.webp` | pull-up bar |
| 64 | Hanging leg raises | `arya-ex-hanging-leg-raises-a.webp`, `arya-ex-hanging-leg-raises-b.webp` | pull-up bar |
| 65 | Ab wheel rollout | `arya-ex-ab-wheel-rollout-a.webp`, `arya-ex-ab-wheel-rollout-b.webp` | ab wheel |
| 66 | L-sit | `arya-ex-l-sit-a.webp` | parallettes or bars |
| 67 | Jumping jacks | `arya-ex-jumping-jacks-a.webp`, `arya-ex-jumping-jacks-b.webp` | none |
| 68 | High knees | `arya-ex-high-knees-a.webp`, `arya-ex-high-knees-b.webp` | none |
| 69 | Stationary bike | `arya-ex-stationary-bike-a.webp` | stationary bike |
| 70 | Jump rope | `arya-ex-jump-rope-a.webp`, `arya-ex-jump-rope-b.webp` | jump rope |
| 71 | Rowing machine | `arya-ex-rowing-machine-a.webp`, `arya-ex-rowing-machine-b.webp` | rowing machine |
| 72 | Treadmill intervals | `arya-ex-treadmill-intervals-a.webp`, `arya-ex-treadmill-intervals-b.webp` | treadmill |
| 73 | Band shoulder dislocates | `arya-ex-band-shoulder-dislocates-a.webp`, `arya-ex-band-shoulder-dislocates-b.webp` | resistance band |
| 74 | Thoracic rotation | `arya-ex-thoracic-rotation-a.webp`, `arya-ex-thoracic-rotation-b.webp` | none (mat) |
| 75 | Ankle mobility drill | `arya-ex-ankle-mobility-drill-a.webp`, `arya-ex-ankle-mobility-drill-b.webp` | wall |
| 76 | Doorway chest stretch | `arya-ex-doorway-chest-stretch-a.webp` | door frame |
| 77 | Couch stretch | `arya-ex-couch-stretch-a.webp` | wall or couch |

---

### 1. Wall push-ups

**Ladder:** Push-up ladder, L0  
**Files:** `arya-ex-wall-push-ups-a.webp`, `arya-ex-wall-push-ups-b.webp`  
**Gear:** none (wall)

**Frame A** (`arya-ex-wall-push-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Wall push-ups". VIEW: Side view, facing right (toward the wall on the right). SETTING: Standing on the sage mat, a plain beige wall on the RIGHT edge of the picture, same wall style as the wall-sit picture. POSE: START. Body in one straight diagonal line from heels to head, leaning toward the wall, arms straight, palms flat on the wall at chest height, hands shoulder-width apart, feet about 60 cm back from the wall, heels down. MUST SHOW: Straight line from ankles to head in both frames; hands at chest height. AVOID: Sagging hips, piked hips, feet too close to the wall. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-wall-push-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Wall push-ups". VIEW: Side view, facing right (toward the wall on the right). SETTING: Standing on the sage mat, a plain beige wall on the RIGHT edge of the picture, same wall style as the wall-sit picture. POSE: END. Same diagonal line but elbows bent about 90 degrees pointing back and slightly down, chest close to the wall, nose about a fist from the wall, heels still down, body still straight. MUST SHOW: Straight line from ankles to head in both frames; hands at chest height. AVOID: Sagging hips, piked hips, feet too close to the wall. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 2. Knee push-ups

**Ladder:** Push-up ladder, L1  
**Files:** `arya-ex-knee-push-ups-a.webp`, `arya-ex-knee-push-ups-b.webp`  
**Gear:** none (mat)

**Frame A** (`arya-ex-knee-push-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Knee push-ups". VIEW: Side view, facing right. SETTING: On the sage mat. POSE: START. Kneeling push-up position, knees on the mat, shins on the mat with ankles crossed or feet lifted behind, body in one straight line from knees to head, arms straight, hands under shoulders. MUST SHOW: Straight line knees to shoulders. Hips NOT pushed up and NOT sagging. AVOID: Hips hiked up, head dropped, elbows flared to 90 degrees from the body. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-knee-push-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Knee push-ups". VIEW: Side view, facing right. SETTING: On the sage mat. POSE: END. Chest lowered to a fist-height above the mat, elbows bent about 90 degrees angled about 45 degrees from the body, straight line knees-to-head kept, neck neutral. MUST SHOW: Straight line knees to shoulders. Hips NOT pushed up and NOT sagging. AVOID: Hips hiked up, head dropped, elbows flared to 90 degrees from the body. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 3. Decline push-ups

**Ladder:** Push-up ladder, L3  
**Files:** `arya-ex-decline-push-ups-a.webp`, `arya-ex-decline-push-ups-b.webp`  
**Gear:** chair

**Frame A** (`arya-ex-decline-push-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Decline push-ups". VIEW: Side view, facing right. SETTING: Mat on the floor. A plain wooden chair (same style as the chair-dips picture) sits at the LEFT with its seat facing the figure, back of the chair pointing left. POSE: START. Hands on the mat under shoulders, arms straight, both feet resting on the chair seat so the body slopes downward from feet to head, body in a straight line, hips level with shoulders. MUST SHOW: Clear downhill slope from feet to hands, chair stable and fully visible. AVOID: Hips piking, chair tipping, hands too far forward. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-decline-push-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Decline push-ups". VIEW: Side view, facing right. SETTING: Mat on the floor. A plain wooden chair (same style as the chair-dips picture) sits at the LEFT with its seat facing the figure, back of the chair pointing left. POSE: END. Elbows bent about 90 degrees, chest a fist above the mat, head neutral, feet still on the chair, body still straight. MUST SHOW: Clear downhill slope from feet to hands, chair stable and fully visible. AVOID: Hips piking, chair tipping, hands too far forward. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 4. Archer push-ups

**Ladder:** Push-up ladder, L4  
**Files:** `arya-ex-archer-push-ups-a.webp`, `arya-ex-archer-push-ups-b.webp`  
**Gear:** none (mat)

**Frame A** (`arya-ex-archer-push-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Archer push-ups". VIEW: FRONT view (figure faces the viewer), full body from head to feet, slightly raised camera so the floor is visible. SETTING: On the sage mat, figure in a wide push-up position. POSE: START. Wide push-up position, hands about twice shoulder-width apart, arms straight, body straight, toes on the mat. MUST SHOW: The straight arm must be clearly straight; the bending arm clearly bent. AVOID: Both arms bent equally, hips twisting. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-archer-push-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Archer push-ups". VIEW: FRONT view (figure faces the viewer), full body from head to feet, slightly raised camera so the floor is visible. SETTING: On the sage mat, figure in a wide push-up position. POSE: END. Weight shifted over the RIGHT hand (viewer's left): that elbow bent deeply, chest lowered toward that hand, the LEFT arm completely straight and extended out to the side with the palm flat. Body stays straight, hips level. MUST SHOW: The straight arm must be clearly straight; the bending arm clearly bent. AVOID: Both arms bent equally, hips twisting. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 5. Pseudo-planche push-ups

**Ladder:** Push-up ladder, L4  
**Files:** `arya-ex-pseudo-planche-push-ups-a.webp`, `arya-ex-pseudo-planche-push-ups-b.webp`  
**Gear:** none (mat)

**Frame A** (`arya-ex-pseudo-planche-push-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Pseudo-planche push-ups". VIEW: Side view, facing right. SETTING: On the sage mat. POSE: START. Push-up position with hands placed beside the hips (fingers pointing back or out), shoulders leaning well forward past the hands, arms straight, body straight and tilted forward, toes on the mat, elbows pointing back and tucked. MUST SHOW: Shoulders clearly ahead of the hands; elbows tucked back close to the body. AVOID: A normal push-up hand position, flared elbows. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-pseudo-planche-push-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Pseudo-planche push-ups". VIEW: Side view, facing right. SETTING: On the sage mat. POSE: END. Elbows bent, tucked tight against the ribs, chest lowered between the hands, shoulders still ahead of the hands, body straight. MUST SHOW: Shoulders clearly ahead of the hands; elbows tucked back close to the body. AVOID: A normal push-up hand position, flared elbows. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 6. Weighted push-ups

**Ladder:** Push-up ladder, L4  
**Files:** `arya-ex-weighted-push-ups-a.webp`, `arya-ex-weighted-push-ups-b.webp`  
**Gear:** backpack

**Frame A** (`arya-ex-weighted-push-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Weighted push-ups". VIEW: Side view, facing right. SETTING: On the sage mat. A charcoal-grey backpack (NOT green) sits on the upper back, shoulder straps visible, packed full. POSE: START. Top push-up position, arms straight, body straight, loaded backpack resting on the upper back between the shoulder blades. MUST SHOW: Backpack clearly on the upper back, not the lower back; straight body. AVOID: Backpack sliding off, sagging hips. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-weighted-push-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Weighted push-ups". VIEW: Side view, facing right. SETTING: On the sage mat. A charcoal-grey backpack (NOT green) sits on the upper back, shoulder straps visible, packed full. POSE: END. Bottom position, chest a fist above the mat, elbows about 45 degrees from the body, backpack still on the upper back. MUST SHOW: Backpack clearly on the upper back, not the lower back; straight body. AVOID: Backpack sliding off, sagging hips. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 7. One-arm push-up negatives

**Ladder:** Push-up ladder, L5  
**Files:** `arya-ex-one-arm-push-up-negatives-a.webp`, `arya-ex-one-arm-push-up-negatives-b.webp`  
**Gear:** none (mat)

**Frame A** (`arya-ex-one-arm-push-up-negatives-a.webp`)

> Exercise illustration, picture A of 2 for "One-arm push-up negatives". VIEW: Side view, facing right, slightly 3/4 from the front so the single support arm and the free arm behind the back are visible. SETTING: On the sage mat. POSE: START. Feet wide apart for balance, one hand (the near hand) flat on the mat directly under the chest, arm straight, the other hand resting behind the lower back, body straight, hips slightly turned. MUST SHOW: Feet clearly wide, free hand clearly behind the back. AVOID: Feet together, free arm in the air. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-one-arm-push-up-negatives-b.webp`)

> Exercise illustration, picture B of 2 for "One-arm push-up negatives". VIEW: Side view, facing right, slightly 3/4 from the front so the single support arm and the free arm behind the back are visible. SETTING: On the sage mat. POSE: END. Lowered position: the supporting elbow bent deeply, chest a few centimetres above the mat, free hand still behind the back, body straight, feet wide. MUST SHOW: Feet clearly wide, free hand clearly behind the back. AVOID: Feet together, free arm in the air. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 8. Machine chest press

**Ladder:** Bench ladder, L1  
**Files:** `arya-ex-machine-chest-press-a.webp`, `arya-ex-machine-chest-press-b.webp`  
**Gear:** gym machine

**Frame A** (`arya-ex-machine-chest-press-a.webp`)

> Exercise illustration, picture A of 2 for "Machine chest press". VIEW: Side view, facing right, machine seen from its side. SETTING: Generic seated chest-press machine in charcoal and light grey, padded seat and back pad, two horizontal handles at chest height, weight stack behind, NO logos or text, plain gym floor line instead of a mat. POSE: START. Figure sitting upright with back flat against the pad, feet flat on the floor, hands holding the handles at chest height, elbows bent and back by the ribs. MUST SHOW: Handles at mid-chest height; back flat on pad. AVOID: Handles at the neck, arched back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-machine-chest-press-b.webp`)

> Exercise illustration, picture B of 2 for "Machine chest press". VIEW: Side view, facing right, machine seen from its side. SETTING: Generic seated chest-press machine in charcoal and light grey, padded seat and back pad, two horizontal handles at chest height, weight stack behind, NO logos or text, plain gym floor line instead of a mat. POSE: END. Arms pressed forward and almost straight (not locked), handles away from the chest, back still against the pad, shoulders down. MUST SHOW: Handles at mid-chest height; back flat on pad. AVOID: Handles at the neck, arched back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 9. Dumbbell bench press

**Ladder:** Bench ladder, L2  
**Files:** `arya-ex-dumbbell-bench-press-a.webp`, `arya-ex-dumbbell-bench-press-b.webp`  
**Gear:** dumbbells, flat bench

**Frame A** (`arya-ex-dumbbell-bench-press-a.webp`)

> Exercise illustration, picture A of 2 for "Dumbbell bench press". VIEW: Side view, facing right (head to the left). SETTING: A flat padded bench in charcoal with a black pad, steel legs, on a plain gym floor line. Hex dumbbells in dark grey metal with black handles, no text. POSE: START (top). Figure lying on the bench, feet flat on the floor, dumbbells held straight above the chest with arms extended, palms facing forward. MUST SHOW: Natural slight arch only, glutes and head on the bench. AVOID: Elbows flared to 90 degrees, feet off the floor. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-dumbbell-bench-press-b.webp`)

> Exercise illustration, picture B of 2 for "Dumbbell bench press". VIEW: Side view, facing right (head to the left). SETTING: A flat padded bench in charcoal with a black pad, steel legs, on a plain gym floor line. Hex dumbbells in dark grey metal with black handles, no text. POSE: END (bottom). Dumbbells lowered to chest level, elbows bent about 90 degrees and about 45 degrees away from the ribs, upper arms slightly below bench level, feet flat. MUST SHOW: Natural slight arch only, glutes and head on the bench. AVOID: Elbows flared to 90 degrees, feet off the floor. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 10. Dumbbell fly

**Ladder:** Bench ladder, L2  
**Files:** `arya-ex-dumbbell-fly-a.webp`, `arya-ex-dumbbell-fly-b.webp`  
**Gear:** dumbbells, flat bench

**Frame A** (`arya-ex-dumbbell-fly-a.webp`)

> Exercise illustration, picture A of 2 for "Dumbbell fly". VIEW: View from the FOOT END of the bench (figure lying on the bench, head farthest from the camera, feet nearer), so both arms are visible opening and closing. SETTING: Flat bench, light dumbbells, gym floor line. POSE: START (top). Dumbbells held directly above the chest, palms facing each other, elbows softly bent. MUST SHOW: A constant slight elbow bend; wide arc. AVOID: Bent-elbow press look, dumbbells dropping below the shoulders. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-dumbbell-fly-b.webp`)

> Exercise illustration, picture B of 2 for "Dumbbell fly". VIEW: View from the FOOT END of the bench (figure lying on the bench, head farthest from the camera, feet nearer), so both arms are visible opening and closing. SETTING: Flat bench, light dumbbells, gym floor line. POSE: END (bottom). Arms opened out wide like a hug, soft elbow bend kept, dumbbells level with the chest, a visible chest stretch, forearms in line with the upper arms. MUST SHOW: A constant slight elbow bend; wide arc. AVOID: Bent-elbow press look, dumbbells dropping below the shoulders. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 11. Cable fly

**Ladder:** Bench ladder, L2  
**Files:** `arya-ex-cable-fly-a.webp`, `arya-ex-cable-fly-b.webp`  
**Gear:** cable station

**Frame A** (`arya-ex-cable-fly-a.webp`)

> Exercise illustration, picture A of 2 for "Cable fly". VIEW: FRONT view, figure standing in the centre between two tall cable towers. SETTING: Two tall generic grey cable columns left and right, each with a high pulley and a single D-handle on a black cable, light floor line, no logos. POSE: START (open). Figure in a split stance (one foot slightly forward), torso leaning slightly forward, arms spread wide at shoulder height with soft elbows, handles out to the sides, cables running up to the high pulleys. MUST SHOW: Both cables visible and symmetric; soft elbows. AVOID: Arms fully straight or bent like a press. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-cable-fly-b.webp`)

> Exercise illustration, picture B of 2 for "Cable fly". VIEW: FRONT view, figure standing in the centre between two tall cable towers. SETTING: Two tall generic grey cable columns left and right, each with a high pulley and a single D-handle on a black cable, light floor line, no logos. POSE: END (closed). Handles brought together in front of the chest, hands nearly touching, soft elbows, same stance and lean. MUST SHOW: Both cables visible and symmetric; soft elbows. AVOID: Arms fully straight or bent like a press. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 12. Barbell bench press

**Ladder:** Bench ladder, L3  
**Files:** `arya-ex-barbell-bench-press-a.webp`, `arya-ex-barbell-bench-press-b.webp`  
**Gear:** barbell, bench with rack

**Frame A** (`arya-ex-barbell-bench-press-a.webp`)

> Exercise illustration, picture A of 2 for "Barbell bench press". VIEW: Side view, facing right (head left). SETTING: A flat bench in front of a squat/bench rack with J-hooks, and safety arms set just above chest height. Olympic barbell in steel with two black plates each end, no text. POSE: START (top). Figure lying on the bench with shoulder blades pulled back, feet flat on the floor, bar held over the chest with straight arms. MUST SHOW: Safety arms visible below the bar. Wrists stacked over elbows. AVOID: Bar at the neck or belly, feet in the air, bouncing off the chest. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-barbell-bench-press-b.webp`)

> Exercise illustration, picture B of 2 for "Barbell bench press". VIEW: Side view, facing right (head left). SETTING: A flat bench in front of a squat/bench rack with J-hooks, and safety arms set just above chest height. Olympic barbell in steel with two black plates each end, no text. POSE: END (bottom). Bar lowered to mid-chest, elbows about 45 degrees from the body, forearms vertical, feet flat, a slight natural arch in the lower back, glutes on the bench. MUST SHOW: Safety arms visible below the bar. Wrists stacked over elbows. AVOID: Bar at the neck or belly, feet in the air, bouncing off the chest. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 13. Parallel bar dips

**Ladder:** Dip ladder, L3  
**Files:** `arya-ex-parallel-bar-dips-a.webp`, `arya-ex-parallel-bar-dips-b.webp`  
**Gear:** dip bars

**Frame A** (`arya-ex-parallel-bar-dips-a.webp`)

> Exercise illustration, picture A of 2 for "Parallel bar dips". VIEW: Side view, facing right. SETTING: Two parallel steel dip bars on sturdy upright posts (near bar drawn, far bar partly hidden), gym floor line. POSE: START (top). Figure supported on the bars with straight arms, shoulders pushed down away from the ears, torso leaning slightly forward, legs bent behind with ankles crossed, feet off the floor. MUST SHOW: Elbows point back, not out. AVOID: Shoulders shrugged up, deep lowering below the elbows. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-parallel-bar-dips-b.webp`)

> Exercise illustration, picture B of 2 for "Parallel bar dips". VIEW: Side view, facing right. SETTING: Two parallel steel dip bars on sturdy upright posts (near bar drawn, far bar partly hidden), gym floor line. POSE: END (bottom). Elbows bent about 90 degrees pointing back, shoulders roughly level with the elbows, torso leaning slightly forward, legs still bent behind. MUST SHOW: Elbows point back, not out. AVOID: Shoulders shrugged up, deep lowering below the elbows. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 14. Weighted dips

**Ladder:** Dip ladder, L4  
**Files:** `arya-ex-weighted-dips-a.webp`, `arya-ex-weighted-dips-b.webp`  
**Gear:** dip bars, backpack

**Frame A** (`arya-ex-weighted-dips-a.webp`)

> Exercise illustration, picture A of 2 for "Weighted dips". VIEW: Side view, facing right. SETTING: Same dip bars as the parallel bar dips picture. A charcoal-grey backpack worn on the BACK with the chest strap clipped. POSE: START (top). Straight arms on the bars, shoulders down, slight forward lean, legs bent behind, loaded backpack on the back. MUST SHOW: Backpack clearly worn, not held. AVOID: Backpack hanging on the front, swinging legs. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-weighted-dips-b.webp`)

> Exercise illustration, picture B of 2 for "Weighted dips". VIEW: Side view, facing right. SETTING: Same dip bars as the parallel bar dips picture. A charcoal-grey backpack worn on the BACK with the chest strap clipped. POSE: END (bottom). Elbows about 90 degrees, shoulders level with elbows, slow controlled lowering look, backpack still on the back. MUST SHOW: Backpack clearly worn, not held. AVOID: Backpack hanging on the front, swinging legs. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 15. Machine shoulder press

**Ladder:** Vertical push ladder, L1  
**Files:** `arya-ex-machine-shoulder-press-a.webp`, `arya-ex-machine-shoulder-press-b.webp`  
**Gear:** gym machine

**Frame A** (`arya-ex-machine-shoulder-press-a.webp`)

> Exercise illustration, picture A of 2 for "Machine shoulder press". VIEW: Side view, facing right. SETTING: Generic seated shoulder-press machine, charcoal and light grey, padded seat with an upright back pad, two handles at ear height, weight stack behind, no logos. POSE: START. Seated tall with the back on the pad, feet flat, hands on the handles at ear height, elbows bent below the handles. MUST SHOW: Back flat on the pad. AVOID: Arched lower back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-machine-shoulder-press-b.webp`)

> Exercise illustration, picture B of 2 for "Machine shoulder press". VIEW: Side view, facing right. SETTING: Generic seated shoulder-press machine, charcoal and light grey, padded seat with an upright back pad, two handles at ear height, weight stack behind, no logos. POSE: END. Arms pressed up almost straight above the shoulders (not locked), back still flat on the pad, ribs down, no arching. MUST SHOW: Back flat on the pad. AVOID: Arched lower back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 16. Lateral raises

**Ladder:** Vertical push ladder, L1  
**Files:** `arya-ex-lateral-raises-a.webp`, `arya-ex-lateral-raises-b.webp`  
**Gear:** light dumbbells

**Frame A** (`arya-ex-lateral-raises-a.webp`)

> Exercise illustration, picture A of 2 for "Lateral raises". VIEW: FRONT view, full body, standing. SETTING: Standing on a plain floor line (a thin mat is fine), two small hex dumbbells in dark grey. POSE: START. Standing tall, feet hip-width, a dumbbell in each hand at the sides of the thighs, palms facing the body, slight elbow bend. MUST SHOW: Arms stop at shoulder height; both arms symmetric. AVOID: Arms above shoulder height, swinging torso. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-lateral-raises-b.webp`)

> Exercise illustration, picture B of 2 for "Lateral raises". VIEW: FRONT view, full body, standing. SETTING: Standing on a plain floor line (a thin mat is fine), two small hex dumbbells in dark grey. POSE: END. Both arms raised out to the sides to shoulder height (forming a T with the body), soft elbows, palms facing down, wrists level with elbows, shoulders NOT shrugged. MUST SHOW: Arms stop at shoulder height; both arms symmetric. AVOID: Arms above shoulder height, swinging torso. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 17. Dumbbell shoulder press

**Ladder:** Vertical push ladder, L2  
**Files:** `arya-ex-dumbbell-shoulder-press-a.webp`, `arya-ex-dumbbell-shoulder-press-b.webp`  
**Gear:** dumbbells

**Frame A** (`arya-ex-dumbbell-shoulder-press-a.webp`)

> Exercise illustration, picture A of 2 for "Dumbbell shoulder press". VIEW: FRONT view, full body, standing (or seated on a short bench in the same pose). SETTING: Standing on the floor line, hex dumbbells in dark grey. POSE: START. Dumbbells held at shoulder height, palms facing forward, elbows under the wrists and pointing slightly forward, ribs down, feet hip-width. MUST SHOW: Ribs down; dumbbells over the shoulders at the top. AVOID: Back arching, dumbbells drifting forward. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-dumbbell-shoulder-press-b.webp`)

> Exercise illustration, picture B of 2 for "Dumbbell shoulder press". VIEW: FRONT view, full body, standing (or seated on a short bench in the same pose). SETTING: Standing on the floor line, hex dumbbells in dark grey. POSE: END. Arms pressed overhead, almost straight, dumbbells above the shoulders and close together, torso straight with no back arch. MUST SHOW: Ribs down; dumbbells over the shoulders at the top. AVOID: Back arching, dumbbells drifting forward. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 18. Elevated pike push-ups

**Ladder:** Vertical push ladder, L3  
**Files:** `arya-ex-elevated-pike-push-ups-a.webp`, `arya-ex-elevated-pike-push-ups-b.webp`  
**Gear:** chair

**Frame A** (`arya-ex-elevated-pike-push-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Elevated pike push-ups". VIEW: Side view, facing right. SETTING: Mat on the floor. A plain wooden chair at the LEFT edge, seat facing right. POSE: START. Inverted V shape: hands on the mat, arms straight, hips raised high, legs straight with both feet resting on the chair seat, head between the arms. MUST SHOW: Hips clearly high, shoulders forward over the hands. AVOID: Flat push-up body line, chair tipping. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-elevated-pike-push-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Elevated pike push-ups". VIEW: Side view, facing right. SETTING: Mat on the floor. A plain wooden chair at the LEFT edge, seat facing right. POSE: END. Elbows bent, head lowered toward the mat between the hands, hips still high, feet still on the chair, shoulders over the hands. MUST SHOW: Hips clearly high, shoulders forward over the hands. AVOID: Flat push-up body line, chair tipping. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 19. Barbell overhead press

**Ladder:** Vertical push ladder, L3  
**Files:** `arya-ex-barbell-overhead-press-a.webp`, `arya-ex-barbell-overhead-press-b.webp`  
**Gear:** barbell

**Frame A** (`arya-ex-barbell-overhead-press-a.webp`)

> Exercise illustration, picture A of 2 for "Barbell overhead press". VIEW: Side view, facing right. SETTING: Standing on a gym floor line. Olympic barbell, steel with two black plates each end, no text. POSE: START. Bar resting on the front of the shoulders at collarbone height, elbows slightly in front of the bar, hands just outside the shoulders, glutes squeezed, standing tall, feet hip-width. MUST SHOW: Vertical bar path, straight torso. AVOID: Leaning back, bar in front of the face. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-barbell-overhead-press-b.webp`)

> Exercise illustration, picture B of 2 for "Barbell overhead press". VIEW: Side view, facing right. SETTING: Standing on a gym floor line. Olympic barbell, steel with two black plates each end, no text. POSE: END. Bar pressed straight overhead directly above the middle of the feet, arms locked straight, head pushed slightly through, ribs down, no back arch. MUST SHOW: Vertical bar path, straight torso. AVOID: Leaning back, bar in front of the face. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 20. Wall handstand hold

**Ladder:** Vertical push ladder, L4  
**Files:** `arya-ex-wall-handstand-hold-a.webp`  
**Gear:** wall

**Frame A** (`arya-ex-wall-handstand-hold-a.webp`)

> Exercise illustration, picture A of 1 for "Wall handstand hold". VIEW: Side view, figure facing right toward the wall (chest to the wall). SETTING: Plain beige wall on the RIGHT edge of the picture, mat on the floor with clear empty space around it. Figure kicked up into a handstand with the chest FACING the wall, toes resting on the wall. POSE: HOLD. Handstand with the chest facing the wall, hands on the mat about 15 cm from the wall, arms straight and locked, shoulders pushed up toward the ears, body in one straight line from hands to feet, toes touching the wall, head neutral between the arms, legs together and pointed. MUST SHOW: Straight banana-free line; arms locked; toes lightly on the wall. AVOID: Arched back, bent arms, head dropping. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 21. Handstand push-up negatives

**Ladder:** Vertical push ladder, L5  
**Files:** `arya-ex-handstand-push-up-negatives-a.webp`, `arya-ex-handstand-push-up-negatives-b.webp`  
**Gear:** wall, thick mat

**Frame A** (`arya-ex-handstand-push-up-negatives-a.webp`)

> Exercise illustration, picture A of 2 for "Handstand push-up negatives". VIEW: Side view, facing the wall. SETTING: Plain beige wall on the right, a thicker soft folded landing mat on the floor, clear space around it. POSE: START (top). Wall handstand facing the wall, arms straight, body straight, toes on the wall. MUST SHOW: The soft mat clearly thicker than the usual mat. AVOID: Head touching the floor hard, arched back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-handstand-push-up-negatives-b.webp`)

> Exercise illustration, picture B of 2 for "Handstand push-up negatives". VIEW: Side view, facing the wall. SETTING: Plain beige wall on the right, a thicker soft folded landing mat on the floor, clear space around it. POSE: END (bottom). Elbows bent deeply, head lowered to a few centimetres above the soft mat, body still straight and tight, toes on the wall. MUST SHOW: The soft mat clearly thicker than the usual mat. AVOID: Head touching the floor hard, arched back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 22. Dead hang

**Ladder:** Pull-up ladder, L0  
**Files:** `arya-ex-dead-hang-a.webp`  
**Gear:** pull-up bar

**Frame A** (`arya-ex-dead-hang-a.webp`)

> Exercise illustration, picture A of 1 for "Dead hang". VIEW: 3/4 FRONT view (figure turned about 30 degrees), full body, feet visible. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. POSE: HOLD. Figure hanging from the bar with straight arms, overhand grip slightly wider than the shoulders, shoulders pulled gently DOWN away from the ears, legs straight and relaxed with toes pointing down, feet off the floor. MUST SHOW: Straight arms, long neck, feet clear of the floor. AVOID: Shrugged shoulders, bent knees swinging. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 23. Scapular pull-ups

**Ladder:** Pull-up ladder, L0  
**Files:** `arya-ex-scapular-pull-ups-a.webp`, `arya-ex-scapular-pull-ups-b.webp`  
**Gear:** pull-up bar

**Frame A** (`arya-ex-scapular-pull-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Scapular pull-ups". VIEW: 3/4 FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. POSE: START. Passive hang, straight arms, shoulders up near the ears (loose hang). MUST SHOW: Arms straight in both frames; the difference is only the shoulder position. AVOID: Bent elbows. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-scapular-pull-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Scapular pull-ups". VIEW: 3/4 FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. POSE: END. Arms STILL straight, shoulder blades pulled down and back so the body rises about 5 cm, chest slightly proud, neck long. MUST SHOW: Arms straight in both frames; the difference is only the shoulder position. AVOID: Bent elbows. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 24. Band-assisted pull-ups

**Ladder:** Pull-up ladder, L1  
**Files:** `arya-ex-band-assisted-pull-ups-a.webp`, `arya-ex-band-assisted-pull-ups-b.webp`  
**Gear:** pull-up bar, resistance band

**Frame A** (`arya-ex-band-assisted-pull-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Band-assisted pull-ups". VIEW: 3/4 FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. A thick flat looped resistance band (muted orange-red) tied round the bar and hanging in a loop. POSE: START. Hang with straight arms, overhand grip, one knee (or foot) resting in the band loop, other leg bent behind. MUST SHOW: Band visibly stretched in the top frame. AVOID: Band around the neck, kicking up. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-band-assisted-pull-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Band-assisted pull-ups". VIEW: 3/4 FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. A thick flat looped resistance band (muted orange-red) tied round the bar and hanging in a loop. POSE: END. Chin above the bar, elbows pointing down toward the ribs, chest toward the bar, knee still in the band, band stretched. MUST SHOW: Band visibly stretched in the top frame. AVOID: Band around the neck, kicking up. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 25. Negative pull-ups

**Ladder:** Pull-up ladder, L1  
**Files:** `arya-ex-negative-pull-ups-a.webp`, `arya-ex-negative-pull-ups-b.webp`  
**Gear:** pull-up bar, step/box

**Frame A** (`arya-ex-negative-pull-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Negative pull-ups". VIEW: 3/4 FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. A small sturdy box or step below the bar. POSE: START (top). Figure standing on the box, chin above the bar, hands overhand, arms fully flexed, eyes forward. MUST SHOW: Box visible beneath the figure. AVOID: Arrows or text on the picture. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-negative-pull-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Negative pull-ups". VIEW: 3/4 FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. A small sturdy box or step below the bar. POSE: END (bottom). Slow lowering finished: fully hanging with straight arms, feet off the box, shoulders gently down. MUST SHOW: Box visible beneath the figure. AVOID: Arrows or text on the picture. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 26. Lat pulldown

**Ladder:** Pull-up ladder, L1  
**Files:** `arya-ex-lat-pulldown-a.webp`, `arya-ex-lat-pulldown-b.webp`  
**Gear:** cable machine

**Frame A** (`arya-ex-lat-pulldown-a.webp`)

> Exercise illustration, picture A of 2 for "Lat pulldown". VIEW: Side view, facing right (figure seated, bar in front of the face). SETTING: Generic lat-pulldown machine in charcoal and light grey: seat, thigh pads over the lap, a high pulley with a long straight/curved wide bar, weight stack behind, no logos. POSE: START (top). Seated tall with thighs under the pads, feet flat, hands on the wide bar with an overhand grip, arms extended up, slight lean back. MUST SHOW: Bar to the upper chest in front of the face. AVOID: Bar behind the neck, big back lean. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-lat-pulldown-b.webp`)

> Exercise illustration, picture B of 2 for "Lat pulldown". VIEW: Side view, facing right (figure seated, bar in front of the face). SETTING: Generic lat-pulldown machine in charcoal and light grey: seat, thigh pads over the lap, a high pulley with a long straight/curved wide bar, weight stack behind, no logos. POSE: END (bottom). Bar pulled down to the upper chest, elbows pointing down and slightly back, chest lifted, torso leaning back only slightly. MUST SHOW: Bar to the upper chest in front of the face. AVOID: Bar behind the neck, big back lean. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 27. Assisted pull-up machine

**Ladder:** Pull-up ladder, L1  
**Files:** `arya-ex-assisted-pull-up-machine-a.webp`, `arya-ex-assisted-pull-up-machine-b.webp`  
**Gear:** assisted pull-up machine

**Frame A** (`arya-ex-assisted-pull-up-machine-a.webp`)

> Exercise illustration, picture A of 2 for "Assisted pull-up machine". VIEW: Side view, facing right (figure facing the machine). SETTING: Generic assisted pull-up machine: two upright posts with horizontal handles at the top, a padded kneeling platform that moves, weight stack with a pin, charcoal and light grey, no logos. POSE: START. Figure kneeling on the pad with arms straight above, hands on the handles, hanging fully. MUST SHOW: Knee pad clearly visible. AVOID: Brand text. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-assisted-pull-up-machine-b.webp`)

> Exercise illustration, picture B of 2 for "Assisted pull-up machine". VIEW: Side view, facing right (figure facing the machine). SETTING: Generic assisted pull-up machine: two upright posts with horizontal handles at the top, a padded kneeling platform that moves, weight stack with a pin, charcoal and light grey, no logos. POSE: END. Chin above the handles, elbows pointing down, chest up, knees still on the pad. MUST SHOW: Knee pad clearly visible. AVOID: Brand text. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 28. Chin-ups

**Ladder:** Pull-up ladder, L2  
**Files:** `arya-ex-chin-ups-a.webp`, `arya-ex-chin-ups-b.webp`  
**Gear:** pull-up bar

**Frame A** (`arya-ex-chin-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Chin-ups". VIEW: 3/4 FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. POSE: START. Hang from the bar with an UNDERHAND grip (palms facing the figure), hands shoulder-width, arms straight, legs together, slightly bent behind. MUST SHOW: Palms visibly facing the face (underhand). AVOID: Overhand grip. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-chin-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Chin-ups". VIEW: 3/4 FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. POSE: END. Chin above the bar, elbows close to the body pointing down and forward, chest high, legs together. MUST SHOW: Palms visibly facing the face (underhand). AVOID: Overhand grip. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 29. Pull-ups

**Ladder:** Pull-up ladder, L2  
**Files:** `arya-ex-pull-ups-a.webp`, `arya-ex-pull-ups-b.webp`  
**Gear:** pull-up bar

**Frame A** (`arya-ex-pull-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Pull-ups". VIEW: 3/4 FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. POSE: START. Full hang, OVERHAND grip (palms facing away), hands just wider than the shoulders, arms straight, legs together slightly bent behind. MUST SHOW: Overhand grip clearly shown. AVOID: Kicking, chin reaching with a stretched neck. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-pull-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Pull-ups". VIEW: 3/4 FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. POSE: END. Chest pulled toward the bar, chin above the bar, elbows pointing down toward the ribs, shoulders back and down. MUST SHOW: Overhand grip clearly shown. AVOID: Kicking, chin reaching with a stretched neck. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 30. Wide pull-ups

**Ladder:** Pull-up ladder, L3  
**Files:** `arya-ex-wide-pull-ups-a.webp`, `arya-ex-wide-pull-ups-b.webp`  
**Gear:** pull-up bar

**Frame A** (`arya-ex-wide-pull-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Wide pull-ups". VIEW: FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. POSE: START. Full hang, overhand grip with hands clearly WIDER than the shoulders (about 1.5x), arms straight. MUST SHOW: Clearly wider hand spacing than the normal pull-up picture. AVOID: Narrow grip. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-wide-pull-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Wide pull-ups". VIEW: FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. POSE: END. Chin over the bar, elbows pulled down and out toward the ribs forming a wide W shape, chest near the bar. MUST SHOW: Clearly wider hand spacing than the normal pull-up picture. AVOID: Narrow grip. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 31. Weighted pull-ups

**Ladder:** Pull-up ladder, L4  
**Files:** `arya-ex-weighted-pull-ups-a.webp`, `arya-ex-weighted-pull-ups-b.webp`  
**Gear:** pull-up bar, backpack

**Frame A** (`arya-ex-weighted-pull-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Weighted pull-ups". VIEW: 3/4 FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. A charcoal-grey backpack worn on the back with the chest strap clipped. POSE: START. Full hang with the loaded backpack on the back, overhand grip, straight arms, legs together. MUST SHOW: Backpack readable as heavy. AVOID: Swinging. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-weighted-pull-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Weighted pull-ups". VIEW: 3/4 FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. A charcoal-grey backpack worn on the back with the chest strap clipped. POSE: END. Chin above the bar, elbows down, backpack steady on the back. MUST SHOW: Backpack readable as heavy. AVOID: Swinging. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 32. Archer pull-ups

**Ladder:** Pull-up ladder, L4  
**Files:** `arya-ex-archer-pull-ups-a.webp`, `arya-ex-archer-pull-ups-b.webp`  
**Gear:** pull-up bar

**Frame A** (`arya-ex-archer-pull-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Archer pull-ups". VIEW: FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. POSE: START. Wide overhand grip, full hang, arms straight. MUST SHOW: One arm clearly straight, the other clearly bent. AVOID: Both arms bent. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-archer-pull-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Archer pull-ups". VIEW: FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. POSE: END. Body pulled up toward the RIGHT hand (viewer's left): that elbow deeply bent, chin level with that hand, the LEFT arm completely straight along the bar, legs together. MUST SHOW: One arm clearly straight, the other clearly bent. AVOID: Both arms bent. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 33. L-sit pull-ups

**Ladder:** Pull-up ladder, L5  
**Files:** `arya-ex-l-sit-pull-ups-a.webp`, `arya-ex-l-sit-pull-ups-b.webp`  
**Gear:** pull-up bar

**Frame A** (`arya-ex-l-sit-pull-ups-a.webp`)

> Exercise illustration, picture A of 2 for "L-sit pull-ups". VIEW: Side view, facing right, figure hanging sideways so the legs are visible. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. The bar is seen from the side as a short rod with a post behind. POSE: START. Full hang, overhand grip, legs straight and lifted out in front at 90 degrees to the torso (L shape), toes pointed. MUST SHOW: Legs straight and horizontal in both frames. AVOID: Bent knees, dropped legs. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-l-sit-pull-ups-b.webp`)

> Exercise illustration, picture B of 2 for "L-sit pull-ups". VIEW: Side view, facing right, figure hanging sideways so the legs are visible. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. The bar is seen from the side as a short rod with a post behind. POSE: END. Chin above the bar, elbows down, legs still straight and held out in front in the L shape. MUST SHOW: Legs straight and horizontal in both frames. AVOID: Bent knees, dropped legs. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 34. One-arm pull-up negatives

**Ladder:** Pull-up ladder, L5  
**Files:** `arya-ex-one-arm-pull-up-negatives-a.webp`, `arya-ex-one-arm-pull-up-negatives-b.webp`  
**Gear:** pull-up bar, box

**Frame A** (`arya-ex-one-arm-pull-up-negatives-a.webp`)

> Exercise illustration, picture A of 2 for "One-arm pull-up negatives". VIEW: 3/4 FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. A small sturdy box beneath the bar. POSE: START (top). Figure standing on the box with ONE hand on the bar and the chin above the bar, that arm fully flexed, the other arm hanging by the side. MUST SHOW: Single hand on the bar in both frames. AVOID: Two hands on the bar. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-one-arm-pull-up-negatives-b.webp`)

> Exercise illustration, picture B of 2 for "One-arm pull-up negatives". VIEW: 3/4 FRONT view, full body. SETTING: A steel pull-up bar mounted high across two upright posts at the LEFT and RIGHT edges of the picture (a freestanding rack look), plain gym floor line. A small sturdy box beneath the bar. POSE: END (bottom). Lowered to a full dead hang from one straight arm, free arm by the side, feet off the box, body slightly turned. MUST SHOW: Single hand on the bar in both frames. AVOID: Two hands on the bar. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 35. Inverted rows

**Ladder:** Row ladder, L1  
**Files:** `arya-ex-inverted-rows-a.webp`, `arya-ex-inverted-rows-b.webp`  
**Gear:** low bar (rack or smith bar)

**Frame A** (`arya-ex-inverted-rows-a.webp`)

> Exercise illustration, picture A of 2 for "Inverted rows". VIEW: Side view, facing right. SETTING: A horizontal steel bar set at about waist height on two upright posts of a rack (posts at left and right edges), mat on the floor. POSE: START. Lying face-up under the bar, hands overhand on the bar slightly wider than the shoulders, arms straight, body in a straight line from heels to head, heels on the floor, hanging. MUST SHOW: Straight line from heels to head in both frames. AVOID: Sagging hips. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-inverted-rows-b.webp`)

> Exercise illustration, picture B of 2 for "Inverted rows". VIEW: Side view, facing right. SETTING: A horizontal steel bar set at about waist height on two upright posts of a rack (posts at left and right edges), mat on the floor. POSE: END. Chest pulled to the bar, elbows pointing back and down, body still a straight plank-line, heels on the floor. MUST SHOW: Straight line from heels to head in both frames. AVOID: Sagging hips. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 36. Seated cable row

**Ladder:** Row ladder, L1  
**Files:** `arya-ex-seated-cable-row-a.webp`, `arya-ex-seated-cable-row-b.webp`  
**Gear:** cable machine

**Frame A** (`arya-ex-seated-cable-row-a.webp`)

> Exercise illustration, picture A of 2 for "Seated cable row". VIEW: Side view, facing right (machine to the right). SETTING: Generic seated cable-row station: low pulley, foot plates, a padded seat, a V-handle attached to a black cable, weight stack, charcoal and light grey, no logos. POSE: START. Seated tall with knees slightly bent and feet on the plates, arms stretched forward holding the handle, torso upright or leaning slightly forward, back flat. MUST SHOW: Flat back in both frames. AVOID: Rounded back, leaning far back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-seated-cable-row-b.webp`)

> Exercise illustration, picture B of 2 for "Seated cable row". VIEW: Side view, facing right (machine to the right). SETTING: Generic seated cable-row station: low pulley, foot plates, a padded seat, a V-handle attached to a black cable, weight stack, charcoal and light grey, no logos. POSE: END. Handle pulled to the belly, elbows pointing back and close to the ribs, shoulder blades squeezed together, torso upright, chest proud. MUST SHOW: Flat back in both frames. AVOID: Rounded back, leaning far back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 37. Feet-elevated inverted rows

**Ladder:** Row ladder, L2  
**Files:** `arya-ex-feet-elevated-inverted-rows-a.webp`, `arya-ex-feet-elevated-inverted-rows-b.webp`  
**Gear:** low bar, chair

**Frame A** (`arya-ex-feet-elevated-inverted-rows-a.webp`)

> Exercise illustration, picture A of 2 for "Feet-elevated inverted rows". VIEW: Side view, facing right. SETTING: Horizontal bar at waist height on two posts (as in the inverted rows picture), a plain wooden chair at the LEFT end with its seat as a footrest. POSE: START. Lying under the bar, hands overhand on the bar, arms straight, heels resting on the chair seat so the body is level or slightly feet-high, body straight. MUST SHOW: Chair clearly under the heels. AVOID: Hips sagging, chair tilting. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-feet-elevated-inverted-rows-b.webp`)

> Exercise illustration, picture B of 2 for "Feet-elevated inverted rows". VIEW: Side view, facing right. SETTING: Horizontal bar at waist height on two posts (as in the inverted rows picture), a plain wooden chair at the LEFT end with its seat as a footrest. POSE: END. Chest pulled to the bar, elbows back and down, heels still on the chair, body still straight. MUST SHOW: Chair clearly under the heels. AVOID: Hips sagging, chair tilting. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 38. Dumbbell row

**Ladder:** Row ladder, L2  
**Files:** `arya-ex-dumbbell-row-a.webp`, `arya-ex-dumbbell-row-b.webp`  
**Gear:** dumbbell, flat bench

**Frame A** (`arya-ex-dumbbell-row-a.webp`)

> Exercise illustration, picture A of 2 for "Dumbbell row". VIEW: Side view, facing right. SETTING: A flat bench, one hex dumbbell in dark grey, gym floor line. POSE: START. One knee and the same-side hand on the bench, other foot on the floor, back flat and almost parallel to the floor, the other arm hanging straight down holding the dumbbell under the shoulder. MUST SHOW: Flat back, hanging arm straight under the shoulder. AVOID: Twisting the torso, rounded back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-dumbbell-row-b.webp`)

> Exercise illustration, picture B of 2 for "Dumbbell row". VIEW: Side view, facing right. SETTING: A flat bench, one hex dumbbell in dark grey, gym floor line. POSE: END. The dumbbell pulled up toward the hip with the elbow pointing back and close to the body, back still flat, torso not twisting. MUST SHOW: Flat back, hanging arm straight under the shoulder. AVOID: Twisting the torso, rounded back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 39. Barbell row

**Ladder:** Row ladder, L3  
**Files:** `arya-ex-barbell-row-a.webp`, `arya-ex-barbell-row-b.webp`  
**Gear:** barbell

**Frame A** (`arya-ex-barbell-row-a.webp`)

> Exercise illustration, picture A of 2 for "Barbell row". VIEW: Side view, facing right. SETTING: Standing on a gym floor line. Olympic barbell, steel with two black plates each end, no text. POSE: START. Hip hinge: knees slightly bent, hips pushed back, back flat and torso leaning about 45 degrees, arms straight hanging down gripping the bar below the shoulders, bar just below the knees. MUST SHOW: Same torso angle in both frames. AVOID: Standing up to jerk the bar, round back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-barbell-row-b.webp`)

> Exercise illustration, picture B of 2 for "Barbell row". VIEW: Side view, facing right. SETTING: Standing on a gym floor line. Olympic barbell, steel with two black plates each end, no text. POSE: END. Bar pulled to the lower ribs, elbows pointing back, back still flat at the same angle, neck neutral. MUST SHOW: Same torso angle in both frames. AVOID: Standing up to jerk the bar, round back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 40. Band pull-aparts

**Ladder:** Pull accessories, L0  
**Files:** `arya-ex-band-pull-aparts-a.webp`, `arya-ex-band-pull-aparts-b.webp`  
**Gear:** resistance band

**Frame A** (`arya-ex-band-pull-aparts-a.webp`)

> Exercise illustration, picture A of 2 for "Band pull-aparts". VIEW: FRONT view, full body, standing. SETTING: Standing on a thin mat, a light looped resistance band (muted orange-red). POSE: START. Standing tall, arms straight forward at chest height, hands holding the band shoulder-width apart with slight tension. MUST SHOW: Band visibly stretched in B. AVOID: Shrugged shoulders, back arching. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-band-pull-aparts-b.webp`)

> Exercise illustration, picture B of 2 for "Band pull-aparts". VIEW: FRONT view, full body, standing. SETTING: Standing on a thin mat, a light looped resistance band (muted orange-red). POSE: END. Arms pulled out to the sides forming a T, the band stretched across the chest, shoulder blades squeezed, arms level with the chest, ribs down. MUST SHOW: Band visibly stretched in B. AVOID: Shrugged shoulders, back arching. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 41. Face pulls

**Ladder:** Pull accessories, L1  
**Files:** `arya-ex-face-pulls-a.webp`, `arya-ex-face-pulls-b.webp`  
**Gear:** resistance band

**Frame A** (`arya-ex-face-pulls-a.webp`)

> Exercise illustration, picture A of 2 for "Face pulls". VIEW: Side view, facing right (anchor point on the right). SETTING: A band anchored at head height to a sturdy upright post at the right edge (draw a simple post), standing on a thin mat. POSE: START. Standing in a staggered stance facing the post, arms straight forward holding the band ends at head height with tension on the band. MUST SHOW: Elbows HIGH in B. AVOID: Elbows low like a row. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-face-pulls-b.webp`)

> Exercise illustration, picture B of 2 for "Face pulls". VIEW: Side view, facing right (anchor point on the right). SETTING: A band anchored at head height to a sturdy upright post at the right edge (draw a simple post), standing on a thin mat. POSE: END. Hands pulled toward the face, elbows high and wide (above the wrists), hands beside the ears, shoulder blades squeezed, band stretched. MUST SHOW: Elbows HIGH in B. AVOID: Elbows low like a row. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 42. Dumbbell curl

**Ladder:** Pull accessories, L1  
**Files:** `arya-ex-dumbbell-curl-a.webp`, `arya-ex-dumbbell-curl-b.webp`  
**Gear:** dumbbells

**Frame A** (`arya-ex-dumbbell-curl-a.webp`)

> Exercise illustration, picture A of 2 for "Dumbbell curl". VIEW: Side view, facing right. SETTING: Standing on a gym floor line (thin mat okay), hex dumbbells in dark grey. POSE: START. Standing tall, arms straight down at the sides holding the dumbbells, palms facing forward, elbows close to the ribs. MUST SHOW: Elbows fixed in both frames. AVOID: Leaning back, elbows drifting forward. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-dumbbell-curl-b.webp`)

> Exercise illustration, picture B of 2 for "Dumbbell curl". VIEW: Side view, facing right. SETTING: Standing on a gym floor line (thin mat okay), hex dumbbells in dark grey. POSE: END. Dumbbells curled up to shoulder height, elbows still pinned at the sides, upper arms vertical, torso still upright with no swing. MUST SHOW: Elbows fixed in both frames. AVOID: Leaning back, elbows drifting forward. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 43. Chair squat

**Ladder:** Squat ladder, L0  
**Files:** `arya-ex-chair-squat-a.webp`, `arya-ex-chair-squat-b.webp`  
**Gear:** chair

**Frame A** (`arya-ex-chair-squat-a.webp`)

> Exercise illustration, picture A of 2 for "Chair squat". VIEW: Side view, facing right. SETTING: On the sage mat, a plain wooden chair BEHIND the figure (on the left), seat facing right. POSE: START. Standing tall in front of the chair, feet shoulder-width, arms extended forward for balance. MUST SHOW: Knees tracking over the toes. AVOID: Collapsing knees, rounded back, plopping on the chair. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-chair-squat-b.webp`)

> Exercise illustration, picture B of 2 for "Chair squat". VIEW: Side view, facing right. SETTING: On the sage mat, a plain wooden chair BEHIND the figure (on the left), seat facing right. POSE: END. Seated position just touching the chair seat, hips pushed back, knees over the toes, chest up, arms still forward, heels down. MUST SHOW: Knees tracking over the toes. AVOID: Collapsing knees, rounded back, plopping on the chair. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 44. Leg press

**Ladder:** Squat ladder, L1  
**Files:** `arya-ex-leg-press-a.webp`, `arya-ex-leg-press-b.webp`  
**Gear:** leg press machine

**Frame A** (`arya-ex-leg-press-a.webp`)

> Exercise illustration, picture A of 2 for "Leg press". VIEW: Side view, facing right (figure reclined, platform to the right). SETTING: Generic 45-degree sled leg-press machine in charcoal and light grey, padded reclined seat, large footplate on the right, two safety handles by the seat, black weight plates stacked on the sled arms, no logos. POSE: START. Sled lowered: knees bent about 90 degrees, feet shoulder-width on the plate, lower back and hips flat on the pad. MUST SHOW: Hips stay on the seat in both frames. AVOID: Locked knees, hips lifting off the pad. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-leg-press-b.webp`)

> Exercise illustration, picture B of 2 for "Leg press". VIEW: Side view, facing right (figure reclined, platform to the right). SETTING: Generic 45-degree sled leg-press machine in charcoal and light grey, padded reclined seat, large footplate on the right, two safety handles by the seat, black weight plates stacked on the sled arms, no logos. POSE: END. Legs pressed out almost straight but knees NOT locked, hips and back still on the pad, hands on the handles. MUST SHOW: Hips stay on the seat in both frames. AVOID: Locked knees, hips lifting off the pad. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 45. Goblet squat

**Ladder:** Squat ladder, L2  
**Files:** `arya-ex-goblet-squat-a.webp`, `arya-ex-goblet-squat-b.webp`  
**Gear:** dumbbell

**Frame A** (`arya-ex-goblet-squat-a.webp`)

> Exercise illustration, picture A of 2 for "Goblet squat". VIEW: Side view, facing right. SETTING: On the sage mat, one hex dumbbell in dark grey held vertically. POSE: START. Standing tall, feet slightly wider than the shoulders and toes turned out a little, holding the dumbbell vertically against the chest with both hands cupped under the top end. MUST SHOW: Chest up, heels flat. AVOID: Rounded back, heels lifting. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-goblet-squat-b.webp`)

> Exercise illustration, picture B of 2 for "Goblet squat". VIEW: Side view, facing right. SETTING: On the sage mat, one hex dumbbell in dark grey held vertically. POSE: END. Deep squat, hips between the heels, elbows inside the knees, chest up, dumbbell at the chest, heels flat. MUST SHOW: Chest up, heels flat. AVOID: Rounded back, heels lifting. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 46. Barbell back squat

**Ladder:** Squat ladder, L3  
**Files:** `arya-ex-barbell-back-squat-a.webp`, `arya-ex-barbell-back-squat-b.webp`  
**Gear:** barbell, squat rack

**Frame A** (`arya-ex-barbell-back-squat-a.webp`)

> Exercise illustration, picture A of 2 for "Barbell back squat". VIEW: Side view, facing right. SETTING: A squat rack with two uprights, J-hooks and safety arms set just below the bottom position. Olympic barbell in steel with two black plates each end, no text. POSE: START. Standing tall with the bar on the upper back (on the traps), hands gripping outside the shoulders, elbows pointing down and back, feet shoulder-width, core braced. MUST SHOW: Safety arms visible in the picture. AVOID: Rounded back, knees caving, heels lifting. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-barbell-back-squat-b.webp`)

> Exercise illustration, picture B of 2 for "Barbell back squat". VIEW: Side view, facing right. SETTING: A squat rack with two uprights, J-hooks and safety arms set just below the bottom position. Olympic barbell in steel with two black plates each end, no text. POSE: END. Squatting to just below parallel, thighs about parallel to the floor, back neutral with a slight forward lean, knees over the toes, bar over the mid-foot. MUST SHOW: Safety arms visible in the picture. AVOID: Rounded back, knees caving, heels lifting. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 47. Step-ups

**Ladder:** Single-leg ladder, L1  
**Files:** `arya-ex-step-ups-a.webp`, `arya-ex-step-ups-b.webp`  
**Gear:** chair/step

**Frame A** (`arya-ex-step-ups-a.webp`)

> Exercise illustration, picture A of 2 for "Step-ups". VIEW: Side view, facing right. SETTING: A sturdy plain wooden chair or low box in front (right) of the figure, on the mat. POSE: START. Standing facing the chair, one whole foot placed flat on the seat, the other foot on the mat behind, torso upright. MUST SHOW: Whole foot on the chair. AVOID: Pushing off the back foot. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-step-ups-b.webp`)

> Exercise illustration, picture B of 2 for "Step-ups". VIEW: Side view, facing right. SETTING: A sturdy plain wooden chair or low box in front (right) of the figure, on the mat. POSE: END. Standing tall on the chair with the working leg straight, other knee lifted to hip height, torso upright. MUST SHOW: Whole foot on the chair. AVOID: Pushing off the back foot. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 48. Walking lunges

**Ladder:** Single-leg ladder, L2  
**Files:** `arya-ex-walking-lunges-a.webp`, `arya-ex-walking-lunges-b.webp`  
**Gear:** none (mat)

**Frame A** (`arya-ex-walking-lunges-a.webp`)

> Exercise illustration, picture A of 2 for "Walking lunges". VIEW: Side view, facing right. SETTING: On the sage mat (long enough for a stride). POSE: START. Standing tall, feet together, hands on hips. MUST SHOW: Front shin vertical, torso upright. AVOID: Front knee past the toes, leaning forward. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-walking-lunges-b.webp`)

> Exercise illustration, picture B of 2 for "Walking lunges". VIEW: Side view, facing right. SETTING: On the sage mat (long enough for a stride). POSE: END. Long stride forward with the RIGHT foot: front knee bent about 90 degrees over the ankle, back knee hovering just above the mat, back heel lifted, torso upright, hands on hips. MUST SHOW: Front shin vertical, torso upright. AVOID: Front knee past the toes, leaning forward. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 49. Bulgarian split squats

**Ladder:** Single-leg ladder, L3  
**Files:** `arya-ex-bulgarian-split-squats-a.webp`, `arya-ex-bulgarian-split-squats-b.webp`  
**Gear:** chair

**Frame A** (`arya-ex-bulgarian-split-squats-a.webp`)

> Exercise illustration, picture A of 2 for "Bulgarian split squats". VIEW: Side view, facing right. SETTING: A plain wooden chair BEHIND the figure (left), on the mat. POSE: START. Standing on the front leg, the back foot resting (laces down) on the chair seat behind, torso upright, hands on hips. MUST SHOW: Front foot far enough forward; back foot on the chair. AVOID: Front knee drifting over the toes. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-bulgarian-split-squats-b.webp`)

> Exercise illustration, picture B of 2 for "Bulgarian split squats". VIEW: Side view, facing right. SETTING: A plain wooden chair BEHIND the figure (left), on the mat. POSE: END. Lowered straight down: front knee bent about 90 degrees over the ankle, back knee pointing to the floor, torso upright. MUST SHOW: Front foot far enough forward; back foot on the chair. AVOID: Front knee drifting over the toes. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 50. Shrimp squat progression

**Ladder:** Single-leg ladder, L4  
**Files:** `arya-ex-shrimp-squat-progression-a.webp`, `arya-ex-shrimp-squat-progression-b.webp`  
**Gear:** none (mat)

**Frame A** (`arya-ex-shrimp-squat-progression-a.webp`)

> Exercise illustration, picture A of 2 for "Shrimp squat progression". VIEW: Side view, facing right. SETTING: On the sage mat. POSE: START. Standing on the right leg, left knee bent and left foot held behind with the left hand. MUST SHOW: Rear foot held by the same-side hand in both frames. AVOID: Knee slamming the floor. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-shrimp-squat-progression-b.webp`)

> Exercise illustration, picture B of 2 for "Shrimp squat progression". VIEW: Side view, facing right. SETTING: On the sage mat. POSE: END. Lowered on the right leg, the back knee gently touching the mat (or hovering just above it), torso leaning slightly forward, left foot still held by the hand. MUST SHOW: Rear foot held by the same-side hand in both frames. AVOID: Knee slamming the floor. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 51. Pistol squat negatives

**Ladder:** Single-leg ladder, L4  
**Files:** `arya-ex-pistol-squat-negatives-a.webp`, `arya-ex-pistol-squat-negatives-b.webp`  
**Gear:** chair

**Frame A** (`arya-ex-pistol-squat-negatives-a.webp`)

> Exercise illustration, picture A of 2 for "Pistol squat negatives". VIEW: Side view, facing right. SETTING: A plain wooden chair BEHIND the figure (left), seat facing right, on the mat. POSE: START. Standing on the right leg, left leg straight out in front, arms forward for balance, chair behind. MUST SHOW: Free leg straight, off the floor in both frames. AVOID: Free foot on the floor. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-pistol-squat-negatives-b.webp`)

> Exercise illustration, picture B of 2 for "Pistol squat negatives". VIEW: Side view, facing right. SETTING: A plain wooden chair BEHIND the figure (left), seat facing right, on the mat. POSE: END. Slow sit-down: right knee deeply bent, hips back, left leg still straight out in front, just touching the chair seat. MUST SHOW: Free leg straight, off the floor in both frames. AVOID: Free foot on the floor. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 52. Pistol squat

**Ladder:** Single-leg ladder, L5  
**Files:** `arya-ex-pistol-squat-a.webp`, `arya-ex-pistol-squat-b.webp`  
**Gear:** none (mat)

**Frame A** (`arya-ex-pistol-squat-a.webp`)

> Exercise illustration, picture A of 2 for "Pistol squat". VIEW: Side view, facing right. SETTING: On the sage mat. POSE: START. Standing on the right leg, left leg straight out in front at hip height, arms forward. MUST SHOW: Heel flat, free leg lifted. AVOID: Heel off the floor, free leg dropping. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-pistol-squat-b.webp`)

> Exercise illustration, picture B of 2 for "Pistol squat". VIEW: Side view, facing right. SETTING: On the sage mat. POSE: END. Full depth single-leg squat: right hip below the knee, heel flat, left leg still straight and lifted in front, torso leaning forward, arms forward. MUST SHOW: Heel flat, free leg lifted. AVOID: Heel off the floor, free leg dropping. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 53. Single-leg glute bridge

**Ladder:** Hinge ladder, L2  
**Files:** `arya-ex-single-leg-glute-bridge-a.webp`, `arya-ex-single-leg-glute-bridge-b.webp`  
**Gear:** none (mat)

**Frame A** (`arya-ex-single-leg-glute-bridge-a.webp`)

> Exercise illustration, picture A of 2 for "Single-leg glute bridge". VIEW: Side view, facing right (head to the left), as in the glute-bridges picture. SETTING: On the sage mat. POSE: START. Lying on the back, arms by the sides, LEFT foot flat with the knee bent, RIGHT leg held straight and raised in line with the thigh. MUST SHOW: Hips level and high; free leg in line with the supporting thigh. AVOID: Hips twisting or sagging. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-single-leg-glute-bridge-b.webp`)

> Exercise illustration, picture B of 2 for "Single-leg glute bridge". VIEW: Side view, facing right (head to the left), as in the glute-bridges picture. SETTING: On the sage mat. POSE: END. Hips lifted: body in a straight line from the shoulders to the supporting knee, the free leg straight and aligned with the thigh, hips level, glute squeezed. MUST SHOW: Hips level and high; free leg in line with the supporting thigh. AVOID: Hips twisting or sagging. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 54. Hamstring walkouts

**Ladder:** Hinge ladder, L2  
**Files:** `arya-ex-hamstring-walkouts-a.webp`, `arya-ex-hamstring-walkouts-b.webp`  
**Gear:** none (mat)

**Frame A** (`arya-ex-hamstring-walkouts-a.webp`)

> Exercise illustration, picture A of 2 for "Hamstring walkouts". VIEW: Side view, facing right (head to the left). SETTING: On the sage mat. POSE: START. Bridge position: lying on the back, hips lifted high, knees bent about 90 degrees, heels flat under the knees. MUST SHOW: Hips high in both frames; legs almost straight in B. AVOID: Hips dropping. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-hamstring-walkouts-b.webp`)

> Exercise illustration, picture B of 2 for "Hamstring walkouts". VIEW: Side view, facing right (head to the left). SETTING: On the sage mat. POSE: END. Feet walked out further, legs nearly straight (a slight bend), hips STILL lifted high in a long diagonal from shoulders to heels. MUST SHOW: Hips high in both frames; legs almost straight in B. AVOID: Hips dropping. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 55. Romanian deadlift

**Ladder:** Hinge ladder, L2  
**Files:** `arya-ex-romanian-deadlift-a.webp`, `arya-ex-romanian-deadlift-b.webp`  
**Gear:** dumbbells

**Frame A** (`arya-ex-romanian-deadlift-a.webp`)

> Exercise illustration, picture A of 2 for "Romanian deadlift". VIEW: Side view, facing right. SETTING: On the gym floor line (thin mat okay), hex dumbbells in dark grey. POSE: START. Standing tall holding the dumbbells in front of the thighs, knees soft, shoulders back. MUST SHOW: Flat back, dumbbells close to the legs. AVOID: Rounded back, squatting down. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-romanian-deadlift-b.webp`)

> Exercise illustration, picture B of 2 for "Romanian deadlift". VIEW: Side view, facing right. SETTING: On the gym floor line (thin mat okay), hex dumbbells in dark grey. POSE: END. Hips pushed far back, torso hinged forward with a flat back, dumbbells sliding along the legs to just below the knees, knees only slightly bent, head neutral. MUST SHOW: Flat back, dumbbells close to the legs. AVOID: Rounded back, squatting down. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 56. Hip thrust

**Ladder:** Hinge ladder, L3  
**Files:** `arya-ex-hip-thrust-a.webp`, `arya-ex-hip-thrust-b.webp`  
**Gear:** bench, barbell

**Frame A** (`arya-ex-hip-thrust-a.webp`)

> Exercise illustration, picture A of 2 for "Hip thrust". VIEW: Side view, facing right (head to the left). SETTING: A flat bench (head side) with the figure's upper back against the bench edge, a barbell with two black plates rolled over the hips with a thick bar pad (charcoal), floor line. POSE: START. Upper back on the bench edge, hips lowered close to the floor, knees bent about 90 degrees, bar across the hip crease, arms resting along the bench. MUST SHOW: Shins vertical at the top; hips level with the torso. AVOID: Over-arching the lower back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-hip-thrust-b.webp`)

> Exercise illustration, picture B of 2 for "Hip thrust". VIEW: Side view, facing right (head to the left). SETTING: A flat bench (head side) with the figure's upper back against the bench edge, a barbell with two black plates rolled over the hips with a thick bar pad (charcoal), floor line. POSE: END. Hips driven up so the body forms a straight line from the shoulders to the knees, shins vertical, chin tucked slightly, glutes squeezed. MUST SHOW: Shins vertical at the top; hips level with the torso. AVOID: Over-arching the lower back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 57. Barbell deadlift

**Ladder:** Hinge ladder, L3  
**Files:** `arya-ex-barbell-deadlift-a.webp`, `arya-ex-barbell-deadlift-b.webp`  
**Gear:** barbell

**Frame A** (`arya-ex-barbell-deadlift-a.webp`)

> Exercise illustration, picture A of 2 for "Barbell deadlift". VIEW: Side view, facing right. SETTING: On a gym floor line, an Olympic barbell with two black plates each end, no text. POSE: START. Bar over the mid-foot, hips low, shins touching the bar, back flat, arms straight and vertical gripping just outside the legs, chest up, head neutral. MUST SHOW: Flat back at the start; bar close to the legs. AVOID: Rounded back, bar far from the legs. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-barbell-deadlift-b.webp`)

> Exercise illustration, picture B of 2 for "Barbell deadlift". VIEW: Side view, facing right. SETTING: On a gym floor line, an Olympic barbell with two black plates each end, no text. POSE: END. Standing fully tall, hips and knees locked, bar held against the thighs, shoulders back, no leaning back. MUST SHOW: Flat back at the start; bar close to the legs. AVOID: Rounded back, bar far from the legs. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 58. Nordic curl negatives

**Ladder:** Hinge ladder, L4  
**Files:** `arya-ex-nordic-curl-negatives-a.webp`, `arya-ex-nordic-curl-negatives-b.webp`  
**Gear:** none (mat, anchor)

**Frame A** (`arya-ex-nordic-curl-negatives-a.webp`)

> Exercise illustration, picture A of 2 for "Nordic curl negatives". VIEW: Side view, facing right. SETTING: On a mat, feet anchored under a sturdy low bar or a heavy sofa end at the LEFT (draw a simple padded anchor bar over the heels). POSE: START. Kneeling upright on the mat, knees on a pad, feet hooked under the anchor, torso upright and straight from the knees to the head, arms bent in front. MUST SHOW: Straight line knees-to-head in both frames; anchor visible. AVOID: Piking at the hips. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-nordic-curl-negatives-b.webp`)

> Exercise illustration, picture B of 2 for "Nordic curl negatives". VIEW: Side view, facing right. SETTING: On a mat, feet anchored under a sturdy low bar or a heavy sofa end at the LEFT (draw a simple padded anchor bar over the heels). POSE: END. Body lowered slowly forward in a straight line from the knees to the head, hands reaching the mat to catch, hips NOT bent. MUST SHOW: Straight line knees-to-head in both frames; anchor visible. AVOID: Piking at the hips. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 59. Single-leg calf raise

**Ladder:** Calf, L2  
**Files:** `arya-ex-single-leg-calf-raise-a.webp`, `arya-ex-single-leg-calf-raise-b.webp`  
**Gear:** wall (support)

**Frame A** (`arya-ex-single-leg-calf-raise-a.webp`)

> Exercise illustration, picture A of 2 for "Single-leg calf raise". VIEW: Side view, facing right. SETTING: On the sage mat, a plain beige wall on the RIGHT with one hand lightly touching it for balance. POSE: START. Standing on the left foot only, the other foot lifted behind, heel low, torso upright, one hand lightly on the wall. MUST SHOW: Big visible heel lift. AVOID: Both feet on the floor. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-single-leg-calf-raise-b.webp`)

> Exercise illustration, picture B of 2 for "Single-leg calf raise". VIEW: Side view, facing right. SETTING: On the sage mat, a plain beige wall on the RIGHT with one hand lightly touching it for balance. POSE: END. Rising high up on the ball of the left foot, heel as high as possible, body tall, free foot still lifted. MUST SHOW: Big visible heel lift. AVOID: Both feet on the floor. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 60. Pallof press

**Ladder:** Core, L2  
**Files:** `arya-ex-pallof-press-a.webp`, `arya-ex-pallof-press-b.webp`  
**Gear:** resistance band

**Frame A** (`arya-ex-pallof-press-a.webp`)

> Exercise illustration, picture A of 2 for "Pallof press". VIEW: FRONT view, figure faces the viewer, anchor post at the viewer's left. SETTING: A sturdy upright post at the LEFT edge with a band anchored at chest height running to the figure's hands, thin mat on the floor. POSE: START. Standing facing the viewer, feet shoulder-width, knees soft, band in both hands held at the chest, elbows bent, band running sideways to the post. MUST SHOW: Torso stays square to the camera. AVOID: Torso twisting toward the post. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-pallof-press-b.webp`)

> Exercise illustration, picture B of 2 for "Pallof press". VIEW: FRONT view, figure faces the viewer, anchor post at the viewer's left. SETTING: A sturdy upright post at the LEFT edge with a band anchored at chest height running to the figure's hands, thin mat on the floor. POSE: END. Arms pressed straight out in front of the chest and held, body square and not twisting, band stretched and trying to pull the torso toward the post. MUST SHOW: Torso stays square to the camera. AVOID: Torso twisting toward the post. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 61. Cable crunch

**Ladder:** Core, L2  
**Files:** `arya-ex-cable-crunch-a.webp`, `arya-ex-cable-crunch-b.webp`  
**Gear:** cable machine

**Frame A** (`arya-ex-cable-crunch-a.webp`)

> Exercise illustration, picture A of 2 for "Cable crunch". VIEW: Side view, facing right. SETTING: A high pulley with a rope handle (black rope with ball ends) above and behind the figure, a mat on the floor, generic cable column on the LEFT, no logos. POSE: START. Kneeling on the mat, hips over the knees, rope held beside the head at the forehead, spine long. MUST SHOW: Hips stay still. AVOID: Sitting back on the heels, pulling with the arms. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-cable-crunch-b.webp`)

> Exercise illustration, picture B of 2 for "Cable crunch". VIEW: Side view, facing right. SETTING: A high pulley with a rope handle (black rope with ball ends) above and behind the figure, a mat on the floor, generic cable column on the LEFT, no logos. POSE: END. Spine rounded forward, ribs pulled toward the hips, elbows toward the knees, hips still in place. MUST SHOW: Hips stay still. AVOID: Sitting back on the heels, pulling with the arms. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 62. Hollow body hold

**Ladder:** Core, L3  
**Files:** `arya-ex-hollow-body-hold-a.webp`  
**Gear:** none (mat)

**Frame A** (`arya-ex-hollow-body-hold-a.webp`)

> Exercise illustration, picture A of 1 for "Hollow body hold". VIEW: Side view, facing right (head to the left). SETTING: On the sage mat. POSE: HOLD. Lying on the back with the lower back pressed into the mat, arms extended overhead by the ears, legs straight, together and lifted low (about 30 cm), shoulders and head lifted off the floor slightly, body forming a shallow banana, ribs pulled down. MUST SHOW: Lower back clearly flat on the mat. AVOID: Back arching off the floor. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 63. Hanging knee raises

**Ladder:** Core, L3  
**Files:** `arya-ex-hanging-knee-raises-a.webp`, `arya-ex-hanging-knee-raises-b.webp`  
**Gear:** pull-up bar

**Frame A** (`arya-ex-hanging-knee-raises-a.webp`)

> Exercise illustration, picture A of 2 for "Hanging knee raises". VIEW: Side view, facing right. SETTING: A steel pull-up bar mounted high across two upright posts at the edges of the picture (a freestanding rack look), plain gym floor line. View from the side so the bar is a short rod with a post behind. POSE: START. Hanging from the bar with straight arms, active shoulders, legs together and straight down. MUST SHOW: Still torso. AVOID: Swinging. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-hanging-knee-raises-b.webp`)

> Exercise illustration, picture B of 2 for "Hanging knee raises". VIEW: Side view, facing right. SETTING: A steel pull-up bar mounted high across two upright posts at the edges of the picture (a freestanding rack look), plain gym floor line. View from the side so the bar is a short rod with a post behind. POSE: END. Knees lifted toward the chest, hips slightly curled, torso still, no swing. MUST SHOW: Still torso. AVOID: Swinging. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 64. Hanging leg raises

**Ladder:** Core, L4  
**Files:** `arya-ex-hanging-leg-raises-a.webp`, `arya-ex-hanging-leg-raises-b.webp`  
**Gear:** pull-up bar

**Frame A** (`arya-ex-hanging-leg-raises-a.webp`)

> Exercise illustration, picture A of 2 for "Hanging leg raises". VIEW: Side view, facing right. SETTING: A steel pull-up bar mounted high across two upright posts at the edges of the picture (a freestanding rack look), plain gym floor line. POSE: START. Hanging with straight arms, active shoulders, legs together and straight down. MUST SHOW: Legs straight in B. AVOID: Bent knees, swinging. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-hanging-leg-raises-b.webp`)

> Exercise illustration, picture B of 2 for "Hanging leg raises". VIEW: Side view, facing right. SETTING: A steel pull-up bar mounted high across two upright posts at the edges of the picture (a freestanding rack look), plain gym floor line. POSE: END. Legs straight and lifted to hip height (horizontal), toes pointed, pelvis slightly tucked, no swing. MUST SHOW: Legs straight in B. AVOID: Bent knees, swinging. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 65. Ab wheel rollout

**Ladder:** Core, L4  
**Files:** `arya-ex-ab-wheel-rollout-a.webp`, `arya-ex-ab-wheel-rollout-b.webp`  
**Gear:** ab wheel

**Frame A** (`arya-ex-ab-wheel-rollout-a.webp`)

> Exercise illustration, picture A of 2 for "Ab wheel rollout". VIEW: Side view, facing right. SETTING: On the sage mat. A small ab wheel (black wheel, grey handle on a short axle) held under the shoulders. POSE: START. Kneeling with the wheel directly under the shoulders, arms straight, back slightly rounded, hips over the knees. MUST SHOW: Flat back, no sagging. AVOID: Arching the lower back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-ab-wheel-rollout-b.webp`)

> Exercise illustration, picture B of 2 for "Ab wheel rollout". VIEW: Side view, facing right. SETTING: On the sage mat. A small ab wheel (black wheel, grey handle on a short axle) held under the shoulders. POSE: END. Rolled out in a long line from the knees to the head, hips NOT sagging, arms overhead by the ears, back flat or very slightly rounded. MUST SHOW: Flat back, no sagging. AVOID: Arching the lower back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 66. L-sit

**Ladder:** Core, L5  
**Files:** `arya-ex-l-sit-a.webp`  
**Gear:** parallettes or bars

**Frame A** (`arya-ex-l-sit-a.webp`)

> Exercise illustration, picture A of 1 for "L-sit". VIEW: Side view, facing right. SETTING: Two low parallettes (small steel bars on feet) on the mat, near one drawn, far one partly hidden. POSE: HOLD. Supported on the parallettes with straight locked arms, shoulders pushed down away from the ears, legs straight out in front at hip height forming an L, toes pointed, torso upright. MUST SHOW: Legs horizontal and straight; shoulders pressed down. AVOID: Bent knees, shrugged shoulders. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 67. Jumping jacks

**Ladder:** Cardio, L1  
**Files:** `arya-ex-jumping-jacks-a.webp`, `arya-ex-jumping-jacks-b.webp`  
**Gear:** none

**Frame A** (`arya-ex-jumping-jacks-a.webp`)

> Exercise illustration, picture A of 2 for "Jumping jacks". VIEW: FRONT view, full body. SETTING: On the sage mat. POSE: START. Standing tall, feet together, arms at the sides. MUST SHOW: Symmetric pose. AVOID: Asymmetric arms. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-jumping-jacks-b.webp`)

> Exercise illustration, picture B of 2 for "Jumping jacks". VIEW: FRONT view, full body. SETTING: On the sage mat. POSE: END. Mid-jump: feet wide apart, arms raised overhead with the hands nearly touching above the head, landing on the balls of the feet. MUST SHOW: Symmetric pose. AVOID: Asymmetric arms. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 68. High knees

**Ladder:** Cardio, L1  
**Files:** `arya-ex-high-knees-a.webp`, `arya-ex-high-knees-b.webp`  
**Gear:** none

**Frame A** (`arya-ex-high-knees-a.webp`)

> Exercise illustration, picture A of 2 for "High knees". VIEW: Side view, facing right. SETTING: On the sage mat. POSE: START. Running in place, right knee driven up to hip height with the thigh parallel to the floor, left foot on the ball of the foot, arms pumping (left arm forward, right arm back), torso upright. MUST SHOW: Thigh parallel to the floor. AVOID: Leaning back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-high-knees-b.webp`)

> Exercise illustration, picture B of 2 for "High knees". VIEW: Side view, facing right. SETTING: On the sage mat. POSE: END. Mirror: left knee up, right foot on the ball, right arm forward, left arm back. MUST SHOW: Thigh parallel to the floor. AVOID: Leaning back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 69. Stationary bike

**Ladder:** Cardio, L1  
**Files:** `arya-ex-stationary-bike-a.webp`  
**Gear:** stationary bike

**Frame A** (`arya-ex-stationary-bike-a.webp`)

> Exercise illustration, picture A of 1 for "Stationary bike". VIEW: Side view, facing right. SETTING: A generic upright exercise bike in charcoal and light grey with a small screen with no readout and no logos, on a floor line. POSE: RIDING. Figure seated on the saddle, torso leaning slightly forward, hands on the handlebars, relaxed shoulders, one leg at the bottom of the pedal stroke with a slight knee bend, the other at the top. MUST SHOW: Slight bend in the knee at the bottom. AVOID: Straight locked leg. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 70. Jump rope

**Ladder:** Cardio, L2  
**Files:** `arya-ex-jump-rope-a.webp`, `arya-ex-jump-rope-b.webp`  
**Gear:** jump rope

**Frame A** (`arya-ex-jump-rope-a.webp`)

> Exercise illustration, picture A of 2 for "Jump rope". VIEW: Side view, facing right. SETTING: On the sage mat, a thin black jump rope with grey handles. POSE: START. Standing on the balls of the feet slightly off the floor, rope passing behind the heels, elbows close to the ribs, hands at hip height, wrists turning. MUST SHOW: Rope arc visible in B. AVOID: Large jumps. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-jump-rope-b.webp`)

> Exercise illustration, picture B of 2 for "Jump rope". VIEW: Side view, facing right. SETTING: On the sage mat, a thin black jump rope with grey handles. POSE: END. Rope overhead in the air above the head in a clear arc, feet a few cm off the floor, same posture. MUST SHOW: Rope arc visible in B. AVOID: Large jumps. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 71. Rowing machine

**Ladder:** Cardio, L2  
**Files:** `arya-ex-rowing-machine-a.webp`, `arya-ex-rowing-machine-b.webp`  
**Gear:** rowing machine

**Frame A** (`arya-ex-rowing-machine-a.webp`)

> Exercise illustration, picture A of 2 for "Rowing machine". VIEW: Side view, facing right. SETTING: A generic indoor rowing machine in charcoal and light grey with a long rail, a round flywheel housing at the right, footplates, a sliding seat, handle and a black chain/strap, no logos or readout text. POSE: CATCH. Knees bent and shins vertical, arms straight forward gripping the handle, torso leaning slightly forward, seat close to the flywheel. MUST SHOW: Both ends of the stroke; flat back. AVOID: Rounded back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-rowing-machine-b.webp`)

> Exercise illustration, picture B of 2 for "Rowing machine". VIEW: Side view, facing right. SETTING: A generic indoor rowing machine in charcoal and light grey with a long rail, a round flywheel housing at the right, footplates, a sliding seat, handle and a black chain/strap, no logos or readout text. POSE: FINISH. Legs extended, torso leaning back slightly, handle pulled to the lower ribs, elbows back. MUST SHOW: Both ends of the stroke; flat back. AVOID: Rounded back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 72. Treadmill intervals

**Ladder:** Cardio, L2  
**Files:** `arya-ex-treadmill-intervals-a.webp`, `arya-ex-treadmill-intervals-b.webp`  
**Gear:** treadmill

**Frame A** (`arya-ex-treadmill-intervals-a.webp`)

> Exercise illustration, picture A of 2 for "Treadmill intervals". VIEW: Side view, facing right. SETTING: A generic treadmill in charcoal and light grey with handrails and a blank display, no logos. POSE: EASY. Light jog, upright posture, arms swinging naturally, slight forward lean, near foot just landing. MUST SHOW: Two visibly different intensities. AVOID: Holding the rails during the run. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-treadmill-intervals-b.webp`)

> Exercise illustration, picture B of 2 for "Treadmill intervals". VIEW: Side view, facing right. SETTING: A generic treadmill in charcoal and light grey with handrails and a blank display, no logos. POSE: FAST. Faster run: bigger stride, torso leaning slightly forward, arms driving, both feet briefly off the belt. MUST SHOW: Two visibly different intensities. AVOID: Holding the rails during the run. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 73. Band shoulder dislocates

**Ladder:** Mobility, L0  
**Files:** `arya-ex-band-shoulder-dislocates-a.webp`, `arya-ex-band-shoulder-dislocates-b.webp`  
**Gear:** resistance band

**Frame A** (`arya-ex-band-shoulder-dislocates-a.webp`)

> Exercise illustration, picture A of 2 for "Band shoulder dislocates". VIEW: Frame A is a FRONT view, frame B is a SIDE view facing right (state the view in each frame). SETTING: On a thin mat, a light looped band (muted orange-red) held in both hands. POSE: START (front view). Standing tall, band held wide in front of the thighs with straight arms, hands about twice shoulder-width apart. MUST SHOW: Straight arms; ribs down. AVOID: Bent elbows, back arching. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-band-shoulder-dislocates-b.webp`)

> Exercise illustration, picture B of 2 for "Band shoulder dislocates". VIEW: Frame A is a FRONT view, frame B is a SIDE view facing right (state the view in each frame). SETTING: On a thin mat, a light looped band (muted orange-red) held in both hands. POSE: END (side view). Arms still straight, band carried overhead and slightly behind the head, ribs down, torso tall. MUST SHOW: Straight arms; ribs down. AVOID: Bent elbows, back arching. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 74. Thoracic rotation

**Ladder:** Mobility, L0  
**Files:** `arya-ex-thoracic-rotation-a.webp`, `arya-ex-thoracic-rotation-b.webp`  
**Gear:** none (mat)

**Frame A** (`arya-ex-thoracic-rotation-a.webp`)

> Exercise illustration, picture A of 2 for "Thoracic rotation". VIEW: Side view, facing right, slightly 3/4 from the front. SETTING: On the sage mat. POSE: START. On hands and knees (hands under shoulders, knees under hips), the right hand placed behind the head with the elbow pointing down to the left elbow. MUST SHOW: Hips stay still; rotation from the upper back. AVOID: Hips shifting. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-thoracic-rotation-b.webp`)

> Exercise illustration, picture B of 2 for "Thoracic rotation". VIEW: Side view, facing right, slightly 3/4 from the front. SETTING: On the sage mat. POSE: END. The chest and the right elbow rotated up toward the ceiling, eyes following the elbow, the hips staying still, the other hand pressing into the mat. MUST SHOW: Hips stay still; rotation from the upper back. AVOID: Hips shifting. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 75. Ankle mobility drill

**Ladder:** Mobility, L0  
**Files:** `arya-ex-ankle-mobility-drill-a.webp`, `arya-ex-ankle-mobility-drill-b.webp`  
**Gear:** wall

**Frame A** (`arya-ex-ankle-mobility-drill-a.webp`)

> Exercise illustration, picture A of 2 for "Ankle mobility drill". VIEW: Side view, facing right (toward the wall). SETTING: A plain beige wall on the RIGHT, mat on the floor. POSE: START. Standing facing the wall in a half-kneeling stance: front foot flat a short distance from the wall, back foot behind, hands on the wall, front knee over the toes with the heel down. MUST SHOW: Front heel flat in both frames. AVOID: Lifted heel. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.

**Frame B** (`arya-ex-ankle-mobility-drill-b.webp`)

> Exercise illustration, picture B of 2 for "Ankle mobility drill". VIEW: Side view, facing right (toward the wall). SETTING: A plain beige wall on the RIGHT, mat on the floor. POSE: END. Front knee driven forward, touching or nearly touching the wall, front heel still FLAT on the floor, torso upright. MUST SHOW: Front heel flat in both frames. AVOID: Lifted heel. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 76. Doorway chest stretch

**Ladder:** Mobility, L0  
**Files:** `arya-ex-doorway-chest-stretch-a.webp`  
**Gear:** door frame

**Frame A** (`arya-ex-doorway-chest-stretch-a.webp`)

> Exercise illustration, picture A of 1 for "Doorway chest stretch". VIEW: 3/4 FRONT view, full body. SETTING: A plain door frame (beige wood) at the centre-left with an open doorway, mat on the floor. POSE: HOLD. Standing in the doorway, the right forearm resting vertically on the door frame with the elbow at shoulder height, one foot stepped forward through the doorway, torso leaning forward gently, chest open, clear stretch across the front of the shoulder. MUST SHOW: Elbow at shoulder height, chest open. AVOID: Elbow above the shoulder, arched back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


### 77. Couch stretch

**Ladder:** Mobility, L0  
**Files:** `arya-ex-couch-stretch-a.webp`  
**Gear:** wall or couch

**Frame A** (`arya-ex-couch-stretch-a.webp`)

> Exercise illustration, picture A of 1 for "Couch stretch". VIEW: Side view, facing right. SETTING: A plain beige wall on the LEFT with a small knee pad (cushion) on the mat, or a simple low couch at the left; choose the wall. POSE: HOLD. Half-kneeling lunge with the back shin vertical up the wall and the back foot resting against the wall behind, the back knee on the cushion, the front foot forward flat with knee bent, torso upright, pelvis tucked under, hands on the front thigh. MUST SHOW: Back shin climbing the wall; tucked pelvis. AVOID: Arched lower back. Same athlete, same style, same colours as the master style block. Square 1:1, 1024 x 1024, cream #FAF6EB background, no text, no arrows.


---

## After generating: what I need to do (do not do this yourself)

1. Upload the finished `.webp` files into `web/images/exercises/` together with the next update, or send them to me in chat in batches of about 10.
2. I add each new slug and its letters to the `EXI` list in `web/js/core/exercise-media.js` (that list decides which pictures show), bump the cache, and update the tests. A missing file never breaks the app: the step simply shows no picture.

## Colour-theme masks (later, with ChatGPT)

The app shows the base picture as is in the Old Money skin. In the other skins (Modern, Professional, Midnight, Sunset) it lays a recolour layer over the clothing, using a transparent PNG mask with the same name as the picture: `web/images/exercise-masks/arya-ex-<slug>-<letter>.png`.

Mask file rules (taken from the existing masks):
- 1024 x 1024 RGBA PNG, same framing as the picture
- White pixels (255,255,255) with alpha 255 ONLY on the tank top and the shorts; everything else fully transparent (alpha 0)
- Soft edges are fine (partial alpha on the garment border), no hole in the middle of a garment, skin, hair, shoes, mat and props never included
- One mask per picture, so {nfr} masks in total

Prompt to give ChatGPT per picture (attach the finished picture):

```
Make a mask of this image. Output a 1024 x 1024 PNG with a transparent background. Fill ONLY the man's dark green tank top and dark green shorts with pure white, fully opaque. Everything else (skin, hair, shoes, socks, mat, wall, chair, bars, machines, weights, background) must be fully transparent. Keep the exact same outline and position as the original image. Soft anti-aliased edges, no outline stroke, no shadows.
```

Check each mask by laying it over the picture: only the two garments may light up.
