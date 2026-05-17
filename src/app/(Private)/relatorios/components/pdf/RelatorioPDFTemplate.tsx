import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { CategoriaRelatorio, ResumoRelatorio } from '@/core/relatorios/relatorio.dto';
import { format } from 'date-fns';

// Registra fontes (Inter ou similar para visual moderno)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottom: '2px solid #6366F1', // Indigo 500
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1E1B4B', // Indigo 950
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#6B7280', // Gray 500
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  metaText: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#4338CA', // Indigo 700
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#EEF2FF', // Indigo 50
    padding: 6,
    borderRadius: 4,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: '#F9FAFB', // Gray 50
    padding: 12,
    borderRadius: 8,
    border: '1px solid #E5E7EB', // Gray 200
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 10,
    color: '#4B5563', // Gray 600
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827', // Gray 900
    marginTop: 4,
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB', // Gray 300
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 6,
    alignItems: 'center',
  },
  tableColDesc: { width: '40%' },
  tableColNum: { width: '20%', textAlign: 'right' },
  colHeaderText: {
    fontSize: 10,
    fontWeight: 700,
    color: '#4B5563',
  },
  cellTextMain: {
    fontSize: 10,
    fontWeight: 600,
    color: '#1F2937',
  },
  cellText: {
    fontSize: 10,
    color: '#374151',
  },
  cellTextDanger: {
    fontSize: 10,
    color: '#DC2626', // Red 600
    fontWeight: 600,
  },
  cellTextSuccess: {
    fontSize: 10,
    color: '#16A34A', // Green 600
    fontWeight: 600,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #E5E7EB',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 9,
    color: '#9CA3AF',
  },
});

interface RelatorioPDFProps {
  dataInicio: string;
  dataFim: string;
  resumo: ResumoRelatorio;
  categorias: CategoriaRelatorio[];
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

export const RelatorioPDFTemplate = ({ dataInicio, dataFim, resumo, categorias }: RelatorioPDFProps) => {
  const dataGeracao = format(new Date(), "dd/MM/yyyy 'às' HH:mm");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* CABEÇALHO COM FIXO TOP */}
        <View style={styles.header} fixed>
          <View>
            <Text style={styles.headerTitle}>Relatório Financeiro 360º</Text>
            <Text style={styles.headerSubtitle}>
              Período Analisado: {dataInicio} até {dataFim}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.metaText}>Gerado em: {dataGeracao}</Text>
            <Text
              style={styles.metaText}
              render={({ pageNumber, totalPages }) => `Página ${String(pageNumber).padStart(2, '0')}/${String(totalPages).padStart(2, '0')}`}
            />
          </View>
        </View>

        {/* SESSÃO 1: RESUMO EXECUTIVO */}
        <Text style={styles.sectionTitle}>Resumo Executivo</Text>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Saldo Livre</Text>
            <Text style={styles.cardValue}>{formatCurrency(resumo?.saldoLivre || 0)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Saldo Projetado</Text>
            <Text style={styles.cardValue}>{formatCurrency(resumo?.saldoProjetado || 0)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Receitas Alcançadas</Text>
            <Text style={styles.cardValue}>{formatCurrency(resumo?.receitasPagas || 0)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Despesas Pagas</Text>
            <Text style={styles.cardValue}>{formatCurrency(resumo?.despesasPagas || 0)}</Text>
          </View>
        </View>

        {/* SESSÃO 2: ANÁLISE SISTÊMICA (Categorias e Itens) */}
        <Text style={styles.sectionTitle}>Análise Sistêmica</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.tableColDesc}><Text style={styles.colHeaderText}>Categoria / Lançamento</Text></View>
            <View style={styles.tableColNum}><Text style={styles.colHeaderText}>Vlr Estimado</Text></View>
            <View style={styles.tableColNum}><Text style={styles.colHeaderText}>Vlr Realizado</Text></View>
            <View style={styles.tableColNum}><Text style={styles.colHeaderText}>Restante</Text></View>
          </View>

          {categorias.map((cat, i) => (
            <React.Fragment key={cat.id}>
              {/* Linha da Categoria (Mestra) */}
              <View style={[styles.tableRow, { backgroundColor: '#F3F4F6' }]} wrap={false}>
                <View style={styles.tableColDesc}>
                  <Text style={styles.cellTextMain}>{cat.nome}</Text>
                </View>
                <View style={styles.tableColNum}>
                  <Text style={styles.cellText}>{formatCurrency(cat.valorPlanejado)}</Text>
                </View>
                <View style={styles.tableColNum}>
                  <Text style={styles.cellText}>{formatCurrency(cat.valorRealizado)}</Text>
                </View>
                <View style={styles.tableColNum}>
                  <Text style={cat.restante > 0 ? styles.cellTextDanger : cat.restante < 0 ? styles.cellTextSuccess : styles.cellText}>
                    {formatCurrency(cat.restante)}
                  </Text>
                </View>
              </View>

              {/* Itens da Categoria */}
              {(cat.detalhes || []).map((item) => (
                <View style={styles.tableRow} key={item.id} wrap={false}>
                  <View style={[styles.tableColDesc, { paddingLeft: 10 }]}>
                    <Text style={styles.cellText}>• {item.nome}</Text>
                  </View>
                  <View style={styles.tableColNum}>
                    <Text style={styles.cellText}>{formatCurrency(item.valorPlanejado)}</Text>
                  </View>
                  <View style={styles.tableColNum}>
                    <Text style={styles.cellText}>{formatCurrency(item.valorRealizado)}</Text>
                  </View>
                  <View style={styles.tableColNum}>
                    <Text style={item.restante > 0 ? styles.cellTextDanger : item.restante < 0 ? styles.cellTextSuccess : styles.cellText}>
                      {formatCurrency(item.restante)}
                    </Text>
                  </View>
                </View>
              ))}
            </React.Fragment>
          ))}
        </View>

        {/* RODAPÉ GLOBAL COM PAGE NUMBERS E TIMESTAMP */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>MagicBox - Gestão Financeira Inteligente</Text>
          <Text style={styles.footerText}>Documento Estritamente Confidencial</Text>
        </View>
      </Page>
    </Document>
  );
};
