from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Role & Jurisdiction", {"fields": ("role", "department", "district")}),
    )
    list_display = ("username", "email", "role", "district", "is_staff")