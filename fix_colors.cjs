const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(/const colors = \['#e74c3c','#3498db','#f1c40f','#2ecc71','#9b59b6','#e67e22'\];/, `const colors = ['#003366', '#FFD700', '#00A859', '#E31837', '#6C7A89', '#F2A900'];
  const opsColors = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#06b6d4'];`);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
