terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Applied locally (per your workflow) — remote state is still worth it so you're
  # not the single point of failure for your own state file. Uncomment once the
  # backing bucket/table exist:
  #
  # backend "s3" {
  #   bucket         = "your-tfstate-bucket"
  #   key            = "cv-site/terraform.tfstate"
  #   region         = "eu-central-1"
  #   dynamodb_table = "terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}