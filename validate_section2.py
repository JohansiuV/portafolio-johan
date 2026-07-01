from pathlib import Path
import re
path = Path(r'F:\\portafolio.web\\index.html')
text = path.read_text(encoding='utf-8')
start = text.index('<!-- ========== SECTION 2: ABOUT ========== -->')
end = text.index('<!-- ========== SECTION 3: CERTIFICATES ========== -->')
fragment = text[start:end]
for tag in ['section','div','aside','main','nav','button','a','p','img','input','link']:
    opens = len(re.findall(rf'<{tag}\b', fragment))
    closes = len(re.findall(rf'</{tag}>', fragment))
    print(tag, opens, closes)
print('\nFragment lines:')
for i,line in enumerate(fragment.splitlines(), start=text[:start].count('\n')+1):
    if '<section' in line or '</section>' in line or '<div' in line or '</div>' in line or '<aside' in line or '</aside>' in line or '<main' in line or '</main>' in line:
        print(i, line)
