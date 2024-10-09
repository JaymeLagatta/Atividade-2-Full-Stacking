console.log("Servidor está iniciando...");

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
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve arquivos estáticos da pasta public

// Middleware para log de requisição
app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`); // Loga a URL da requisição
    next(); // Chama o próximo middleware
});

// Definir o cabeçalho de codificação
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

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
            .insert([{
                nome,
                email,
                telefone,
                cep,
                endereco: enderecoData.logradouro,
                complemento: enderecoData.complemento,
                bairro: enderecoData.bairro,
                cidade: enderecoData.localidade,
                estado: enderecoData.uf,
                senha, // Considere usar hash para a senha
                tipo_acesso: 1,
            }]);

        if (error) {
            console.error('Erro ao inserir usuário:', error);
            return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
        }

        return res.status(201).json({ message: 'Usuário cadastrado com sucesso!', data });
    } catch (err) {
        console.error('Erro ao processar a requisição:', err);
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
        console.error('Erro ao processar a requisição:', err);
        return res.status(500).json({ error: 'Erro ao processar a requisição.' });
    }
});

// Rota para login 
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const { data: usuario, error } = await supabase
            .from('usuario')
            .select('*')
            .eq('email', email)
            .single(); // Retorna um único usuário com base no email

        if (error || !usuario) {
            return res.status(401).json({ error: 'Usuário não encontrado ou credenciais inválidas.' });
        }

        // Validação simples de senha (idealmente, use hash de senha)
        if (usuario.senha !== senha) {
            return res.status(401).json({ error: 'Senha incorreta.' });
        }

        // Login bem-sucedido
        return res.status(200).json({ message: 'Login bem-sucedido' });
    } catch (err) {
        console.error('Erro ao processar login:', err);
        return res.status(500).json({ error: 'Erro ao processar login.' });
    }
});
// Rota para deletar um usuário
app.delete('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('usuario')
        .delete()
        .eq('id', id);

    if (error) return res.status(400).send(error);
    res.status(204).send();  // No Content
});
// Rota para obter um usuário específico
app.get('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('id', id)
        .single(); // Obtem um único registro

    if (error) return res.status(400).send(error);
    res.json(data); // Retorna os dados em formato JSON
});

// Rota para editar um usuário 
app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone, cep } = req.body;

    const { data, error } = await supabase
        .from('usuario')
        .update({ nome, email, telefone, cep })
        .eq('id', id);

    if (error) return res.status(400).send(error);
    res.send(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
