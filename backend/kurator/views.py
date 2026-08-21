from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import KuratorPhoto, KuratorReport
from .serializers import KuratorPhotoSerializer, KuratorReportSerializer


class KuratorPhotoViewSet(viewsets.ModelViewSet):
    queryset = KuratorPhoto.objects.select_related('kurator', 'group').prefetch_related('students_present').all()
    serializer_class = KuratorPhotoSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['kurator', 'group', 'date']
    search_fields = ['description', 'lesson_topic']
    ordering_fields = ['date']

    def perform_create(self, serializer):
        serializer.save(kurator=self.request.user)

    @action(detail=False, methods=['post'], url_path='upload-photo')
    def upload_photo(self, request):
        serializer = KuratorPhotoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(kurator=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='my-photos')
    def my_photos(self, request):
        photos = KuratorPhoto.objects.filter(kurator=request.user).select_related('group').prefetch_related('students_present')
        serializer = KuratorPhotoSerializer(photos, many=True)
        return Response(serializer.data)


class KuratorReportViewSet(viewsets.ModelViewSet):
    queryset = KuratorReport.objects.select_related('kurator').prefetch_related('groups_covered').all()
    serializer_class = KuratorReportSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['kurator', 'date']
    ordering_fields = ['date']

    def perform_create(self, serializer):
        serializer.save(kurator=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-reports')
    def my_reports(self, request):
        reports = KuratorReport.objects.filter(kurator=request.user).prefetch_related('groups_covered')
        serializer = KuratorReportSerializer(reports, many=True)
        return Response(serializer.data)
