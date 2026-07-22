# Merge all feature and pull request branches into main
$branches = @(
    'version-44', 'version-55',
    'pull-1', 'pull-2', 'pull-3', 'pull-4', 'pull-5', 'pull-6', 'pull-7', 'pull-8', 'pull-9', 'pull-10', 'pull-11', 'pull-12', 'pull-13', 'pull-14',
    'feat/dsa-sold-by', 'feat/gdpr-erasure', 'feat/allergen-origin-engine', 'feat/bundled-demo-catalogue', 'feat/compliance-phase-11', 'feat/error-boundaries', 'feat/homepage-investor-narrative', 'feat/reliability-degradation-engine', 'feat/seller-onboarding-flow', 'feat/vat-checkout',
    'fix/accessible-image-fallbacks', 'fix/auth-remove-mock-token', 'fix/auth-session-secret', 'fix/ci-dedup', 'fix/storage-safety',
    'agent/documentation-truth', 'agent/frontend-accessibility', 'agent/security-codeql-fixes', 'agent/testing-coverage',
    'docs/asset-provenance-audit', 'docs/truthfulness-fact-ledger'
)

foreach ($b in $branches) {
    Write-Host "=== Merging branch: $b ==="
    git merge $b -m "merge: integrate $b into main" --no-edit
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Resolving merge conflict for $b using main version..."
        git checkout --ours .
        git add .
        git commit -m "merge: integrate $b into main with conflict resolution" --no-edit
    }
}

Write-Host "Pushing final integrated main branch to GitHub..."
git push origin main
