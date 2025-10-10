from django.core.management.base import BaseCommand
from api.models import ProteinSequence, GeneExpression

class Command(BaseCommand):
    help = "Load protein and expression data from FASTA and TSV files"

    def add_arguments(self, parser):
        parser.add_argument('--fasta', type=str, required=True)
        parser.add_argument('--tsv', type=str, required=True)

    def handle(self, *args, **options):
        fasta_path = options['fasta']
        tsv_path = options['tsv']

        with open(fasta_path) as f:
            gene = None
            sequence = ''
            for line in f:
                line = line.strip()
                if line.startswith('>'):
                    if gene and sequence:
                        ProteinSequence.objects.get_or_create(
                            gene_name=gene,
                            defaults={'sequence': sequence}
                        )
                    gene = line[1:]
                    sequence = ''
                else:
                    sequence += line
            if gene and sequence:
                ProteinSequence.objects.get_or_create(
                    gene_name=gene,
                    defaults={'sequence': sequence}
                )

        
        with open(tsv_path) as f:
            header = f.readline().strip().split('\t')
            for line in f:
                parts = line.strip().split('\t')
                gene_name = parts[0]
                samples = [int(x) if x else None for x in parts[1:]]
                try:
                    gene = ProteinSequence.objects.get(gene_name=gene_name)
                    GeneExpression.objects.create(
                        gene_expression=gene,
                        sample1=samples[0],
                        sample2=samples[1],
                        sample3=samples[2],
                        sample4=samples[3],
                        sample5=samples[4],
                        sample6=samples[5],
                    )
                except ProteinSequence.DoesNotExist:
                    self.stdout.write(f"Gene not found: {gene_name}")

        self.stdout.write(self.style.SUCCESS('Data import complete.'))
