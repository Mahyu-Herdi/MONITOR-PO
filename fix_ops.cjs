const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const gridStart = '<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mt-6">';

let pGrid = code.indexOf(gridStart);
if (pGrid === -1) {
    console.error("Grid start not found");
    process.exit(1);
}

let before = code.substring(0, pGrid);

let opsEnd = '{selectedDapur && (';
let pEnd = code.indexOf(opsEnd);
if (pEnd === -1) {
    console.error("End not found");
    process.exit(1);
}

let rest = code.substring(pEnd);

// Now we need to extract the raw text for OPS LEFT PANEL and OPS RIGHT PANEL
// since they are currently messed up in the file.

let pLeft = code.indexOf('{/* OPS LEFT PANEL */}');
let pRight = code.indexOf('{/* OPS RIGHT PANEL */}');

// The file currently has Right Panel then a bunch of closing tags, then Left Panel.
// This is invalid JSX.

// Let's just find the original strings from our log!
// Wait, I can just use a regex to extract the inner content of the panels.

// Extract Left Panel
let leftMatch = code.match(/\{\/\* OPS LEFT PANEL \*\/\}[\s\S]*?(?=\s*\{\/\*|\s*\{selectedDapur)/);
let leftPanel = leftMatch ? leftMatch[0] : '';

// Extract Right Panel
let rightMatch = code.match(/\{\/\* OPS RIGHT PANEL \*\/\}[\s\S]*?(?=\s*\{\/\*|\s*\{selectedDapur)/);
let rightPanel = rightMatch ? rightMatch[0] : '';

// But right panel might contain the extra closing tags I accidentally included!
// Let's clean up rightPanel by removing any trailing closing divs that belong to the grid or main container.
// Right panel should end right after `Belum ada data operasional.</div>\n            )}\n          </div>\n        </div>`

let cleanRightMatch = rightPanel.match(/\{\/\* OPS RIGHT PANEL \*\/\}[\s\S]*?Belum ada data operasional\.<\/div>\n            \)\}\n          <\/div>\n        <\/div>/);
if (cleanRightMatch) {
    rightPanel = cleanRightMatch[0];
}

// Left panel should end right after `</PieChart>\n              </ResponsiveContainer>\n            </div>\n          </div>\n        </div>`
let cleanLeftMatch = leftPanel.match(/\{\/\* OPS LEFT PANEL \*\/\}[\s\S]*?<\/PieChart>\n              <\/ResponsiveContainer>\n            <\/div>\n          <\/div>\n        <\/div>/);
if (cleanLeftMatch) {
    leftPanel = cleanLeftMatch[0];
}

let newSection = `${gridStart}\n        ${rightPanel}\n        ${leftPanel}\n      </div>\n      `;

// We also need to make sure the main container is properly closed before {selectedDapur && (
// The structure should be:
// <div> (root)
//   <div> (main content)
//     ...
//     <div className="grid ..."> ... </div> (main section)
//     <div className="grid ... mt-6"> ... </div> (ops section)
//   </div>
// </div>
// {selectedDapur && ...}

let newCode = before + newSection + rest;

fs.writeFileSync('src/components/AdminDashboard.tsx', newCode);
console.log("Fixed!");

