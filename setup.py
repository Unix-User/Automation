import os
import subprocess
import sys
from pathlib import Path

def create_directory_structure():
    """Create the project directory structure"""
    directories = [
        'static/css',
        'static/js',
        'static/uploads',
        'templates',
        'logs',
        'instance'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"Created directory: {directory}")

def create_virtual_environment():
    """Create and activate virtual environment"""
    if not os.path.exists('venv'):
        print("Creating virtual environment...")
        subprocess.run([sys.executable, '-m', 'venv', 'venv'])
        print("Virtual environment created successfully")
    else:
        print("Virtual environment already exists")

def install_requirements():
    """Install project requirements"""
    pip_cmd = 'venv/Scripts/pip' if sys.platform == 'win32' else 'venv/bin/pip'
    
    print("Installing requirements...")
    requirements = [
        'flask',
        'open-interpreter',
        'python-dotenv',
        'requests',
        'logging'
    ]
    
    # Create requirements.txt
    with open('requirements.txt', 'w') as f:
        for req in requirements:
            f.write(f"{req}\n")
    
    subprocess.run([pip_cmd, 'install', '-r', 'requirements.txt'])
    print("Requirements installed successfully")

def create_env_file():
    """Create .env file with default configuration"""
    if not os.path.exists('.env'):
        env_content = """FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1
OLLAMA_API_BASE=http://localhost:11434
MODEL_NAME=codestral
"""
        with open('.env', 'w') as f:
            f.write(env_content)
        print("Created .env file with default configuration")
    else:
        print(".env file already exists")

def create_env_example():
    """Create .env.example file"""
    env_example = """FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1
OLLAMA_API_BASE=http://localhost:11434
MODEL_NAME=codestral
"""
    with open('.env.example', 'w') as f:
        f.write(env_example)
    print("Created .env.example file")

def setup_logging():
    """Create logging configuration"""
    log_config = """[loggers]
keys=root

[handlers]
keys=consoleHandler,fileHandler

[formatters]
keys=simpleFormatter

[logger_root]
level=INFO
handlers=consoleHandler,fileHandler

[handler_consoleHandler]
class=StreamHandler
level=INFO
formatter=simpleFormatter
args=(sys.stdout,)

[handler_fileHandler]
class=FileHandler
level=INFO
formatter=simpleFormatter
args=('logs/app.log', 'a')

[formatter_simpleFormatter]
format=%(asctime)s - %(name)s - %(levelname)s - %(message)s
"""
    with open('logging.conf', 'w') as f:
        f.write(log_config)
    print("Created logging configuration")

def main():
    """Main setup function"""
    print("Starting project setup...")
    
    # Create directory structure
    create_directory_structure()
    
    # Create virtual environment
    create_virtual_environment()
    
    # Install requirements
    install_requirements()
    
    # Create configuration files
    create_env_file()
    create_env_example()
    setup_logging()
    
    print("\nSetup completed successfully!")
    print("\nTo activate the virtual environment:")
    if sys.platform == 'win32':
        print("    venv\\Scripts\\activate")
    else:
        print("    source venv/bin/activate")
    
    print("\nTo run the application:")
    print("    flask run")

if __name__ == '__main__':
    main() 