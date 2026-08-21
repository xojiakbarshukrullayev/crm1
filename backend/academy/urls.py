from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'groups', views.GroupViewSet)
router.register(r'group-students', views.GroupStudentViewSet)
router.register(r'attendances', views.AttendanceViewSet)
router.register(r'homeworks', views.HomeworkViewSet)
router.register(r'submissions', views.HomeworkSubmissionViewSet)
router.register(r'lessons', views.LessonViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
