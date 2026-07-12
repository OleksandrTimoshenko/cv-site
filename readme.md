# CV site
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