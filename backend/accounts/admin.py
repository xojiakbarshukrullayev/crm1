from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, ParentStudent, TeacherSubject


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'phone', 'coin_balance', 'is_active')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('CRM Info', {
            'fields': ('role', 'phone', 'avatar', 'coin_balance', 'date_of_birth')
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('CRM Info', {
            'fields': ('role', 'phone', 'date_of_birth')
        }),
    )


@admin.register(ParentStudent)
class ParentStudentAdmin(admin.ModelAdmin):
    list_display = ('parent', 'student')
    search_fields = ('parent__username', 'student__username')


@admin.register(TeacherSubject)
class TeacherSubjectAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'subject')
    list_filter = ('subject',)
    search_fields = ('teacher__username',)
