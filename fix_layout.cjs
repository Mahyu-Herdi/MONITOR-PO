const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// 1. Add opsColors near colors
const colorsMatch = code.match(/const colors = \['#003366', '#FFD700', '#00A859', '#E31837', '#6C7A89', '#F2A900'\];/);
if (colorsMatch) {
    code = code.replace(colorsMatch[0], `const colors = ['#003366', '#FFD700', '#00A859', '#E31837', '#6C7A89', '#F2A900'];\n  const opsColors = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#06b6d4'];`);
}

// 2. Change colors for opsChartData
code = code.replace(/fill=\{colors\[index \% colors\.length\]\} \/>/g, (match, offset) => {
    // If it's inside ops chart
    // We can just find if it's mapped over opsChartData
    return match; // We will do this via Regex in step 3
});

// Actually, let's extract the 4 panels and rebuild the grid.
let pTabelBahanBaku = code.indexOf('{/* RIGHT PANEL: RECAPITULATION TABLE/CARDS */}');
let pGrafikBahanBaku = code.indexOf('{/* LEFT PANEL: CHART & METRICS */}');
let pTabelOps = code.indexOf('{/* OPS RIGHT PANEL */}');
let pGrafikOps = code.indexOf('{/* OPS LEFT PANEL */}');

// The layout right now is a bit of a mess because of the previous sed commands. 
// Let's extract the panels using a better approach.

function extractPanel(startMarker, endRegex) {
    let startIdx = code.indexOf(startMarker);
    if (startIdx === -1) return null;
    let textAfter = code.substring(startIdx);
    let match = textAfter.match(endRegex);
    if (match) {
        let content = textAfter.substring(0, match.index + match[0].length);
        // Replace it in the original code with a placeholder to prevent matching it again
        code = code.replace(content, `<!-- PLACEHOLDER_${startMarker.replace(/[^A-Z]/g, '')} -->`);
        return content;
    }
    return null;
}

// Extract panels
let tabelBahanBaku = extractPanel('{/* RIGHT PANEL: RECAPITULATION TABLE/CARDS */}', /<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n/);
if (!tabelBahanBaku) {
    // Try a different end match
    tabelBahanBaku = extractPanel('{/* RIGHT PANEL: RECAPITULATION TABLE/CARDS */}', /Belum ada data distribusi\.<\/div>\n\s*\)\}\n\s*<\/div>\n\s*<\/div>/);
}

let grafikBahanBaku = extractPanel('{/* LEFT PANEL: CHART & METRICS */}', /Belum ada data distribusi\.<\/div>\n\s*\)\}\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>/);
if(!grafikBahanBaku) {
   grafikBahanBaku = extractPanel('{/* LEFT PANEL: CHART & METRICS */}', /Belum ada data distribusi\.<\/div>\n\s*\)\}\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>/);
}

// Let's just do a manual rebuild of the return statement from Kalkulator Bagi Hasil down to Modal.
