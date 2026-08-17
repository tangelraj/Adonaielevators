from django.urls import path
from .views import HeroAPIView, EnquiryAPIView

urlpatterns = [
    path('hero/', HeroAPIView.as_view()),
    path('enquiry/', EnquiryAPIView.as_view()),
]
