import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// react-router-dom (v7) espera TextEncoder/TextDecoder globales, que jsdom
// no provee en el entorno de test.
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
