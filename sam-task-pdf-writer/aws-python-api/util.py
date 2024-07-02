from uuid import uuid4
import os
import shutil

import pdfkit
from xvfbwrapper import Xvfb

# import markdown
# from mdx_bleach.mdx_bleach.extension import BleachExtension


def sanitize(st):
    '''
    TODO: sanitize input
    '''
    # bleach = BleachExtension()
    # md = markdown.Markdown(extensions=[bleach])
    # return md.convert(st)
    return st


def render_pdf_template(template, body):
    replacement_context = {
        'CONTEST_FULL_TITLE': body['contest_full_title'],
        'CONTEST_TITLE': body['contest_title'],
        'CONTEST': body['contest'],
        'CONTEST_PLACE': '',  # @TODO: add this field
        'TASK_NAME': body['task_name'],
        'COUNTRY': body['country'],
        'LANGUAGE': body['language'],
        'LANGUAGE_CODE': body['language_code'],
        'CONTEST_DATE': body['contest_date'],
        'IMAGE_BASE64': body['image_base64']
    }
    for k, v in replacement_context.items():
        template = template.replace('{{'+k+'}}', v)
    return template


WKHTMLTOPDF_CMD_OPTIONS = {
    'disable-local-file-access': None,
    'disable-javascript': None,
    'allow': '/tmp/',
    'page-size': 'A4',
    'margin-left': '0.75in',
    'margin-right': '0.75in',
    'margin-top': '0.62in',
    'margin-bottom': '1in',
    'print-media-type': ''
}


def convert_html_to_pdf(html, pdf_file_path):
    try:
        html_file_path = '/tmp/{}.html'.format(str(uuid4()))
        with open(html_file_path, 'wb') as f:
            f.write(html.encode('utf-8'))
        with Xvfb():
            pdfkit.from_file(html_file_path, pdf_file_path,
                             options=WKHTMLTOPDF_CMD_OPTIONS)
        os.remove(html_file_path)
    except Exception as e:
        print(e)


def add_page_numbers_to_pdf(pdf_file_path, task_name):
    color = '-color "0.4 0.4 0.4" '
    cmd = ('cpdf -add-text "{0} (%Page of %EndPage)   " -font "Arial" ' + color +
           '-font-size 10 -bottomright .62in {1} -o {1}').format(task_name, pdf_file_path)
    os.system(cmd)

# body requires:
# 'content'
# 'contest_full_title'
# 'contest_title'
# 'contest'
# 'task_name'
# 'country'
# 'language'
# 'language_code'
# 'contest_date'
# 'image_base64'


def process_pdf(content, body):
    if os.path.exists('/tmp/static'):
        shutil.rmtree('/tmp/static')
    shutil.copytree('/usr/src/app/static', '/tmp/static')
    rendered_html = render_pdf_template(content, body)
    output_file_path = '/tmp/{}.html'.format(str(uuid4()))
    convert_html_to_pdf(rendered_html, output_file_path)
    add_page_numbers_to_pdf(output_file_path, body['task_name'])
    shutil.rmtree('/tmp/static')
    return output_file_path
