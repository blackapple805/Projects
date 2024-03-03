import json
import csv
import os

def har_to_csv(har_file, csv_file):
    with open(har_file, 'r') as f:
        har_data = json.load(f)
    
    # Extracting required data from .har file
    # You might need to adjust the fields based on your needs
    data_to_write = []
    for entry in har_data['log']['entries']:
        url = entry['request']['url']
        status = entry['response']['status']
        data_to_write.append([url, status])

    # Appending data to csv file
    with open(csv_file, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(data_to_write)

def main():
    folder_path = '/media/sf_GreatVm/harhar'  # Path to folder containing .har files
    output_csv = 'output.csv'

    # If output CSV already exists, remove it to start fresh
    if os.path.exists(output_csv):
        os.remove(output_csv)

    # Write header to CSV
    with open(output_csv, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['URL', 'Status'])  # Adjust headers based on your needs

    for file in os.listdir(folder_path):
        if file.endswith('.har'):
            har_to_csv(os.path.join(folder_path, file), output_csv)

if __name__ == '__main__':
    main()
