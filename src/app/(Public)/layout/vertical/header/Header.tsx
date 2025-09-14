// src/components/layout/public/Header.tsx

import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material/styles';
import { IconMenu2 } from '@tabler/icons-react';
import { Button, Container, Divider, Drawer, List, ListItemButton, ListItemText, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import PublicSearch from './Search';
import { useSession } from 'next-auth/react';
import Profile from './Profile';

// Links de navegação para a área pública
const publicNavLinks = [
  { title: 'Home', href: '/' },
  { title: 'Recursos', href: '/features' },
  { title: 'Preços', href: '/pricing' },
  { title: 'Contato', href: '/contact' },
];

const PublicHeader = () => {
  const theme = useTheme();
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down('lg'));
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();


  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    minHeight: '70px', // Altura padrão do cabeçalho
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <Container maxWidth="lg">
        <ToolbarStyled>
          {/* Logo */}
          <Box sx={{ flexShrink: 0, mr: 2 }}>
            
          {/* Logo */}
          <Typography
            variant="h4"
            component={Link}
            href="/"
            sx={{
              textDecoration: 'none',
              color: theme.palette.primary.main,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            MagicBox
          </Typography>
          </Box>
          
          <Box flexGrow={1} />

          {/* Navegação para Desktop */}
          {lgUp && (
            <Stack direction="row" spacing={1}>
              {publicNavLinks.map((link) => (
                <Button 
                  key={link.title} 
                  color="inherit" 
                  component={Link} 
                  href={link.href}
                  sx={{ textTransform: 'none', fontSize: '1rem' }}
                >
                  {link.title}
                </Button>
              ))}
            </Stack>
          )}

          <Box flexGrow={1} />

          {/* Ações da Direita (Busca e Autenticação) */}
          <Stack spacing={1} direction="row" alignItems="center">
            <PublicSearch />
            
            {status === 'authenticated' ? (
              <Profile />
            ) : (
              <>
                <Button variant="text" color="primary" component={Link} href="/auth/auth1/login">
                  Login
                </Button>
                <Button variant="contained" color="primary" component={Link} href="/auth/register">
                  Cadastre-se
                </Button>
              </>
            )}
          </Stack>

          {/* Botão de Menu para Mobile */}
          {lgDown && (
            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ ml: 1 }}
            >
              <IconMenu2 size="24" />
            </IconButton>
          )}
        </ToolbarStyled>
      </Container>
      
      {/* Drawer (Menu Lateral) para Mobile */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <List>
            {publicNavLinks.map((link) => (
              <ListItemButton key={link.title} component={Link} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                <ListItemText primary={link.title} />
              </ListItemButton>
            ))}
             <Divider sx={{ my: 1 }} />
             {status !== 'authenticated' && (
              <>
                <ListItemButton component={Link} href="/auth/auth1/login" onClick={() => setMobileMenuOpen(false)}>
                  <ListItemText primary="Login" />
                </ListItemButton>
                <ListItemButton component={Link} href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <ListItemText primary="Cadastre-se" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBarStyled>
  );
};

export default PublicHeader;