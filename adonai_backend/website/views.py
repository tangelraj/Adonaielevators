from django.core.mail import EmailMessage
from django.conf import settings
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import ScopedRateThrottle
from .models import HeroSection, Enquiry
from .serializers import HeroSerializer, EnquirySerializer
from .captcha import generate_captcha

class HeroAPIView(APIView):
    def get(self, request):
        hero = HeroSection.objects.first()
        serializer = HeroSerializer(hero)
        return Response(serializer.data)

class CaptchaAPIView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'captcha'

    def get(self, request):
        question, token = generate_captcha()
        return Response({"question": question, "token": token})

class EnquiryAPIView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'enquiry'

    def post(self, request):
        serializer = EnquirySerializer(data=request.data)
        if serializer.is_valid():
            enquiry = serializer.save()

            # Send email notification to Adonai Elevators
            subject = f"New Enquiry from {enquiry.name}"
            message = (
                f"New enquiry received:\n\n"
                f"Name: {enquiry.name}\n"
                f"Email: {enquiry.email}\n"
                f"Mobile: {enquiry.mobile}\n"
                f"Message: {enquiry.message}\n"
            )
            try:
                email = EmailMessage(
                    subject=subject,
                    body=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[settings.EMAIL_HOST_USER],
                    reply_to=[enquiry.email],
                )
                email.send(fail_silently=False)
            except Exception:
                # Log full exception with stack trace to the server logs for easier debugging
                logging.exception("Error sending enquiry email")

            return Response(
                {"message": "Enquiry submitted successfully. We will contact you soon."},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
