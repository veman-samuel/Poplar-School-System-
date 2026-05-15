from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, StaffProfile, ClassGroup, Subject, Student,
    SchemeOfWork, Homework, HomeworkSubmission, StudentGrade,
    AttendanceLog, FeeTransaction, InteractiveTest, TestQuestion, TestSubmission
)

# Custom User Admin page configurations
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'phone_number', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Poplar System Roles', {'fields': ('role', 'phone_number')}),
    )


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'section', 'subject_specialty', 'is_active_faculty', 'salary_tier')
    list_filter = ('section', 'is_active_faculty')
    search_fields = ('user__username', 'user__email', 'subject_specialty')


@admin.register(ClassGroup)
class ClassGroupAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'class_teacher')
    list_filter = ('section',)
    search_fields = ('title',)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'class_group', 'assigned_teacher')
    list_filter = ('class_group__section',)
    search_fields = ('name', 'class_group__title')


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'section', 'class_group', 'parent_name', 
        'parent_email', 'enrollment_status', 'fees_due', 'fees_paid'
    )
    list_filter = ('section', 'enrollment_status', 'class_group')
    search_fields = ('name', 'parent_name', 'parent_email', 'id')
    readonly_fields = ('id',)


@admin.register(SchemeOfWork)
class SchemeOfWorkAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'term', 'period_description', 'last_updated')
    list_filter = ('term', 'subject__class_group__section')
    search_fields = ('title', 'subject__name')


@admin.register(FeeTransaction)
class FeeTransactionAdmin(admin.ModelAdmin):
    list_display = ('receipt_no', 'student', 'amount_paid', 'payment_method', 'transaction_date')
    list_filter = ('payment_method', 'transaction_date')
    search_fields = ('receipt_no', 'student__name', 'phone_number_used', 'smart_card_hardware_id')
    readonly_fields = ('id', 'transaction_date')


@admin.register(AttendanceLog)
class AttendanceLogAdmin(admin.ModelAdmin):
    list_display = ('date', 'log_type', 'is_present', 'student', 'staff_user', 'recorded_by')
    list_filter = ('log_type', 'is_present', 'date')
    search_fields = ('student__name', 'staff_user__username', 'staff_user__email')


@admin.register(InteractiveTest)
class InteractiveTestAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'class_group', 'due_date', 'total_points', 'published_status')
    list_filter = ('published_status', 'due_date', 'subject__class_group__section')
    search_fields = ('title', 'subject__name')
