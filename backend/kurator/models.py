from django.db import models
from django.conf import settings


class KuratorPhoto(models.Model):
    kurator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='kurator_photos',
        limit_choices_to={'role': 'kurator'},
    )
    group = models.ForeignKey(
        'academy.Group',
        on_delete=models.CASCADE,
        related_name='kurator_photos',
    )
    photo = models.ImageField(upload_to='kurator_photos/')
    description = models.TextField(blank=True, default='')
    date = models.DateField()
    students_present = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='photos_present',
    )
    lesson_topic = models.CharField(max_length=200, blank=True, default='')

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Photo by {self.kurator.get_full_name()} - {self.group.name} ({self.date})"


class KuratorReport(models.Model):
    kurator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='kurator_reports',
        limit_choices_to={'role': 'kurator'},
    )
    date = models.DateField()
    report_text = models.TextField()
    groups_covered = models.ManyToManyField(
        'academy.Group',
        blank=True,
        related_name='kurator_reports',
    )

    class Meta:
        ordering = ['-date']
        verbose_name = 'Kurator Report'
        verbose_name_plural = 'Kurator Reports'

    def __str__(self):
        return f"Report by {self.kurator.get_full_name()} ({self.date})"
