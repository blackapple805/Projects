import sys
import json

def process_request(data):
    # Example ML processing, returning varied results based on input
    if isinstance(data, str):
        data = json.loads(data)
    
    # If data is a dictionary, convert it to a list
    if isinstance(data, dict):
        data = [data]

    results = []
    for item in data:
        value = int(item.get('value', 0))
        prediction = value * 2  # Example: Multiply value by 2
        item['prediction'] = prediction
        results.append(item)
    
    return results

if __name__ == "__main__":
    input_data = json.loads(sys.argv[1])
    result = process_request(input_data)
    print(json.dumps(result))