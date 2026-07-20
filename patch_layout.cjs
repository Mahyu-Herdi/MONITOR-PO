const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// The main section is from `<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">`
// down to `*Klik kartu atau baris dapur untuk melihat rincian dan mengunduh dokumen.`
// Let's use a regex to capture it.
const regexMain = /<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">([\s\S]*?)<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mt-6">/g;

let matches = [...code.matchAll(regexMain)];
if (matches.length > 0) {
    let mainContent = matches[0][1];
    
    // Split into left and right panels
    const leftPanelMatch = mainContent.match(/\{\/\* LEFT PANEL: CHART & METRICS \*\/\}[\s\S]*?(?=\{\/\* RIGHT PANEL: RECAPITULATION TABLE\/CARDS \*\/})/);
    const rightPanelMatch = mainContent.match(/\{\/\* RIGHT PANEL: RECAPITULATION TABLE\/CARDS \*\/\}[\s\S]*?(?=<div className="mt-4 text-xs font-bold text-muted text-center sm:text-left">)/);
    const footerMatch = mainContent.match(/<div className="mt-4 text-xs font-bold text-muted text-center sm:text-left">[\s\S]*?(?=$)/);
    
    if (leftPanelMatch && rightPanelMatch && footerMatch) {
        let leftPanel = leftPanelMatch[0];
        let rightPanel = rightPanelMatch[0];
        let footer = footerMatch[0];
        
        // Rename title
        leftPanel = leftPanel.replace("GRAFIK MARGIN UTAMA PER DAPUR", "GRAFIK MARGIN BAHAN BAKU");
        
        // Fix missing closing div in footer!
        // footer is something like:
        // <div className="mt-4 text-xs font-bold text-muted text-center sm:text-left">
        //   *Klik kartu atau baris dapur untuk melihat rincian dan mengunduh dokumen.
        
        let newFooter = `<div className="mt-4 text-xs font-bold text-muted text-center sm:text-left">
            *Klik kartu atau baris dapur untuk melihat rincian dan mengunduh dokumen.
          </div>
        </div>
      </div>\n      `;
        
        let newMainContent = rightPanel + "\n        " + leftPanel + "\n        " + newFooter;
        
        code = code.replace(matches[0][0], `<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        ` + newMainContent + `<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mt-6">`);
    } else {
        console.log("Failed to match panels in main");
    }
} else {
    console.log("Failed to match main section");
}

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
