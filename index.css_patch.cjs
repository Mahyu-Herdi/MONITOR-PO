const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

if (!code.includes('.custom-scrollbar')) {
code += `
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.02); 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1); 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.2); 
}
`;
fs.writeFileSync('src/index.css', code);
}
