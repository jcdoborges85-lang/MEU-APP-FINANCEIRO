# Controle Financeiro Pessoal

Um aplicativo web simples e moderno para ajudar no controle das suas finanças pessoais. Desenvolvido com HTML, JavaScript puro (Vanilla JS) e Tailwind CSS (via CDN).

## Funcionalidades

*   **Painel de Resumo:** Visualize rapidamente o seu Saldo Total, Total de Entradas e Total de Saídas.
*   **Gestão de Transações:** Adicione novas transações informando descrição, valor, data, tipo (Receita ou Despesa) e categoria.
*   **Lista Detalhada:** Acompanhe o histórico de transações recentes com formatação de cores por tipo (verde para receitas, vermelho para despesas).
*   **Remoção Simples:** Exclua transações com um único clique.
*   **Persistência de Dados:** Suas informações são salvas automaticamente no `LocalStorage` do seu navegador. Você pode fechar a aba e voltar depois sem perder seus dados.

## Como abrir e usar o app

1.  **Clone ou baixe** este repositório para o seu computador.
2.  **Abra a pasta** onde os arquivos foram salvos.
3.  Dê um **duplo clique no arquivo `index.html`** para abri-lo no seu navegador padrão (Google Chrome, Firefox, Safari, Edge, etc.). *Não é necessário instalar Node.js ou rodar um servidor local para usar o app básico.*
4.  Com o app aberto:
    *   Clique no botão **"+ Nova Transação"** para registrar uma receita ou despesa.
    *   Preencha os dados no formulário que aparecerá na tela e clique em **"Salvar"**.
    *   Observe os valores se atualizarem automaticamente nos cartões principais (Saldo, Entradas, Saídas).
    *   Para excluir um registro, basta clicar no ícone de "lixeira" na tabela de transações.

## Tecnologias Utilizadas

*   HTML5
*   CSS3 (Tailwind CSS via CDN)
*   JavaScript (ES6+)
*   LocalStorage API
