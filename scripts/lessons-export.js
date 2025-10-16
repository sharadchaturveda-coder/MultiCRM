#!/usr/bin/env node

/**
 * Post-Build Reflection Export: Lessons Learned Capture
 *
 * Extracts lessons from successful domain specializations
 * Builds corpus of domain-specific heuristics over time
 *
 * Usage: node scripts/lessons-export.js [domain-name]
 * Example: node scripts/lessons-export.js school
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const LESSONS_DIR = path.join(__dirname, '..', 'lessons');

function createLessonsDirIfNeeded() {
  if (!fs.existsSync(LESSONS_DIR)) {
    fs.mkdirSync(LESSONS_DIR, { recursive: true });
  }
}

async function collectLessonData(domainName) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise(resolve => rl.question(query, resolve));

  console.log(`🎯 Lessons Export for ${domainName} Domain`);
  console.log('=' .repeat(50));

  const lessonData = {
    domain: domainName,
    exportDate: new Date().toISOString(),
    lessons: {}
  };

  // Domain-specific patterns
  const patterns = await question('📝 What unique data patterns emerged (e.g., Student has enrollment_date, GPA; Patient needs different contact types)? ');
  if (patterns.trim()) lessonData.lessons.dataPatterns = patterns;

  // Business logic insights
  const logic = await question('🧠 What business logic was more complex than expected? ');
  if (logic.trim()) lessonData.lessons.businessLogic = logic;

  // Integration challenges
  const integrations = await question('🔗 What external integrations were needed (attendance systems, medical devices, payment processors)? ');
  if (integrations.trim()) lessonData.lessons.integrations = integrations;

  // UI patterns discovered
  const uiPatterns = await question('🎨 What domain-specific UI patterns emerged (timetables, medical charts, reservation grids)? ');
  if (uiPatterns.trim()) lessonData.lessons.uiPatterns = uiPatterns;

  // Performance considerations
  const performance = await question('⚡ What performance considerations unique to this domain (bulk operations, real-time updates)? ');
  if (performance.trim()) lessonData.lessons.performance = performance;

  // Security/compliance requirements
  const compliance = await question('🔒 What compliance requirements emerged (FERPA, HIPAA, GDPR)? ');
  if (compliance.trim()) lessonData.lessons.compliance = compliance;

  // Development velocity insights
  const velocity = await question('📊 How did development velocity compare to estimated (faster/slower than expected, why)? ');
  if (velocity.trim()) lessonData.lessons.velocity = velocity;

  // Template gaps identified
  const gaps = await question('🔍 What gaps did you find in the base template that required workarounds? ');
  if (gaps.trim()) lessonData.lessons.templateGaps = gaps;

  // Success metrics achieved
  const metrics = await question('🎯 What success metrics were met (user count, response times, uptime)? ');
  if (metrics.trim()) lessonData.lessons.successMetrics = metrics;

  rl.close();
  return lessonData;
}

function formatMarkdownLesson(lessonData) {
  let content = `# ${lessonData.domain.toUpperCase()} Domain Lessons Learned\n\n`;
  content += `**Export Date:** ${new Date(lessonData.exportDate).toDateString()}\n\n`;
  content += `**Specialization Summary:** Template cloned and adapted for ${lessonData.domain} domain\n\n`;
  content += '---\n\n';

  if (lessonData.lessons.dataPatterns) {
    content += `## 📊 Data Patterns\n${lessonData.lessons.dataPatterns}\n\n`;
  }

  if (lessonData.lessons.businessLogic) {
    content += `## 🧠 Business Logic Complexity\n${lessonData.lessons.businessLogic}\n\n`;
  }

  if (lessonData.lessons.integrations) {
    content += `## 🔗 Required Integrations\n${lessonData.lessons.integrations}\n\n`;
  }

  if (lessonData.lessons.uiPatterns) {
    content += `## 🎨 Domain-Specific UI Patterns\n${lessonData.lessons.uiPatterns}\n\n`;
  }

  if (lessonData.lessons.performance) {
    content += `## ⚡ Performance Considerations\n${lessonData.lessons.performance}\n\n`;
  }

  if (lessonData.lessons.compliance) {
    content += `## 🔒 Compliance Requirements\n${lessonData.lessons.compliance}\n\n`;
  }

  if (lessonData.lessons.velocity) {
    content += `## 📈 Development Velocity\n${lessonData.lessons.velocity}\n\n`;
  }

  if (lessonData.lessons.templateGaps) {
    content += `## 🔍 Template Gaps Identified\n${lessonData.lessons.templateGaps}\n\n`;
    content += '### Template Improvement Recommendations\n';
    content += '- [ ] Address identified gaps in base template\n';
    content += '- [ ] Consider adding domain-specific starter templates\n';
    content += '- [ ] Update documentation with domain considerations\n\n';
  }

  if (lessonData.lessons.successMetrics) {
    content += `## 🎯 Success Metrics Achieved\n${lessonData.lessons.successMetrics}\n\n`;
  }

  // Add domain-specific recommendations for future specializations
  content += '---\n\n';
  content += `## 💡 Recommendations for Future ${lessonData.domain.charAt(0).toUpperCase() + lessonData.domain.slice(1)} CRMs\n\n`;
  content += `- Start with these data patterns as foundation\n`;
  content += `- Plan for identified business logic complexity\n`;
  content += `- Budget extra time for compliance requirements\n`;
  content += `- Consider pre-built integration templates\n\n`;

  content += `## 🔄 Template Version Compatibility\n\n`;
  content += `- Exported from: MultiCRM base template\n`;
  content += `- Meta version: ${lessonData.metaHash || 'current'}\n`;
  content += `- Applicable to: Similar ${lessonData.domain}-like domains\n\n`;

  return content;
}

async function main() {
  const domainName = process.argv[2];

  if (!domainName) {
    console.error('❌ Usage: node scripts/lessons-export.js <domain-name>');
    console.error('Example: node scripts/lessons-export.js school');
    process.exit(1);
  }

  createLessonsDirIfNeeded();

  console.log(`📚 Starting lessons export for ${domainName} domain...\n`);

  try {
    const lessonData = await collectLessonData(domainName);
    const markdownContent = formatMarkdownLesson(lessonData);

    const outputPath = path.join(LESSONS_DIR, `${domainName}.md`);
    fs.writeFileSync(outputPath, markdownContent);

    console.log(`\n✅ Lessons exported to: ${outputPath}`);
    console.log(`📖 This will help improve future ${domainName} CRM specializations.`);
    console.log(`🔬 Check /lessons/${domainName}.md after successful domain deployment.`);

    // Update metrics if they exist
    const metricsPath = path.join(__dirname, '..', 'metrics', 'index.json');
    if (fs.existsSync(metricsPath)) {
      const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
      if (!metrics.domains) metrics.domains = {};
      metrics.domains[domainName] = {
        lessonsCaptured: new Date().toISOString(),
        specializationType: 'completed'
      };
      fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
      console.log('📊 Metrics updated with lesson capture.');
    }

  } catch (error) {
    console.error('❌ Error during lessons export:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { collectLessonData, formatMarkdownLesson, createLessonsDirIfNeeded };
