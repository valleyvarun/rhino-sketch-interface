# Import necessary libraries for HTTP handling, decoding, and file operations
from http.server import BaseHTTPRequestHandler, HTTPServer
import base64
import os

# Define the folder where sketches will be saved (change if needed)
SKETCH_DIR = r"C:\Users\Varun SA\Documents\rhino-sketch-interface\sketches"


# Define a request handler class for handling incoming POST requests
class SketchHandler(BaseHTTPRequestHandler):

    # This function runs whenever the server receives a POST request
    def do_POST(self):

        # Get the length of the incoming data (base64 PNG)
        content_length = int(self.headers["Content-Length"])

        # Read the actual base64 string from the request body
        post_data = self.rfile.read(content_length).decode("utf-8")

        # Remove the "data:image/png;base64," prefix if it exists
        if "," in post_data:
            base64_data = post_data.split(",")[1]
        else:
            base64_data = post_data

        # Decode the base64 string into binary image data
        image_data = base64.b64decode(base64_data)

        # Check if the sketch folder exists
        # If not, create it so we don't get an error when saving
        if not os.path.exists(SKETCH_DIR):
            os.makedirs(SKETCH_DIR)

        # Get all existing PNG filenames in the folder that are just numbers (e.g., "1.png", "2.png")
        existing_files = [
            int(f.split(".")[0])
            for f in os.listdir(SKETCH_DIR)
            if f.endswith(".png") and f.split(".")[0].isdigit()
        ]

        # Find the next available index by taking the max number and adding 1
        # If no files exist yet, start at 1
        next_index = max(existing_files, default=0) + 1

        # Create the full file path for the new sketch
        new_file_path = os.path.join(SKETCH_DIR, f"{next_index}.png")

        try:
            # Save the image data to the new file
            with open(new_file_path, "wb") as f:
                f.write(image_data)

            # Send back a 200 OK response to the browser
            self.send_response(200)
            self.end_headers()

            # Send a message back saying the image was saved
            self.wfile.write(f"Image saved as {next_index}.png".encode())

        except Exception as e:
            # If anything fails, return a 500 error and the error message
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f"Error: {str(e)}".encode())


# Define a function to start the server
def run(server_class=HTTPServer, handler_class=SketchHandler):

    # Set the server to listen on port 8000 on localhost (127.0.0.1)
    server_address = ("", 8000)

    # Create the HTTP server instance
    httpd = server_class(server_address, handler_class)

    # Print a message so you know the server is running
    print("Server started on port 8000")

    # Keep the server running forever (until manually stopped)
    httpd.serve_forever()


# Only run the server if this file is the main script
if __name__ == "__main__":
    run()
