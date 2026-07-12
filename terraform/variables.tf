variable "aws_region" {
  description = "Region for the S3 bucket."
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  description = "Short name used for resource naming/tagging."
  type        = string
  default     = "cv-site"
}

variable "domain_name" {
  description = "Custom domain, e.g. cv.tymoshenko.dev. Leave empty to serve on *.cloudfront.net only."
  type        = string
  default     = ""
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID for domain_name. Required only when domain_name is set."
  type        = string
  default     = ""
}

variable "price_class" {
  description = "CloudFront price class. PriceClass_100 = cheapest (US/EU/Canada edges only)."
  type        = string
  default     = "PriceClass_100"
}

variable "tags" {
  type = map(string)
  default = {
    Project   = "cv-site"
    ManagedBy = "terraform"
  }
}
