# Contact — visual review

The new Contact page uses the approved Afterglow design and official contact details. **The owner has not configured Formspree yet:** these production screenshots show the honest unconfigured state and working email alternative. No submission or live email delivery is claimed.

[Validation results](../../docs/CONTACT_VALIDATION.md) · [Integration and owner setup](../../docs/CONTACT_HANDOFF.md) · [Capture measurements](capture-evidence.json) · [Browser regression results](browser-verification.json)

Screenshots are unedited Chromium captures of the static production build. Full-page and detail views use the website’s reduced-motion preference; the separately labelled motion views show completed reveals after native scrolling.

## Desktop — 1440px

![Desktop full Contact page with official contact methods and the signature footer](contact-1440.png)

<details>
<summary>Desktop component views</summary>

### Editorial introduction

![Desktop: Editorial introduction](contact-1440-hero.png)

### Enquiry form and email fallback

![Desktop: Enquiry form and email fallback](contact-1440-form.png)

### Direct contact and social links

![Desktop: Direct contact and social links](contact-1440-direct.png)

### Preserved signature footer

![Desktop: Preserved signature footer](contact-1440-footer.png)

### Introduction after normal-motion reveal

![Desktop: Introduction after normal-motion reveal](contact-1440-hero-motion.png)

### Footer after native scrolling, normal motion

![Desktop: Footer after native scrolling, normal motion](contact-1440-footer-motion.png)

</details>

## Tablet — 768px

![Tablet full Contact page with official contact methods and the signature footer](contact-768.png)

<details>
<summary>Tablet component views</summary>

### Editorial introduction

![Tablet: Editorial introduction](contact-768-hero.png)

### Enquiry form and email fallback

![Tablet: Enquiry form and email fallback](contact-768-form.png)

### Direct contact and social links

![Tablet: Direct contact and social links](contact-768-direct.png)

### Preserved signature footer

![Tablet: Preserved signature footer](contact-768-footer.png)

### Introduction after normal-motion reveal

![Tablet: Introduction after normal-motion reveal](contact-768-hero-motion.png)

### Footer after native scrolling, normal motion

![Tablet: Footer after native scrolling, normal motion](contact-768-footer-motion.png)

</details>

## Mobile — 390px

![Mobile full Contact page with official contact methods and the signature footer](contact-390.png)

<details>
<summary>Mobile component views</summary>

### Editorial introduction

![Mobile: Editorial introduction](contact-390-hero.png)

### Enquiry form and email fallback

![Mobile: Enquiry form and email fallback](contact-390-form.png)

### Direct contact and social links

![Mobile: Direct contact and social links](contact-390-direct.png)

### Preserved signature footer

![Mobile: Preserved signature footer](contact-390-footer.png)

### Introduction after normal-motion reveal

![Mobile: Introduction after normal-motion reveal](contact-390-hero-motion.png)

### Footer after native scrolling, normal motion

![Mobile: Footer after native scrolling, normal motion](contact-390-footer-motion.png)

</details>

## Submission states

The configured success, failure, timeout and duplicate-submission paths are exercised using intercepted browser test responses. These tests make no external Formspree requests and cannot establish inbox delivery. A real owner-created endpoint, verified recipient, tested delivery and approved DrawnOut privacy policy are required before public form launch.
