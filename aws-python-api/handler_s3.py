import os
from uuid import uuid4
import firebase_admin
from firebase_admin import credentials, auth, firestore
from secret import IAM_ADMIN_ACCESS, IAM_ADMIN_SECRET, PLUM_PERSONAL_IDENTIFICATION
import json
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from urllib.request import urlopen
import base64
from util import process_pdf

admin_config = Config(
    region_name='ap-southeast-1'
)

s3 = boto3.client('s3',
                  aws_access_key_id=IAM_ADMIN_ACCESS,
                  aws_secret_access_key=IAM_ADMIN_SECRET,
                  config=admin_config)

cred = credentials.Certificate("cred.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Why don't we lift everything here to front-end
# (yes, now it's TODO)


def fetch_s3_object(event, context):
    print('DBG fetch_s3_object', json.dumps(event, indent=2))
    user_token = event['headers']['tpw-user-token']
    contest = event['headers']['tpw-contest']
    task = event['headers']['tpw-task']
    s3now = event['headers']['tpw-s3now']
    secretsuffix = event['headers']['tpw-secretsuffix']
    try:
        decoded_token = auth.verify_id_token(user_token, check_revoked=True)
        uid = decoded_token['uid']
        contest_doc = db.collection(u'contests').document(contest).get()
        if not contest_doc.exists:
            # Contest doesn't exist
            raise ValueError("Contest doesn't exist")
        data = contest_doc.to_dict()
        if uid not in data['users']:
            raise ValueError("Unauthorized in this contest")
        if task not in data['tasks']:
            raise ValueError("Task is not in this contest")
        object_name = f'protected/{contest}-{task}-{s3now}-{secretsuffix}.pdf'
        file_url = s3.generate_presigned_url('get_object', Params={
                                             'Bucket': 'task-pdf-writer-v1', 'Key': object_name}, ExpiresIn=3600)
        response = {
            "statusCode": 200,
            "body": json.dumps({
                "message": file_url,
                "input": event
            }),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET'
            }
        }
        return response
    except auth.RevokedIdTokenError:
        # Token revoked, inform the user to reauthenticate or signOut().
        return {
            "statusCode": 401,
            "body": json.dumps({
                "message": "Token revoked",
                "input": event
            }),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET'
            }
        }
    except auth.UserDisabledError:
        # Token belongs to a disabled user record.
        return {
            "statusCode": 401,
            "body": json.dumps({
                "message": "Token belongs to a disabled user record",
                "input": event
            }),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET'
            }
        }
    except auth.InvalidIdTokenError:
        # Token is invalid
        return {
            "statusCode": 401,
            "body": json.dumps({
                "message": "Token is invalid",
                "input": event
            }),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET'
            }
        }
    except ClientError:
        # Boto3 error
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": "Boto3 error",
                "input": event
            }),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET'
            }
        }
    except Exception:
        # Something is broken
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": "Something else is broken",
                "input": event
            }),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET'
            }
        }


def process_s3_object(event, context):
    # Process the object, from md to pdf
    try:
        object_name = event['Records'][0]['s3']['object']['key']
        head_response = s3.head_object(
            Bucket='task-pdf-writer-v1', Key=object_name)
        metadata = head_response['Metadata']
        body = {
            'content': 'Content not found!',
            'contest_full_title': metadata.get('tpw-contest-full-title', ''),
            'contest_title': metadata.get('tpw-contest-title', ''),
            'contest': metadata.get('tpw-contest', ''),
            'task_name': metadata.get('tpw-task-name', ''),
            'country': metadata.get('tpw-country', ''),
            'language': metadata.get('tpw-language', ''),
            'language_code': metadata.get('tpw-language-code', ''),
            'contest_date': metadata.get('tpw-contest-date', ''),
            'image_base64': ''
        }
        content_filename = '/tmp/{}.md'.format(str(uuid4()))
        s3.download_file('task-pdf-writer-v1', object_name, content_filename)
        with open(content_filename) as f:
            body['content'] = f.read()
        contest_id = body['contest']
        try:
            s3.head_object(Bucket='task-pdf-writer-v1', Key=f'private/{contest_id}-logo')
            logo_exists = True
        except ClientError:
            logo_exists = False
        if logo_exists:
            s3.download_file('task-pdf-writer-v1',
                            f'private/{contest_id}-logo', content_filename)
            content_type = s3.head_object(
                Bucket='task-pdf-writer-v1', Key=f'private/{contest_id}-logo')['Metadata']['Content-Type']
            with open(content_filename, 'rb') as f:
                base64_data = base64.b64encode(f.read())
                body['image_base64'] = f'data:{content_type};base64,' + base64_data
        # now the body is complete
        print('[DEBUG body]', body)
        output_file_path = process_pdf(body)
        s3.upload_file(output_file_path, 'task-pdf-writer-v1',
                       object_name.replace('.md', '.pdf'))
    except Exception as e:
        print('[DEBUG] ERROR', e)
        return


def upload_datauri(datauri, key):
    content_type = datauri.split(';')[0]
    filename = '/tmp/{}.dat'.format(str(uuid4()))
    with urlopen(datauri) as response:
        data = response.read()
        with open(filename, "wb") as f:
            f.write(data)
    s3.upload_file(filename, 'task-pdf-writer-v1',
                   key, {'ContentType': content_type})
    os.remove(filename)


def migrate_logo(event, context):
    # Single time migration.
    # However, it could be run as a cronjob
    pin = event['headers']['tpw-pin']
    if pin != PLUM_PERSONAL_IDENTIFICATION:
        return {
            "statusCode": 403,
            "body": json.dumps({
                "message": "This function is for Plum only!",
                "input": event
            }),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST'
            }
        }
    try:
        contests = db.collection(u'contests').stream()
        for contest in contests:
            contest_id = contest.id
            data = contest.to_dict()
            if 'logo' in data and ';' in data['logo']:
                contest_logo_base64 = data['logo']
                object_name = f'private/{contest_id}-logo'
                upload_datauri(contest_logo_base64, object_name)
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": "Something is wrong " + str(e),
                "input": event
            }),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST'
            }
        }
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Migration done!",
            "input": event
        }),
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST'
        }
    }
