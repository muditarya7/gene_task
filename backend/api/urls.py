from django.urls import path
from .views import get_fasta,get_heatmap,download_tsv

urlpatterns = [
    path("get_fasta/", get_fasta, name="get_fasta"),
    path("get_heatmap/",get_heatmap,name ="get_heatmap"),
    path('download_tsv/', download_tsv, name='download_tsv'),

]
