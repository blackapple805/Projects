from flask import Flask, render_template, request, redirect, url_for, jsonify
import firebase_config

app = Flask(__name__)
db = firebase_config.db

@app.route('/')
def index():
    transactions_ref = db.collection('transactions')
    transactions = [{'id': doc.id, **doc.to_dict()} for doc in transactions_ref.stream()]
    return render_template('index.html', transactions=transactions)

@app.route('/add', methods=['POST'])
def add_transaction():
    date = request.form['date']
    category = request.form['category']
    amount = float(request.form['amount'])
    transaction_type = request.form['type']
    transaction = {
        'date': date,
        'category': category,
        'amount': amount,
        'type': transaction_type
    }
    db.collection('transactions').add(transaction)
    return redirect(url_for('index'))

@app.route('/delete/<doc_id>', methods=['POST'])
def delete_transaction(doc_id):
    db.collection('transactions').document(doc_id).delete()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
