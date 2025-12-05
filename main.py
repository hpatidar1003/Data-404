import http.server
import socketserver
import webbrowser
import os
import sys
import json
import hashlib
import secrets

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
USERS_FILE = os.path.join(DIRECTORY, 'users.json')
DOWNLOAD_LINK = "https://drive.google.com/file/d/1qzv3B0lzGwEg7aPDhPW5CyMqYZ4M0b9N/view?usp=drive_link"

# Ensure users file exists
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w') as f:
        json.dump({}, f)

def hash_password(password, salt=None):
    if not salt:
        salt = secrets.token_hex(16)
    # Use PBKDF2 for better security than simple SHA256
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return salt, key.hex()

def verify_password(stored_password, provided_password):
    salt = stored_password['salt']
    key = stored_password['key']
    _, new_key = hash_password(provided_password, salt)
    return new_key == key

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('Content-Security-Policy', "frame-ancestors 'none'")
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_POST(self):
        if self.path == '/api/login':
            self.handle_login()
        elif self.path == '/api/register':
            self.handle_register()
        else:
            self.send_error(404, "Endpoint not found")

    def get_post_data(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        return json.loads(post_data.decode('utf-8'))

    def send_json_response(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def handle_register(self):
        try:
            data = self.get_post_data()
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            if not username or not email or not password:
                self.send_json_response({'error': 'Missing fields'}, 400)
                return

            with open(USERS_FILE, 'r') as f:
                users = json.load(f)

            if username in users:
                self.send_json_response({'error': 'Username already exists'}, 409)
                return
            
            # Check if email exists
            for user in users.values():
                if user['email'] == email:
                    self.send_json_response({'error': 'Email already registered'}, 409)
                    return

            salt, key = hash_password(password)
            users[username] = {
                'email': email,
                'salt': salt,
                'key': key
            }

            with open(USERS_FILE, 'w') as f:
                json.dump(users, f)

            self.send_json_response({'success': True, 'message': 'Account created successfully'})

        except Exception as e:
            print(f"Register Error: {e}")
            self.send_json_response({'error': 'Internal Server Error'}, 500)

    def handle_login(self):
        try:
            data = self.get_post_data()
            login_id = data.get('loginIdentifier')
            password = data.get('password')

            with open(USERS_FILE, 'r') as f:
                users = json.load(f)

            user = None
            # Try finding by username
            if login_id in users:
                user = users[login_id]
            else:
                # Try finding by email
                for u in users.values():
                    if u['email'] == login_id:
                        user = u
                        break
            
            if user and verify_password(user, password):
                # SUCCESS: Return the download link here
                self.send_json_response({
                    'success': True, 
                    'message': 'Login successful',
                    'downloadLink': DOWNLOAD_LINK
                })
            else:
                self.send_json_response({'error': 'Invalid credentials'}, 401)

        except Exception as e:
            print(f"Login Error: {e}")
            self.send_json_response({'error': 'Internal Server Error'}, 500)

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

def main():
    os.chdir(DIRECTORY)
    print(f"Starting secure server on port {PORT}...")
    
    with ReusableTCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"Serving at {url}")
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)

if __name__ == "__main__":
    main()
