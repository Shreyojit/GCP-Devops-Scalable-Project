🚀 Deploying Kubernetes on GCP with Terraform & GitHub CI/CD 🌐
✨ Infrastructure as Code, Automated Deployments, and Scalable Cloud Solutions! ✨

🔧 What We Built:

    A fully automated pipeline to deploy a Kubernetes cluster on Google Cloud Platform (GCP) using Terraform and GitHub Actions.

    🛠️ Infrastructure as Code: Terraform scripts to provision GKE clusters, compute resources, and load balancers.

    🤖 CI/CD Automation: GitHub Actions for seamless, secure, and repeatable deployments.

    🚦 Scalable & Secure: Kubernetes deployments with static IPs, workload identity federation, and role-based access control.

🌟 Key Features:

    ☁️ GCP Integration: Leveraged GKE, Compute Engine, and Cloud Storage for a robust cloud infrastructure.

    🔐 Secure Authentication: GitHub OIDC with GCP Workload Identity Federation for secure, tokenless access.

    ⚙️ Terraform Magic: Infrastructure defined as code for consistency and reproducibility.

    🚀 CI/CD Pipeline: Automated testing, planning, and deployment with GitHub Actions.

    📦 Kubernetes Deployment: Containerized applications managed effortlessly with GKE.

💡 Why It’s Awesome:

    🛡️ Security First: OIDC authentication ensures no long-lived credentials are stored.

    ⏩ Speed & Efficiency: Automated pipelines reduce manual errors and deployment time.

    🌍 Scalability: Kubernetes and GKE enable horizontal scaling for high-traffic applications.

    🔄 Reproducibility: Terraform ensures the same infrastructure can be deployed across environments.

🔗 Tech Stack:

    Cloud: GCP (GKE, Compute Engine, Cloud Storage)

    IaC: Terraform

    CI/CD: GitHub Actions

    Orchestration: Kubernetes

    Authentication: GitHub OIDC + GCP Workload Identity Federation

🌈 The Future:

    📊 Monitoring: Integrate Prometheus and Grafana for real-time insights.

    🔄 Multi-Environment Support: Staging, production, and rollback strategies.

    🛠️ Advanced Networking: Implement ingress controllers and network policies.

🎯 Impact:
This project demonstrates how to build a modern, scalable, and secure cloud-native infrastructure using cutting-edge tools and best practices. Perfect for DevOps engineers, cloud enthusiasts, and anyone passionate about automation! 🚀




Deploying a Node.js Application to GKE Using Terraform and GitHub Actions
This guide walks you through the process of deploying a simple Node.js application to Google Kubernetes Engine (GKE) using Terraform and GitHub Actions. The steps include creating a Node.js application, writing a Dockerfile, setting up Terraform scripts for GKE, configuring GitHub OIDC authentication, and automating the deployment using GitHub Actions.

Table of Contents
Create a Simple Node.js/Express Application

Write Dockerfile for the Application

Write Terraform Scripts for GKE Cluster, Deployment, and Service

Set Up GitHub OIDC Authentication with GCP

Create a GCS Bucket for Terraform State

Add Secrets to GitHub Repository

Write GitHub Actions Workflow

Deploy the Application

Clean Up Resources

1. Create a Simple Node.js/Express Application
Create a simple Node.js application using Express. Below is an example app.js file:

javascript
Copy
const express = require('express');
const app = express();
const port = 80;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
2. Write Dockerfile for the Application
Create a Dockerfile to containerize the Node.js application:

dockerfile
Copy
FROM --platform=linux/amd64 node:14
WORKDIR /usr/app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 80
CMD ["node", "app.js"]
3. Write Terraform Scripts for GKE Cluster, Deployment, and Service
providers.tf
Configure the Google and Kubernetes providers:

hcl
Copy
terraform {
  required_version = ">= 0.12"
  backend "gcs" {}
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "kubernetes" {
  host  = google_container_cluster.default.endpoint
  token = data.google_client_config.current.access_token
  client_certificate = base64decode(
    google_container_cluster.default.master_auth[0].client_certificate,
  )
  client_key = base64decode(google_container_cluster.default.master_auth[0].client_key)
  cluster_ca_certificate = base64decode(
    google_container_cluster.default.master_auth[0].cluster_ca_certificate,
  )
}
main.tf
Create a GKE cluster:

hcl
Copy
data "google_container_engine_versions" "default" {
  location = "us-central1-c"
}

data "google_client_config" "current" {}

resource "google_container_cluster" "default" {
  name               = "my-first-cluster"
  location           = "us-central1-c"
  initial_node_count = 3
  min_master_version = data.google_container_engine_versions.default.latest_master_version

  node_config {
    machine_type = "g1-small"
    disk_size_gb = 32
  }

  provisioner "local-exec" {
    when    = destroy
    command = "sleep 90"
  }
}
k8s.tf
Deploy the application to Kubernetes:

hcl
Copy
resource "kubernetes_deployment" "name" {
  metadata {
    name = "nodeappdeployment"
    labels = {
      "type" = "backend"
      "app"  = "nodeapp"
    }
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        "type" = "backend"
        "app"  = "nodeapp"
      }
    }
    template {
      metadata {
        name = "nodeapppod"
        labels = {
          "type" = "backend"
          "app"  = "nodeapp"
        }
      }
      spec {
        container {
          name  = "nodecontainer"
          image = var.container_image
          port {
            container_port = 80
          }
        }
      }
    }
  }
}

resource "google_compute_address" "default" {
  name   = "ipforservice"
  region = var.region
}

resource "kubernetes_service" "appservice" {
  metadata {
    name = "nodeapp-lb-service"
  }
  spec {
    type             = "LoadBalancer"
    load_balancer_ip = google_compute_address.default.address
    port {
      port        = 80
      target_port = 80
    }
    selector = {
      "type" = "backend"
      "app"  = "nodeapp"
    }
  }
}
variables.tf
Define input variables:

hcl
Copy
variable "region" {}
variable "project_id" {}
variable "container_image" {}
outputs.tf
Define output values:

hcl
Copy
output "cluster_name" {
  value = google_container_cluster.default.name
}

output "cluster_endpoint" {
  value = google_container_cluster.default.endpoint
}

output "cluster_location" {
  value = google_container_cluster.default.location
}

output "load-balancer-ip" {
  value = google_compute_address.default.address
}
4. Set Up GitHub OIDC Authentication with GCP
Create a Workload Identity Pool
bash
Copy
gcloud iam workload-identity-pools create "k8s-pool" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --display-name="k8s Pool"
Create an OIDC Identity Provider
bash
Copy
gcloud iam workload-identity-pools providers create-oidc "k8s-provider" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="k8s-pool" \
  --display-name="k8s provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.aud=assertion.aud" \
  --issuer-uri="https://token.actions.githubusercontent.com"
Create a Service Account
Create a service account with the required permissions:

bash
Copy
gcloud iam service-accounts create tf-gke-test \
  --display-name="Terraform GKE Test Service Account"
Assign the necessary roles:

bash
Copy
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:tf-gke-test@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/container.admin"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:tf-gke-test@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
Add IAM Policy Binding
bash
Copy
gcloud iam service-accounts add-iam-policy-binding tf-gke-test@${PROJECT_ID}.iam.gserviceaccount.com \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/k8s-pool/attribute.repository/${GITHUB_REPO}"
5. Create a GCS Bucket for Terraform State
Create a Google Cloud Storage (GCS) bucket to store the Terraform state file:

bash
Copy
gsutil mb gs://${TF_STATE_BUCKET_NAME}
6. Add Secrets to GitHub Repository
Add the following secrets to your GitHub repository:

GCP_PROJECT_ID

GCP_TF_STATE_BUCKET

7. Write GitHub Actions Workflow
Create a GitHub Actions workflow file (.github/workflows/deploy.yml):

yaml
Copy
name: Deploy to Kubernetes
on:
  push:
    branches:
      - "main"

env:
  GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  TF_STATE_BUCKET_NAME: ${{ secrets.GCP_TF_STATE_BUCKET }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      IMAGE_TAG: ${{ github.sha }}

    permissions:
      contents: 'read'
      id-token: 'write'

    steps:
    - uses: actions/checkout@v3
    - id: auth
      name: Authenticate to Google Cloud
      uses: google-github-actions/auth@v1
      with:
        token_format: 'access_token'
        workload_identity_provider: 'projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/k8s-pool/providers/k8s-provider'
        service_account: 'tf-gke-test@${GCP_PROJECT_ID}.iam.gserviceaccount.com'
    - name: Set up Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
    - name: Docker Auth
      run: gcloud auth configure-docker
    - name: Build and Push Docker Image
      run: |
        docker build -t us.gcr.io/$GCP_PROJECT_ID/nodeappimage:$IMAGE_TAG .
        docker push us.gcr.io/$GCP_PROJECT_ID/nodeappimage:$IMAGE_TAG
      working-directory: ./nodeapp
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v2
    - name: Terraform Init
      run: terraform init -backend-config="bucket=$TF_STATE_BUCKET_NAME" -backend-config="prefix=test"
      working-directory: ./terraform
    - name: Terraform Plan
      run: |
        terraform plan \
        -var="region=us-central1" \
        -var="project_id=$GCP_PROJECT_ID" \
        -var="container_image=us.gcr.io/$GCP_PROJECT_ID/nodeappimage:$IMAGE_TAG" \
        -out=PLAN
      working-directory: ./terraform
    - name: Terraform Apply
      run: terraform apply PLAN
      working-directory: ./terraform
8. Deploy the Application
Push your code to the main branch, and the GitHub Actions workflow will automatically deploy your application to GKE.

9. Clean Up Resources
To clean up all resources, run the following command:

bash
Copy
terraform destroy -var="region=us-central1" -var="project_id=$GCP_PROJECT_ID" -var="container_image=us.gcr.io/$GCP_PROJECT_ID/nodeappimage:$IMAGE_TAG"
Screenshots

    

![Screenshot from 2025-01-26 00-53-39](https://github.com/user-attachments/assets/1cf299b1-2028-4da8-91c2-8aa2a18b3a2a)
![Screenshot from 2025-01-26 01-32-29](https://github.com/user-attachments/assets/66051e3a-f59d-4101-bcd0-a2e8fa04f0ca)
![Screenshot from 2025-01-26 01-28-42](https://github.com/user-attachments/assets/c0d63c96-d8da-4e0e-b8c4-14646dc574ba)
![Screenshot from 2025-01-26 00-49-45](https://github.com/use
![Screenshot 2025-01-26 011741](https://github.com/user-attachments/assets/20371664-5c1d-47f0-8466-ba41e5137eee)
r-attachments/assets/1a59efb1-e22e-49da-bd4b-34d64a7f41cc)

