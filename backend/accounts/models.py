from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('kurator', 'Kurator'),
        ('ustoz', 'Ustoz'),
        ('qowimcha_ustoz', 'Qowimcha Ustoz'),
        ('intern', 'Intern'),
        ('oquvchi', 'Oquvchi'),
        ('ota_ona', 'Ota-Ona'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='oquvchi')
    phone = models.CharField(max_length=20, blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    coin_balance = models.PositiveIntegerField(default=0)
    date_of_birth = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"


SUBJECT_CHOICES = [
    ('ingliz_tili', 'Ingliz Tili'),
    ('matematika', 'Matematika'),
    ('rus_tili', 'Rus Tili'),
    ('ozbek_tili', 'O\'zbek Tili'),
    ('fizika', 'Fizika'),
    ('kimyo', 'Kimyo'),
    ('biologiya', 'Biologiya'),
    ('tarix', 'Tarix'),
]


class ParentStudent(models.Model):
    parent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='children',
        limit_choices_to={'role': 'ota_ona'}
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='parents',
        limit_choices_to={'role': 'oquvchi'}
    )

    class Meta:
        unique_together = ('parent', 'student')
        verbose_name = 'Parent-Student'
        verbose_name_plural = 'Parent-Student Links'

    def __str__(self):
        return f"{self.parent.get_full_name()} -> {self.student.get_full_name()}"


class TeacherSubject(models.Model):
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='teacher_subjects',
        limit_choices_to={'role__in': ['ustoz', 'qowimcha_ustoz']}
    )
    subject = models.CharField(max_length=20, choices=SUBJECT_CHOICES)

    class Meta:
        unique_together = ('teacher', 'subject')
        verbose_name = 'Teacher Subject'
        verbose_name_plural = 'Teacher Subjects'

    def __str__(self):
        return f"{self.teacher.get_full_name()} - {self.get_subject_display()}"
