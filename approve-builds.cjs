const fs = require('fs');
const content = fs.readFileSync('pnpm-workspace.yaml', 'utf8');
const packageJson = require('./package.json');
packageJson.pnpm = packageJson.pnpm || {};
packageJson.pnpm.onlyBuiltDependencies = [
  "@firebase/util", "@prisma/client", "@prisma/engines", "core-js", "esbuild", "prisma", "protobufjs", "unrs-resolver"
];
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
