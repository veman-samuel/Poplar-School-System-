from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import HttpResponse
from django.db.models import Sum, Q, Avg
from django.db import transaction as db_transaction
from datetime import date
import random
import csv

from .models import (
    User, StaffProfile, ClassGroup, Subject, Student,
    SchemeOfWork, Homework, HomeworkSubmission, StudentGrade,
    AttendanceLog, FeeTransaction, InteractiveTest, TestQuestion, TestSubmission, SectionType
)

# --- PORTAL WORKSPACE ENTRY POINT VIEW ---
def workspace_view(request):
    current_role = request.GET.get('role', 'Visitor')
    active_student_id = request.GET.get('active_student_id', '')

    students = Student.objects.all()
    teachers = User.objects.filter(role=User.Role.TEACHER)
    classes = ClassGroup.objects.all()
    transactions = FeeTransaction.objects.all().order_by('-transaction_date')
    homeworks = Homework.objects.all()
    tests = InteractiveTest.objects.all()
    grades = StudentGrade.objects.all().order_by('-evaluated_date')
    schemes_of_work = SchemeOfWork.objects.all().order_by('-created_at')
    subjects = Subject.objects.all()

    # Determine default/active student profiles
    current_student = None
    if active_student_id:
        current_student = students.filter(id=active_student_id).first()
    if not current_student and students.exists():
        current_student = students.first()
    
    first_student_id = current_student.id if current_student else ''

    # Local Section Queries (for Coordinators)
    nursery_students = students.filter(section=SectionType.NURSERY)
    primary_students = students.filter(section=SectionType.PRIMARY)
    secondary_students = students.filter(section=SectionType.SECONDARY)

    nursery_classes = classes.filter(section=SectionType.NURSERY)
    primary_classes = classes.filter(section=SectionType.PRIMARY)
    secondary_classes = classes.filter(section=SectionType.SECONDARY)

    nursery_pending = nursery_students.filter(enrollment_status=Student.EnrollmentStatus.PENDING)
    primary_pending = primary_students.filter(enrollment_status=Student.EnrollmentStatus.PENDING)
    secondary_pending = secondary_students.filter(enrollment_status=Student.EnrollmentStatus.PENDING)

    # All Pending approvals
    pending_students = students.filter(enrollment_status=Student.EnrollmentStatus.PENDING)
    approved_students_count = students.filter(enrollment_status=Student.EnrollmentStatus.APPROVED).count()

    # Financial computations:
    total_due = students.aggregate(total=Sum('fees_due'))['total'] or 0.00
    total_paid = students.aggregate(total=Sum('fees_paid'))['total'] or 0.00
    total_outstanding = max(float(total_due) - float(total_paid), 0.00)

    # Format fees
    total_due_formatted = "{:,.0f}".format(total_due)
    total_paid_formatted = "{:,.0f}".format(total_paid)
    total_outstanding_formatted = "{:,.0f}".format(total_outstanding)

    # Let's compute accountant payment gateway metrics
    mtn_total = float(FeeTransaction.objects.filter(payment_method='MM_MTN').aggregate(s=Sum('amount_paid'))['s'] or 0)
    airtel_total = float(FeeTransaction.objects.filter(payment_method='MM_AIRTEL').aggregate(s=Sum('amount_paid'))['s'] or 0)
    mpesa_total = float(FeeTransaction.objects.filter(payment_method='MM_MPESA').aggregate(s=Sum('amount_paid'))['s'] or 0)
    nfc_total = float(FeeTransaction.objects.filter(payment_method='SMART_CARD').aggregate(s=Sum('amount_paid'))['s'] or 0)
    
    overall_total_txns = mtn_total + airtel_total + mpesa_total + nfc_total or 1.0
    mtn_percent = (mtn_total / overall_total_txns) * 100
    airtel_percent = (airtel_total / overall_total_txns) * 100
    mpesa_percent = (mpesa_total / overall_total_txns) * 100
    nfc_percent = (nfc_total / overall_total_txns) * 100

    # Specific child queries for dynamic parent view
    children = students
    current_child = current_student
    child_transactions = transactions.filter(student=current_child) if current_child else []

    context = {
        'current_role': current_role,
        'active_student_id': active_student_id or first_student_id,
        'first_student_id': first_student_id,
        'students': students,
        'teachers': teachers,
        'classes': classes,
        'transactions': transactions,
        'homeworks': homeworks,
        'tests': tests,
        'grades': grades,
        'schemes_of_work': schemes_of_work,
        'subjects': subjects,
        
        'current_student': current_student,
        'children': children,
        'current_child': current_child,
        'child_transactions': child_transactions,

        # Coordinators:
        'nursery_students': nursery_students,
        'primary_students': primary_students,
        'secondary_students': secondary_students,
        'nursery_classes': nursery_classes,
        'primary_classes': primary_classes,
        'secondary_classes': secondary_classes,
        'nursery_pending': nursery_pending,
        'primary_pending': primary_pending,
        'secondary_pending': secondary_pending,
        
        'pending_students': pending_students,
        'approved_students_count': approved_students_count,
        
        # Financials:
        'total_due_formatted': total_due_formatted,
        'total_paid_formatted': total_paid_formatted,
        'total_outstanding_formatted': total_outstanding_formatted,
        'mtn_total': "{:,.0f}".format(mtn_total),
        'airtel_total': "{:,.0f}".format(airtel_total),
        'mpesa_total': "{:,.0f}".format(mpesa_total),
        'nfc_total': "{:,.0f}".format(nfc_total),
        'mtn_percent': round(mtn_percent, 1),
        'airtel_percent': round(airtel_percent, 1),
        'mpesa_percent': round(mpesa_percent, 1),
        'nfc_percent': round(nfc_percent, 1),

        'is_unseeded': not Student.objects.exists()
    }

    return render(request, 'django_version/workspace.html', context)


# --- ADMISSIONS REGISTRATION ---
def submit_admission(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        section = request.POST.get('section')
        parent_name = request.POST.get('parent_name')
        parent_email = request.POST.get('parent_email')
        class_group_id = request.POST.get('class_group_id')
        
        class_group = get_object_or_404(ClassGroup, idx=class_group_id) if ClassGroup.objects.filter(id=class_group_id).exists() else ClassGroup.objects.first()
        
        if not class_group:
            messages.error(request, "Failed to file admission: No active classroom allocations established in database.")
            return redirect('/django-portal/?role=Visitor')

        # Create Student (Status PENDING)
        student = Student.objects.create(
            name=name,
            section=section,
            class_group=class_group,
            parent_name=parent_name,
            parent_email=parent_email,
            enrollment_status=Student.EnrollmentStatus.PENDING,
            fees_due=1200000.00 if section == 'Secondary' else (850000.00 if section == 'Primary' else 650000.00)
        )

        messages.success(request, f"Admissions checklist filed for {student.name}! Credentials logged under physical division: {student.section}.")
    return redirect('/django-portal/?role=Visitor')


# --- AUTHORIZE ENROLLMENT APPROVAL ---
def approve_student(request, student_id):
    if request.method == 'POST':
        student = get_object_or_404(Student, id=student_id)
        role_referrer = request.POST.get('role_referrer', 'Admin')
        
        student.enrollment_status = Student.EnrollmentStatus.APPROVED
        student.save()

        messages.success(request, f"Admission successfully approved! {student.name} fully enrolled into {student.class_group.title}.")
        return redirect(f'/django-portal/?role={role_referrer}')
    return redirect('/django-portal/')


# --- CREATE ACADEMIC CLASSGROUP ---
def create_class(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        section = request.POST.get('section')
        teacher_id = request.POST.get('teacher_id')

        teacher = get_object_or_404(User, id=teacher_id) if teacher_id else None

        course = ClassGroup.objects.create(
            title=title,
            section=section,
            class_teacher=teacher
        )
        messages.success(request, f"Classroom group '{course.title}' created successfully under {course.section} section.")
    return redirect('/django-portal/?role=Admin')


# --- ONBOARD FACULTY TUTOR ---
def onboard_teacher(request):
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        username = request.POST.get('username')
        email = request.POST.get('email')
        specialty = request.POST.get('specialty')
        section = request.POST.get('section')

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username designation already taken!")
            return redirect('/django-portal/?role=Admin')

        with db_transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role=User.Role.TEACHER,
                password='PoplarTutorPassword123'
            )
            StaffProfile.objects.create(
                user=user,
                section=section,
                subject_specialty=specialty,
                salary_tier=2200000.00
            )

        messages.success(request, f"Tutor {user.get_full_name()} onboarded successfully! Lesson Specialty track set to: {specialty}.")
    return redirect('/django-portal/?role=Admin')


# --- LESSON SCHEME OF WORK CREATION ---
def create_sow(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        term = request.POST.get('term')
        subject_id = request.POST.get('subject_id')
        period_description = request.POST.get('period_description')

        subject = get_object_or_404(Subject, id=subject_id)

        SchemeOfWork.objects.create(
            subject=subject,
            term=term,
            title=title,
            period_description=period_description,
            detailed_plan={
                "weeks": [
                    {"week": 1, "topic": "Definitions and Syllabus foundations"},
                    {"week": 2, "topic": "Practical illustrations and interactive tests"},
                    {"week": 3, "topic": "Curriculum milestone examinations"}
                ]
            }
        )
        messages.success(request, f"New Lesson Scheme '{title}' published live under Subject: {subject.name}.")
    return redirect('/django-portal/?role=Teacher')


# --- STUDENT EVALUATION GRADING CARD ---
def update_student_grade(request):
    if request.method == 'POST':
        student_id = request.POST.get('student_id')
        subject_id = request.POST.get('subject_id')
        percentage = request.POST.get('grade_percentage')

        student = get_object_or_454 = get_object_or_404(Student, id=student_id)
        subject = get_object_or_404(Subject, id=subject_id)

        grade, created = StudentGrade.objects.update_or_create(
            student=student,
            subject=subject,
            defaults={'grade_percentage': int(percentage)}
        )
        messages.success(request, f"Classroom evaluation filed! {student.name} score for {subject.name} set to {percentage}%.")
    return redirect('/django-portal/?role=Teacher')


# --- ISSUING ASSIGNMENT HOMEWORK ---
def create_homework(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        subject_id = request.POST.get('subject_id')
        max_score = request.POST.get('max_score')
        due_date = request.POST.get('due_date')
        instructions = request.POST.get('instructions')

        subject = get_object_or_455 = get_object_or_404(Subject, id=subject_id)

        Homework.objects.create(
            subject=subject,
            title=title,
            instructions=instructions,
            due_date=due_date,
            max_score=int(max_score)
        )
        messages.success(request, f"Homework task '{title}' published successfully for core students.")
    return redirect('/django-portal/?role=Teacher')


# --- RECORD ATTENDANCE CHECKLIST ---
def record_bulk_attendance(request):
    if request.method == 'POST':
        present_student_ids = request.POST.getlist('present_students')
        all_student_ids = request.POST.getlist('all_student_ids')

        with db_transaction.atomic():
            for sid in all_student_ids:
                student = Student.objects.filter(id=sid).first()
                if student:
                    is_present = sid in present_student_ids
                    # Record / Update attendance logs
                    AttendanceLog.objects.update_or_create(
                        date=date.today(),
                        student=student,
                        log_type='STU',
                        defaults={
                            'is_present': is_present
                        }
                    )
                    # Recompute student general attendance average (rate)
                    history = student.attendance_history.all()
                    p_cnt = history.filter(is_present=True).count()
                    tot = history.count()
                    if tot > 0:
                        student.attendance_rate = int((p_cnt / tot) * 100)
                        student.save()

        messages.success(request, "Bulk attendance spreadsheet successfully synced & committed to digital registries.")
    return redirect('/django-portal/?role=Teacher')


# --- AUTO-GRADE ONLINE MULTIPLE CHOICE TEST SOLUTIONS ---
def submit_quiz(request, test_id):
    if request.method == 'POST':
        test = get_object_or_404(InteractiveTest, id=test_id)
        student_id = request.POST.get('student_id')
        student = get_object_or_404(Student, id=student_id)

        answers = {}
        score = 0
        total_points = 0

        # Scan for radio values in post response
        for question in test.questions.all():
            total_points += question.max_points
            student_ans = request.POST.get(f"question_{question.id}", "")
            answers[str(question.id)] = student_ans
            
            if student_ans and question.correct_answer and student_ans.strip().upper() == question.correct_answer.strip().upper():
                score += question.max_points

        # File TestSubmission
        sub, created = TestSubmission.objects.update_or_create(
            test=test,
            student=student,
            defaults={
                'answers': answers,
                'score_achieved': score,
                'status': TestSubmission.ReviewStatus.COMPLETED,
                'tutor_feedback': "Graded automatically by Poplar Core Django engine on solve submission."
            }
        )

        messages.success(request, f"Exam cleared! Autograde result for {student.name}: Scored {score}/{total_points} ({round((score/total_points)*100, 1)}%) on '{test.title}'!")
        return redirect(f'/django-portal/?role=Learner&active_student_id={student.id}')
    return redirect('/django-portal/?role=Learner')


# --- PROCESS SCHOOL TUITION FEESTRANSACTION ---
def process_payment(request):
    if request.method == 'POST':
        student_id = request.POST.get('student_id')
        amount = float(request.POST.get('amount', 0))
        method = request.POST.get('payment_method')
        phone = request.POST.get('phone_number_used', '')
        card_id = request.POST.get('smart_card_hardware_id', '')

        student = get_object_or_404(Student, id=student_id)

        with db_transaction.atomic():
            # Ledger updates
            student.fees_paid = float(student.fees_paid) + amount
            student.save()

            # Save unique FeeTransaction event
            receipt = f"TXN-{random.randint(100000, 999999)}"
            FeeTransaction.objects.create(
                student=student,
                amount_paid=amount,
                receipt_no=receipt,
                payment_method=method,
                phone_number_used=phone if method != 'SMART_CARD' else '',
                smart_card_hardware_id=card_id if method == 'SMART_CARD' else ''
            )

        messages.success(request, f"Clearence transaction cleared! Confirmed UGX {amount:,.0f} deposit. Saved Receipt: {receipt}.")
        return redirect(f'/django-portal/?role=Parent&active_student_id={student.id}')
    return redirect('/django-portal/?role=Parent')


# --- TREASURY INDIVIDUAL ADJUSTMENT ---
def adjust_dues(request):
    if request.method == 'POST':
        student_id = request.POST.get('student_id')
        amount = float(request.POST.get('adjustment_amount', 0))
        adj_type = request.POST.get('adjustment_type')

        student = get_object_or_404(Student, id=student_id)

        if adj_type == 'ADD':
            student.fees_due = float(student.fees_due) + amount
            messages.success(request, f"Ledger balanced! UGX {amount:,.0f} successfully billed/charged to {student.name}.")
        else:
            student.fees_due = max(float(student.fees_due) - amount, 0.00)
            messages.success(request, f"Bursary successfully granted! UGX {amount:,.0f} deducted from {student.name} dues.")
        
        student.save()
    return redirect('/django-portal/?role=Accountant')


# --- EXPORT LEDGER ACCOUNT CSV REPORT ---
def export_ledger_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="poplar_financial_records_2026.csv"'

    writer = csv.writer(response)
    writer.writerow(['Student ID', 'Student Name', 'Academic Division', 'ClassGroup title', 'Tuition Fees Due', 'Tuition Fees Paid', 'Dues Outstanding'])

    for slr in Student.objects.all():
        writer.writerow([
            slr.id,
            slr.name,
            slr.section,
            slr.class_group.title,
            slr.fees_due,
            slr.fees_paid,
            slr.outstanding_balance
        ])
    return response


# --- BOOTSTRAP DEMO DATA AND RECORDS SEEDER ---
def seed_demo_data(request):
    if request.method == 'POST':
        with db_transaction.atomic():
            # 1. Clear database to ensure safe seed run
            User.objects.filter(role=User.Role.TEACHER).delete()
            ClassGroup.objects.all().delete()
            Student.objects.all().delete()
            FeeTransaction.objects.all().delete()
            SchemeOfWork.objects.all().delete()
            Homework.objects.all().delete()
            StudentGrade.objects.all().delete()
            InteractiveTest.objects.all().delete()
            TestQuestion.objects.all().delete()

            # Ensure we have active teachers
            teacher_users = [
                ("mar_teacher", "Martin", "Ocen", "Mathematics Specialist", SectionType.PRIMARY),
                ("jan_teacher", "Jane", "Namubiru", "Phonetics & Reading Specialist", SectionType.NURSERY),
                ("dav_teacher", "Davis", "Kakoba", "Calculus & Chemistry Specialist", SectionType.SECONDARY)
            ]
            tutors = []
            for username, fname, lname, specialty, section in teacher_users:
                if not User.objects.filter(username=username).exists():
                    teacher = User.objects.create_user(
                        username=username,
                        email=f"{username}@poplar.ac.ug",
                        first_name=fname,
                        last_name=lname,
                        role=User.Role.TEACHER,
                        password="PoplarTeacherPass123_"
                    )
                    StaffProfile.objects.create(
                        user=teacher,
                        section=section,
                        subject_specialty=specialty,
                        salary_tier=2200000.00
                    )
                    tutors.append(teacher)
                else:
                    tutors.append(User.objects.get(username=username))

            # 2. Add ClassGroups matching 3 sections
            class_records = [
                ("Tiny Tots Nursery A", SectionType.NURSERY, tutors[1]),
                ("Primary 4 Bravo", SectionType.PRIMARY, tutors[0]),
                ("Senior 6 Physics Alpha", SectionType.SECONDARY, tutors[2])
            ]
            classes = []
            for title, section, teacher in class_records:
                course = ClassGroup.objects.create(
                    title=title,
                    section=section,
                    class_teacher=teacher
                )
                classes.append(course)

            # 3. Create Core Subjects
            subjects = [
                Subject.objects.create(name="Phonics & Coloring", class_group=classes[0], assigned_teacher=tutors[1]),
                Subject.objects.create(name="Integrated Arithmetic", class_group=classes[1], assigned_teacher=tutors[0]),
                Subject.objects.create(name="Organic Chemistry & Physics", class_group=classes[2], assigned_teacher=tutors[2])
            ]

            # 4. Generate Students (Nursery, Primary, Secondary)
            students_list = [
                # Nursery
                ("Chloe Namisango", SectionType.NURSERY, classes[0], 650000.00, 300000.00, "Highly visual learner", "Needs guidance with spelling", "Colors and visual cards"),
                # Primary
                ("Moses Kizza", SectionType.PRIMARY, classes[1], 850000.00, 500000.00, "Excellent logical calculator", "Struggles with comprehension passage pacing", "Interactive mathematical flashcards"),
                # Secondary
                ("Angello Ssemwogerere", SectionType.SECONDARY, classes[2], 1200000.00, 1200000.00, "Physics practical model wizard", "Requires rigorous calculus reviews", "Dynamic lab sessions")
            ]
            for name, section, cg, due, paid, strn, weak, pref in students_list:
                Student.objects.create(
                    name=name,
                    section=section,
                    class_group=cg,
                    parent_name=f"Marcus {name.split()[-1]}",
                    parent_email=f"marcus.{name.split()[-1].lower()}@gmail.com",
                    enrollment_status=Student.EnrollmentStatus.APPROVED,
                    fees_due=due,
                    fees_paid=paid,
                    attendance_rate=random.randint(85, 100),
                    personalized_strengths=strn,
                    personalized_weaknesses=weak,
                    learning_preferences=pref,
                    photo=f"https://images.unsplash.com/photo-1544717305-2782549b5136?w=150"
                )

            # Create extra Pending admissions (Buffer)
            Student.objects.create(
                name="Priscilla Nabakoza",
                section=SectionType.PRIMARY,
                class_group=classes[1],
                parent_name="Agnes Nabakoza",
                parent_email="agnes.naba@yahoo.co.ug",
                enrollment_status=Student.EnrollmentStatus.PENDING,
                fees_due=850000.00,
                fees_paid=0.00,
                attendance_rate=100
            )

            # 5. Populate Scheme of Work SOWs
            SchemeOfWork.objects.create(
                subject=subjects[1],
                term="Term 1",
                title="Algebra Decimals & Logic Foundations",
                period_description="4 Months Plan",
                detailed_plan={"weeks": [{"week": 1, "target": "Syllabus foundations"}]}
            )

            # 6. Establish Fee Transactions (Receipt ledger)
            active_students = Student.objects.filter(enrollment_status=Student.EnrollmentStatus.APPROVED)
            if active_students.exists():
                FeeTransaction.objects.create(
                    student=active_students.first(),
                    amount_paid=300000.00,
                    receipt_no="TXN-SAMPLE-MTN-9988",
                    payment_method="MM_MTN",
                    phone_number_used="+256772718222"
                )
                FeeTransaction.objects.create(
                    student=active_students[1],
                    amount_paid=500000.00,
                    receipt_no="TXN-SAMPLE-CARD-4422",
                    payment_method="SMART_CARD",
                    smart_card_hardware_id="POPLAR-CHIP-RFID-77A"
                )

            # 7. Issue Student Grades
            for idx, slr in enumerate(active_students):
                StudentGrade.objects.create(
                    student=slr,
                    subject=subjects[idx % len(subjects)],
                    grade_percentage=random.randint(65, 95)
                )

            # 8. Set Up Homework Task
            Homework.objects.create(
                subject=subjects[1],
                title="Quadratic Fraction Factoring Lesson-2",
                instructions="Derive solutions for the 5 formulas outlined in class notes.",
                due_date="2026-06-30",
                max_score=100
            )

            # 9. Build Interactive Test Quizzes with Questions
            quiz = InteractiveTest.objects.create(
                title="Mid-Term Arithmetic Diagnostics Paper",
                description="This test covers elementary subtraction logic and division models.",
                subject=subjects[1],
                class_group=classes[1],
                due_date=date(2026, 6, 25),
                total_points=30,
                created_by=tutors[0],
                published_status=True
            )
            TestQuestion.objects.create(
                test=quiz,
                type="multiple-choice",
                text="What is the result of 144 / 12?",
                options=["A) 11", "B) 12", "C) 144", "D) 1"],
                correct_answer="B",
                max_points=10
            )
            TestQuestion.objects.create(
                test=quiz,
                type="multiple-choice",
                text="Solve for X: 2x + 10 = 30",
                options=["A) 5", "B) 10", "C) 15", "D) 20"],
                correct_answer="B",
                max_points=10
            )
            TestQuestion.objects.create(
                test=quiz,
                type="multiple-choice",
                text="What is the square root of 64?",
                options=["A) 6", "B) 7", "C) 8", "D) 9"],
                correct_answer="C",
                max_points=10
            )

        messages.success(request, "Poplar School registers seeded with fresh records! Tutors, Classes, and Quizzes deployed.")
    next_url = request.POST.get('next', '/django-portal/')
    return redirect(next_url)
