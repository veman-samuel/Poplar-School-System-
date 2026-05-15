from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    UserViewSet, StudentViewSet, SchemeOfWorkViewSet,
    FeeTransactionViewSet, AttendanceLogViewSet, HomeworkViewSet, InteractiveTestViewSet
)
from .views_ui import (
    workspace_view, submit_admission, approve_student, create_class,
    onboard_teacher, create_sow, update_student_grade, create_homework,
    record_bulk_attendance, submit_quiz, process_payment, adjust_dues,
    export_ledger_csv, seed_demo_data
)

# Initialize standard DRF defaults routing structure
router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'schemes-of-work', SchemeOfWorkViewSet, basename='scheme-of-work')
router.register(r'transactions', FeeTransactionViewSet, basename='transaction')
router.register(r'attendance', AttendanceLogViewSet, basename='attendance')
router.register(r'homework', HomeworkViewSet, basename='homework')
router.register(r'tests', InteractiveTestViewSet, basename='test')

urlpatterns = [
    # REST DRF views
    path('api/v1/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    # Template GUI pages
    path('', workspace_view, name='root_workspace'),
    path('django-portal/', workspace_view, name='django_workspace'),
    path('django-portal/submit-admission/', submit_admission, name='submit_admission'),
    path('django-portal/approve-student/<str:student_id>/', approve_student, name='approve_student'),
    path('django-portal/create-class/', create_class, name='create_class'),
    path('django-portal/onboard-teacher/', onboard_teacher, name='onboard_teacher'),
    path('django-portal/create-sow/', create_sow, name='create_sow'),
    path('django-portal/update-grade/', update_student_grade, name='update_student_grade'),
    path('django-portal/create-homework/', create_homework, name='create_homework'),
    path('django-portal/record-attendance/', record_bulk_attendance, name='record_bulk_attendance'),
    path('django-portal/submit-quiz/<int:test_id>/', submit_quiz, name='submit_quiz'),
    path('django-portal/process-payment/', process_payment, name='process_payment'),
    path('django-portal/adjust-dues/', adjust_dues, name='adjust_dues'),
    path('django-portal/export-csv/', export_ledger_csv, name='export_ledger_csv'),
    path('django-portal/seed/', seed_demo_data, name='seed_demo_data'),
]
