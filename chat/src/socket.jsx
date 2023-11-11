/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-undef */
import {io} from 'socket.io-client';

const URL = process.env.NODE_ENV === 'production' ? undefined: 'http://localhost:3000';

export const socket = io(URL);