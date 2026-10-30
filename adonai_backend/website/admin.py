from django.contrib import admin
from .models import HeroSection, Enquiry

admin.site.register(HeroSection)


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'mobile', 'created_at']
    search_fields = ['name', 'email', 'mobile']
    readonly_fields = ['name', 'email', 'mobile', 'message', 'created_at']
    ordering = ['-created_at']
