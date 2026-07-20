const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Insert opsColors if not exist
if (!code.includes('opsColors')) {
    code = code.replace(/const colors = \['#003366'.*?\];/, `const colors = ['#003366', '#FFD700', '#00A859', '#E31837', '#6C7A89', '#F2A900'];
  const opsColors = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#06b6d4'];`);
}

let startMarker = '<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">';
let endMarker = '{selectedDapur && (';

let startIndex = code.indexOf(startMarker);
let endIndex = code.indexOf(endMarker);

const extracted = require('./extracted.json');

// Clean up grafikBahan
let grafikBahan = extracted.grafikBahan;
grafikBahan = grafikBahan.split(/<div className="mt-4 text-xs font-bold text-muted text-center sm:text-left">/)[0]; // strip the extra junk
grafikBahan = grafikBahan.replace(/xl:col-span-5/g, "xl:col-span-12");

// Clean up grafikOps
let grafikOps = extracted.grafikOps;
grafikOps = grafikOps + "\n        </div>"; // it was missing one closing div
grafikOps = grafikOps.replace(/xl:col-span-5/g, "xl:col-span-12");

// Clean up tabelBahan
let tabelBahan = extracted.tabelBahan;
tabelBahan = tabelBahan.replace(/xl:col-span-7/g, "xl:col-span-12");
// tabelBahan ends with `Belum ada data distribusi.</div>\n            )}\n          </div>`
// it might need an extra closing div, wait it's a neo-card so it has no outer divs.
// actually let's check neo-card. `<div className="xl:col-span-12 neo-card ...`
// so we just need </div>
tabelBahan += "\n          <div className=\"mt-4 text-xs font-bold text-muted text-center sm:text-left\">\n            *Klik kartu atau baris dapur untuk melihat rincian dan mengunduh dokumen.\n          </div>\n        </div>";

// Clean up tabelOps
let tabelOps = extracted.tabelOps;
tabelOps = tabelOps.replace(/xl:col-span-7/g, "xl:col-span-12");
// It might be missing closing div?
tabelOps += "\n        </div>";

let newStructure = `
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start mt-6">
        ${grafikBahan}
        ${grafikOps}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start mt-6">
        ${tabelBahan}
        ${tabelOps}
      </div>
      `;

let newCode = code.substring(0, startIndex) + newStructure + '\n      ' + code.substring(endIndex);

fs.writeFileSync('src/components/AdminDashboard.tsx', newCode);
console.log("Success rebuild");
