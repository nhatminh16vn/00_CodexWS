---
name: improve-site-music
description: Improve, compose, or troubleshoot background music and game sound in the MyFamilyWeb project while keeping changes approachable and compatible with its existing audio controls.
---

# Improve MyFamilyWeb Music

Use this skill when the user asks to make the site's music or game sounds better, or wants help choosing a musical direction. The project is a family learning website with small browser games; keep audio pleasant, clear, and suitable for repeated listening.

## Understand the current sound

- Inspect the relevant audio code and the page that loads it before changing anything. Shared background music is currently generated with the Web Audio API in `MyFamilyWeb_v1.1/js/site-music.js`; game sound effects are in `MyFamilyWeb_v1.1/js/game-audio.js`. Feature 25 also has its own music engine in `MyFamilyWeb_v1.1/features/feature25/feature25.js`.
- Check which controls, persistence settings, mobile behavior, and accessibility labels the page already uses. Preserve them unless the user asks for a change.
- Describe what the current code is doing in plain language. Do not claim to have listened to it unless audio was actually played and heard in the available environment.

## Shape a better result

- Start from the intended mood and use: background music should stay out of the way; game cues should be brief and easy to distinguish. Avoid harsh, piercing, overly loud, repetitive, or crowded sounds.
- If the user has not named a style, offer a small number of concrete directions in plain language, such as calm playful, cozy acoustic, or upbeat arcade. Choose a conservative fit for the family site when the user wants you to decide; do not block on music terminology.
- Make a focused change that addresses the audible problem. For generated music, consider melody phrasing and variation, chord movement, rhythm, instrument timbre, note duration, dynamics, and loop length. For sound effects, make events recognizable without making them tiring.
- Prefer the existing Web Audio API and project patterns. Do not add libraries or external audio assets unless they materially improve the result and the user has asked for that kind of change. If using an external track, check its license and credit requirements before adding it.
- Keep audio opt-in where the current page requires user interaction, respect saved mute and volume preferences, and keep volume levels safe and balanced. Do not make sound autoplay behavior more intrusive.
- Keep code readable for a beginner. Explain music and implementation choices using everyday words, with a short before/after description.

## Apply and verify changes

- Keep edits scoped to the requested track, feature, and necessary shared audio code. Watch for duplicated audio engines and avoid changing unrelated games.
- Check script and asset paths, browser audio restrictions, pause/resume behavior, and whether timers or oscillators can continue after music is stopped.
- If the environment supports running the page, verify the actual playback, loop transition, volume control, mute behavior, and mobile layout. Otherwise say clearly that the sound was not auditioned and give the user a simple way to preview it.
- Do not add or run tests unless the user asks for testing. Report the files changed and any audio behavior that remains unverified.
