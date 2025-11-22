import React, { useState } from 'react';
import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useSession, signOut } from "next-auth/react";
import { 
  IconMail,
  IconUser,
  IconSettings,
  IconHelpCircle,
  IconLogout,
  IconPigMoney,
  IconTrendingUp,
} from '@tabler/icons-react';
import { Stack } from '@mui/system';

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const { data: session } = useSession();

  const profileMenuItems = [
    {
      title: 'Meu Perfil',
      subtitle: 'Configurações da conta',
      href: '/dashboard/perfil',
      icon: <IconUser size={20} />,
      color: '#5D87FF',
    },
    {
      title: 'Metas Financeiras',
      subtitle: 'Acompanhar objetivos',
      href: '/dashboard?section=goals',
      icon: <IconTrendingUp size={20} />,
      color: '#13DEB9',
    },
    {
      title: 'Configurações',
      subtitle: 'Preferências do app',
      href: '/dashboard/configuracoes',
      icon: <IconSettings size={20} />,
      color: '#FA896B',
    },
    {
      title: 'Ajuda & Suporte',
      subtitle: 'Central de ajuda',
      href: '/dashboard/ajuda',
      icon: <IconHelpCircle size={20} />,
      color: '#FFAE1F',
    },
  ];

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="menu do usuário"
        color="inherit"
        aria-controls="profile-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={session?.user?.image || "/images/profile/user-1.jpg"}
          alt="Foto do Perfil"
          sx={{
            width: 36,
            height: 36,
            border: '2px solid',
            borderColor: 'primary.main',
          }}
        />
      </IconButton>
      
      <Menu
        id="profile-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '320px',
            borderRadius: 3,
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Minha Conta
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <Avatar 
              src={session?.user?.image || "/images/profile/user-1.jpg"} 
              alt="Foto do Perfil"
              sx={{ 
                width: 60, 
                height: 60,
                border: '3px solid',
                borderColor: 'primary.main',
              }} 
            />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {session?.user?.name || 'Usuário'}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                display="flex"
                alignItems="center"
                gap={0.5}
                mb={1}
              >
                <IconMail size={16} />
                {session?.user?.email || 'usuario@magicbox.com'}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: '#13DEB920',
                  color: '#13DEB9',
                }}
              >
                <IconPigMoney size={14} />
                <Typography variant="caption" fontWeight={600}>
                  Usuário Premium
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
        
        <Divider />
        
        <Box sx={{ py: 1 }}>
          {profileMenuItems.map((item) => (
            <ListItemButton
              key={item.title}
              component={Link}
              href={item.href}
              onClick={handleClose2}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: `${item.color}15`,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    backgroundColor: `${item.color}20`,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                secondary={item.subtitle}
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                }}
              />
            </ListItemButton>
          ))}
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              textAlign: "center",
              mb: 2,
            }}
          >
            <IconPigMoney size={24} style={{ marginBottom: 8 }} />
            <Typography variant="body2" fontWeight={600} gutterBottom>
              🎉 Parabéns!
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Você está no controle das suas finanças
            </Typography>
          </Box>
          
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<IconLogout size={18} />}
            onClick={() => {
              handleClose2();
              signOut({ callbackUrl: '/' });
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Sair da Conta
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
