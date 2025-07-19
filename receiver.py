from http.server import BaseHTTPRequestHandler, HTTPServer
import base64
import os

# Create the 'sketches' folder if it doesn't exist
SAVE_FOLDER = "sketches"
os.makedirs(SAVE_FOLDER, exist_ok=True)


# Get the next available sketch file number
def get_next_filename():
    existing = [
        int(f.split(".")[0])
        for f in os.listdir(SAVE_FOLDER)
        if f.endswith(".png") and f.split(".")[0].isdigit()
    ]
    next_num = max(existing, default=0) + 1
    return os.path.join(SAVE_FOLDER, f"{next_num}.png")


# Handler class for HTTP POST requests
class SketchHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read incoming image data
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length).decode("utf-8")

            # Extract base64 portion
            base64_data = post_data.split(",")[1] if "," in post_data else post_data

            # Decode the base64 image
            image_data = base64.b64decode(base64_data)

            # Save the image
            filename = get_next_filename()
            with open(filename, "wb") as f:
                f.write(image_data)

            # Respond safely as plain text
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Access-Control-Allow-Origin", "*")  # Prevent CORS issues
            self.end_headers()
            self.wfile.write(b"Image saved successfully.")

        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f"Error: {str(e)}".encode())


# Start the HTTP server
def run():
    server_address = ("", 8000)
    httpd = HTTPServer(server_address, SketchHandler)
    print("Sketch server running on port 8000...")
    httpd.serve_forever()


if __name__ == "__main__":
    run()
