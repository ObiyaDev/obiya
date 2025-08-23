export const ignoredPaths = [
  // Motia
  '.motia/**',
  '**/.motia/**',

  // Dependencies
  'node_modules/**',
  '**/node_modules/**',
  'python_modules/**',
  '**/python_modules/**',

  // Build outputs
  'dist/**',
  '**/dist/**',
  'build/**',
  '**/build/**',
  '.next/**',
  '**/.next/**',

  // Cache directories
  '.cache/**',
  '**/.cache/**',
  '.turbo/**',
  '**/.turbo/**',
  '.nuxt/**',
  '**/.nuxt/**',

  // Version control
  '.git/**',
  '**/.git/**',
  '.svn/**',
  '**/.svn/**',

  // IDE/Editor files
  '.vscode/**',
  '**/.vscode/**',
  '.idea/**',
  '**/.idea/**',
  '*.swp',
  '*.swo',
  '*~',

  // OS files
  '.DS_Store',
  '**/.DS_Store',
  'Thumbs.db',
  '**/Thumbs.db',

  // Logs
  '*.log',
  '**/*.log',
  'logs/**',
  '**/logs/**',

  // Temporary files
  'tmp/**',
  '**/tmp/**',
  'temp/**',
  '**/temp/**',

  // Package manager files
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',

  // Coverage reports
  'coverage/**',
  '**/coverage/**',
  '.nyc_output/**',
  '**/.nyc_output/**',
]

// NOTE: chokidar accepts regexp which seems to work better than the paths defined above
export const devWatchIgnoredPaths = [
  /\.motia/,
  /node_modules/,
  /python_modules/,
  /dist/,
  /build/,
  /\.next/,
  /\.cache/,
  /\.turbo/,
  /\.nuxt/,
  /\.git/,
  /\.svn/,
  /\.vscode/,
  /\.idea/,
  /\.DS_Store/,
  /Thumbs.db/,
  /\.log/,
  /logs/,
  /tmp/,
  /temp/,
  /pnpm-lock.yaml/,
  /yarn.lock/,
  /package-lock.json/,
  /coverage/,
  /\.nyc_output/,
]
