from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Group, GroupStudent, Attendance, Homework, HomeworkSubmission, Lesson
from .serializers import (
    GroupSerializer, GroupStudentSerializer, AttendanceSerializer,
    HomeworkSerializer, HomeworkSubmissionSerializer, LessonSerializer,
)


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.select_related('teacher', 'kurator').all()
    serializer_class = GroupSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['subject', 'teacher', 'kurator']
    search_fields = ['name', 'room']
    ordering_fields = ['created_at', 'name']

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        group = self.get_object()
        students = GroupStudent.objects.filter(group=group, is_active=True).select_related('student')
        serializer = GroupStudentSerializer(students, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_student(self, request, pk=None):
        group = self.get_object()
        student_id = request.data.get('student_id')
        if not student_id:
            return Response({'error': 'student_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if group.is_full:
            return Response({'error': 'Group is full.'}, status=status.HTTP_400_BAD_REQUEST)

        gs, created = GroupStudent.objects.get_or_create(
            group=group, student_id=student_id,
            defaults={'is_active': True}
        )
        if not created:
            gs.is_active = True
            gs.save()
        return Response(GroupStudentSerializer(gs).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def remove_student(self, request, pk=None):
        group = self.get_object()
        student_id = request.data.get('student_id')
        if not student_id:
            return Response({'error': 'student_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            gs = GroupStudent.objects.get(group=group, student_id=student_id)
            gs.is_active = False
            gs.save()
            return Response({'detail': 'Student removed from group.'})
        except GroupStudent.DoesNotExist:
            return Response({'error': 'Student not in group.'}, status=status.HTTP_404_NOT_FOUND)


class GroupStudentViewSet(viewsets.ModelViewSet):
    queryset = GroupStudent.objects.select_related('group', 'student').all()
    serializer_class = GroupStudentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'student', 'is_active']


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('student', 'group', 'marked_by').all()
    serializer_class = AttendanceSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student', 'group', 'date', 'is_present']
    ordering_fields = ['date']

    @action(detail=False, methods=['post'], url_path='bulk-create')
    def bulk_create(self, request):
        attendances_data = request.data.get('attendances', [])
        if not attendances_data:
            return Response({'error': 'attendances list is required.'}, status=status.HTTP_400_BAD_REQUEST)

        created = []
        for data in attendances_data:
            serializer = AttendanceSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save(marked_by=request.user)
            created.append(serializer.data)

        return Response(created, status=status.HTTP_201_CREATED)


class HomeworkViewSet(viewsets.ModelViewSet):
    queryset = Homework.objects.select_related('group', 'created_by').all()
    serializer_class = HomeworkSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['group', 'created_by', 'due_date']
    search_fields = ['title']
    ordering_fields = ['created_at', 'due_date']

    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        homework = self.get_object()
        subs = HomeworkSubmission.objects.filter(homework=homework).select_related('student')
        serializer = HomeworkSubmissionSerializer(subs, many=True)
        return Response(serializer.data)


class HomeworkSubmissionViewSet(viewsets.ModelViewSet):
    queryset = HomeworkSubmission.objects.select_related('homework', 'student').all()
    serializer_class = HomeworkSubmissionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['homework', 'student', 'grade']


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.select_related('group', 'teacher').all()
    serializer_class = LessonSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['group', 'teacher', 'date']
    search_fields = ['topic']
    ordering_fields = ['date']
