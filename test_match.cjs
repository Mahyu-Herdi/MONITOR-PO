const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
const leftPanelStart = '{/* LEFT PANEL: CHART & METRICS */}';
const rightPanelStart = '{/* RIGHT PANEL: RECAPITULATION TABLE/CARDS */}';
const opsLeftPanelStart = '{/* OPS LEFT PANEL */}';
const opsRightPanelStart = '{/* OPS RIGHT PANEL */}';

const leftIdx = code.indexOf(leftPanelStart);
const rightIdx = code.indexOf(rightPanelStart);
const opsLeftIdx = code.indexOf(opsLeftPanelStart);
const opsRightIdx = code.indexOf(opsRightPanelStart);

console.log(leftIdx, rightIdx, opsLeftIdx, opsRightIdx);
