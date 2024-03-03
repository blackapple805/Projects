import firebase_admin
from firebase_admin import ml
from firebase_admin import credentials

# download private_key.json from Firebase
firebase_admin.initialize_app(
    credentials.Certificate('private_key.json'),
    options={
        'storageBucket': 'model-deployment.appspot.com'  # same as your cloud storage id
    }
)

source = ml.TFLiteGCSModelSource.from_tflite_model_file('expression_detection.tflite')
tflite_format = ml.TFLiteFormat(model_source=source)

model = ml.Model(
    display_name="expression",  # This is the name you use from your app to download the model
    model_format=tflite_format
)

# Add the model to your Firebase project and publish it
new_model = ml.create_model(model)
ml.publish_model(new_model.model_id)
print(new_model.model_id)
print(new_model.model_format)