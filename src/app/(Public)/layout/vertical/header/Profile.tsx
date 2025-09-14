import React, { useState } from 'react';
import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import { useSession, signOut } from "next-auth/react";
import { IconDashboard, IconUser } from '@tabler/icons-react';
import { Stack } from '@mui/system';

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const { data: session } = useSession();

  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
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
          alt={'ProfileImg'}
          sx={{
            width: 35,
            height: 35,
          }}
        />
      </IconButton>
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '250px',
            p: 2,
          },
        }}
      >
        <Typography variant="h6" px={1}>
          Olá, {session?.user?.name?.split(' ')[0] || 'Usuário'}
        </Typography>
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ py: 1, px: 0 }} className="hover-text-primary">
          <Link href="/dashboard">
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                width="45px"
                height="45px"
                bgcolor="primary.light"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink="0"
              >
                <IconDashboard width={24} height={24} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600} color="textPrimary" className="text-hover" noWrap>
                  Painel
                </Typography>
                <Typography color="textSecondary" variant="subtitle2" noWrap>
                  Acessar sua área
                </Typography>
              </Box>
            </Stack>
          </Link>
        </Box>

        <Box mt={2}>
          <Button 
            variant="outlined" 
            color="primary" 
            fullWidth 
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;