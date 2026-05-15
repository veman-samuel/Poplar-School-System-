from rest_framework import serializers
from .models import (
    User, StaffProfile, ClassGroup, Subject, Student,
    SchemeOfWork, Homework, HomeworkSubmission, StudentGrade,
    AttendanceLog, FeeTransaction, InteractiveTest, TestQuestion, TestSubmission
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number']


class StaffProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = StaffProfile
        fields = ['id', 'user', 'user_details', 'section', 'subject_specialty', 'is_active_faculty', 'salary_tier']


class ClassGroupSerializer(serializers.ModelSerializer):
    class_teacher_name = serializers.CharField(source='class_teacher.get_full_name', read_only=True)

    class Meta:
        model = ClassGroup
        fields = ['id', 'title', 'section', 'class_teacher', 'class_teacher_name']


class SubjectSerializer(serializers.ModelSerializer):
    class_group_details = ClassGroupSerializer(source='class_group', read_only=True)
    assigned_teacher_name = serializers.CharField(source='assigned_teacher.get_full_name', read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'name', 'class_group', 'class_group_details', 'assigned_teacher', 'assigned_teacher_name']


class StudentSerializer(serializers.ModelSerializer):
    class_group_title = serializers.CharField(source='class_group.title', read_only=True)
    outstanding_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'name', 'section', 'class_group', 'class_group_title', 
            'parent', 'parent_name', 'parent_email', 'enrollment_status', 
            'photo', 'attendance_rate', 'fees_due', 'fees_paid', 'outstanding_balance',
            'personalized_strengths', 'personalized_weaknesses', 'learning_preferences'
        ]


class SchemeOfWorkSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class_title = serializers.CharField(source='subject.class_group.title', read_only=True)

    class Meta:
        model = SchemeOfWork
        fields = ['id', 'subject', 'subject_name', 'class_title', 'term', 'title', 'period_description', 'detailed_plan', 'created_at', 'last_updated']


class HomeworkSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = Homework
        fields = ['id', 'subject', 'subject_name', 'title', 'instructions', 'due_date', 'max_score', 'created_at']


class HomeworkSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    homework_title = serializers.CharField(source='homework.title', read_only=True)

    class Meta:
        model = HomeworkSubmission
        fields = ['id', 'homework', 'homework_title', 'student', 'student_name', 'solution_text', 'submitted_at', 'score_achieved', 'teacher_remarks']


class StudentGradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = StudentGrade
        fields = ['id', 'student', 'student_name', 'subject', 'subject_name', 'grade_percentage', 'evaluated_date']


class AttendanceLogSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    staff_name = serializers.CharField(source='staff_user.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='student_subject.name', read_only=True)

    class Meta:
        model = AttendanceLog
        fields = ['id', 'log_type', 'date', 'student_subject', 'subject_name', 'student', 'student_name', 'staff_user', 'staff_name', 'is_present', 'recorded_by']


class FeeTransactionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)

    class Meta:
        model = FeeTransaction
        fields = ['id', 'student', 'student_name', 'amount_paid', 'receipt_no', 'payment_method', 'phone_number_used', 'smart_card_hardware_id', 'transaction_date']


class TestQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestQuestion
        fields = ['id', 'test', 'type', 'text', 'options', 'correct_answer', 'max_points']


class InteractiveTestSerializer(serializers.ModelSerializer):
    questions = TestQuestionSerializer(many=True, read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class_group_title = serializers.CharField(source='class_group.title', read_only=True)

    class Meta:
        model = InteractiveTest
        fields = ['id', 'title', 'description', 'subject', 'subject_name', 'class_group', 'class_group_title', 'due_date', 'total_points', 'created_by', 'published_status', 'questions']


class TestSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    test_title = serializers.CharField(source='test.title', read_only=True)

    class Meta:
        model = TestSubmission
        fields = ['id', 'test', 'test_title', 'student', 'student_name', 'submitted_at', 'answers', 'score_achieved', 'tutor_feedback', 'status']
