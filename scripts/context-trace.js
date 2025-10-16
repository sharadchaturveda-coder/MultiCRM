const dependencyTree = require('dependency-tree');
const path = require('path');

// Generate live dependency graph for the entire codebase
const tree = dependencyTree({
  filename: 'src/backend/src/index.ts',
  directory: 'src',
  filter: path => !path.includes('node_modules')
});

console.log(JSON.stringify(tree, null, 2));
