import json
import csv
import os

def get_header_value(headers, header_name):
    """Retrieve the header value for a given header name."""
    return next((header['value'] for header in headers if header['name'] == header_name), None)

def har_to_csv(har_file, csv_file):
    try:
        with open(har_file, 'r') as f:
            har_data = json.load(f)

        data_to_write = []
        for entry in har_data['log']['entries']:
            url = entry['request']['url']
            
            request_headers = entry['request']['headers']

            timestamp = entry['startedDateTime']
            agent = get_header_value(request_headers, 'User-Agent')
            bytes_ = entry['response']['bodySize']
            client_ip = entry.get('clientIPAddress', 'N/A')
            event_dataset = entry.get('custom_field_name', {}).get('event_dataset', '')
            extension = os.path.splitext(url)[1]
            geo_coordinates = entry.get('custom_field_name', {}).get('geo_coordinates', '')
            host = get_header_value(request_headers, 'Host')
            hour_of_day = timestamp.split('T')[1].split(':')[0]
            index_keyword = entry.get('some_field_name', {}).get('index_keyword', '')
            ip = entry['serverIPAddress']
            machine_os = get_header_value(request_headers, 'X-OS')
            memory = entry.get('custom_field_name', {}).get('memory', '')
            message = entry['response']['statusText']
            referer = get_header_value(request_headers, 'Referer')
            request_keyword = entry['request']['method']
            response_keyword = entry['response']['status']

            # Appending to the list
            data_to_write.append([
                url, timestamp, agent, bytes_, client_ip, event_dataset, extension,
                geo_coordinates, host, hour_of_day, index_keyword, ip, machine_os, 
                memory, message, referer, request_keyword, response_keyword
            ])
    
        # Appending data to csv file
        with open(csv_file, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerows(data_to_write)

        print(f"Processed {len(data_to_write)} entries from {har_file}")
    except Exception as e:
        print(f"Error processing {har_file}: {str(e)}")
        # Deleting the problematic .har file
        try:
            os.remove(har_file)
            print(f"Deleted problematic file: {har_file}")
        except Exception as del_error:
            print(f"Error deleting {har_file}: {del_error}")

def main():
    folder_path = '/media/sf_GreatVm/harhar'
    output_csv = 'output.csv'

    # If output CSV already exists, remove it to start fresh
    if os.path.exists(output_csv):
        os.remove(output_csv)

    # Write header to CSV
    with open(output_csv, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['URL', 'Timestamp', 'User Agent', 'Bytes', 'Client IP', 'Event Dataset', 'File Extension',
                         'Geo Coordinates', 'Host', 'Hour of Day', 'Index Keyword', 'IP', 'Machine OS', 
                         'Memory', 'Message', 'Referer', 'Request Keyword', 'Response Keyword']) 

    for file in os.listdir(folder_path):
        if file.endswith('.har'):
            har_to_csv(os.path.join(folder_path, file), output_csv)

    print(f"Processing of .har files in {folder_path} is complete!")

if __name__ == '__main__':
    main()
