from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve as static_serve
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/academy/', include('academy.urls')),
    path('api/quiz/', include('quiz.urls')),
    path('api/battle/', include('battle.urls')),
    path('api/coin/', include('coin.urls')),
    path('api/post/', include('post.urls')),
    path('api/kurator/', include('kurator.urls')),
]

# Media fayllar (har doim)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# =============================================================
# Frontend (Vite build) - React SPA serve qilish
# =============================================================
# Frontend'da hosil bo'lgan fayllar: backend/frontend_build/{index.html, assets/...}
FRONTEND_BUILD_DIR = os.path.join(settings.BASE_DIR, 'frontend_build')

# 1) Frontend assetlari (CSS/JS/images) - /assets/... URL'lar
#    Vite default ravishda /assets/ ga chiqaradi. WhiteNoise ham serve qiladi,
#    lekin aniq URL routing ham qilib qo'yamiz (xatoga chidamli)
if os.path.isdir(os.path.join(FRONTEND_BUILD_DIR, 'assets')):
    urlpatterns += [
        re_path(r'^assets/(?P<path>.*)$', static_serve,
                {'document_root': os.path.join(FRONTEND_BUILD_DIR, 'assets')}),
    ]

# 2) Root URL "/" -> frontend index.html
# 3) SPA fallback: har qanday "/dashboard", "/login" kabi URL ham index.html ga
#    (API, admin, media, static, assets bundan mustasno)
index_view = TemplateView.as_view(template_name='index.html')

urlpatterns += [
    re_path(r'^$', index_view, name='home'),
    re_path(
        r'^(?!api/|admin/|media/|static/|assets/).*$',
        index_view,
        name='frontend'
    ),
]

# Debug rejimida Django'ning static() helperi (WhiteNoise ustidan)
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
