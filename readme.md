# CV site
### Overview

A personal résumé site for a DevOps engineer, styled after `systemctl status` /
a monitoring dashboard — every résumé section (experience, skills, education)
renders as a systemd-style unit with an `● active (loaded)` status indicator.

- Static site: HTML/CSS/JS, content externalized to JSON (EN/UA, EN default)
- Hosting: S3 + CloudFront, no backend, no server-side logic
- Infrastructure: OpenTofu, modular (`s3_static_site`, `cloudfront_distribution`,
  `acm_certificate`), applied locally
- Content deploy: GitHub Actions (S3 sync + CloudFront invalidation)
- Contact info protected with client-side obfuscation (base64 + reveal-on-click) —
  no plain-text email/phone in the page source

**Live:** _(add the link after your first `tofu apply`)_
## Create AWS insfra
### Install terraform or OpenTofu + aws CLI
##### Use commands for your OS.
```
nix-shell -p opentofu awscli2
```

## Deploy code to S3
1. Create AWS user with propper permissions
2. Add user credentials to GitHub repo
3. Use GitHub workflow for deploy code to s3 bucket.