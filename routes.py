from flask import jsonify, render_template, request, Blueprint, current_app
from functools import wraps
from config.navigation import get_nav_items
import time
from interpreter import interpreter

# Blueprints para organizar rotas por funcionalidade
main = Blueprint('main', __name__)
chat = Blueprint('chat', __name__)
admin = Blueprint('admin', __name__)

def timer_decorator(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = f(*args, **kwargs)
        current_app.logger.info(f'Route {f.__name__} took {time.time()-start:.2f} seconds')
        return result
    return wrapper

def with_navigation(f):
    """Decorator para adicionar itens de navegação ao contexto"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            # Verifica se usuário está autenticado (implemente sua lógica de auth)
            is_authenticated = False  
            nav_items = get_nav_items(is_authenticated)
            
            # Executa a função original
            result = f(*args, **kwargs)
            
            # Se já é uma resposta HTTP, retorna diretamente
            if isinstance(result, tuple) or hasattr(result, 'status_code'):
                return result
                
            # Se é um dicionário, adiciona nav_items e renderiza o template
            if isinstance(result, dict):
                template_name = result.pop('template', 'index.html')
                result['nav_items'] = nav_items
                return render_template(template_name, **result)
            
            # Se é uma string, assume que é o nome do template
            return render_template(result, nav_items=nav_items)
            
        except Exception as e:
            current_app.logger.error(f'Error in view {f.__name__}: {e}')
            return jsonify({'error': str(e)}), 500
            
    return wrapper

# Rotas principais
@main.route('/')
@with_navigation
@timer_decorator
def index():
    """Rota para a página inicial"""
    try:
        return 'index.html'
    except Exception as e:
        current_app.logger.error(f'Error rendering index: {e}')
        return jsonify({'error': 'Error rendering page'}), 500

# Rotas de chat
@main.route('/chat', methods=['GET'])
@with_navigation
@timer_decorator
def chat_page():
    """Rota para renderizar a página de chat"""
    try:
        return 'chat.html'
    except Exception as e:
        current_app.logger.error(f'Error rendering chat page: {e}')
        return jsonify({'error': 'Error rendering chat page'}), 500

@chat.route('/message', methods=['POST'])
@timer_decorator
def chat_message():
    """Endpoint para processar mensagens do chat"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'No data provided'
            }), 400
            
        prompt = data.get('prompt')
        if not prompt:
            return jsonify({
                'error': 'No prompt provided'
            }), 400
            
        try:
            # Process response from interpreter
            response = ""
            for chunk in current_app.agent.chat(prompt, stream=True):
                if chunk.get('content'):
                    response += chunk['content']
            
            # Clean and format response
            response = response.strip() if response else "No response"
            
            current_app.logger.info('Chat processed successfully')
            return jsonify({
                'response': response,
                'status': 'success'
            })
        except Exception as agent_error:
            current_app.logger.error(f'Agent error: {agent_error}')
            return jsonify({
                'response': 'Desculpe, ocorreu um erro ao processar sua mensagem.',
                'status': 'error'
            }), 500
        
    except Exception as e:
        current_app.logger.error(f'Error processing chat: {e}')
        return jsonify({
            'response': 'Erro interno do servidor',
            'status': 'error'
        }), 500

# Rotas administrativas
@admin.route('/reload-routes', methods=['POST'])
@timer_decorator
def reload_routes():
    """Endpoint para recarregar as rotas"""
    try:
        # Aqui você pode implementar a lógica de recarregamento
        current_app.logger.info("Routes reload requested")
        return jsonify({'message': 'Routes reloaded successfully'})
    except Exception as e:
        current_app.logger.error(f"Error reloading routes: {e}")
        return jsonify({'error': str(e)}), 500

# Rota de verificação de status
@main.route('/health')
def health_check():
    return jsonify({
        'status': 'ok',
        'timestamp': time.time()
    })

@main.route('/api/interpreter', methods=['POST'])
def execute_interpreter():
    try:
        data = request.get_json()
        command = data.get('command')
        
        if not command:
            return jsonify({'error': 'No command provided'}), 400

        # Configura o interpreter
        interpreter.auto_run = True
        interpreter.conversation_history = True
        
        # Executa o comando
        response = interpreter.chat(command)
        
        # Processa a resposta
        return jsonify({
            'command_output': response.get('output', ''),
            'assistant_message': response.get('message', ''),
            'conversation_id': response.get('conversation_id', '')
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def register_routes(app):
    """Função para registrar todos os blueprints e rotas"""
    try:
        # Registra os blueprints
        app.register_blueprint(main)
        app.register_blueprint(chat, url_prefix='/api/chat')
        app.register_blueprint(admin, url_prefix='/admin')
        
        # Registra handler para erros 404
        @app.errorhandler(404)
        def not_found(e):
            return jsonify({
                'error': 'Route not found',
                'path': request.path
            }), 404
        
        # Registra handler para erros 500
        @app.errorhandler(500)
        def server_error(e):
            return jsonify({
                'error': 'Internal server error',
                'details': str(e)
            }), 500
            
        # Adiciona headers CORS
        @app.after_request
        def add_cors_headers(response):
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
            return response
            
        app.logger.info("Routes registered successfully")
        
    except Exception as e:
        app.logger.error(f"Error registering routes: {e}")
        raise