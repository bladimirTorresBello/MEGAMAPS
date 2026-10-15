const fs = require('fs');
const c = fs.readFileSync('c:/xampp/htdocs/Proyecto MegaMaps/Nueva carpeta/megamaps/index.html', 'utf8');
const m = c.match(/const SITIOS = \[([\s\S]*?)\];/);
if (m) {
  const ids = [...m[1].matchAll(/id:"([^"]+)"/g)].map(x => x[1]);
  const labels = [...m[1].matchAll(/label:"([^"]+)"/g)].map(x => x[1]);
  ids.forEach((id, i) => console.log('id=' + id + ' label=' + labels[i]));
}
