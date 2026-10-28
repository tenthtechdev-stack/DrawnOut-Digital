# Loading milestone — checkpoint review

This is the saved-work checkpoint for issue #6, stacked on `feature/contact-page` (PR #5). The implementation is preserved for review; final acceptance validation is incomplete.

These existing production captures were recorded on 2026-10-28 before the last mobile refresh/zero-scroll and background-animation pause corrections. They are genuine browser evidence, not a final capture of every checkpoint change. No screenshots or recordings were regenerated for this checkpoint.

- [Existing desktop recording — 47.08 seconds](desktop-loading-experience.mp4)
- Final mobile recording: **not completed**.
- [Capture measurements and video timeline](loading-evidence.json)
- [Measured browser results](checkpoint-validation.json)
- [Validation status and remaining checks](../../docs/LOADING_MILESTONE_VALIDATION.md)
- [Implementation handoff](../../docs/LOADING_MILESTONE_HANDOFF.md)

## Existing desktop preview

![Desktop opening and living gradient preview](desktop-loading-preview.gif)

## Opening — desktop 1440px

![Desktop progressive project wave](opening-1440-mid-wave.png)

![Desktop six approved project artworks and DrawnOut wordmark](opening-1440-all-artwork.png)

## Opening — mobile 390px

![Mobile progressive project wave](opening-390-mid-wave.png)

![Mobile six approved project artworks and DrawnOut wordmark](opening-390-all-artwork.png)

## Living hero — 1440px

The 0/2/5-second views show autonomous movement after renderer readiness.

![Hero at 1440px, approximately 0 seconds](hero-1440-0s.png)

![Hero at 1440px, approximately 2 seconds](hero-1440-2s.png)

![Hero at 1440px, approximately 5 seconds](hero-1440-5s.png)

Raw production WebGL canvas: [0s](gradient-1440-0s-canvas.png), [2s](gradient-1440-2s-canvas.png), [5s](gradient-1440-5s-canvas.png).

## Living hero — 768px

The 0/2/5-second views show autonomous movement after renderer readiness.

![Hero at 768px, approximately 0 seconds](hero-768-0s.png)

![Hero at 768px, approximately 2 seconds](hero-768-2s.png)

![Hero at 768px, approximately 5 seconds](hero-768-5s.png)

Raw production WebGL canvas: [0s](gradient-768-0s-canvas.png), [2s](gradient-768-2s-canvas.png), [5s](gradient-768-5s-canvas.png).

## Living hero — 390px

The 0/2/5-second views show autonomous movement after renderer readiness.

![Hero at 390px, approximately 0 seconds](hero-390-0s.png)

![Hero at 390px, approximately 2 seconds](hero-390-2s.png)

![Hero at 390px, approximately 5 seconds](hero-390-5s.png)

Raw production WebGL canvas: [0s](gradient-390-0s-canvas.png), [2s](gradient-390-2s-canvas.png), [5s](gradient-390-5s-canvas.png).

## Living hero — 320px

The 0/2/5-second views show autonomous movement after renderer readiness.

![Hero at 320px, approximately 0 seconds](hero-320-0s.png)

![Hero at 320px, approximately 2 seconds](hero-320-2s.png)

![Hero at 320px, approximately 5 seconds](hero-320-5s.png)

Raw production WebGL canvas: [0s](gradient-320-0s-canvas.png), [2s](gradient-320-2s-canvas.png), [5s](gradient-320-5s-canvas.png).

## Accessible CSS fallback

![Desktop CSS fallback](hero-1440-css-fallback.png)

## Signature footer — 1440px

### Arrival

![Arrival at 1440px](footer-1440-arrive.png)

### Held pose

![Held pose at 1440px](footer-1440-hold.png)

### Expansion

![Expansion at 1440px](footer-1440-expand.png)

### Reverse scroll

![Reverse scroll at 1440px](footer-1440-reverse.png)

### Social links and Tenth Tech credit

![Social links and Tenth Tech credit at 1440px](footer-1440-links.png)

### Static footer component view

![Static footer component view at 1440px](footer-1440-static.png)

## Signature footer — 768px

### Arrival

![Arrival at 768px](footer-768-arrive.png)

### Held pose

![Held pose at 768px](footer-768-hold.png)

### Expansion

![Expansion at 768px](footer-768-expand.png)

### Reverse scroll

![Reverse scroll at 768px](footer-768-reverse.png)

### Social links and Tenth Tech credit

![Social links and Tenth Tech credit at 768px](footer-768-links.png)

### Static footer component view

![Static footer component view at 768px](footer-768-static.png)

## Signature footer — 390px

### Arrival

![Arrival at 390px](footer-390-arrive.png)

### Held pose

![Held pose at 390px](footer-390-hold.png)

### Expansion

![Expansion at 390px](footer-390-expand.png)

### Reverse scroll

![Reverse scroll at 390px](footer-390-reverse.png)

### Social links and Tenth Tech credit

![Social links and Tenth Tech credit at 390px](footer-390-links.png)

### Static footer component view

![Static footer component view at 390px](footer-390-static.png)

## Evidence limits

The hand and illuminated plaque remain the documented separated-image motion prototype, not a completed photorealistic rigged 3D model. Software WebGL exercises the production shader but does not establish physical-device GPU performance. Existing static footer component captures can include the sticky header; the corrected capture script is saved but has not been rerun. Formspree remains safely unconfigured pending the owner’s endpoint and verified live delivery.
