#!/bin/bash

# Debug workflow script - ensures reproducible diagnostics
# MultiCRM LLM-debuggable project diagnostics

echo "🔍 Starting MultiCRM debug workflow..."

# Type checking
echo "📝 Running TypeScript type check..."
npm run type-check

# Linting
echo "🔍 Running ESLint..."
npm run lint

# Testing
echo "🧪 Running test suite..."
npm test

# Generate live dependency map
echo "📦 Generating live dependency map..."
node scripts/context-trace.js > ./docs/dependency-map.json

# System status
echo "📊 Checking system health..."
node scripts/system-status.js

# Generate fresh code map
echo "🗺️  Regenerating code map..."
node -e "
const fs = require('fs');
const path = require('path');

function generateMap(dir, prefix = '') {
  const entries = [];
  const items = fs.readdirSync(dir).sort();

  for (const item of items) {
    if (['node_modules', '.git'].includes(item)) continue;

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    const isDir = stat.isDirectory();

    if (isDir) {
      const desc = getDescription(item);
      entries.push(prefix + '- ' + item + '/' + (desc ? ' (' + desc + ')' : ''));
      entries.push(...generateMap(fullPath, prefix + '  | '));
    } else {
      entries.push(prefix + '- ' + item);
    }
  }
  return entries;
}

function getDescription(filename) {
  const descriptions = {
    'index.ts': 'main entry point',
    'types.ts': 'type definitions',
    'config.ts': 'configuration',
    'package.json': 'dependencies'
  };
  return descriptions[filename];
}

const map = generateMap('src').join('\n');
const header = '# Code Map\\nMultirepo CRM template implementing specification-driven development. Generated ' + new Date().toISOString().split('T')[0] + '.\\n\\n';
fs.writeFileSync('./docs/code-map.md', header + '```\\nsrc/\\n' + map + '\\n```');
"

echo "✅ Debug workflow complete. Check docs/ for updated maps."
echo "📋 Output files:"
echo "  - docs/dependency-map.json (live dependency graph)"
echo "  - docs/code-map.md (updated code overview)"
echo "🔍 Run 'cat docs/dependency-map.json | jq .' to view dependency graph"
