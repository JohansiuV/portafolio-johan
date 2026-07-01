from html.parser import HTMLParser
from pathlib import Path

path = Path(r'F:\portafolio.web\index.html')
content = path.read_text(encoding='utf-8')

class TagParser(HTMLParser):
    void_tags = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []
    def handle_starttag(self, tag, attrs):
        if tag in self.void_tags:
            return
        self.stack.append((tag, self.getpos()))
    def handle_endtag(self, tag):
        if not self.stack:
            self.errors.append(('unmatched_close', tag, self.getpos()))
            return
        last, pos = self.stack[-1]
        if last == tag:
            self.stack.pop()
            return
        # if closing tag doesn't match last open tag, note mismatch
        for i in range(len(self.stack)-1, -1, -1):
            if self.stack[i][0] == tag:
                self.errors.append(('mismatch', tag, self.getpos(), self.stack[-1][0], self.stack[-1][1]))
                self.stack = self.stack[:i]
                return
        self.errors.append(('unmatched_close', tag, self.getpos()))
    def error(self, msg):
        self.errors.append(('parse_error', msg, self.getpos()))

parser = TagParser()
parser.feed(content)
print('stack remaining', len(parser.stack))
print('remaining tags', parser.stack[-20:])
print('errors', parser.errors[:30])
