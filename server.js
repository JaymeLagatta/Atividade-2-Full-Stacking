require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const app = express();
const port = 3000;

// Configurações do Supabase usando variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Utilize a chave anônima aqui
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Middleware para definir o cabeçalho de codificação
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});



// Serve arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Rota para cadastrar o usuário
app.post('/api/cadastrar', async (req, res) => {
    const { nome, email, telefone, cep, senha } = req.body;

    try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        const enderecoData = response.data;

        if (enderecoData.erro) {
            return res.status(400).json({ error: 'CEP inválido.' });
        }

        const { data, error } = await supabase
            .from('usuario')
            .insert([
                {
                    nome,
                    email,
                    telefone,
                    cep,
                    endereco: enderecoData.logradouro,
                    complemento: enderecoData.complemento,
                    bairro: enderecoData.bairro,
                    cidade: enderecoData.localidade,
                    estado: enderecoData.uf,
                    senha,
                    tipo_acesso: 1,
                },
            ]);

        if (error) {
            console.error('Erro ao inserir usuário:', error);
            return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
        }

        return res.status(201).json({ message: 'Usuário cadastrado com sucesso!', data });
    } catch (err) {
        return res.status(500).json({ error: 'Erro ao processar a requisição.' });
    }
});

// Rota para buscar usuários
app.get('/api/usuarios', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('usuario')
            .select('*'); // Seleciona todos os dados

        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar usuários.' });
        }

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: 'Erro ao processar a requisição.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
