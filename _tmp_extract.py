import re
c = open(r'c:\xampp\htdocs\Proyecto MegaMaps\Nueva carpeta\megamaps\index.html', 'r', encoding='utf-8').read()
m = re.search(r'const SITIOS = \[([\s\S]*?)\];', c)
if m:
    ids = re.findall(r'id:"([^"]+)"', m.group(1))
    labels = re.findall(r'label:"([^"]+)"', m.group(1))
    for i in range(len(ids)):
        print(f'id={ids[i]} label={labels[i]}')
