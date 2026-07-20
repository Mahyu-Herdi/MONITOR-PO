const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `            )}
          </div>
        </div>
      </div>
          </div>
        </div>
      </div>
        {/* OPS LEFT PANEL */}`;

const replacement = `            )}
          </div>
        </div>
        {/* OPS LEFT PANEL */}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Fixed spacing");
