# iOS Simulator QA — September 7, 2026

Partial round against the local mobile-ux-plan worktree at `http://localhost:3000/video-to-gif`, using iPhone 17 Pro / iOS 26.5 Simulator in portrait. No implementation changes were made during this round.

## Verified through Safari UI

- Upload heading, device-file explanation, and Choose video are visible above Safari's toolbar without scrolling.
- Choose video opens the native Photo Library / Choose File menu.
- The Photos picker opens, but contains no videos. `simctl addmedia` stalled, including an absolute-path retry bounded to 20 seconds. Photo-library selection is therefore unverified.
- Downloaded the repository's H.264/AAC MP4 fixture through a temporary loopback HTTP server as `ytgify-qa.mp4` (1.3 MB in Files).
- Choose File opens the native Files picker; selecting that fixture enters the editor with a 0–5s selection.
- Create GIF is visible above Safari's bottom toolbar in this initial editor view.

## Blocked checks

After file selection, the computer-use tool began returning `noWindowsAvailable` for all coordinate clicks, preceded by a ScreenCaptureKit invalid-parameter error. Screenshots and native accessibility menu actions continued to work. Re-selecting the app, raising the window, resetting the control session, dismissing menus, and changing window geometry did not restore pointer input.

A follow-up restored pointer control briefly by selecting the iPhone window through Simulator’s Window menu. Tapping Play successfully displayed and played the video inline. The initial black play surface is therefore not evidence of a playback failure. Subsequent scroll/drag input again failed with `noWindowsAvailable`, including after bringing all windows forward.

Software-keyboard occlusion, trim edits, nested captions/style, GIF export, GIF saving, and smaller-result recovery remain **unverified in iOS Simulator**. The earlier Playwright results still stand but do not substitute for these checks. Simulator QA is also distinct from physical-iPhone performance and memory testing.

The simulator remains on the loaded editor for continuation. The local app remains running. This round is not a completed iOS acceptance pass.
