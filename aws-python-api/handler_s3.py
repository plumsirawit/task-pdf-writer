import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate("cred.json")
firebase_admin.initialize_app(cred)

def fetch_s3_object(event, context):
    # TODO: authN the user
    # get contest, get task, get s3now
    # then check whether user belongs to the specified contest
    # if yes, get object from s3 and send the response
    pass