import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from '@/store/hooks';
import { toggleSidebar, toggleMobileSidebar, setDarkMode } from '@/store/customizer/CustomizerSlice';
import { IconMenu2, IconMoon, IconSun, IconTrendingUp } from '@tabler/icons-react';
import Notifications from './Notification';
import Profile from './Profile';
import Search from './Search';
import { AppState } from '@/store/store';
import Navigation from './Navigation';
import MobileRightSidebar from './MobileRightSidebar';

const Header = () => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down('lg'));

  // drawer
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.divider,
    [theme.breakpoints.up('lg')]: {
      minHeight: customizer.TopbarHeight,
    },
  }));
  
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  // Mock data - em produção viria de APIs
  const quickFinancialData = {
    saldo: 2174.75,
    meta: 85, // percentual da meta alcançada
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        {/* ------------------------------------------- */}
        {/* Toggle Button Sidebar */}
        {/* ------------------------------------------- */}
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={lgUp ? () => dispatch(toggleSidebar()) : () => dispatch(toggleMobileSidebar())}
          sx={{
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'primary.light',
            },
          }}
        >
          <IconMenu2 size="20" />
        </IconButton>

        {/* ------------------------------------------- */}
        {/* Search Dropdown */}
        {/* ------------------------------------------- */}
        <Search />
        
        {lgUp ? (
          <>
            <Navigation />
            
            {/* Quick Financial Info */}
            <Box sx={{ mx: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`Saldo: ${formatCurrency(quickFinancialData.saldo)}`}
                  variant="outlined"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    borderColor: '#13DEB9',
                    color: '#13DEB9',
                    '&:hover': {
                      backgroundColor: '#13DEB920',
                    },
                  }}
                />
                <Chip
                  icon={<IconTrendingUp size={16} />}
                  label={`Meta: ${quickFinancialData.meta}%`}
                  variant="outlined"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    borderColor: '#5D87FF',
                    color: '#5D87FF',
                    '&:hover': {
                      backgroundColor: '#5D87FF20',
                    },
                  }}
                />
              </Stack>
            </Box>
          </>
        ) : null}

        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          
          {/* ------------------------------------------- */}
          {/* Dark/Light Mode Toggle */}
          {/* ------------------------------------------- */}
          <IconButton 
            size="large" 
            color="inherit"
            sx={{
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            }}
          >
            {customizer.activeMode === "light" ? (
              <IconMoon
                size="20"
                stroke="1.5"
                onClick={() => dispatch(setDarkMode("dark"))}
              />
            ) : (
              <IconSun
                size="20"
                stroke="1.5"
                onClick={() => dispatch(setDarkMode("light"))}
              />
            )}
          </IconButton>
          
          <Notifications />
          
          {/* ------------------------------------------- */}
          {/* Toggle Right Sidebar for mobile */}
          {/* ------------------------------------------- */}
          {lgDown ? <MobileRightSidebar /> : null}
          
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
