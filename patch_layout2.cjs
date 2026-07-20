const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// 1. Rename the title
code = code.replace("GRAFIK MARGIN UTAMA PER DAPUR", "GRAFIK MARGIN BAHAN BAKU");

// 2. Swap OPS Left Panel and OPS Right Panel
const opsLeftStart = '{/* OPS LEFT PANEL */}';
const opsRightStart = '{/* OPS RIGHT PANEL */}';
const opsEnd = '      {selectedDapur && (';

let p1 = code.indexOf(opsLeftStart);
let p2 = code.indexOf(opsRightStart);
let p3 = code.indexOf(opsEnd);

if (p1 !== -1 && p2 !== -1 && p3 !== -1) {
    let before = code.substring(0, p1);
    let leftPanel = code.substring(p1, p2);
    // The right panel extends until the closing divs before {selectedDapur && (
    // We need to carefully extract it.
    let rightPanelAndEnd = code.substring(p2, p3);
    
    // The right panel ends with:
    //       </div>
    //     </div>
    //   </div>
    // </div>
    // </div>
    // </div>
    // Let's just find the last </div> before p3
    let lastDivIdx = rightPanelAndEnd.lastIndexOf('</div>');
    let rightPanelEndIdx = lastDivIdx + 6; // length of </div>
    // actually, let's just do a manual swap by finding the closing tags of the grid.
    
    // The grid is:
    // <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mt-6">
    //   {/* OPS LEFT PANEL */} ...
    //   {/* OPS RIGHT PANEL */} ...
    // </div>
    
    let left = leftPanel;
    let rightMatch = rightPanelAndEnd.match(/\{\/\* OPS RIGHT PANEL \*\/\}[\s\S]*?(?=\n      <\/div>\n          <\/div>\n        <\/div>\n      <\/div>\n)/);
    
    if (rightMatch) {
        let right = rightMatch[0];
        let rest = rightPanelAndEnd.substring(rightMatch[0].length);
        
        let newCode = before + right + "\n        " + left + rest;
        fs.writeFileSync('src/components/AdminDashboard.tsx', newCode);
        console.log("Successfully swapped OPS panels");
    } else {
        // Let's try an easier approach: Split by tokens
        let rightPart = rightPanelAndEnd.split('\n      </div>\n          </div>\n        </div>\n      </div>\n')[0];
        let rest = rightPanelAndEnd.substring(rightPart.length);
        let newCode = before + rightPart + "\n        " + left + rest;
        fs.writeFileSync('src/components/AdminDashboard.tsx', newCode);
        console.log("Successfully swapped OPS panels (fallback)");
    }
} else {
    console.log("Could not find OPS panels.");
}

