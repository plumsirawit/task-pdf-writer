import json
from django.template.loader import render_to_string
from django.conf import settings

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

def render(event, context):
    body = json.loads(event['body'])
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
        'contest_date': body['contest_date']
    }
    rendered_string = render_to_string('pdf-template.html', context=render_context)
    body = {
        "message": rendered_string,
        "input": event
    }
    
    response = {"statusCode": 200, "body": json.dumps(body)}
    return response