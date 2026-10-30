import logging

from rest_framework import serializers
from .models import HeroSection, Enquiry
from .captcha import verify_and_consume_captcha, CaptchaError
from .utils import get_client_ip

abuse_logger = logging.getLogger('website.abuse')

class HeroSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSection
        fields = ['id', 'title', 'subtitle', 'image']

class EnquirySerializer(serializers.ModelSerializer):
    captcha_token = serializers.CharField(write_only=True)
    captcha_answer = serializers.CharField(write_only=True)

    class Meta:
        model = Enquiry
        fields = ['id', 'name', 'email', 'mobile', 'message', 'created_at', 'captcha_token', 'captcha_answer']
        read_only_fields = ['created_at']

    def validate(self, attrs):
        token = attrs.pop('captcha_token', None)
        answer = attrs.pop('captcha_answer', None)
        try:
            verify_and_consume_captcha(token, answer)
        except CaptchaError as exc:
            abuse_logger.warning(
                "CAPTCHA check failed from %s: %s",
                get_client_ip(self.context.get('request')),
                exc,
            )
            raise serializers.ValidationError({'captcha': str(exc)})
        return attrs
