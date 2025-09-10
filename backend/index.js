const express = require('express');
const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.send('Olá, mundo! Este é o backend do TeleUp.');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});