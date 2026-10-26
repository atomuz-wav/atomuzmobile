"""
Servidor local de desenvolvimento do site ATOMUZ.

Igual ao `python3 -m http.server`, mas manda o navegador NUNCA guardar
os arquivos em cache. Assim toda alteração em HTML, CSS ou JS aparece ao
recarregar a página, sem precisar de Cmd + Shift + R.

Uso:
  python3 serve.py              só neste computador (http://localhost:5500)
  python3 serve.py --rede       também para celulares no mesmo Wi-Fi
  python3 serve.py 8080         outra porta (combina com --rede)
"""
import http.server
import socket
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def local_ip():
    """Descobre o IP deste computador na rede Wi-Fi (ex.: 192.168.0.12)."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.255.255.255", 1))  # não envia nada; só escolhe a interface de rede
            return s.getsockname()[0]
    except OSError:
        return None


if __name__ == "__main__":
    args = sys.argv[1:]
    lan = "--rede" in args
    numbers = [a for a in args if a.isdigit()]
    port = int(numbers[0]) if numbers else 5500

    # 127.0.0.1 = só este computador; 0.0.0.0 = aceita conexões da rede local
    host = "0.0.0.0" if lan else "127.0.0.1"
    server = http.server.ThreadingHTTPServer((host, port), NoCacheHandler)

    print(f"ATOMUZ rodando em http://localhost:{port}", flush=True)
    if lan:
        ip = local_ip()
        if ip:
            print(f"No celular (mesmo Wi-Fi), abra:  http://{ip}:{port}", flush=True)
        else:
            print("Não encontrei o IP da rede. Veja em Ajustes do Sistema > Wi-Fi > Detalhes.", flush=True)
    print("Ctrl + C para parar", flush=True)
    server.serve_forever()
