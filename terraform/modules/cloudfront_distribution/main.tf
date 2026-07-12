variable "project_name" {
  type = string
}

variable "bucket_regional_domain_name" {
  description = "From the s3_static_site module — the origin."
  type        = string
}

variable "price_class" {
  type    = string
  default = "PriceClass_100"
}

variable "domain_name" {
  description = "Custom domain alias, or empty string to serve only on *.cloudfront.net."
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "Must be an us-east-1 cert. Required if domain_name is set."
  type        = string
  default     = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}

resource "aws_cloudfront_origin_access_control" "this" {
  name                              = "${var.project_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = var.price_class
  aliases             = var.domain_name != "" ? [var.domain_name] : []
  tags                = var.tags

  origin {
    domain_name              = var.bucket_regional_domain_name
    origin_id                = "s3-site-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.this.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "s3-site-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress                = true


    # AWS managed "CachingOptimized" policy — no need to hand-roll cache headers.
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  # Missing paths (e.g. a stale deep link) still serve index.html instead of
  # CloudFront's default XML error page.
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.domain_name == ""
    acm_certificate_arn            = var.domain_name != "" ? var.acm_certificate_arn : null
    ssl_support_method             = var.domain_name != "" ? "sni-only" : null
    minimum_protocol_version       = var.domain_name != "" ? "TLSv1.2_2021" : null
  }
}

output "distribution_id" {
  value = aws_cloudfront_distribution.this.id
}

output "distribution_arn" {
  value = aws_cloudfront_distribution.this.arn
}

output "domain_name" {
  value = aws_cloudfront_distribution.this.domain_name
}

output "hosted_zone_id" {
  value = aws_cloudfront_distribution.this.hosted_zone_id
}

output "origin_access_control_id" {
  value = aws_cloudfront_origin_access_control.this.id
}
