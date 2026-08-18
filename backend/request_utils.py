from ipaddress import ip_address

from fastapi import Request


def client_identifier(request: Request) -> str:
    """Return the proxy-provided client IP, falling back to the socket peer."""
    forwarded_for = request.headers.get("x-forwarded-for", "")
    candidates = [
        request.headers.get("x-real-ip", ""),
        forwarded_for.split(",", 1)[0].strip(),
        request.client.host if request.client else "",
    ]

    for candidate in candidates:
        try:
            return str(ip_address(candidate))
        except ValueError:
            continue

    # TestClient and some local ASGI servers use a hostname instead of an IP.
    return (request.client.host if request.client else "unknown")[:128]
