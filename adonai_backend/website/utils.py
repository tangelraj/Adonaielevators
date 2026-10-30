def get_client_ip(request):
    """Best-effort client IP for logging - trusts X-Forwarded-For only because
    this app expects to sit behind a reverse proxy in production."""
    if request is None:
        return 'unknown'
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', 'unknown')
