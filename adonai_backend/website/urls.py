from django.urls import path
from .views import HeroAPIView, EnquiryAPIView, CaptchaAPIView

urlpatterns = [
    path('hero/', HeroAPIView.as_view()),
    path('enquiry/', EnquiryAPIView.as_view()),
    path('captcha/', CaptchaAPIView.as_view()),
]
