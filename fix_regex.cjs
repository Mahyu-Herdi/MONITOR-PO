const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(/Belum ada data operasional\.<\/div>\n\s*\)\}\n\s*<\/div>\n\s*<\/div>[\s\S]*?\{\/\* OPS LEFT PANEL \*\/\}/g, 
`Belum ada data operasional.</div>
            )}
          </div>
        </div>
        {/* OPS LEFT PANEL */}`);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Fixed with regex");
