output "s3_bucket_name" {
  description = "Set this as the BUCKET repository/environment variable in GitHub for the deploy workflow."
  value       = module.s3_static_site.bucket_id
}

output "cloudfront_distribution_id" {
  description = "Set this as CLOUDFRONT_DISTRIBUTION_ID in GitHub for cache invalidation."
  value       = module.cloudfront_distribution.distribution_id
}

output "cloudfront_domain_name" {
  value = module.cloudfront_distribution.domain_name
}

output "site_url" {
  value = var.domain_name != "" ? "https://${var.domain_name}" : "https://${module.cloudfront_distribution.domain_name}"
}
