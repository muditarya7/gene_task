from django.shortcuts import render
from rest_framework.decorators import api_view
from api.models import ProteinSequence, GeneExpression
from rest_framework.response import Response
from django.http import HttpResponse, JsonResponse
import plotly.graph_objects as map
import pandas as pd


@api_view(['GET'])
def get_fasta(request):
   
    gene_list = [g.strip() for g in request.GET.get('genes', '').split(',') if g.strip()]
    if len(gene_list) > 10:
      return Response("Maximum 10 genes allowed.", status=400)
    
    proteins=ProteinSequence.objects.filter(gene_name__in=gene_list)
    fasta_text=''
    for p in proteins:
        fasta_text += f">{p.gene_name}\n{p.sequence}\n"
    
    
    return HttpResponse(fasta_text, content_type='text/plain; charset=utf-8')

@api_view(['GET'])
def get_heatmap(request):
    raw_genes = request.GET.get('genes', '')
    gene_list = [g.strip() for g in raw_genes.split(',') if g.strip()]
    
    if not gene_list:
        return JsonResponse({'error': 'No gene names provided'}, status=400)
    if len(gene_list) > 10:
        return JsonResponse({'error': 'Maximum 10 genes allowed'}, status=400)
    
    records = GeneExpression.objects.filter(
        gene_expression__gene_name__in=gene_list
    ).values(
        'gene_expression__gene_name',
        'sample1', 'sample2', 'sample3', 'sample4', 'sample5', 'sample6'
    )
    
    if not records:
        return JsonResponse({'error': 'No expression data found for the given genes'}, status=404)
    
    data_frame = pd.DataFrame.from_records(records)
    samples = ['sample1', 'sample2', 'sample3', 'sample4', 'sample5', 'sample6']
    
    heatmap_data = {
        'z': data_frame[samples].values.tolist(),
        'x': samples,
        'y': data_frame['gene_expression__gene_name'].tolist(),
        'type': 'heatmap',
        'colorscale': 'Viridis'
    }
    
    return JsonResponse({'data': heatmap_data})
   
@api_view(['GET'])
def download_tsv(request):
    raw_genes = request.GET.get('genes', '')
    gene_list = [g.strip() for g in raw_genes.split(',') if g.strip()]
    
    if not gene_list:
        return JsonResponse({'error': 'No gene names provided'}, status=400)
    if len(gene_list) > 10:
        return JsonResponse({'error': 'Maximum 10 genes allowed'}, status=400)
    
    records = GeneExpression.objects.filter(
        gene_expression_id__in=gene_list
    ).values('gene_expression_id', 'sample1', 'sample2', 'sample3', 'sample4', 'sample5', 'sample6')

    df = pd.DataFrame.from_records(records)
    tsv_data = df.to_csv(sep='\t', index=False)

    response = HttpResponse(tsv_data, content_type='text/tab-separated-values')
    response['Content-Disposition'] = 'attachment; filename="gene_expression.tsv"'
    return response
 

