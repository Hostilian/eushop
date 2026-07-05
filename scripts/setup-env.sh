#!/bin/bash
set -e

echo "Setting up CI/CD environment..."

# Create necessary directories
mkdir -p k8s .github/workflows scripts

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || true

echo "✅ Environment setup complete"
echo ""
echo "Next steps:"
echo "1. Set up GitHub Secrets in your repository:"
echo "   - KUBE_CONFIG_STAGING, KUBE_CONFIG_PRODUCTION"
echo "   - KUBE_CONTEXT_STAGING, KUBE_CONTEXT_PRODUCTION"
echo "   - SLACK_WEBHOOK_URL (optional)"
echo "   - SNYK_TOKEN (optional for security scanning)"
echo "   - STAGING_URL, PRODUCTION_URL"
echo ""
echo "2. Configure Kubernetes clusters:"
echo "   kubectl config set-context staging --namespace=staging"
echo "   kubectl config set-context production --namespace=production"
echo ""
echo "3. Test the pipeline locally:"
echo "   pnpm ci:web"
echo "   pnpm ci:core"
echo ""
echo "4. Push to GitHub to trigger workflows"
