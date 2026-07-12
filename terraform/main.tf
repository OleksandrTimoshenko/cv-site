resource "random_id" "suffix" {
  byte_length = 3
}

locals {
  use_custom_domain = var.domain_name != "" && var.hosted_zone_id != ""
}

module "s3_static_site" {
  source = "./modules/s3_static_site"

  bucket_name = "${var.project_name}-${random_id.suffix.hex}"
  tags        = var.tags
}

module "acm_certificate" {
  source = "./modules/acm_certificate"
  count  = local.use_custom_domain ? 1 : 0

  providers = {
    aws = aws.us_east_1
  }

  domain_name    = var.domain_name
  hosted_zone_id = var.hosted_zone_id
  tags           = var.tags
}

module "cloudfront_distribution" {
  source = "./modules/cloudfront_distribution"

  project_name                 = var.project_name
  bucket_regional_domain_name  = module.s3_static_site.bucket_regional_domain_name
  price_class                  = var.price_class
  domain_name                  = var.domain_name
  acm_certificate_arn          = local.use_custom_domain ? module.acm_certificate[0].certificate_arn : ""
  tags                         = var.tags
}

# Bucket policy lives here, not inside the s3 module, because it needs the
# CloudFront distribution ARN — putting it in either child module would create
# a module-to-module cycle.
data "aws_iam_policy_document" "s3_oac" {
  statement {
    sid    = "AllowCloudFrontServicePrincipal"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${module.s3_static_site.bucket_arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [module.cloudfront_distribution.distribution_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = module.s3_static_site.bucket_id
  policy = data.aws_iam_policy_document.s3_oac.json
}

resource "aws_route53_record" "site_alias" {
  count = local.use_custom_domain ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = module.cloudfront_distribution.domain_name
    zone_id                = module.cloudfront_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}
