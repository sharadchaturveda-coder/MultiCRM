#!/usr/bin/env node

/**
 * Reflexive Improvement Loop: Review Queue Checker
 *
 * Checks decision ledger for entries past their Revisit By date
 * Posts overdue decisions to review queue for evaluation
 *
 * Usage: node scripts/check-review-queue.js
 * CI Integration: Run weekly/monthly as scheduled job
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, '..', 'decisions', 'ledger.md');
const REVIEW_QUEUE_PATH = path.join(__dirname, '..', 'review-queue.txt');

function parseLedgerEntry(line) {
  // Format: YYYY-MM-DD | Decision Summary | Rationale | Impact Score | Status | Revisit By
  const parts = line.split('|').map(p => p.trim());
  if (parts.length === 6) {
    return {
      date: parts[0],
      summary: parts[1],
      rationale: parts[2],
      impactScore: parts[3],
      status: parts[4],
      revisitBy: parts[5]
    };
  }
  return null;
}

function isOverdue(revisitDate) {
  if (revisitDate === 'N/A' || revisitDate === '2026-01-15 (quarterly)') return false;

  try {
    const reviewDate = new Date(revisitDate.split(' ')[0]); // Remove any suffixes
    const now = new Date();
    return reviewDate < now;
  } catch (e) {
    console.warn(`Invalid date format: ${revisitDate}`);
    return false;
  }
}

function generateReviewContent(overdueEntries) {
  const timestamp = new Date().toISOString();
  let content = `REVIEW QUEUE - ${timestamp}\n`;
  content += '='.repeat(50) + '\n\n';

  content += 'Overdue Architectural Decisions Requiring Review:\n\n';

  overdueEntries.forEach((entry, index) => {
    content += `${index + 1}. [${entry.impactScore} IMPACT] ${entry.summary}\n`;
    content += `   Decision Date: ${entry.date}\n`;
    content += `   Rationale: ${entry.rationale}\n`;
    content += `   Status: ${entry.status}\n`;
    content += `   Was Due: ${entry.revisitBy}\n`;
    content += `   Days Overdue: ${Math.floor((new Date() - new Date(entry.revisitBy)) / (1000*60*60*24))}\n\n`;

    content += '   Review Questions:\n';
    content += '   - Is original rationale still valid?\n';
    content += '   - Have constraints/technology changed?\n';
    content += '   - Should this decision be upheld/modified/reversed?\n';
    content += '   - New revisit date if upheld:\n\n';
  });

  content += 'IMPACT PRIORITY ORDERING:\n';
  const highImpact = overdueEntries.filter(e => e.impactScore === 'HIGH');
  const medImpact = overdueEntries.filter(e => e.impactScore === 'MED');
  const lowImpact = overdueEntries.filter(e => e.impactScore === 'LOW');

  if (highImpact.length) {
    content += '🚨 HIGH IMPACT (Review immediately):\n';
    highImpact.forEach(e => content += `   • ${e.summary}\n`);
  }

  if (medImpact.length) {
    content += '⚠️ MEDIUM IMPACT (Review this sprint):\n';
    medImpact.forEach(e => content += `   • ${e.summary}\n`);
  }

  if (lowImpact.length) {
    content += 'ℹ️ LOW IMPACT (Review when convenient):\n';
    lowImpact.forEach(e => content += `   • ${e.summary}\n`);
  }

  return content;
}

function checkAndGenerateReviewQueue() {
  console.log('🔍 Checking decision ledger for overdue reviews...');

  const ledgerContent = fs.readFileSync(LEDGER_PATH, 'utf8');
  const lines = ledgerContent.split('\n');

  const overdueEntries = [];

  for (const line of lines) {
    if (line.trim() && !line.startsWith('#') && !line.startsWith('---')) {
      const entry = parseLedgerEntry(line);
      if (entry && entry.impactScore !== 'FINAL' && isOverdue(entry.revisitBy)) {
        overdueEntries.push(entry);
      }
    }
  }

  if (overdueEntries.length === 0) {
    console.log('✅ No overdue architectural decisions found.');
    // Clear review queue if it exists
    if (fs.existsSync(REVIEW_QUEUE_PATH)) {
      fs.unlinkSync(REVIEW_QUEUE_PATH);
      console.log('🧹 Cleared empty review queue.');
    }
    return 0;
  }

  console.log(`⚠️ Found ${overdueEntries.length} overdue architectural decisions requiring review.`);
  console.log(`📝 Generating review queue...`);

  const reviewContent = generateReviewContent(overdueEntries);
  fs.writeFileSync(REVIEW_QUEUE_PATH, reviewContent);

  console.log(`✅ Review queue updated: ${path.relative(process.cwd(), REVIEW_QUEUE_PATH)}`);
  console.log('\nPriority breakdown:');

  const highImpact = overdueEntries.filter(e => e.impactScore === 'HIGH');
  const medImpact = overdueEntries.filter(e => e.impactScore === 'MED');
  const lowImpact = overdueEntries.filter(e => e.impactScore === 'LOW');

  if (highImpact.length) console.log(`🚨 HIGH IMPACT: ${highImpact.length} - REVIEW IMMEDIATELY`);
  if (medImpact.length) console.log(`⚠️ MEDIUM IMPACT: ${medImpact.length} - REVIEW THIS SPRINT`);
  if (lowImpact.length) console.log(`ℹ️ LOW IMPACT: ${lowImpact.length} - REVIEW WHEN CONVENIENT`);

  return overdueEntries.length;
}

function showNextReviewDates() {
  console.log('\n📅 Upcoming review schedule:');

  const ledgerContent = fs.readFileSync(LEDGER_PATH, 'utf8');
  const lines = ledgerContent.split('\n');

  const upcomingEntries = [];

  for (const line of lines) {
    if (line.trim() && !line.startsWith('#') && !line.startsWith('---')) {
      const entry = parseLedgerEntry(line);
      if (entry && entry.revisitBy !== 'N/A' && entry.status.includes('FINAL')) {
        try {
          const reviewDate = new Date(entry.revisitBy);
          const now = new Date();
          const daysUntil = Math.ceil((reviewDate - now) / (1000*60*60*24));
          if (daysUntil >= 0) {
            upcomingEntries.push({ ...entry, daysUntil });
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
    }
  }

  // Show next 5 upcoming reviews
  upcomingEntries
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5)
    .forEach(entry => {
      const urgency = entry.daysUntil <= 7 ? '🚨' :
                     entry.daysUntil <= 30 ? '⚠️' : 'ℹ️';
      console.log(`${urgency} ${entry.date} → ${entry.revisitBy} (${entry.daysUntil} days): ${entry.summary}`);
    });
}

if (require.main === module) {
  const overdueCount = checkAndGenerateReviewQueue();
  showNextReviewDates();

  process.exit(overdueCount > 0 ? 1 : 0);
}

module.exports = { checkAndGenerateReviewQueue, parseLedgerEntry, isOverdue };
