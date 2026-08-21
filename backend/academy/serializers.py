from rest_framework import serializers
from .models import Group, GroupStudent, Attendance, Homework, HomeworkSubmission, Lesson


class GroupSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True, default=None)
    kurator_name = serializers.CharField(source='kurator.get_full_name', read_only=True, default=None)
    subject_display = serializers.CharField(source='get_subject_display', read_only=True)
    current_students_count = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'subject', 'subject_display', 'teacher', 'teacher_name',
            'kurator', 'kurator_name', 'room', 'schedule', 'max_students',
            'current_students_count', 'is_full', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class GroupStudentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = GroupStudent
        fields = ['id', 'group', 'student', 'student_name', 'group_name', 'joined_at', 'is_active']
        read_only_fields = ['id', 'joined_at']


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'group', 'group_name',
            'date', 'is_present', 'marked_by', 'marked_by_name',
            'photo', 'note',
        ]
        read_only_fields = ['id']


class HomeworkSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default=None)
    submissions_count = serializers.SerializerMethodField()

    class Meta:
        model = Homework
        fields = [
            'id', 'group', 'group_name', 'title', 'description', 'due_date',
            'created_by', 'created_by_name', 'submissions_count', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_submissions_count(self, obj):
        return obj.submissions.count()


class HomeworkSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    homework_title = serializers.CharField(source='homework.title', read_only=True)

    class Meta:
        model = HomeworkSubmission
        fields = [
            'id', 'homework', 'homework_title', 'student', 'student_name',
            'file', 'answer_text', 'submitted_at', 'grade', 'feedback',
        ]
        read_only_fields = ['id', 'submitted_at']


class LessonSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True, default=None)

    class Meta:
        model = Lesson
        fields = [
            'id', 'group', 'group_name', 'topic', 'description', 'date',
            'teacher', 'teacher_name', 'room', 'materials_text',
        ]
        read_only_fields = ['id']
