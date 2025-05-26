from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import os
import time

app = Flask(__name__, template_folder='templates')
CORS(app)  # Enable CORS for frontend-backend communication

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PDF_DIR = os.path.join(BASE_DIR, 'generated_pdfs')

# Ensure generated_pdfs directory exists
os.makedirs(PDF_DIR, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    data = request.get_json()
    video_link = data.get('video_link')
    if not video_link:
        return jsonify({'error': 'No video link provided'}), 400

    # Simulate PDF generation process (replace this with real generation logic)
    timestamp = int(time.time())
    pdf_filename = f"notes_{timestamp}.pdf"
    pdf_path = os.path.join(PDF_DIR, pdf_filename)

    # For demonstration, just create an empty PDF file or dummy content
    with open(pdf_path, 'wb') as f:
        f.write(b'%PDF-1.4\n%Fake PDF content\n%%EOF')

    # Return the relative URL path for frontend to link to
    return jsonify({'path': f'/generated_pdfs/{pdf_filename}'})


@app.route('/generated_pdfs/<path:filename>')
def serve_pdf(filename):
    # Serve PDF files from generated_pdfs folder
    return send_from_directory(PDF_DIR, filename)


@app.route('/list-pdfs', methods=['GET'])
def list_pdfs():
    # List all PDFs in generated_pdfs folder
    try:
        files = [f'/generated_pdfs/{f}' for f in os.listdir(PDF_DIR) if f.endswith('.pdf')]
        files.sort(key=lambda x: os.path.getmtime(os.path.join(PDF_DIR, os.path.basename(x))), reverse=True)
        return jsonify({'pdfs': files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
