const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `  const opsChartData = Object.values(opsChartDataMap).sort((a: any, b: any) => b.margin_ops - a.margin_ops);`;

const replacement = `  const opsChartData = Object.values(opsChartDataMap).sort((a: any, b: any) => b.margin_ops - a.margin_ops);

  const opsDapurDataMap = filteredOpsData.reduce((acc: Record<string, any>, curr) => {
    const d = curr.nama_sppg || curr.dapur_name || 'Tanpa Nama Dapur';
    if (!acc[d]) acc[d] = {
      name: d,
      margin_ops: 0,
      pm: 0
    };
    acc[d].margin_ops += parseNumber(curr.margin_ops);
    acc[d].pm += parsePM(curr.pm);
    return acc;
  }, {});
  const opsDapurData = Object.values(opsDapurDataMap).sort((a: any, b: any) => b.margin_ops - a.margin_ops);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
