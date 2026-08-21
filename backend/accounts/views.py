from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import User, ParentStudent, TeacherSubject
from .serializers import (
    UserSerializer, UserCreateSerializer, LoginSerializer,
    ChangePasswordSerializer, ParentStudentSerializer,
    TeacherSubjectSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    ordering_fields = ['created_at', 'username', 'coin_balance']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=['get', 'put', 'patch'])
    def profile(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = UserSerializer(user)
            return Response(serializer.data)
        serializer = UserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Password changed successfully.'})

    @action(detail=False, methods=['get'])
    def teachers(self, request):
        teachers = User.objects.filter(role__in=['ustoz', 'qowimcha_ustoz'])
        serializer = UserSerializer(teachers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def students(self, request):
        students = User.objects.filter(role='oquvchi')
        serializer = UserSerializer(students, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def parents(self, request):
        parents = User.objects.filter(role='ota_ona')
        serializer = UserSerializer(parents, many=True)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = UserCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    })


class ParentStudentViewSet(viewsets.ModelViewSet):
    queryset = ParentStudent.objects.select_related('parent', 'student').all()
    serializer_class = ParentStudentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['parent', 'student']
    search_fields = ['parent__username', 'student__username']


class TeacherSubjectViewSet(viewsets.ModelViewSet):
    queryset = TeacherSubject.objects.select_related('teacher').all()
    serializer_class = TeacherSubjectSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['teacher', 'subject']
