let dadosVisiveis = false; // controle de visibilidade

async function fetchData() {
    const output = document.getElementById('output');

    if (dadosVisiveis) {
        // Se os dados estão visíveis, esconde
        output.style.display = 'none';
        dadosVisiveis = false;
        return;
    }

    try {
        const response = await fetch('/api/usuarios'); // Ajuste na rota de config
        if (!response.ok) {
            throw new Error('Erro ao buscar dados');
        }
        const data = await response.json();
        console.log(data); // verifica se os dados estão sendo retornados

        // limpa o conteúdo
        output.innerHTML = ''; 

        // exibe os dados
        data.forEach(usuario => {
            output.innerHTML += `
                <div>
                    <strong>Nome:</strong> ${usuario.nome}<br>
                    <strong>Email:</strong> ${usuario.email}<br>
                    <strong>Telefone:</strong> ${usuario.telefone}<br>
                    <strong>CEP:</strong> ${usuario.cep}<br>
                    <strong>Endereço:</strong> ${decodeURIComponent(usuario.endereco)}<br>
                    <strong>Bairro:</strong> ${usuario.bairro}<br>
                    <strong>Cidade:</strong> ${usuario.cidade}<br>
                    <strong>Estado:</strong> ${usuario.estado}<br>
                    <hr>
                </div>
            `;
        });

        output.style.display = 'block'; // Exibir os dados
        dadosVisiveis = true; // Atualizar o controle de visibilidade
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

// Adiciona o event listener ao botão
document.getElementById('fetch-button').addEventListener('click', fetchData);
