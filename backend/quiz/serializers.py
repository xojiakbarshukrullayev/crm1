from rest_framework import serializers
from .models import Quiz, Question, Choice, QuizResult, StudentQuizAnswer


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'question', 'text', 'is_correct']
        read_only_fields = ['id']


class ChoiceSafeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text']


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'quiz', 'text', 'order', 'choices']
        read_only_fields = ['id']


class QuestionSafeSerializer(serializers.ModelSerializer):
    choices = ChoiceSafeSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'choices']


class QuizSerializer(serializers.ModelSerializer):
    total_questions = serializers.IntegerField(read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True, default=None)
    subject_display = serializers.CharField(source='get_subject_display', read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'subject', 'subject_display', 'group', 'teacher',
            'teacher_name', 'time_limit_minutes', 'passing_score', 'is_active',
            'total_questions', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class QuizDetailSerializer(QuizSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta(QuizSerializer.Meta):
        fields = QuizSerializer.Meta.fields + ['questions']


class StudentQuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentQuizAnswer
        fields = ['id', 'result', 'question', 'chosen_choice', 'is_correct']
        read_only_fields = ['id', 'is_correct']


class QuizResultSerializer(serializers.ModelSerializer):
    answers = StudentQuizAnswerSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    class Meta:
        model = QuizResult
        fields = [
            'id', 'quiz', 'quiz_title', 'student', 'student_name',
            'score', 'total_questions', 'percentage', 'completed_at', 'answers',
        ]
        read_only_fields = ['id', 'completed_at']


class SubmitQuizSerializer(serializers.Serializer):
    answers = serializers.ListField(
        child=serializers.DictField(),
        help_text='List of {question_id, choice_id} dicts'
    )

    def validate_answers(self, value):
        if not value:
            raise serializers.ValidationError('At least one answer is required.')
        return value
