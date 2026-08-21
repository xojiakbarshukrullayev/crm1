from rest_framework import serializers
from .models import KuratorPhoto, KuratorReport


class KuratorPhotoSerializer(serializers.ModelSerializer):
    kurator_name = serializers.CharField(source='kurator.get_full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    students_present_names = serializers.SerializerMethodField()

    class Meta:
        model = KuratorPhoto
        fields = [
            'id', 'kurator', 'kurator_name', 'group', 'group_name',
            'photo', 'description', 'date', 'students_present',
            'students_present_names', 'lesson_topic',
        ]
        read_only_fields = ['id']

    def get_students_present_names(self, obj):
        return [s.get_full_name() for s in obj.students_present.all()]


class KuratorReportSerializer(serializers.ModelSerializer):
    kurator_name = serializers.CharField(source='kurator.get_full_name', read_only=True)
    groups_covered_names = serializers.SerializerMethodField()

    class Meta:
        model = KuratorReport
        fields = [
            'id', 'kurator', 'kurator_name', 'date', 'report_text',
            'groups_covered', 'groups_covered_names',
        ]
        read_only_fields = ['id']

    def get_groups_covered_names(self, obj):
        return [g.name for g in obj.groups_covered.all()]
