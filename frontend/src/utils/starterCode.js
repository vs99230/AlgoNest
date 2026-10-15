/** Builds starter code for every supported language from one signature. */
const TYPES = {
  int: { python: 'int', js: 'number', cppParam: 'int', cppReturn: 'int', java: 'int' },
  double: { python: 'float', js: 'number', cppParam: 'double', cppReturn: 'double', java: 'double' },
  boolean: { python: 'bool', js: 'boolean', cppParam: 'bool', cppReturn: 'bool', java: 'boolean' },
  string: { python: 'str', js: 'string', cppParam: 'string&', cppReturn: 'string', java: 'String' },
  'int[]': {
    python: 'List[int]',
    js: 'number[]',
    cppParam: 'vector<int>&',
    cppReturn: 'vector<int>',
    java: 'int[]',
  },
  'int[][]': {
    python: 'List[List[int]]',
    js: 'number[][]',
    cppParam: 'vector<vector<int>>&',
    cppReturn: 'vector<vector<int>>',
    java: 'int[][]',
  },
  'char[][]': {
    python: 'List[List[str]]',
    js: 'string[][]',
    cppParam: 'vector<vector<char>>&',
    cppReturn: 'vector<vector<char>>',
    java: 'char[][]',
  },
};

const PLACEHOLDER = 'Write your solution here';

export function buildStarterCode({ name, params, returns }) {
  const ret = TYPES[returns];

  const python = [
    'from typing import List',
    '',
    'class Solution:',
    `    def ${name}(self, ${params.map(([n, t]) => `${n}: ${TYPES[t].python}`).join(', ')}) -> ${ret.python}:`,
    `        # ${PLACEHOLDER}`,
    '        pass',
    '',
  ].join('\n');

  const javascript = [
    '/**',
    ...params.map(([n, t]) => ` * @param {${TYPES[t].js}} ${n}`),
    ` * @return {${ret.js}}`,
    ' */',
    `function ${name}(${params.map(([n]) => n).join(', ')}) {`,
    `  // ${PLACEHOLDER}`,
    '}',
    '',
  ].join('\n');

  const cpp = [
    '#include <bits/stdc++.h>',
    'using namespace std;',
    '',
    'class Solution {',
    'public:',
    `    ${ret.cppReturn} ${name}(${params.map(([n, t]) => `${TYPES[t].cppParam} ${n}`).join(', ')}) {`,
    `        // ${PLACEHOLDER}`,
    '    }',
    '};',
    '',
  ].join('\n');

  const java = [
    'class Solution {',
    `    public ${ret.java} ${name}(${params.map(([n, t]) => `${TYPES[t].java} ${n}`).join(', ')}) {`,
    `        // ${PLACEHOLDER}`,
    '    }',
    '}',
    '',
  ].join('\n');

  return { python, javascript, cpp, java };
}
