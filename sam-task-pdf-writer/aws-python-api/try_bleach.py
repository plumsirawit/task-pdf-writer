import markdown
from mdx_bleach.mdx_bleach.extension import BleachExtension


def sanitize(st):
    bleach = BleachExtension()
    md = markdown.Markdown(extensions=[bleach])
    return md.convert(st)


st = input()
print(sanitize(st))
