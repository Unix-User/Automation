import logging
import logging.config
import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from routes import register_routes
from jinja2 import ChoiceLoader, FileSystemLoader

# Load environment variables
load_dotenv()

# Configure logging
logging.config.fileConfig('logging.conf')
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__, 
        static_url_path='/static',
        static_folder='static',
        template_folder='templates'
    )

    # Configurar Jinja para procurar templates em múltiplos diretórios
    template_loader = ChoiceLoader([
        app.jinja_loader,
        FileSystemLoader([
            os.path.join(app.root_path, 'templates'),
            os.path.join(app.root_path, 'templates/macros')
        ])
    ])
    app.jinja_loader = template_loader

    # Load configuration from environment variables
    app.config.update(
        OLLAMA_API_BASE=os.getenv('OLLAMA_API_BASE', 'http://localhost:11434'),
        MODEL_NAME=os.getenv('MODEL_NAME', 'codestral'),
        CACHE_TYPE='simple',
        CACHE_DEFAULT_TIMEOUT=300
    )

    try:
        import interpreter
        
        # Create single instance of OpenInterpreter
        agent = interpreter.OpenInterpreter()
        agent.offline = True
        agent.auto_run = True
        agent.llm.model = f"ollama/{app.config['MODEL_NAME']}"
        agent.llm.api_base = app.config['OLLAMA_API_BASE']
        
        # Adiciona o agent ao contexto da aplicação
        app.agent = agent
        
        logger.info("AI agent initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing AI agent: {e}")
        raise

    # Registra as rotas
    register_routes(app)

    return app

app = create_app()

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
            
        # Usa o agente OpenInterpreter para processar a mensagem
        response = app.agent.chat(message)
        
        return jsonify({
            'response': response,
            'status': 'success'
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)