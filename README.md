🚀 Deploying Kubernetes on GCP with Terraform & GitHub CI/CD 🌐
✨ Infrastructure as Code, Automated Deployments, and Scalable Cloud Solutions! ✨

🔧 What We Built
A fully automated pipeline to deploy a Kubernetes cluster on Google Cloud Platform (GCP) using Terraform and GitHub Actions.

🛠️ Infrastructure as Code: Terraform scripts to provision GKE clusters, compute resources, and load balancers.

🤖 CI/CD Automation: GitHub Actions for seamless, secure, and repeatable deployments.

🚦 Scalable & Secure: Kubernetes deployments with static IPs, workload identity federation, and role-based access control.

🌟 Key Features
☁️ GCP Integration: Leveraged GKE, Compute Engine, and Cloud Storage for a robust cloud infrastructure.

🔐 Secure Authentication: GitHub OIDC with GCP Workload Identity Federation for secure, tokenless access.

⚙️ Terraform Magic: Infrastructure defined as code for consistency and reproducibility.

🚀 CI/CD Pipeline: Automated testing, planning, and deployment with GitHub Actions.

📦 Kubernetes Deployment: Containerized applications managed effortlessly with GKE.

💡 Why It’s Awesome
🛡️ Security First: OIDC authentication ensures no long-lived credentials are stored.

⏩ Speed & Efficiency: Automated pipelines reduce manual errors and deployment time.

🌍 Scalability: Kubernetes and GKE enable horizontal scaling for high-traffic applications.

🔄 Reproducibility: Terraform ensures the same infrastructure can be deployed across environments.

🔗 Tech Stack
Cloud: GCP (GKE, Compute Engine, Cloud Storage)

IaC: Terraform

CI/CD: GitHub Actions

Orchestration: Kubernetes

Authentication: GitHub OIDC + GCP Workload Identity Federation

🌈 The Future
📊 Monitoring: Integrate Prometheus and Grafana for real-time insights.

🔄 Multi-Environment Support: Staging, production, and rollback strategies.

🛠️ Advanced Networking: Implement ingress controllers and network policies.

🎯 Impact
This project demonstrates how to build a modern, scalable, and secure cloud-native infrastructure using cutting-edge tools and best practices. Perfect for DevOps engineers, cloud enthusiasts, and anyone passionate about automation! 🚀


![Screenshot 2025-01-26 015534](https://github.com/user-attachments/assets/5692108c-7a0b-481f-a402-681eeb8e8d2a)


![Screenshot 2025-01-26 015552](https://github.com/user-attachments/assets/b45f191a-d409-46bf-ae99-a34043e604b8)


![Screenshot 2025-01-26 015607](https://github.com/user-attachments/assets/72898849-25a0-4825-b16e-452708a9b109)

Deploying a Node.js Application to GKE Using Terraform and GitHub Actions
This guide walks you through the process of deploying a simple Node.js application to Google Kubernetes Engine (GKE) using Terraform and GitHub Actions.

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

<p>
<img src="https://raw.githubusercontent.com/tush-tr/tush-tr/master/res/docker.gif" height="36" width="36" >
<img src="https://raw.githubusercontent.com/tush-tr/tush-tr/master/res/kubernetes.svg.png"  height="36" width="36" ><img src="https://raw.githubusercontent.com/tush-tr/tush-tr/master/res/social-icon-google-cloud-1200-630.png" height="36" ><img src="https://raw.githubusercontent.com/itsksaurabh/itsksaurabh/master/assets/terraform.gif" height="36" ></p>

# Steps
- [x] Create a simple nodejs/express application.
- [x] Write Dockerfile for the application
    ```Dockerfile
    FROM --platform=linux/amd64 node:14
    WORKDIR /usr/app
    COPY package.json .
    RUN npm install
    COPY . .
    EXPOSE 80
    CMD ["node","app.js"]
    ```
- [x] Write Terraform scripts for GKE Cluster, Deployment and service.
  - ```providers.tf```: use google and kubernetes providers
    ```sh
    terraform {
      required_version = ">= 0.12"
      backend "gcs" {
      }
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
    ```
  - ```main.tf```: for creating GKE Cluster
    ```sh
    data "google_container_engine_versions" "default" {
      location = "us-central1-c"
    }
    data "google_client_config" "current" {
    }

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
    ```
  - ```k8s.tf```: For deployment and service deployment on K8s
    ```sh
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
    ```
  - ```variables.tf```
    ```sh
    variable "region" {
    }
    variable "project_id" {
    }
    variable "container_image" {
    }
    ```
  - ```outputs.tf```
    ```sh
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
    ```
- [x] Setup Github OIDC Authentication with GCP
  - Create a new workload Identity pool
    ```sh
    gcloud iam workload-identity-pools create "k8s-pool" \
    --project="${PROJECT_ID}" \
    --location="global" \
    --display-name="k8s Pool"
    ```
  - Create a oidc identity provider for authenticating with Github
    ```sh
    gcloud iam workload-identity-pools providers create-oidc "k8s-provider" \
    --project="${PROJECT_ID}" \
    --location="global" \
    --workload-identity-pool="k8s-pool" \
    --display-name="k8s provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.aud=assertion.aud" \
    --issuer-uri="https://token.actions.githubusercontent.com"
    ```
  - Create a service account with these permissions
    ```sh
    roles/compute.admin
    roles/container.admin
    roles/container.clusterAdmin
    roles/iam.serviceAccountTokenCreator
    roles/iam.serviceAccountUser
    roles/storage.admin
    ```
  - Add IAM Policy bindings with Github repo, Identity provider and service account.
    ```sh
    gcloud iam service-accounts add-iam-policy-binding "${SERVICE_ACCOUNT_EMAIL}" \
    --project="${GCP_PROJECT_ID}" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/k8s-pool/attribute.repository/${GITHUB_REPO}"
    ```


- [x] Create a bucket in GCS for storing terraform state file.
- [x] Get your GCP Project number for reference.
  ```sh
  gcloud projects describe ${PROJECT_ID}
  ``` 
- [x] Add secrets to Github Repo
  - GCP_PROJECT_ID
  - GCP_TF_STATE_BUCKET
- [x] write GH Actions workflow for deploying our app to GKE using terraform

```yml
name: Deploy to kubernetes
on:
  push:
    branches:
      - "Complete-CI/CD-with-Terraform-GKE"

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
    - uses: 'actions/checkout@v3'
    - id: 'auth'
      name: 'Authenticate to Google Cloud'
      uses: 'google-github-actions/auth@v1'
      with:
        token_format: 'access_token'
        workload_identity_provider: 'projects/886257991781/locations/global/workloadIdentityPools/k8s-pool/providers/k8s-provider'
        service_account: 'tf-gke-test@$GCP_PROJECT_ID.iam.gserviceaccount.com'
    - name: 'Set up Cloud SDK'
      uses: 'google-github-actions/setup-gcloud@v1'
    - name: docker auth
      run: gcloud auth configure-docker
    - run: gcloud auth list
    - name: Build and push docker image
      run: |
        docker build -t us.gcr.io/$GCP_PROJECT_ID/nodeappimage:$IMAGE_TAG .
        docker push us.gcr.io/$GCP_PROJECT_ID/nodeappimage:$IMAGE_TAG
      working-directory: ./nodeapp
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v2
    - name: Terraform init
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
```

8. Deploy the Application
Push your code to the main branch, and the GitHub Actions workflow will automatically deploy your application to GKE.

9. Clean Up Resources
To clean up all resources, run the following command:

terraform destroy -var="region=us-central1" -var="project_id=$GCP_PROJECT_ID" -var="container_image=us.gcr.io/$GCP_PROJECT_ID/nodeappimage:$IMAGE_TAG"
Screenshots
Here are some screenshots of the deployment process:



![Screenshot from 2025-01-26 01-32-29](https://github.com/user-attachments/assets/d4117ce7-71c3-4269-b3e1-dbf558551889)
![Screenshot from 2025-01-26 01-28-42](https://github.com/user-attachments/assets/94d58989-914d-4741-8c4d-ad98704b58b0)
![Screenshot from 2025-01-26 00-53-39](https://github.com/user-attachments/assets/46e67864-5859-46ac-8569-a0605e17e4ae)
