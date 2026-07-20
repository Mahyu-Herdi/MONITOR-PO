const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
    'const [selectedDapur, setSelectedDapur] = useState<string | null>(null);',
    'const [selectedDapur, setSelectedDapur] = useState<string | null>(null);\n  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);'
);

code = code.replace(
    'const detailedData = selectedDapur ? filteredData.filter(d => d.dapur_name === selectedDapur) : [];',
    'const detailedData = selectedDapur ? filteredData.filter(d => d.dapur_name === selectedDapur) : [];\n  const detailedOpsData = selectedOperator ? filteredOpsData.filter(d => (d.operator_name || \'Tanpa Nama\') === selectedOperator) : [];'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
console.log("Added selectedOperator");
