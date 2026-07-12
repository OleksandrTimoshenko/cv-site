variable "domain_name" {
  description = "Custom domain for the site, e.g. cv.tymoshenko.dev."
  type        = string
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID that owns domain_name."
  type        = string
}

variable "tags" {
  type    = map(string)
  default = {}
}

# Caller must pass a provider aliased to us-east-1 — CloudFront only accepts
# ACM certs from that region regardless of where the rest of the stack lives.

resource "aws_acm_certificate" "this" {
  domain_name       = var.domain_name
  validation_method = "DNS"
  tags              = var.tags

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "validation" {
  for_each = {
    for dvo in aws_acm_certificate.this.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = var.hosted_zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "this" {
  certificate_arn         = aws_acm_certificate.this.arn
  validation_record_fqdns = [for r in aws_route53_record.validation : r.fqdn]
}

output "certificate_arn" {
  value = aws_acm_certificate_validation.this.certificate_arn
}
