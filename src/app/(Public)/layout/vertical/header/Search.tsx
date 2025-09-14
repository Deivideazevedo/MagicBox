// src/components/layout/public/PublicSearch.tsx

import { useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconSearch, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { pageLinks } from './data'; // Importando os dados públicos

// Interface para os links de página
interface LinkType {
  href: string;
  title: string;
}

const PublicSearch = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState('');

  // Filtra os links com base no título
  const filterLinks = (links: LinkType[], searchTerm: string): LinkType[] => {
    if (!searchTerm) {
      return links; // Retorna todos se a busca estiver vazia
    }
    return links.filter((link) =>
      link.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const searchResults = filterLinks(pageLinks, search);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={() => setShowDialog(true)}
        size="large"
      >
        <IconSearch size="20" />
      </IconButton>
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        fullWidth
        maxWidth={'sm'}
        PaperProps={{ sx: { position: 'fixed', top: 30, m: 0 } }}
      >
        <DialogContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              id="public-search"
              placeholder="Pesquisar páginas..."
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <IconButton size="small" onClick={() => setShowDialog(false)}>
              <IconX size="18" />
            </IconButton>
          </Stack>
        </DialogContent>
        <Divider />
        <Box p={2} sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          <Typography variant="h6" p={1}>
            Links Rápidos
          </Typography>
          <List component="nav">
            {searchResults.length > 0 ? (
              searchResults.map((link) => (
                <ListItemButton
                  key={link.title}
                  href={link.href}
                  component={Link}
                  onClick={() => setShowDialog(false)}
                >
                  <ListItemText
                    primary={link.title}
                    secondary={link.href}
                  />
                </ListItemButton>
              ))
            ) : (
                <Typography variant="body2" color="textSecondary" align="center" p={2}>
                    Nenhum resultado encontrado.
                </Typography>
            )}
          </List>
        </Box>
      </Dialog>
    </>
  );
};

export default PublicSearch;