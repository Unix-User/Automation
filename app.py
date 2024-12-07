import logging
import logging.config
import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from routes import register_routes
from jinja2 import ChoiceLoader, FileSystemLoader
from interpreter import interpreter

load_dotenv()

logging.config.fileConfig('logging.conf')
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__, 
        static_url_path='/static',
        static_folder='static',
        template_folder='templates'
    )

    template_loader = ChoiceLoader([
        app.jinja_loader,
        FileSystemLoader([
            os.path.join(app.root_path, 'templates'),
            os.path.join(app.root_path, 'templates/macros')
        ])
    ])
    app.jinja_loader = template_loader

    app.config.update(
        OLLAMA_API_BASE=os.getenv('OLLAMA_API_BASE', 'http://localhost:11434'),
        MODEL_NAME=os.getenv('OLLAMA_MODEL_NAME', 'llama3.2'),
        CACHE_TYPE='simple',
        CACHE_DEFAULT_TIMEOUT=300
    )

    try:
        interpreter.offline = True
        interpreter.llm.api_base = os.getenv('OLLAMA_API_BASE', 'http://localhost:11434')
        interpreter.llm.model = f"ollama/{os.getenv('OLLAMA_MODEL_NAME', 'llama3.2')}"
        interpreter.llm.supports_functions = False
        interpreter.llm.context_window = 110000
        interpreter.llm.max_tokens = 4096
        interpreter.auto_run = True
        logger.info("AI agent initialized successfully with model: %s", interpreter.llm.model)

    except Exception as e:
        logger.error("Error initializing AI agent: %s", e)
        raise

    register_routes(app)

    return app

app = create_app()

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message')
        logger.info("Received chat request - Message: \n%s", message)

        response = interpreter.chat(message)

        logger.info("Generated response: %s", response)
        
        # Format response to match chat.js expectations
        if response and len(response) > 0:
            last_message = response[-1]
            return jsonify({
                'response': last_message.get('content', ''),
                'status': 'success'
            })
        else:
            return jsonify({
                'response': '',
                'status': 'success'
            })

    except Exception as e:
        logger.error("Error processing chat request: %s", e)
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
