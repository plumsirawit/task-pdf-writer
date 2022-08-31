import json
import base64
from uuid import uuid4
from django.template.loader import render_to_string
from django.conf import settings
import os
import shutil

import pdfkit
from xvfbwrapper import Xvfb

def hello(event, context):
    body = {
        "message": "Go Serverless v2.0! Your function executed successfully!",
        "input": event,
    }

    response = {"statusCode": 200, "body": json.dumps(body)}

    return response

    # Use this code if you don't use the http event with the LAMBDA-PROXY
    # integration
    """
    return {
        "message": "Go Serverless v1.0! Your function executed successfully!",
        "event": event
    }
    """

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

def render(event, context):
    body = json.loads(event['body'])
    rendered_string = render_pdf_template(body)
    body = {
        "message": rendered_string,
        "input": event
    }
    response = {"statusCode": 200, "body": json.dumps(body)}
    return response

def convert_html_to_pdf(html, pdf_file_path):
    try:
        html_file_path = '/tmp/{}.html'.format(str(uuid4()))
        with open(html_file_path, 'wb') as f:
            f.write(html.encode('utf-8'))
        with Xvfb():
            pdfkit.from_file(html_file_path, pdf_file_path, options=settings.WKHTMLTOPDF_CMD_OPTIONS)
        os.remove(html_file_path)
    except Exception as e:
        print(e)

def add_page_numbers_to_pdf(pdf_file_path, task_name):
    color = '-color "0.4 0.4 0.4" '
    cmd = ('cpdf -add-text "{0} (%Page of %EndPage)   " -font "Arial" ' + color + \
          '-font-size 10 -bottomright .62in {1} -o {1}').format(task_name, pdf_file_path)
    os.system(cmd)

def genpdf(event, context):
    if os.path.exists('/tmp/static'):
        shutil.rmtree('/tmp/static')
    shutil.copytree('/usr/src/app/static', '/tmp/static')
    body = json.loads(event['body'])
    rendered_html = render_pdf_template(body)
    output_file_path = '/tmp/{}.html'.format(str(uuid4()))
    convert_html_to_pdf(rendered_html, output_file_path)
    add_page_numbers_to_pdf(output_file_path, body['task_name'])
    with open(output_file_path, 'rb') as f:
        output_file_content = base64.b64encode(f.read()).decode('utf-8')
    body = {
        "message": output_file_content,
        "input": event
    }
    response = {
        "statusCode": 200,
        "body": json.dumps(body),
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        }
    }
    shutil.rmtree('/tmp/static')
    return response