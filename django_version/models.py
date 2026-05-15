from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

# --- 1. Custom User Model supporting role-based authentication ---
class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Super Admin'
        SECTION_MANAGER = 'SECTION_MANAGER', 'Section Manager'
        TEACHER = 'TEACHER', 'Teacher'
        STUDENT = 'STUDENT', 'Student'
        PARENT = 'PARENT', 'Parent'
        ACCOUNTANT = 'ACCOUNTANT', 'Accountant'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
        help_text="Role designation within Poplar School System"
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


# --- 2. Sections within Poplar School ---
class SectionType(models.TextChoices):
    NURSERY = 'Nursery', 'Nursery School'
    PRIMARY = 'Primary', 'Primary School'
    SECONDARY = 'Secondary', 'Secondary School'


class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    section = models.CharField(max_length=15, choices=SectionType.choices, blank=True, null=True)
    subject_specialty = models.CharField(max_length=100, blank=True, null=True)
    is_active_faculty = models.BooleanField(default=True)
    salary_tier = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.user.get_role_display()} [{self.section or 'Global'}]"


# --- 3. Academic Structure ---
class ClassGroup(models.Model):
    title = models.CharField(max_length=100, help_text="e.g. Grade 4 Bravo or Tiny Tots")
    section = models.CharField(max_length=15, choices=SectionType.choices)
    class_teacher = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        limit_choices_to={'role': 'TEACHER'},
        null=True, 
        blank=True,
        related_name='assigned_classes'
    )

    class Meta:
        verbose_name = "Class Group"
        unique_together = ('title', 'section')

    def __str__(self):
        return f"{self.title} ({self.section})"


class Subject(models.Model):
    name = models.CharField(max_length=100, help_text="e.g. Mathematics, Literacy, Social Studies")
    class_group = models.ForeignKey(ClassGroup, on_delete=models.CASCADE, related_name='subjects')
    assigned_teacher = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        limit_choices_to={'role': 'TEACHER'},
        null=True, 
        blank=True,
        related_name='taught_subjects'
    )

    def __str__(self):
        return f"{self.name} - {self.class_group.title}"


# --- 4. Students Profiles, Fees Ledger & Enrollment Approvals ---
class Student(models.Model):
    class EnrollmentStatus(models.TextChoices):
        PENDING = 'Pending', 'Admission Pending Approval'
        APPROVED = 'Approved', 'Approved & Enrolled'
        REJECTED = 'Rejected', 'Rejected'

    id = models.CharField(primary_key=True, max_length=50, default=lambda: f"stud-{uuid.uuid4().hex[:4]}")
    name = models.CharField(max_length=150)
    section = models.CharField(max_length=15, choices=SectionType.choices)
    class_group = models.ForeignKey(ClassGroup, on_delete=models.PROTECT, related_name='students')
    parent = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        limit_choices_to={'role': 'PARENT'},
        null=True, 
        blank=True,
        related_name='children'
    )
    parent_name = models.CharField(max_length=150, help_text="Backup cached parent name")
    parent_email = models.EmailField(help_text="Primary notification & receipt matching key")
    
    enrollment_status = models.CharField(
        max_length=15, 
        choices=EnrollmentStatus.choices, 
        default=EnrollmentStatus.PENDING
    )
    photo = models.URLField(max_length=300, default="https://images.unsplash.com/photo-1544717305-2782549b5136?w=150")
    attendance_rate = models.IntegerField(default=100, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Financial ledger states
    fees_due = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    fees_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    # Personalized AI Study Planner recommendations
    personalized_strengths = models.TextField(blank=True, default="Attentive learner")
    personalized_weaknesses = models.TextField(blank=True, default="Needs guided practice")
    learning_preferences = models.TextField(blank=True, default="Visual materials and interactive tests")

    @property
    def outstanding_balance(self):
        return max(self.fees_due - self.fees_paid, 0.00)

    def __str__(self):
        return f"{self.name} ({self.class_group.title}) [{self.enrollment_status}]"


# --- 5. Scheme of Work ---
class SchemeOfWork(models.Model):
    class TermChoices(models.TextChoices):
        TERM_1 = 'Term 1', 'Term 1'
        TERM_2 = 'Term 2', 'Term 2'
        TERM_3 = 'Term 3', 'Term 3'

    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='schemes_of_work')
    term = models.CharField(max_length=10, choices=TermChoices.choices, default=TermChoices.TERM_1)
    title = models.CharField(max_length=150, help_text="e.g. Quad-Month Algebra Foundation & Equations")
    period_description = models.CharField(max_length=100, default="4 Months Scheme Plan", help_text="Must map structural target of 4 months")
    detailed_plan = models.JSONField(
        default=dict,
        help_text="JSON list of weekly targets, curriculum milestones and specific teacher resources"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.subject.name} ({self.term})"


# --- 6. Homework, Hand-ins & Grades Record ---
class Homework(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='homeworks')
    title = models.CharField(max_length=150)
    instructions = models.TextField()
    due_date = models.DateField()
    max_score = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.subject.name}"


class HomeworkSubmission(models.Model):
    homework = models.ForeignKey(Homework, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='homework_submissions')
    solution_text = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    score_achieved = models.IntegerField(null=True, blank=True)
    teacher_remarks = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('homework', 'student')

    def __str__(self):
        return f"HW Submission - {self.student.name} for {self.homework.title}"


# Cache student grades directly per class subject
class StudentGrade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='course_grades')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='grades_list')
    grade_percentage = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    evaluated_date = models.DateField(auto_now=True)

    class Meta:
        unique_together = ('student', 'subject')

    def __str__(self):
        return f"{self.student.name} - {self.subject.name}: {self.grade_percentage}%"


# --- 7. Attendance Log System for Staff & Students ---
class AttendanceLog(models.Model):
    LOG_TYPE_CHOICES = (
        ('STU', 'Student'),
        ('STF', 'Staff'),
    )
    log_type = models.CharField(max_length=3, choices=LOG_TYPE_CHOICES, default='STU')
    date = models.DateField()
    
    # Generic FK relations can be simulated with separate fields for robust SQL query indexes
    student_subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True, related_name='attendance_history')
    staff_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='staff_attendance_history')
    
    is_present = models.BooleanField(default=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='recorded_attendances')

    class Meta:
        unique_together = (('date', 'student', 'student_subject'), ('date', 'staff_user'))

    def __str__(self):
        entity = self.student.name if self.log_type == 'STU' else self.staff_user.get_full_name()
        status = "Present" if self.is_present else "Absent"
        return f"{entity} - {self.date}: {status}"


# --- 8. Mobile Money & Smart Card Payments Ledger ---
class FeeTransaction(models.Model):
    class PaymentProvider(models.TextChoices):
        MOBILE_MONEY_MTN = 'MM_MTN', 'MTN Mobile Money'
        MOBILE_MONEY_AIRTEL = 'MM_AIRTEL', 'Airtel Money'
        MOBILE_MONEY_MPESA = 'MM_MPESA', 'M-Pesa Gateway'
        SMART_CARD = 'SMART_CARD', 'Poplar Smart Badge NFC'
        BANK_TRANSFER = 'BANK_TRANSFER', 'Electronic Bank Ledger'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='fee_transactions')
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    receipt_no = models.CharField(max_length=50, unique=True, help_text="Golden reference serial for physical audits")
    payment_method = models.CharField(max_length=20, choices=PaymentProvider.choices, default=PaymentProvider.MOBILE_MONEY_MPESA)
    phone_number_used = models.CharField(max_length=25, blank=True, null=True, help_text="Mobile money target trace")
    smart_card_hardware_id = models.CharField(max_length=60, blank=True, null=True, help_text="Poplar SmartCard UID tracking")
    transaction_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Receipt {self.receipt_no} - {self.student.name} (Amount: UGX {self.amount_paid})"


# --- 9. Robust Interactive Tests System ---
class InteractiveTest(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='interactive_tests')
    class_group = models.ForeignKey(ClassGroup, on_delete=models.CASCADE, related_name='class_evaluations')
    due_date = models.DateField()
    total_points = models.IntegerField(default=100)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_exams')
    published_status = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} - {self.subject.name}"


class TestQuestion(models.Model):
    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = 'multiple-choice', 'Multiple Choice'
        ONE_WORD = 'one-word', 'One Word'
        ESSAY = 'essay', 'Essay Argumentative'

    test = models.ForeignKey(InteractiveTest, on_delete=models.CASCADE, related_name='questions')
    type = models.CharField(max_length=20, choices=QuestionType.choices)
    text = models.TextField()
    options = models.JSONField(
        default=list, 
        blank=True, 
        help_text="List of choices representing multiple options e.g. ['A) 1962', 'B) 1970', 'C) 1986']"
    )
    correct_answer = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        help_text="Letters representing option A, B, C, D or exact string for one-word response"
    )
    max_points = models.IntegerField(default=10)

    def __str__(self):
        return f"Q: {self.text[:50]}... ({self.get_type_display()})"


class TestSubmission(models.Model):
    class ReviewStatus(models.TextChoices):
        PENDING = 'Pending', 'Tutor Grading Outstanding'
        COMPLETED = 'Completed', 'Scored & Completed'

    test = models.ForeignKey(InteractiveTest, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='test_submissions')
    submitted_at = models.DateTimeField(auto_now_add=True)
    answers = models.JSONField(
        default=dict,
        help_text="Key Value pair representing mapping of { question_id : student_solution }"
    )
    score_achieved = models.IntegerField(null=True, blank=True)
    tutor_feedback = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=15, choices=ReviewStatus.choices, default=ReviewStatus.PENDING)

    class Meta:
        unique_together = ('test', 'student')

    def __str__(self):
        return f"Exam Paper - {self.student.name} - {self.test.title}"
