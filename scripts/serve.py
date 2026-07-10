#!/usr/bin/env python3
# meyvetabagi dev server — no-store cache headers so Safari NEVER shows stale CSS/JS modules.
import http.server, os

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

print('→ app: http://localhost:8080/web/app.html  (cache disabled — plain reload is always fresh)')
http.server.ThreadingHTTPServer(('', 8080), NoCache).serve_forever()
