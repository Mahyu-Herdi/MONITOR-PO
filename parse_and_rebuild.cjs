const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Insert opsColors near colors
code = code.replace(/const colors = \['#003366'.*?\];/, `const colors = ['#003366', '#FFD700', '#00A859', '#E31837', '#6C7A89', '#F2A900'];
  const opsColors = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#06b6d4'];`);

// First let's extract the 4 panels.
// They are surrounded by `{/* LEFT PANEL: ... */}` etc.

let m1 = code.match(/\{\/\* LEFT PANEL: CHART & METRICS \*\/\}[\s\S]*?(?=\{\/\*|Belum ada data distribusi\.<\/div>\n\s*\)\}\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>)/);
let grafikBahan = m1 ? m1[0] : "";
// We need to fix the extraction because previously I messed up the order and div closing tags
let m2 = code.match(/\{\/\* RIGHT PANEL: RECAPITULATION TABLE\/CARDS \*\/\}[\s\S]*?(?=\{\/\* LEFT PANEL: CHART & METRICS \*\/})/);
let tabelBahan = m2 ? m2[0] : "";

let m3 = code.match(/\{\/\* OPS RIGHT PANEL \*\/\}[\s\S]*?(?=\s*\{\/\* OPS LEFT PANEL \*\/})/);
let tabelOps = m3 ? m3[0] : "";

let m4 = code.match(/\{\/\* OPS LEFT PANEL \*\/\}[\s\S]*?(?=\s*<\/div>\n\s*<\/div>\n\s*\{selectedDapur && \()/);
let grafikOps = m4 ? m4[0] : "";

// Wait, the way they are positioned now:
// RIGHT PANEL
// LEFT PANEL (Bahan)
// OPS RIGHT PANEL
// OPS LEFT PANEL

if (tabelBahan && grafikBahan && tabelOps && grafikOps) {
    console.log("All parts found!");
    // Change ops chart color array to opsColors
    grafikOps = grafikOps.replace(/colors\[index \% colors\.length\]/g, "opsColors[index % opsColors.length]");
    tabelOps = tabelOps.replace(/colors\[i \% colors\.length\]/g, "opsColors[i % opsColors.length]");
    
    // We want the new structure:
    let newStructure = `
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-6">
        ${grafikBahan}
        ${grafikOps}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-6">
        ${tabelBahan}
        ${tabelOps}
      </div>
    `;
    
    // To do this safely, we will replace the whole section from `<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">`
    // down to `{selectedDapur && (`
    let startMarker = '<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">';
    let endMarker = '{selectedDapur && (';
    
    let startIndex = code.indexOf(startMarker);
    let endIndex = code.indexOf(endMarker);
    
    if (startIndex !== -1 && endIndex !== -1) {
        let before = code.substring(0, startIndex);
        let after = code.substring(endIndex);
        
        let newCode = before + newStructure + '\n      ' + after;
        
        // Remove closing tags from the extracted strings just in case they have extra or missing </div>
        // Actually it's better to just write the new structure properly. Let's see what the panels look like first.
        fs.writeFileSync('extracted.json', JSON.stringify({
            tabelBahan, grafikBahan, tabelOps, grafikOps
        }));
    }
} else {
    console.log("Failed to find parts");
    console.log("tabelBahan:", !!tabelBahan);
    console.log("grafikBahan:", !!grafikBahan);
    console.log("tabelOps:", !!tabelOps);
    console.log("grafikOps:", !!grafikOps);
}

