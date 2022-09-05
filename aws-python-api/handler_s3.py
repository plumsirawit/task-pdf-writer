import firebase_admin
from firebase_admin import credentials, auth, firestore
from secret import IAM_ADMIN_ACCESS, IAM_ADMIN_SECRET
import json
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

admin_config = Config(
    region_name = 'ap-southeast-1',
    signature_version = 'v4',
    retries = {
        'max_attempts': 10,
        'mode': 'standard'
    }
)

s3 = boto3.client('s3',
    aws_access_key_id=IAM_ADMIN_ACCESS,
    aws_secret_access_key=IAM_ADMIN_SECRET,
    config=admin_config)

cred = credentials.Certificate("cred.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def fetch_s3_object(event, context):
    body = json.loads(event['body'])
    user_token = body['user_token']
    contest = body['contest']
    task = body['task']
    s3now = body['s3now']
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
        object_name = f'protected/{contest}-{task}-{s3now}.pdf'
        file_url = s3.generate_presigned_url('get_object', Params={'Bucket': 'task-pdf-writer-v1', 'Key': object_name}, ExpiresIn=3600)
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
    pass