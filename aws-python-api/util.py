from uuid import uuid4
from django.template.loader import render_to_string
from django.conf import settings
import os
import shutil

import pdfkit
from xvfbwrapper import Xvfb


def render_pdf_template(body):
    render_context = {
        'content': body['content'],
        'contest_full_title': body['contest_full_title'],
        'contest_title': body['contest_title'],
        'contest': body['contest'],
        'task_name': body['task_name'],
        'country': body['country'],
        'language': body['language'],
        'language_code': body['language_code'],
        'direction': 'ltr',
        'pdf_output': True,
        'static_path': 'static',
        'images_path': '',
        'text_font_base64': False,
        'contest_date': body['contest_date'],
        'image_base64': body['image_base64']
    }
    return render_to_string('pdf-template.html', context=render_context)


def convert_html_to_pdf(html, pdf_file_path):
    try:
        html_file_path = '/tmp/{}.html'.format(str(uuid4()))
        with open(html_file_path, 'wb') as f:
            f.write(html.encode('utf-8'))
        with Xvfb():
            pdfkit.from_file(html_file_path, pdf_file_path,
                             options=settings.WKHTMLTOPDF_CMD_OPTIONS)
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


def process_pdf(body):
    if os.path.exists('/tmp/static'):
        shutil.rmtree('/tmp/static')
    shutil.copytree('/usr/src/app/static', '/tmp/static')
    rendered_html = render_pdf_template(body)
    output_file_path = '/tmp/{}.html'.format(str(uuid4()))
    convert_html_to_pdf(rendered_html, output_file_path)
    add_page_numbers_to_pdf(output_file_path, body['task_name'])
    shutil.rmtree('/tmp/static')
    return output_file_path
