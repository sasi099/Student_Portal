from flask import Flask, request, jsonify, send_from_directory
import os

app = Flask(__name__)
UPLOAD_DIRECTORY = "uploads"

# This is a simple, insecure way to check for a master user.
# In a real application, use a proper authentication system.
MASTER_USERNAME = "sasi099"
MASTER_PASSWORD = "sasi099"

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

def is_master_user():
    # Check for master credentials in headers
    username = request.headers.get('X-Master-Username')
    password = request.headers.get('X-Master-Password')
    return username == MASTER_USERNAME and password == MASTER_PASSWORD

@app.route('/upload/<department>/<category>', methods=['POST'])
def upload_file(department, category):
    if not is_master_user():
        return jsonify({"error": "Unauthorized"}), 401

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        department_folder = os.path.join(UPLOAD_DIRECTORY, department)
        category_folder = os.path.join(department_folder, category)
        if not os.path.exists(category_folder):
            os.makedirs(category_folder)
        file.save(os.path.join(category_folder, file.filename))
        return jsonify({"message": "File uploaded successfully"}), 200

@app.route('/files/<department>/<category>', methods=['GET'])
def list_files(department, category):
    category_folder = os.path.join(UPLOAD_DIRECTORY, department, category)
    files = []
    if os.path.exists(category_folder):
        files = os.listdir(category_folder)
    return jsonify({"files": files})

@app.route('/download/<department>/<category>/<filename>', methods=['GET'])
def download_file(department, category, filename):
    category_folder = os.path.join(UPLOAD_DIRECTORY, department, category)
    return send_from_directory(category_folder, filename, as_attachment=True)

@app.route('/delete/<department>/<category>/<filename>', methods=['DELETE'])
def delete_file(department, category, filename):
    if not is_master_user():
        return jsonify({"error": "Unauthorized"}), 401
        
    try:
        file_path = os.path.join(UPLOAD_DIRECTORY, department, category, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({"message": "File deleted successfully"}), 200
        else:
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
