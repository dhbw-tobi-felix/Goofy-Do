# Variables
NAMESPACE := goofydo
DOMAIN := goofydo.local
K8S_PATH := deployment/k8s
OS := $(shell uname -s)
MINIKUBE_IP := $(shell minikube ip 2>/dev/null)

# Shell setup
SHELL := /bin/bash

.PHONY: help up down stop start suspend resume undeploy destroy restart secrets tls-secret deploy logs tunnel check-prereqs

help: ## Display this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# --- MAIN COMMANDS ---

up: check-prereqs cluster-start ns secrets tls-secret deploy ## Start everything (Idempotent: Can be run multiple times)
	@echo ""
	@$(MAKE) wait-ready

stop: ## Stop the Minikube VM (Preserves ALL data and secrets)
	@echo "🛑 Stopping Minikube VM..."
	minikube stop

start: ## Restart Minikube VM (Resumes state)
	@echo "▶️  Starting Minikube VM..."
	minikube start --driver=docker --memory=4096 --cpus=2
	@echo "🔄 Don't forget to restart the tunnel with 'make tunnel'!"

suspend: ## Scale all deployments to 0 (Frees resources, keeps Secrets & DB Data)
	@echo "zzz Suspending application..."
	kubectl scale deployment --all --replicas=0 -n $(NAMESPACE)

resume: ## Scale all deployments back to 1
	@echo "⏰ Resuming application..."
	kubectl scale deployment --all --replicas=1 -n $(NAMESPACE)

undeploy: ## Delete App Resources (Deployments, Services, Ingress) but KEEP Secrets & DB Data
	@echo "🧹 Removing application resources..."
	@# We delete specific resource types instead of 'delete -k' to avoid deleting the Namespace
	kubectl delete deployment,service,ingress,job -n $(NAMESPACE) --all --ignore-not-found=true
	@echo "✅ App removed. Secrets and Database Volumes preserved."

destroy: ## 🧨 DANGER: Delete Namespace, Secrets, and ALL Data (Factory Reset)
	@echo "🔥 Destroying everything..."
	kubectl delete -k $(K8S_PATH) --ignore-not-found=true
	kubectl delete pvc --all -n goofydo --ignore-not-found=true
	kubectl delete ns $(NAMESPACE) --ignore-not-found=true
	@echo "💀 Everything is gone."

restart: destroy up ## destroy and then start from scratch

wait-ready: ## Wait until all deployments are Ready, then print tunnel info
	@echo "⏳ Waiting for all deployments in namespace $(NAMESPACE) to become Ready..."

	@for dep in $$(kubectl get deploy -n $(NAMESPACE) -o jsonpath='{.items[*].metadata.name}'); do \
		echo "→ Waiting for deployment $$dep..."; \
		kubectl rollout status deployment/$$dep -n $(NAMESPACE) --timeout=600s || exit 1; \
	done

	@echo ""
	@echo "✅ Cluster is fully Ready."
	@echo "🚀 App available at: https://$(DOMAIN)"
	@echo "ℹ️ Run 'make tunnel' in a separate terminal."

# --- HELPER COMMANDS ---

check-prereqs:
	@which minikube > /dev/null || (echo "❌ minikube is missing" && exit 1)
	@which kubectl > /dev/null || (echo "❌ kubectl is missing" && exit 1)
	@which openssl > /dev/null || (echo "❌ openssl is missing" && exit 1)

cluster-start:
	@echo "⚙️  Checking Minikube status..."
	@minikube status > /dev/null 2>&1 || \
    		(echo "🚀 Starting Minikube (Docker, 4GB RAM, 2 CPUs)..." && \
    		minikube start --driver=docker --memory=4096 --cpus=2)
	@minikube addons enable ingress > /dev/null 2>&1
	@minikube addons enable ingress-dns > /dev/null 2>&1

ns:
	@kubectl get ns $(NAMESPACE) > /dev/null 2>&1 || kubectl create ns $(NAMESPACE)

secrets: ns
	@echo "🔐 Checking application secrets..."
	@# Backend Secret
	@kubectl get secret backend-secret -n $(NAMESPACE) > /dev/null 2>&1 || \
	(echo "   Creating backend-secret..." && \
	kubectl create secret generic backend-secret -n $(NAMESPACE) \
		--from-literal=QUARKUS_DATASOURCE_USERNAME=app \
		--from-literal=QUARKUS_DATASOURCE_PASSWORD="$$(openssl rand -base64 32)")

	@# Postgres Secret
	@kubectl get secret postgres-secret -n $(NAMESPACE) > /dev/null 2>&1 || \
	(echo "   Creating postgres-secret..." && \
	kubectl create secret generic postgres-secret -n $(NAMESPACE) \
		--from-literal=POSTGRES_USER=root \
		--from-literal=POSTGRES_PASSWORD="$$(openssl rand -base64 32)")

	@# Keycloak Admin Secret
	@kubectl get secret keycloak-admin-secret -n $(NAMESPACE) > /dev/null 2>&1 || \
	(echo "   Creating keycloak-admin-secret..." && \
	kubectl create secret generic keycloak-admin-secret -n $(NAMESPACE) \
		--from-literal=KEYCLOAK_ADMIN=kc-admin \
		--from-literal=KEYCLOAK_ADMIN_PASSWORD="$$(openssl rand -base64 32)")

	@# Keycloak DB Secret
	@kubectl get secret keycloak-db-secret -n $(NAMESPACE) > /dev/null 2>&1 || \
	(echo "   Creating keycloak-db-secret..." && \
	kubectl create secret generic keycloak-db-secret -n $(NAMESPACE) \
		--from-literal=KC_DB_USERNAME=keycloak_prod \
		--from-literal=KC_DB_PASSWORD="$$(openssl rand -base64 32)")

	@echo "✅ Secrets ready."

tls-secret: ns
	@echo "🔐 Checking TLS certificates..."
	@if [ -f "$(DOMAIN).pem" ] && [ -f "$(DOMAIN)-key.pem" ]; then \
		kubectl create secret tls goofydo-tls --cert=$(DOMAIN).pem --key=$(DOMAIN)-key.pem -n $(NAMESPACE) --dry-run=client -o yaml | kubectl apply -f -; \
	elif which mkcert > /dev/null; then \
		mkcert $(DOMAIN) && kubectl create secret tls goofydo-tls --cert=$(DOMAIN).pem --key=$(DOMAIN)-key.pem -n $(NAMESPACE) --dry-run=client -o yaml | kubectl apply -f -; \
	else \
		echo "❌ No certs found. Ingress might fail (https issue)."; \
	fi

deploy:
	@echo "🔧Fixing Ingress..."
	-kubectl delete -A ValidatingWebhookConfiguration ingress-nginx-admission
	@echo "🚀 Deploying resources..."
	kubectl apply -k $(K8S_PATH)

tunnel:
	@echo "🔌 Setup Tunnel mechanism for $(OS)..."
ifeq ($(OS),Darwin)
	@# macOS
	sudo minikube tunnel
else
	@# Linux:
	@echo "✅ On Linux you don't need a tunnel!"
	@echo "Instead, configure your /etc/hosts to use the direct Minikube IP."
	@echo "👉 Your current Minikube IP: $(MINIKUBE_IP)"
	@echo ""
	@echo "Add this line to /etc/hosts (delete any existing 127.0.0.1 entry for goofydo!):"
	@echo "echo '$(MINIKUBE_IP) goofydo.local' | sudo tee -a /etc/hosts"
endif

logs:
	kubectl get pods -n $(NAMESPACE)