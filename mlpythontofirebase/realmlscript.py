import firebase_admin
from firebase_admin import credentials, firestore
from joblib import dump

# Load your pre-trained ML model and the vectorizer
dump(vectorizer, 'Use own ML model here ')
dump(model, 'Use own ML model here')
# Path to your Firebase Admin SDK private key
cred = credentials.Certificate('Use own json file here')

# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred)

# Firestore client
db = firestore.client()

tasks_to_add = [
    {'id': 'monthly_report_task', 
     'task': 'Prepare the monthly report', 
     'status': 'TODO'},

    {'id': 'server_downtime_task', 
     'task': 'Urgent: Fix the server downtime issue', 
     'status': 'URGENT'},

    {'id': 'team_meeting_task',
     'task': 'Schedule a meeting with the project team',
     'status': 'TODO'},

    {'id': 'client_slides_task',
     'task': 'Urgent: Complete the client presentation slides',
     'status': 'URGENT'},

    {'id': 'website_update_task',
     'task': 'Update the website with the new changes',
     'status': 'TODO'},
    
    {'id': 'employee_survey_task',
     'task': 'Send out the survey to all employees',
     'status': 'TODO'},

    {'id': 'project_review_task',
     'task': 'Urgent: Review the final project deliverables',
     'status': 'URGENT'}
]

# Add these tasks to the 'tasksCollection' with a custom ID
for task_info in tasks_to_add:
    task_id = task_info['id']  # Get the custom ID
    # Create a document with the custom ID
    db.collection('tasksCollection').document(task_id).set({
        'task': task_info['task'],
        'status': task_info['status']
    })
    
# Function to preprocess the text and predict task status using the loaded ML model
def predict_task_status(task_description):
    # Preprocess the task_description with the vectorizer
    task_description_tfidf = dump([task_description])
    # Make a prediction with the pre-trained model
    prediction = dump(task_description_tfidf)
    return prediction[0]  # Assuming your model returns an array of predictions
# Example usage of the function:
task_description = "Schedule a meeting with the project team"
predicted_status = predict_task_status(task_description)
print(f"Task: {task_description}, Predicted Status: {predicted_status}")



# Reading data from 'tasksCollection'
tasks = db.collection('tasksCollection').get()

for task in tasks:
    task_data = task.to_dict()
    if 'task' in task_data:
        # Use the mock ML model to predict the priority of the task
        predicted_priority = predict_task_status(task_data['task'])
        print(f"Task ID: {task.id}, Task: {task_data['task']}, Status: {task_data['status']}")
    # else:
    #     # Handle the case where 'task' field is missing
    #     print(f"Document ID: {task.id} does not have a 'task' field.")