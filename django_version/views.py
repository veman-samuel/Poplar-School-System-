from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Avg, Q
from django.shortcuts import get_object_or_404
from datetime import date
import random

from .models import (
    User, StaffProfile, ClassGroup, Subject, Student,
    SchemeOfWork, Homework, HomeworkSubmission, StudentGrade,
    AttendanceLog, FeeTransaction, InteractiveTest, TestQuestion, TestSubmission
)
from .serializers import (
    UserSerializer, StaffProfileSerializer, ClassGroupSerializer, SubjectSerializer,
    StudentSerializer, SchemeOfWorkSerializer, HomeworkSerializer, HomeworkSubmissionSerializer,
    StudentGradeSerializer, AttendanceLogSerializer, FeeTransactionSerializer,
    InteractiveTestSerializer, TestSubmissionSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Specific Section Manager Action: Create a Class Teacher account
    @action(detail=False, methods=['post'], url_path='create-teacher')
    def create_teacher(self, request):
        if request.user.role not in [User.Role.ADMIN, User.Role.SECTION_MANAGER]:
            return Response(
                {"detail": "Only Section Managers and Administative staff are authorized to onboard teachers."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password', 'PoplarTeacherPass123_')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        section = request.data.get('section')
        specialty = request.data.get('specialty', 'General Academics')

        if not username or not email or not section:
            return Response(
                {"detail": "Please specify username, email, and target Section level (Nursery, Primary, or Secondary)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response({"detail": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=User.Role.TEACHER
        )

        # Create staff profile
        profile = StaffProfile.objects.create(
            user=user,
            section=section,
            subject_specialty=specialty,
            salary_tier=2200000.00  # Default teacher base salary
        )

        return Response({
            "success": True,
            "user": UserSerializer(user).data,
            "profile_id": profile.id
        }, status=status.HTTP_201_CREATED)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Student.objects.all()
        
        # Parents can only see their registered children
        if user.role == User.Role.PARENT:
            return qs.filter(Q(parent=user) | Q(parent_email__iexact=user.email))
        
        # Students can view their own profile only
        elif user.role == User.Role.STUDENT:
            return qs.filter(name__icontains=user.first_name)
        
        # Section Heads can only see students in their physical section
        elif user.role == User.Role.SECTION_MANAGER:
            profile = getattr(user, 'staff_profile', None)
            if profile and profile.section:
                return qs.filter(section=profile.section)
        
        return qs

    # Section Head Action: Approve a student admitting to a section
    @action(detail=True, methods=['post'], url_path='approve-enrollment')
    def approve_enrollment(self, request, pk=None):
        student = self.get_object_or_404(Student, pk=pk)
        
        # Rule check: Enforce relational sync permission gate
        if request.user.role not in [User.Role.ADMIN, User.Role.SECTION_MANAGER]:
            return Response({"detail": "Insufficient permissions."}, status=status.HTTP_403_FORBIDDEN)

        if request.user.role == User.Role.SECTION_MANAGER:
            profile = getattr(request.user, 'staff_profile', None)
            if profile and profile.section != student.section:
                return Response(
                    {"detail": f"This pupil belongs to {student.section}. You are head of {profile.section}."},
                    status=status.HTTP_403_FORBIDDEN
                )

        student.enrollment_status = Student.EnrollmentStatus.APPROVED
        student.save()

        return Response({
            "success": True, 
            "detail": f"{student.name} enrollment successfully approved & verified inside Poplar School register.",
            "studentStatus": student.enrollment_status
        })

    # Record personalized learning path configuration (AI Adaptive Tuning)
    @action(detail=True, methods=['post'], url_path='update-learning-path')
    def update_learning_path(self, request, pk=None):
        student = self.get_object_or_404(Student, pk=pk)
        
        if request.user.role not in [User.Role.ADMIN, User.Role.SECTION_MANAGER, User.Role.TEACHER]:
            return Response({"detail": "Only verified educators can update paths."}, status=status.HTTP_403_FORBIDDEN)

        student.personalized_strengths = request.data.get('strengths', student.personalized_strengths)
        student.personalized_weaknesses = request.data.get('weaknesses', student.personalized_weaknesses)
        student.learning_preferences = request.data.get('preferences', student.learning_preferences)
        student.save()

        return Response({
            "success": True,
            "detail": f"AI learning pathway for {student.name} updated successfully.",
            "data": {
                "strengths": student.personalized_strengths,
                "weaknesses": student.personalized_weaknesses,
                "preferences": student.learning_preferences
            }
        })


class SchemeOfWorkViewSet(viewsets.ModelViewSet):
    queryset = SchemeOfWork.objects.all()
    serializer_class = SchemeOfWorkSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Quick create: 4 months duration schema validation
    def perform_create(self, serializer):
        if self.request.user.role not in [User.Role.ADMIN, User.Role.TEACHER]:
            raise permissions.exceptions.PermissionDenied("Only active school teaching faculty can initiate schemes of work.")
        serializer.save()


class FeeTransactionViewSet(viewsets.ModelViewSet):
    queryset = FeeTransaction.objects.all()
    serializer_class = FeeTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Custom post for payments: Supports Mobile Money & NFC Smart Card Gateway Clearances
    def create(self, request, *args, **kwargs):
        student_id = request.data.get('student')
        amount = request.data.get('amount')
        method = request.data.get('payment_method')
        phone = request.data.get('phone_number_used')
        card_id = request.data.get('smart_card_hardware_id')

        if not student_id or not amount or not method:
            return Response({"detail": "Missing target student ID reference or payment amount descriptor."}, status=status.HTTP_400_BAD_REQUEST)

        student = get_object_or_404(Student, pk=student_id)
        
        # Process and deduct outstanding ledger balances
        amount_paid = float(amount)
        student.fees_paid = float(student.fees_paid) + amount_paid
        student.save()

        # Save payment transaction events log
        receipt = f"TXN-{random.randint(100000, 999999)}"
        txn = FeeTransaction.objects.create(
            student=student,
            amount_paid=amount,
            receipt_no=receipt,
            payment_method=method,
            phone_number_used=phone,
            smart_card_hardware_id=card_id
        )

        return Response({
            "success": True,
            "receipt_no": txn.receipt_no,
            "student_name": student.name,
            "fees_due_remaining": float(student.outstanding_balance),
            "fees_paid_cumulative": float(student.fees_paid)
        }, status=status.HTTP_201_CREATED)


class AttendanceLogViewSet(viewsets.ModelViewSet):
    queryset = AttendanceLog.objects.all()
    serializer_class = AttendanceLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Summary analysis for Section Manager and Administrators
    @action(detail=False, methods=['get'], url_path='summarize-attendance')
    def summarize_attendance(self, request):
        target_section = request.query_params.get('section')
        logs = AttendanceLog.objects.filter(log_type='STU')
        
        if target_section:
            logs = logs.filter(student__section=target_section)

        total_records = logs.count()
        presents = logs.filter(is_present=True).count()
        absents = logs.filter(is_present=False).count()

        attendance_ratio = (presents / total_records * 100) if total_records > 0 else 100.0

        return Response({
            "section": target_section or "Global Unified Registry",
            "total_records": total_records,
            "presents": presents,
            "absents": absents,
            "overall_attendance_rate": round(attendance_ratio, 2)
        })


class HomeworkViewSet(viewsets.ModelViewSet):
    queryset = Homework.objects.all()
    serializer_class = HomeworkSerializer
    permission_classes = [permissions.IsAuthenticated]


class InteractiveTestViewSet(viewsets.ModelViewSet):
    queryset = InteractiveTest.objects.all()
    serializer_class = InteractiveTestSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Score submittor actions
    @action(detail=True, methods=['post'], url_path='submit-solutions')
    def submit_solutions(self, request, pk=None):
        test = self.get_object_or_404(InteractiveTest, pk=pk)
        student_id = request.data.get('student_id')
        answers = request.data.get('answers', {})

        student = get_object_or_404(Student, pk=student_id)

        # Basic AI / Auto-grading of MCQ responses
        score = 0
        total_max = 0
        for q in test.questions.all():
            total_max += q.max_points
            student_choice = answers.get(str(q.id))
            if student_choice and q.correct_answer and student_choice.strip().lower() == q.correct_answer.strip().lower():
                score += q.max_points

        submission = TestSubmission.objects.create(
            test=test,
            student=student,
            answers=answers,
            score_achieved=score,
            status=TestSubmission.ReviewStatus.COMPLETED if total_max > 0 else TestSubmission.ReviewStatus.PENDING,
            tutor_feedback="Auto-graded by Poplar Core engine."
        )

        return Response({
            "success": True,
            "score": score,
            "out_of": total_max,
            "status": submission.status
        })
