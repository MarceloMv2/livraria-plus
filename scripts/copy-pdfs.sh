#!/bin/bash
# Script para copiar PDFs da pasta de origem para a pasta do projeto
# Uso: ./scripts/copy-pdfs.sh /caminho/para/pasta/dos/pdfs

ORIGEM="${1:?Uso: $0 /caminho/para/pasta/dos/pdfs}"
DESTINO="$(dirname "$0")/../pdfs"

if [ ! -d "$ORIGEM" ]; then
    echo "❌ Pasta de origem não encontrada: $ORIGEM"
    exit 1
fi

mkdir -p "$DESTINO"

echo "📚 Copiando PDFs de: $ORIGEM"
echo "📁 Para: $DESTINO"
echo ""

# Copia mantendo a estrutura
cp -rv "$ORIGEM"/*.pdf "$DESTINO/" 2>/dev/null | tail -5
cp -rv "$ORIGEM"/**/*.pdf "$DESTINO/" 2>/dev/null | tail -5

COUNT=$(find "$DESTINO" -name "*.pdf" | wc -l | tr -d ' ')
SIZE=$(du -sh "$DESTINO" | cut -f1)

echo ""
echo "✅ Concluído!"
echo "   📄 $COUNT arquivos PDF copiados"
echo "   💾 Tamanho total: $SIZE"
echo ""
echo "Próximo passo: configure o .env com as credenciais do R2 e execute:"
echo "  npx tsx scripts/upload-pdfs.ts $DESTINO"
