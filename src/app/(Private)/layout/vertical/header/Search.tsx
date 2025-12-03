import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import {
  IconSearch,
  IconX,
  IconHome,
  IconPlus,
  IconList,
  IconReportAnalytics,
  IconSettings,
  IconCalculator,
  IconCreditCard,
  IconTrendingUp,
  IconCalendar,
  IconWallet,
} from '@tabler/icons-react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  category: string;
  keywords: string[];
}

const Search = () => {
  const [showDrawer2, setShowDrawer2] = useState(false);
  const [search, setSearch] = useState('');

  const handleDrawerClose2 = () => {
    setShowDrawer2(false);
    setSearch('');
  };

  // Dados de busca inteligente para MagicBox
  const searchableData: SearchResult[] = [
    // Páginas principais
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Visão geral das suas finanças',
      href: '/dashboard',
      icon: <IconHome size={20} />,
      category: 'Páginas',
      keywords: ['inicio', 'home', 'painel', 'resumo', 'visao geral'],
    },
    {
      id: 'lancamentos',
      title: 'Lançamentos',
      description: 'Registrar novas transações',
      href: '/dashboard/lancamentos',
      icon: <IconPlus size={20} />,
      category: 'Páginas',
      keywords: ['transacao', 'gasto', 'receita', 'pagamento', 'novo'],
    },
    {
      id: 'extrato',
      title: 'Extrato',
      description: 'Histórico de transações',
      href: '/dashboard/extrato',
      icon: <IconList size={20} />,
      category: 'Páginas',
      keywords: ['historico', 'lista', 'movimentacao', 'transacoes'],
    },
    {
      id: 'relatorios',
      title: 'Relatórios',
      description: 'Análises e gráficos financeiros',
      href: '/dashboard/relatorios',
      icon: <IconReportAnalytics size={20} />,
      category: 'Páginas',
      keywords: ['graficos', 'analise', 'estatisticas', 'charts'],
    },
    {
      id: 'cadastros',
      title: 'Cadastros',
      description: 'Configurar contas e categorias',
      href: '/dashboard/cadastros',
      icon: <IconSettings size={20} />,
      category: 'Páginas',
      keywords: ['configuracao', 'contas', 'categorias', 'categorias'],
    },
    
    // Ações rápidas
    {
      id: 'nova-despesa',
      title: 'Nova Despesa',
      description: 'Cadastrar nova categoria de despesa',
      href: '/dashboard/cadastros?tab=categorias',
      icon: <IconWallet size={20} />,
      category: 'Ações',
      keywords: ['despesa', 'categoria', 'novo', 'cadastrar'],
    },
    {
      id: 'nova-conta',
      title: 'Nova Conta',
      description: 'Adicionar conta financeira',
      href: '/dashboard/cadastros?tab=contas',
      icon: <IconCreditCard size={20} />,
      category: 'Ações',
      keywords: ['conta', 'banco', 'cartao', 'financeira'],
    },
    {
      id: 'calculadora',
      title: 'Calculadora Financeira',
      description: 'Ferramentas de cálculo',
      href: '/dashboard/relatorios?view=calculator',
      icon: <IconCalculator size={20} />,
      category: 'Ferramentas',
      keywords: ['calculadora', 'calculo', 'juros', 'parcelas'],
    },
    {
      id: 'metas',
      title: 'Metas Financeiras',
      description: 'Acompanhar objetivos',
      href: '/dashboard?section=goals',
      icon: <IconTrendingUp size={20} />,
      category: 'Ferramentas',
      keywords: ['metas', 'objetivos', 'economia', 'planos'],
    },
  ];

  // Filtro inteligente
  const filteredResults = useMemo(() => {
    if (!search.trim()) return searchableData.slice(0, 6); // Mostra os 6 primeiros se não houver busca

    const searchLower = search.toLowerCase();
    
    return searchableData.filter(item => {
      // Busca no título
      if (item.title.toLowerCase().includes(searchLower)) return true;
      
      // Busca na descrição
      if (item.description.toLowerCase().includes(searchLower)) return true;
      
      // Busca nas palavras-chave
      if (item.keywords.some(keyword => keyword.includes(searchLower))) return true;
      
      return false;
    }).sort((a, b) => {
      // Prioriza resultados que começam com a busca
      const aStartsWithSearch = a.title.toLowerCase().startsWith(searchLower);
      const bStartsWithSearch = b.title.toLowerCase().startsWith(searchLower);
      
      if (aStartsWithSearch && !bStartsWithSearch) return -1;
      if (!aStartsWithSearch && bStartsWithSearch) return 1;
      
      return 0;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Agrupar por categoria
  const groupedResults = useMemo(() => {
    const groups: { [key: string]: SearchResult[] } = {};
    
    filteredResults.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    
    return groups;
  }, [filteredResults]);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Páginas': '#5D87FF',
      'Ações': '#13DEB9',
      'Ferramentas': '#FA896B',
    };
    return colors[category] || '#757575';
  };

  return (
    <>
      <IconButton
        aria-label="buscar"
        color="inherit"
        aria-controls="search-menu"
        aria-haspopup="true"
        onClick={() => setShowDrawer2(true)}
        size="large"
        sx={{
          background: 'rgba(93, 135, 255, 0.1)',
          '&:hover': {
            background: 'rgba(93, 135, 255, 0.2)',
          },
        }}
      >
        <IconSearch size="18" />
      </IconButton>
      
      <Dialog
        open={showDrawer2}
        onClose={handleDrawerClose2}
        fullWidth
        maxWidth="md"
        aria-labelledby="search-dialog"
        PaperProps={{
          sx: {
            position: 'fixed',
            top: 80,
            m: 0,
            borderRadius: 3,
            maxHeight: '70vh',
          },
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: '#5D87FF20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5D87FF',
              }}
            >
              <IconSearch size={20} />
            </Box>
            <TextField
              id="search-input"
              placeholder="Buscar páginas, ações ou ferramentas..."
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <IconButton size="small" onClick={handleDrawerClose2}>
              <IconX size="20" />
            </IconButton>
          </Stack>
          
          {!search.trim() && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              💡 Dica: Digite palavras como "lançamento", "relatório", "conta" ou "despesa"
            </Typography>
          )}
        </DialogContent>
        
        <Divider />
        
        <Box sx={{ maxHeight: '50vh', overflow: 'auto', p: 2 }}>
          {filteredResults.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhum resultado encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tente buscar por "dashboard", "lançamentos" ou "relatórios"
              </Typography>
            </Box>
          ) : (
            Object.entries(groupedResults).map(([category, items]) => (
              <Box key={category} mb={3}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Chip
                    label={category}
                    size="small"
                    sx={{
                      backgroundColor: `${getCategoryColor(category)}20`,
                      color: getCategoryColor(category),
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {items.length} {items.length === 1 ? 'resultado' : 'resultados'}
                  </Typography>
                </Box>
                
                <List component="nav" disablePadding>
                  {items.map((item) => (
                    <ListItemButton
                      key={item.id}
                      component={Link}
                      href={item.href}
                      onClick={handleDrawerClose2}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: `${getCategoryColor(category)}10`,
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            backgroundColor: `${getCategoryColor(category)}20`,
                            color: getCategoryColor(category),
                          }}
                        >
                          {item.icon}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        secondary={item.description}
                        primaryTypographyProps={{
                          fontWeight: 500,
                        }}
                        secondaryTypographyProps={{
                          fontSize: '0.875rem',
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            ))
          )}
        </Box>
      </Dialog>
    </>
  );
};

export default Search;
