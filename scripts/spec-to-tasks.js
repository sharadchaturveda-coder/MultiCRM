#!/usr/bin/env node

/**
 * Spec-to-Tasks Translation Script
 *
 * Reads a plan.md file and generates a tasks.md skeleton with:
 * - Executable task breakdown
 * - Parallel task markers [P]
 * - Acceptance criteria placeholders
 * - Test stubs
 *
 * Usage: node scripts/spec-to-tasks.js specs/001-feature-name/plan.md
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_HEADER = `# Implementation Tasks

## 📋 Task Breakdown

Generated from plan.md on ${new Date().toISOString().split('T')[0]}

### Task Status Legend
- ✅ **COMPLETED**: Task implemented and tested
- 🏗️ **IN PROGRESS**: Currently being worked on
- 📋 **TODO**: Not yet started
- [P]: Tasks that can be worked on in parallel

---

`;

const TEMPLATE_FOOTER = `

## 📊 Task Completion Checklist

### Quality Gates
- [ ] All tasks completed with ✅
- [ ] TypeScript strict mode passes
- [ ] Test coverage >90%
- [ ] Documentation updated
- [ ] Manual acceptance testing passed

### Deployment Readiness
- [ ] CI/CD pipeline passes
- [ ] Migration scripts ready
- [ ] Rollback plan documented
- [ ] Feature flags configured
`;

function parsePlanMd(planPath) {
  const content = fs.readFileSync(planPath, 'utf8');

  // Extract sections that typically contain implementable items
  const tasks = [];

  // Look for API endpoints
  const endpointRegex = /- \*\*([^*]+)\*\*.*?:\s*\|\s*([^\|]+)\s*\|\s*([^\|]*)/g;
  let match;
  while ((match = endpointRegex.exec(content)) !== null) {
    tasks.push({
      type: 'API Endpoint',
      title: match[1].trim(),
      method: match[2].trim(),
      description: match[3].trim(),
      acceptance: 'Returns correct data structure, handles errors, validates input'
    });
  }

  // Look for database schemas
  const schemaRegex = /^### (.+Schema)/gm;
  while ((match = schemaRegex.exec(content)) !== null) {
    tasks.push({
      type: 'Database Schema',
      title: match[1],
      description: 'Create and validate database schema',
      acceptance: 'Schema creates successfully, migrations run, data integrity maintained'
    });
  }

  // Look for frontend components
  const componentRegex = /- (.+Component)/g;
  while ((match = componentRegex.exec(content)) !== null) {
    if (!match[1].includes('API') && !match[1].includes('Schema')) {
      tasks.push({
        type: 'Frontend Component',
        title: match[1],
        description: 'Implement reactive component with proper state management',
        acceptance: 'Component renders correctly, handles user interactions, integrates with API'
      });
    }
  }

  // Look for business logic modules
  const logicRegex = /- (.+(?:Service|Manager|Handler|Processor))/g;
  while ((match = logicRegex.exec(content)) !== null) {
    tasks.push({
      type: 'Business Logic',
      title: match[1],
      description: 'Implement core business logic and validations',
      acceptance: 'Business rules enforced, edge cases handled, performance within bounds'
    });
  }

  // Add testing tasks for each major component
  const testTasks = tasks.map(task => ({
    type: 'Testing',
    title: `Tests for ${task.title}`,
    description: 'Write comprehensive tests following test-first approach',
    acceptance: 'Unit tests pass, integration tests pass, coverage requirements met',
    parallel: true
  }));

  return { tasks, testTasks };
}

function generateTasksMd(planPath, tasks, testTasks) {
  const featureName = path.basename(path.dirname(planPath));
  const outputDir = path.dirname(planPath);
  const outputPath = path.join(outputDir, 'tasks.md');

  let content = TEMPLATE_HEADER;

  content += `## 🏗️ Feature: ${featureName}\n\n`;

  // Main implementation tasks
  content += `### Implementation Tasks\n\n`;
  tasks.forEach((task, index) => {
    const status = index === 0 ? '🏗️' : '📋';
    const parallel = task.parallel ? ' [P]' : '';

    content += `#### ${status} Task ${index + 1}: ${task.title}${parallel}\n`;
    content += `**Type:** ${task.type}\n`;
    content += `**Description:** ${task.description}\n\n`;
    content += `**Acceptance Criteria:**\n`;
    content += `- [ ] ${task.acceptance}\n`;
    content += `- [ ] Tested and documented\n`;
    content += `- [ ] Code review passed\n\n`;
  });

  // Testing tasks (marked parallel)
  content += `### 🧪 Testing Tasks [P]\n\n`;
  testTasks.forEach((task, index) => {
    const status = '📋';
    content += `#### ${status} Test Task ${index + 1}: ${task.title} [P]\n`;
    content += `**Description:** ${task.description}\n\n`;
    content += `**Test Structure:**\n`;
    content += `\`\`\`typescript\n`;
    content += `describe('${task.title}', () => {\n`;
    content += `  it('should meet acceptance criteria', () => {\n`;
    content += `    // TODO: Implement test\n`;
    content += `  });\n`;
    content += `});\n`;
    content += `\`\`\`\n\n`;
    content += `**Acceptance Criteria:**\n`;
    content += `- [ ] ${task.acceptance}\n`;
    content += `- [ ] Red-Green-Refactor cycle completed\n\n`;
  });

  // Add general tasks that always exist
  content += `### 🔧 Infrastructure Tasks\n\n`;
  content += `#### 📋 Task INF-1: Environment Configuration\n`;
  content += `**Description:** Set up environment variables and deployment configuration\n\n`;
  content += `**Acceptance Criteria:**\n`;
  content += `- [ ] Environment variables documented\n`;
  content += `- [ ] Deployment configuration updated\n`;
  content += `- [ ] Secrets management configured\n\n`;

  content += `#### 📋 Task INF-2: Documentation Updates\n`;
  content += `**Description:** Update API docs, README, and guides\n\n`;
  content += `**Acceptance Criteria:**\n`;
  content += `- [ ] API documentation synchronized\n`;
  content += `- [ ] README updated with new features\n`;
  content += `- [ ] Getting started guide current\n\n`;

  content += `#### 📋 Task INF-3: Migration Scripts\n`;
  content += `**Description:** Create database migration scripts if schema changes\n\n`;
  content += `**Acceptance Criteria:**\n`;
  content += `- [ ] Migration scripts tested locally\n`;
  content += `- [ ] Rollback scripts prepared\n`;
  content += `- [ ] Zero-downtime migration plan\n\n`;

  content += TEMPLATE_FOOTER;

  fs.writeFileSync(outputPath, content);
  console.log(`✅ Generated tasks.md: ${outputPath}`);

  return outputPath;
}

function main() {
  const planPath = process.argv[2];

  if (!planPath) {
    console.error('Usage: node spec-to-tasks.js <path-to-plan.md>');
    process.exit(1);
  }

  if (!fs.existsSync(planPath)) {
    console.error(`Plan file not found: ${planPath}`);
    process.exit(1);
  }

  try {
    console.log(`🔄 Parsing plan.md: ${planPath}`);
    const { tasks, testTasks } = parsePlanMd(planPath);

    console.log(`📊 Found ${tasks.length} implementation tasks`);
    console.log(`🧪 Found ${testTasks.length} testing tasks`);

    const outputPath = generateTasksMd(planPath, tasks, testTasks);
    console.log(`🎯 Tasks successfully generated!`);

    // Print task summary
    console.log('\n📋 Task Summary:');
    tasks.forEach((task, i) => console.log(`  ${i + 1}. ${task.title} (${task.type})`));
    testTasks.forEach((task, i) => console.log(`  T${i + 1}. ${task.title}`));

  } catch (error) {
    console.error('❌ Error processing plan:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parsePlanMd, generateTasksMd };
