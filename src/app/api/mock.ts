import AxiosMockAdapter from 'axios-mock-adapter';
import axios from '@/utils/axios';

// Only use mock adapter in development environment
const useMock = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_API === 'true';

const mock = useMock ? new AxiosMockAdapter(axios, { delayResponse: 100 }) : null;

export default mock;
