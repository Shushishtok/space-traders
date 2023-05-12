import express from 'express';
import { routes } from './routes';

const app = express();
const port = 3000;

app.use('/', routes);

app.listen(port, () => {
	console.log(`Server is running in port: ${port}`);
});