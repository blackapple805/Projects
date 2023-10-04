import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv() 

account_sid = os.environ['TWILIO_ACCOUNT_SID']
auth_token = os.environ['TWILIO_AUTH_TOKEN']

to_phone_number = os.environ['PHONE_NUMBER']
from_phone_number = os.environ['TWILIO_PHONE_NUMBER'] 

client = Client(account_sid, auth_token)

message = client.messages \
    .create(
         body='Happy Bday Eric!',
         from_= from_phone_number,
         to=to_phone_number
     )
print(f"SID:{message.sid} Status:{message.status}")