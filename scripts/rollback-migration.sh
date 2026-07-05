#!/bin/bash
set -e

echo "Initiating rollback procedure..."

# Rollback database to previous version
# This would typically use Flyway or Liquibase rollback commands
# For example: flyway undo -url=jdbc:postgresql://$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB

echo "Rolling back Kubernetes deployments..."
kubectl rollout undo deployment/web-deployment -n $NAMESPACE
kubectl rollout undo deployment/core-service-deployment -n $NAMESPACE

echo "Waiting for rollback to complete..."
kubectl rollout status deployment/web-deployment -n $NAMESPACE --timeout=300s
kubectl rollout status deployment/core-service-deployment -n $NAMESPACE --timeout=300s

echo "Rollback completed successfully"
