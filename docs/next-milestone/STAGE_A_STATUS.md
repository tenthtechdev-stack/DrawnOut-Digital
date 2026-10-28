# Stage A: loader and right-side gradient correction

Authority: the owner's next-milestone request, the adjacent loader/gradient brief fetched from `briefs/loader-motion-service-copy`, and PR #7 comment 6474998758. This supersedes the earlier policy that suppressed all internal homepage arrivals and used a full-hero color field.

## Source diagnosis and changes

- Homepage/logo arrivals from Contact or Work now qualify for the approved loader. Ordinary non-home internal navigation remains immediate.
- The old 700ms start budget could expire while a render-blocking stylesheet loaded. Production styles are now inline (previous shared/home styles total approximately 14KB compressed), trading some cross-page CSS caching for reliable startup without another critical request.
- The approved 4.2-second sequence remains intact. Late markup/style/artwork initialization receives a short branded handoff when time permits, within the absolute 4.9-second release deadline. History, restored scrolling, input, reduced motion and Save Data still release content.
- The gradient now has a soft, right-localized color envelope, a vertically evolving folded ribbon and stable fine grain. The left remains predominantly cream. Removed local text scrims; retained the approved typography/layout and resource controls.

## Checkpoint validation

Two focused real-WebGL tests passed at 390px and 1440px (31.4 seconds) before loader completion: 0/2/5/8-second observations showed approximately 42–43% total colored area; the leftmost 45% remained neutral while the rightmost 45% was approximately 92–94% colored. Offscreen pausing also passed. These tests use Chromium software WebGL, not physical-device benchmarks.

At this early checkpoint, complete loader/regression validation and headed production recordings are still pending. The subsequent delivery report will record actual results; these preliminary checks are not an overall acceptance claim.

## Hosted preview uncertainty

`curl -I -L --max-time 25 https://drawnoutdigital.netlify.app/` returned `curl: (56) CONNECT tunnel failed, response 403`. A read-only GitHub API request for `tenthtechdev-stack/DrawnOut-Digital` returned HTTP 404 for this connection. Therefore the live deployment's commit SHA could not be verified. A stale deployment remains a separate possibility, not an established finding. No changes or pushes were made to that repository.

The original KOTA recording is described by the supplied brief but is not present in the fetched documentation branch or current workspace. Implementation follows the detailed provided motion direction; no claim of inspecting that video is made.

The hand/plaque remains a separated 2D prototype. Contact still needs owner Formspree configuration/live delivery verification. All preview pages retain noindex. No merge or deployment is included.
