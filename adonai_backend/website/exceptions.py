import logging

from rest_framework.exceptions import Throttled
from rest_framework.views import exception_handler as drf_exception_handler

from .utils import get_client_ip

abuse_logger = logging.getLogger('website.abuse')


def custom_exception_handler(exc, context):
    """Wraps DRF's default handler to log throttled requests for abuse tracking."""
    response = drf_exception_handler(exc, context)
    if isinstance(exc, Throttled):
        request = context.get('request')
        view = context.get('view')
        abuse_logger.warning(
            "Throttled request from %s (view=%s)",
            get_client_ip(request),
            view.__class__.__name__ if view else 'unknown',
        )
    return response
