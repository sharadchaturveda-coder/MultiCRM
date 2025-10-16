#!/usr/bin/env node

/**
 * Meta-Spec Inheritance Validation Script
 *
 * Validates that new spec.md files inherit the meta-spec constraints.
 * Runs as pre-commit hook or CI check.
 *
 * Usage: node scripts/validate-meta-inheritance.js [spec-file]
 *        node scripts/validate-meta-inheritance.js (validates all specs)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const META_SPEC_PATH = path.join(__dirname, '..', 'meta', 'meta.md');

function getFileHash(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

function validateSpecInheritance(specPath) {
  const metaContent = fs.readFileSync(META_SPEC_PATH, 'utf8');
  const specContent = fs.readFileSync(specPath, 'utf8');

  console.log(`🔍 Validating: ${specPath}`);

  const issues = [];

  // Check for meta-spec version/hash reference
  const metaHash = getFileHash(META_SPEC_PATH);
  const hasHashReference = specContent.includes(`meta@${metaHash}`);
  if (!hasHashReference) {
    issues.push(`Missing meta-spec inheritance reference. Add: \`meta@${metaHash}\``);
  }

  // Check for key constitutional constraints mention
  const constraints = [
    'TypeScript strict mode',
    '90%+ test coverage',
    'sub-500KB frontend bundle',
    'sub-100ms API response',
    'schema-per-tenant'
  ];

  constraints.forEach(constraint => {
    if (!specContent.toLowerCase().includes(constraint.toLowerCase())) {
      issues.push(`Missing inherited constraint acknowledgment: "${constraint}"`);
    }
  });

  // Check for stakeholder archetypes recognition
  const archetypes = [
    'domain specialists',
    'platform engineers',
    'product architects',
    'individual developers'
  ];

  let recognizedArchetypes = 0;
  archetypes.forEach(archetype => {
    if (specContent.toLowerCase().includes(archetype)) {
      recognizedArchetypes++;
    }
  });

  if (recognizedArchetypes < 2) {
    issues.push('Specification should acknowledge at least 2 stakeholder archetypes from meta-spec');
  }

  return { specPath, valid: issues.length === 0, issues };
}

function findAllSpecs(rootDir) {
  const specs = [];

  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.startsWith('.')) {
        walk(filePath);
      } else if (file === 'spec.md') {
        specs.push(filePath);
      }
    }
  }

  walk(rootDir);
  return specs;
}

function main() {
  const targetArg = process.argv[2];
  const specsDir = path.join(__dirname, '..', 'specs');

  let specFiles = [];

  if (targetArg) {
    if (fs.existsSync(targetArg) && path.basename(targetArg) === 'spec.md') {
      specFiles = [targetArg];
    } else {
      console.error(`❌ Spec file not found: ${targetArg}`);
      process.exit(1);
    }
  } else {
    specFiles = findAllSpecs(specsDir);
  }

  console.log(`🚀 Validating meta-spec inheritance for ${specFiles.length} specs...\n`);

  const results = [];
  let allValid = true;

  for (const specFile of specFiles) {
    const result = validateSpecInheritance(specFile);
    results.push(result);

    if (!result.valid) {
      allValid = false;
      console.log(`❌ ${path.relative(process.cwd(), specFile)}`);
      result.issues.forEach(issue => console.log(`   ${issue}`));
    } else {
      console.log(`✅ ${path.relative(process.cwd(), specFile)}`);
    }
  }

  console.log('\n' + '='.repeat(50));

  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.filter(r => !r.valid).length;

  console.log(`📊 Summary: ${validCount} valid, ${invalidCount} invalid`);

  if (allValid) {
    console.log('🎉 All specs properly inherit meta-spec constraints!');
    process.exit(0);
  } else {
    console.log('❌ Some specs have inheritance issues. Fix before committing.');
    console.log('💡 Add missing constraints and inheritance reference to spec files.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateSpecInheritance, findAllSpecs };
