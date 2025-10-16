#!/usr/bin/env node

/**
 * Environmental Awareness: System Status Script
 *
 * Provides comprehensive system health overview
 * Sanity check before deployment or major changes
 *
 * Usage: node scripts/system-status.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getFileHash(filePath) {
  if (!fs.existsSync(filePath)) return 'NOT FOUND';
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  } catch (e) {
    return 'ERROR';
  }
}

function countSpecs() {
  const specsDir = path.join(__dirname, '..', 'specs');
  if (!fs.existsSync(specsDir)) return 0;

  let count = 0;
  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (file === 'spec.md') {
        count++;
      }
    }
  }
  walk(specsDir);
  return count;
}

function checkConstitutionCompliance() {
  const constitutionPath = path.join(__dirname, '..', 'constitution.md');
  if (!fs.existsSync(constitutionPath)) return 'MISSING';

  const content = fs.readFileSync(constitutionPath, 'utf8');

  // Check for key constitutional elements
  const elements = [
    'TypeScript strict mode',
    'schema-per-tenant',
    'multi-tenancy',
    'specification'
  ];

  const present = elements.filter(el =>
    content.toLowerCase().includes(el.toLowerCase().replace('-', ' '))
  );

  return `${present.length}/${elements.length} elements present`;
}

function analyzeDecisionLedger() {
  const ledgerPath = path.join(__dirname, '..', 'decisions', 'ledger.md');
  if (!fs.existsSync(ledgerPath)) return { total: 0, recent: 0, overdue: 0 };

  const content = fs.readFileSync(ledgerPath, 'utf8');
  const lines = content.split('\n');

  let totalEntries = 0;
  let recentEntries = 0; // Last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let overdueEntries = 0;

  for (const line of lines) {
    if (line.trim() && !line.startsWith('#') && !line.startsWith('---') && line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 5) {
        totalEntries++;

        // Check date
        try {
          const entryDate = new Date(parts[0]);
          if (entryDate >= thirtyDaysAgo) recentEntries++;
        } catch (e) {
          // Invalid date, skip
        }

        // Check if overdue (simplified check)
        const status = parts[4];
        if (status.includes('IMPLEMENTING') && parts.length > 5) {
          const revisitBy = parts[5];
          if (revisitBy !== 'N/A' && revisitBy !== '') {
            try {
              const reviewDate = new Date(revisitBy);
              if (reviewDate < new Date()) overdueEntries++;
            } catch (e) {
              // Invalid date
            }
          }
        }
      }
    }
  }

  return { total: totalEntries, recent: recentEntries, overdue: overdueEntries };
}

function checkTestCoverage() {
  // Simulate coverage check - in real system would parse test output
  return '87% (simulated - integrate with test runner)';
}

function analyzeHealthScore() {
  let score = 100;

  // Constitution compliance reduces score if incomplete
  const constCompliance = checkConstitutionCompliance();
  if (!constCompliance.includes('MISSING')) {
    const match = constCompliance.match(/(\d+)\/(\d+)/);
    if (match) {
      const present = parseInt(match[1]);
      const total = parseInt(match[2]);
      const reduction = (total - present) * 5;
      score -= reduction;
    }
  }

  // Ledger health
  const ledger = analyzeDecisionLedger();
  if (ledger.overdue > 0) score -= ledger.overdue * 3;

  // Spec compliance from cached metrics
  const metricsPath = path.join(__dirname, '..', 'metrics', 'index.json');
  if (fs.existsSync(metricsPath)) {
    try {
      const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
      const health = metrics.healthScore?.overall || 87;
      score = (score + health) / 2; // Average with stored score
    } catch (e) {
      score -= 5; // Parse error penalty
    }
  }

  return Math.max(0, Math.min(100, score));
}

function printStatusReport() {
  const timestamp = new Date().toISOString();
  console.log(`🔍 MultiCRM System Status Report - ${timestamp}`);
  console.log('='.repeat(60));

  // Meta integrity
  const metaHash = getFileHash(path.join(__dirname, '..', 'meta', 'meta.md'));
  const constHash = getFileHash(path.join(__dirname, '..', 'constitution.md'));
  console.log(`📜 Meta Version: ${metaHash}`);
  console.log(`🏛️ Constitution Hash: ${constHash}`);

  // Specification ecosystem
  const specCount = countSpecs();
  console.log(`📋 Spec Count: ${specCount} total`);

  // Constitution compliance
  const constCompliance = checkConstitutionCompliance();
  console.log(`⚖️ Constitution Compliance: ${constCompliance}`);

  // Decision ledger status
  const ledger = analyzeDecisionLedger();
  console.log(`📊 Decision Ledger: ${ledger.total} total, ${ledger.recent} recent`);

  if (ledger.overdue > 0) {
    console.log(`🚨 Overdue Reviews: ${ledger.overdue} - Run 'node scripts/check-review-queue.js'`);
  }

  // Quality metrics
  const coverage = checkTestCoverage();
  console.log(`🧪 Test Coverage: ${coverage}`);

  // Tool availability
  const tools = [
    'spec-to-tasks.js',
    'validate-meta-inheritance.js',
    'check-review-queue.js',
    'lessons-export.js'
  ];

  const availableTools = tools.filter(tool =>
    fs.existsSync(path.join(__dirname, tool))
  );
  console.log(`🔧 Meta-Tools Available: ${availableTools.length}/${tools.length}`);

  // Overall health score
  const healthScore = analyzeHealthScore();
  console.log(`💚 System Health Score: ${healthScore}/100`);

  // Health interpretation
  let healthStatus = 'UNKNOWN';
  if (healthScore >= 90) healthStatus = '🏥 EXCELLENT - System fully operational';
  else if (healthScore >= 70) healthStatus = '✅ GOOD - Minor issues only';
  else if (healthScore >= 50) healthStatus = '⚠️ ATTENTION - Multiple concerns';
  else healthStatus = '🚨 CRITICAL - Immediate action required';

  console.log(`📈 Health Status: ${healthStatus}`);

  // Quick recommendations
  console.log('\n💡 Recommendations:');
  if (ledger.overdue > 0) {
    console.log('   • Run periodic review checks');
  }
  if (specCount < 2) {
    console.log('   • Add more specification examples');
  }
  if (constCompliance.includes('MISSING')) {
    console.log('   • Ensure constitution file exists');
  }
  if (availableTools.length < tools.length) {
    console.log('   • Complete meta-tool ecosystem');
  }

  console.log('\n🎯 Ready for deployment? ' + (healthScore >= 70 ? '✅ YES' : '❌ REVIEW ISSUES FIRST'));
}

if (require.main === module) {
  printStatusReport();
}

module.exports = {
  getFileHash,
  countSpecs,
  checkConstitutionCompliance,
  analyzeDecisionLedger,
  analyzeHealthScore
};
