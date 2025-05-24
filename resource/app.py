from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, VideoUnavailable
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os
import re
import uuid
import urllib.parse as urlparse

app = Flask(__name__)
CORS(app)

# Set folder for saving PDFs
PDF_FOLDER = os.path.join(os.path.dirname(__file__), 'generated_pdfs')
os.makedirs(PDF_FOLDER, exist_ok=True)

# --- Improved Video ID extractor for all URL types ---
def extract_video_id(url):
    parsed = urlparse.urlparse(url)
    if parsed.hostname == 'youtu.be':
        return parsed.path[1:]
    if parsed.hostname in ['www.youtube.com', 'youtube.com', 'm.youtube.com']:
        query = urlparse.parse_qs(parsed.query)
        return query.get('v', [None])[0]
    return None

# --- Generate PDF from transcript ---
def create_pdf(transcript, filename):
    pdf_path = os.path.join(PDF_FOLDER, filename)
    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter
    y_position = height - 40

    for entry in transcript:
        text = entry['text']
        if y_position < 40:
            c.showPage()
            y_position = height - 40
        c.drawString(40, y_position, text)
        y_position -= 14

    c.save()
    return pdf_path

# --- Main API Endpoint ---
@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    try:
        data = request.get_json(force=True)
        video_link = data.get('video_link')
        print("✅ Received video link:", video_link)

        if not video_link:
            return jsonify({'error': 'No video link provided'}), 400

        video_id = extract_video_id(video_link)
        print("✅ Extracted video ID:", video_id)

        if not video_id:
            return jsonify({'error': 'Invalid YouTube link'}), 400

        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        print("✅ Transcript fetched. First line:", transcript[0] if transcript else 'Empty')

        unique_filename = f"{video_id}_{uuid.uuid4().hex[:6]}.pdf"
        create_pdf(transcript, unique_filename)

        return jsonify({
            'message': '✅ PDF generated successfully',
            'path': f"http://localhost:5000/static/pdfs/{unique_filename}"
        })

    except TranscriptsDisabled:
        print("❌ Subtitles disabled for this video")
        return jsonify({'error': 'Subtitles are disabled for this video'}), 400
    except VideoUnavailable:
        print("❌ Video unavailable or deleted")
        return jsonify({'error': 'Video is unavailable or deleted'}), 400
    except Exception as e:
        print("❌ Unhandled Exception:", str(e))
        return jsonify({'error': f"An error occurred: {str(e)}"}), 500

# --- Serve PDF files from folder ---
@app.route('/static/pdfs/<filename>')
def serve_pdf(filename):
    return send_from_directory(PDF_FOLDER, filename)

# --- Run the Flask app ---
if __name__ == '__main__':
    app.run(debug=True)
