import json
import base64

from util import render_pdf_template, process_pdf

def hello(event, context):
    body = {
        "message": "Go Serverless v2.0! Your function executed successfully!",
        "input": event,
    }
    response = {"statusCode": 200, "body": json.dumps(body)}
    return response

def render(event, context):
    body = json.loads(event['body'])
    rendered_string = render_pdf_template(body)
    body = {
        "message": rendered_string,
        "input": event
    }
    response = {"statusCode": 200, "body": json.dumps(body)}
    return response

def genpdf(event, context):
    body = json.loads(event['body'])
    output_file_path = process_pdf(body)
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
    return response