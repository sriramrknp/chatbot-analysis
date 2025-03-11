from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv  # Add this

# Load environment variables first
load_dotenv()  # Add this before initializing OpenAI

app = Flask(__name__)
CORS(app)

# Now initialize the client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route('/api/generate-draft', methods=['POST'])
def generate_draft():
    try:
        data = request.json
        required_fields = ['name', 'email', 'txn_id', 'problem']
        
        # Validate required fields
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Create structured prompt
        prompt = f"""Create a professional customer support response with these details:
        Name: {data['name']}
        Email: {data['email']}
        Transaction ID: {data['txn_id']}
        Issue: {data['problem']}
        
        Include these sections:
        1. Greeting using customer's name
        2. Problem confirmation
        3. Solution steps
        4. Timeline for resolution
        5. Contact information
        6. Closing remarks"""

        # Generate response using OpenAI
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Use valid model name
            messages=[
                {"role": "system", "content": "You are an expert customer support agent."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        return jsonify({
            "draft": completion.choices[0].message.content
        })

    except Exception as e:
        print(f"API Error: {str(e)}")
        return jsonify({"error": "Failed to generate draft. Please try again."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)