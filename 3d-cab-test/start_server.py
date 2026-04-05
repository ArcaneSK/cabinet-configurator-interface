import http.server
import socketserver
import webbrowser

PORT = 8881
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://127.0.0.1:{PORT}")
    webbrowser.open(f"http://127.0.0.1:{PORT}")  # Opens the URL in the default browser
    try:
        while True:
            httpd.handle_request()  # Handle one request at a time
    except KeyboardInterrupt:
        print("\nServer stopped by user.")
        httpd.server_close()