from django.db import models

class ProteinSequence(models.Model):
    gene_name = models.CharField(max_length=200,unique=True,primary_key=True)
    sequence = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class GeneExpression(models.Model):
    gene_expression = models.ForeignKey(ProteinSequence, on_delete=models.CASCADE, related_name='expressions')
    sample1 = models.IntegerField(blank=True)
    sample2 = models.IntegerField(blank=True)
    sample3 = models.IntegerField(blank=True)
    sample4 = models.IntegerField(blank=True)
    sample5 = models.IntegerField(blank=True)
    sample6 = models.IntegerField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

