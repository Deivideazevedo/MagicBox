import mock from './mock';

// Only configure mock if it's enabled
if (mock) {
  mock.onAny().passThrough();
}
