const fs = require('fs');
fs.writeFileSync('pnpm-workspace.yaml', 'packages:\n  - "apps/*"\npnpmApproveBuilds: true\n');
