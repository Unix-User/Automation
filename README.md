# Chat App com OpenInterpreter e Ollama

Uma aplicação web moderna que integra o OpenInterpreter com Ollama para fornecer um assistente IA capaz de executar código e manter conversas contextuais.

## 🚀 Características

- **Execução de Código em Tempo Real**: Utilize o OpenInterpreter para executar e analisar código diretamente no chat
- **Processamento Local**: Todos os processos são executados localmente através do Ollama
- **Interface Intuitiva**: Design moderno e responsivo para uma experiência de usuário agradável
- **Streaming de Respostas**: Visualize as respostas sendo geradas em tempo real
- **Suporte a Múltiplos Modelos**: Compatível com diversos modelos disponíveis no Ollama

## 🛠️ Tecnologias Utilizadas

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **IA**: OpenInterpreter, Ollama
- **Estilo**: Bootstrap 5
- **Logging**: Python logging

## 📋 Pré-requisitos

- Python 3.8+
- Ollama instalado e configurado
- OpenInterpreter
- Navegador web moderno

## 🔧 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/Unix-User/Automation.git
   cd Automation
   ```

2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. Inicie o Ollama:
   ```bash
   ollama serve
   ```

5. Execute a aplicação:
   ```bash
   flask run
   ```

## 🎮 Uso

1. Acesse `http://localhost:5000` no seu navegador
2. Inicie uma nova conversa clicando em "Começar Chat"
3. Digite suas mensagens e interaja com o assistente IA

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Weverton** - *Trabalho Inicial* - [@unix-user](https://github.com/unix-user)

## 🎁 Agradecimentos

- OpenInterpreter Team
- Ollama Team
- Todos os contribuidores que dedicaram tempo a este projeto
