import logging
import logging.config
import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.config.fileConfig('logging.conf')
logger = logging.getLogger(__name__)

app = Flask(__name__, 
    static_url_path='/static',
    static_folder='static',
    template_folder='templates'
)

# Load configuration from environment variables
app.config.update(
    OLLAMA_API_BASE=os.getenv('OLLAMA_API_BASE', 'http://localhost:11434'),
    MODEL_NAME=os.getenv('MODEL_NAME', 'codestral')
)

try:
    import interpreter
    
    # Create multiple instances of OpenInterpreter
    agent_1 = interpreter.OpenInterpreter()
    agent_1.offline = True
    agent_1.auto_run = True
    agent_1.llm.model = f"ollama/{app.config['MODEL_NAME']}"
    agent_1.llm.api_base = app.config['OLLAMA_API_BASE']
    agent_1.system_message = "This is agent 1."

    agent_2 = interpreter.OpenInterpreter()
    agent_2.offline = True
    agent_2.auto_run = True
    agent_2.llm.model = f"ollama/{app.config['MODEL_NAME']}"
    agent_2.llm.api_base = app.config['OLLAMA_API_BASE']
    agent_2.system_message = "This is agent 2."
    
    logger.info("AI agents initialized successfully")
except Exception as e:
    logger.error(f"Error initializing AI agents: {e}")
    raise

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['GET', 'POST'])
def chat():
    if request.method == 'POST':
        data = request.get_json()
        prompt = data.get('prompt')
        
        if not prompt:
            return jsonify({
                'error': 'No prompt provided'
            }), 400
            
        try:
            # Process responses from both agents
            response_1 = agent_1.chat(prompt)
            response_2 = agent_2.chat(prompt)
            
            # Clean and format responses
            response_1 = str(response_1).strip() if response_1 else "No response"
            response_2 = str(response_2).strip() if response_2 else "No response"
            
            app.logger.info('Chat processed successfully by multiple agents')
            return jsonify({
                'response_1': response_1,
                'response_2': response_2
            })
        except Exception as e:
            app.logger.error(f'Error processing chat: {e}')
            return jsonify({
                'response_1': f'Error: {str(e)}',
                'response_2': 'Agent unavailable'
            }), 500
    return render_template('chat.html')

if __name__ == '__main__':
    app.run(debug=True)