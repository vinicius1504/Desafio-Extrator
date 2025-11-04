from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SpreadsheetUploadViewSet, ColumnMappingViewSet, ProductViewSet, MappingTemplateViewSet
from .download_views import ExportDownloadView

router = DefaultRouter()
router.register(r'uploads', SpreadsheetUploadViewSet, basename='upload')
router.register(r'mappings', ColumnMappingViewSet, basename='mapping')
router.register(r'templates', MappingTemplateViewSet, basename='template')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
    # Download endpoints (fora do DRF para evitar problemas com content negotiation)
    path('uploads/<int:pk>/download/', ExportDownloadView.as_view(), name='upload-download'),
]
