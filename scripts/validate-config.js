#!/usr/bin/env node
'use strict';

/** Performs repository-only checks and never prints environment values. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const requiredFiles = ['.github/workflows/ci-cd.yml', 'docker-compose.yml', 'k8s/core-service-deployment.yml', 'k8s/ingress.yml'];
let failed = false;

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    console.error(`Configuration error: required file is missing: ${relativePath}`);
    failed = true;
  }
}

const deploymentPath = path.join(root, 'k8s/core-service-deployment.yml');
if (fs.existsSync(deploymentPath)) {
  const deployment = fs.readFileSync(deploymentPath, 'utf8');
  for (const probe of ['livenessProbe:', 'readinessProbe:', 'startupProbe:']) {
    if (!deployment.includes(probe)) {
      console.error(`Configuration error: ${path.basename(deploymentPath)} lacks ${probe}`);
      failed = true;
    }
  }
}

if (failed) process.exitCode = 1;
else console.log('Repository configuration references are present.');
