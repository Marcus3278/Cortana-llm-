const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

class OllamaSetup {
    constructor() {
        this.ollamaUrl = 'http://localhost:11434';
        this.recommendedModel = 'llama2:7b-chat';
        this.isWindows = process.platform === 'win32';
        this.isMac = process.platform === 'darwin';
        this.isLinux = process.platform === 'linux';
    }

    async checkOllamaInstalled() {
        return new Promise((resolve) => {
            exec('ollama --version', (error, stdout, stderr) => {
                if (error) {
                    resolve(false);
                } else {
                    console.log('Ollama version:', stdout.trim());
                    resolve(true);
                }
            });
        });
    }

    async checkOllamaRunning() {
        return new Promise((resolve) => {
            const http = require('http');
            const req = http.get('http://localhost:11434/api/tags', (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on('error', () => {
                resolve(false);
            });
            
            req.setTimeout(5000, () => {
                req.destroy();
                resolve(false);
            });
        });
    }

    async downloadOllama() {
        console.log('Downloading Ollama...');
        
        let downloadUrl;
        let filename;
        
        if (this.isWindows) {
            downloadUrl = 'https://ollama.ai/download/windows';
            filename = 'ollama-windows.exe';
        } else if (this.isMac) {
            downloadUrl = 'https://ollama.ai/download/mac';
            filename = 'ollama-mac.zip';
        } else if (this.isLinux) {
            // For Linux, we'll use the install script
            return this.installOllamaLinux();
        }

        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filename);
            
            https.get(downloadUrl, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    // Follow redirect
                    https.get(response.headers.location, (redirectResponse) => {
                        redirectResponse.pipe(file);
                        
                        file.on('finish', () => {
                            file.close();
                            console.log(`Downloaded ${filename}`);
                            console.log('Please run the installer and then restart this setup.');
                            resolve(true);
                        });
                    }).on('error', reject);
                } else {
                    response.pipe(file);
                    
                    file.on('finish', () => {
                        file.close();
                        console.log(`Downloaded ${filename}`);
                        console.log('Please run the installer and then restart this setup.');
                        resolve(true);
                    });
                }
            }).on('error', reject);
        });
    }

    async installOllamaLinux() {
        return new Promise((resolve, reject) => {
            console.log('Installing Ollama on Linux...');
            exec('curl -fsSL https://ollama.ai/install.sh | sh', (error, stdout, stderr) => {
                if (error) {
                    console.error('Error installing Ollama:', error);
                    reject(error);
                } else {
                    console.log('Ollama installed successfully');
                    console.log(stdout);
                    resolve(true);
                }
            });
        });
    }

    async startOllama() {
        return new Promise((resolve, reject) => {
            console.log('Starting Ollama service...');
            
            let command;
            if (this.isWindows) {
                command = 'start ollama serve';
            } else {
                command = 'ollama serve &';
            }
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error starting Ollama:', error);
                    reject(error);
                } else {
                    console.log('Ollama service started');
                    // Wait a moment for the service to start
                    setTimeout(() => resolve(true), 3000);
                }
            });
        });
    }

    async pullModel(modelName = this.recommendedModel) {
        return new Promise((resolve, reject) => {
            console.log(`Pulling model: ${modelName}...`);
            console.log('This may take several minutes depending on your internet connection.');
            
            const pullProcess = exec(`ollama pull ${modelName}`, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error pulling model:', error);
                    reject(error);
                } else {
                    console.log(`Model ${modelName} pulled successfully`);
                    resolve(true);
                }
            });

            // Show progress
            pullProcess.stdout.on('data', (data) => {
                process.stdout.write(data);
            });

            pullProcess.stderr.on('data', (data) => {
                process.stderr.write(data);
            });
        });
    }

    async listModels() {
        return new Promise((resolve, reject) => {
            exec('ollama list', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    console.log('Available models:');
                    console.log(stdout);
                    resolve(stdout);
                }
            });
        });
    }

    async testModel(modelName = this.recommendedModel) {
        return new Promise((resolve, reject) => {
            console.log(`Testing model: ${modelName}...`);
            
            const testPrompt = 'Hello, please respond with a brief greeting.';
            const command = `ollama run ${modelName} "${testPrompt}"`;
            
            exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error testing model:', error);
                    reject(error);
                } else {
                    console.log('Model test successful!');
                    console.log('Response:', stdout.trim());
                    resolve(true);
                }
            });
        });
    }

    async setup() {
        try {
            console.log('🤖 Setting up Ollama for Cortana LLM...\n');

            // Check if Ollama is installed
            const isInstalled = await this.checkOllamaInstalled();
            
            if (!isInstalled) {
                console.log('❌ Ollama is not installed.');
                console.log('📥 Downloading Ollama...');
                await this.downloadOllama();
                console.log('⚠️  Please install Ollama and run this setup again.');
                return false;
            }

            console.log('✅ Ollama is installed');

            // Check if Ollama is running
            const isRunning = await this.checkOllamaRunning();
            
            if (!isRunning) {
                console.log('🚀 Starting Ollama service...');
                await this.startOllama();
                
                // Check again after starting
                const isNowRunning = await this.checkOllamaRunning();
                if (!isNowRunning) {
                    console.log('❌ Failed to start Ollama service. Please start it manually with: ollama serve');
                    return false;
                }
            }

            console.log('✅ Ollama service is running');

            // List current models
            try {
                await this.listModels();
            } catch (error) {
                console.log('No models installed yet.');
            }

            // Pull recommended model if not available
            console.log(`📦 Pulling recommended model: ${this.recommendedModel}`);
            await this.pullModel(this.recommendedModel);

            // Test the model
            console.log('🧪 Testing model...');
            await this.testModel(this.recommendedModel);

            console.log('\n🎉 Ollama setup complete!');
            console.log('🚀 You can now start the Cortana LLM application.');
            console.log('\nTo start the app, run: npm start');

            return true;

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            console.log('\n🔧 Manual setup instructions:');
            console.log('1. Install Ollama from https://ollama.ai');
            console.log('2. Start Ollama: ollama serve');
            console.log('3. Pull a model: ollama pull llama2:7b-chat');
            console.log('4. Test the model: ollama run llama2:7b-chat "Hello"');
            return false;
        }
    }

    async quickSetup() {
        console.log('🚀 Quick setup for development...');
        
        try {
            const isRunning = await this.checkOllamaRunning();
            if (!isRunning) {
                console.log('Starting Ollama...');
                await this.startOllama();
            }

            // Try to pull a smaller, faster model for development
            const devModel = 'llama2:7b-chat';
            console.log(`Pulling development model: ${devModel}`);
            await this.pullModel(devModel);

            console.log('✅ Quick setup complete!');
            return true;
        } catch (error) {
            console.error('Quick setup failed:', error);
            return false;
        }
    }
}

// CLI interface
if (require.main === module) {
    const setup = new OllamaSetup();
    
    const args = process.argv.slice(2);
    const command = args[0] || 'setup';

    switch (command) {
        case 'setup':
            setup.setup();
            break;
        case 'quick':
            setup.quickSetup();
            break;
        case 'check':
            setup.checkOllamaInstalled().then(installed => {
                console.log('Ollama installed:', installed);
                return setup.checkOllamaRunning();
            }).then(running => {
                console.log('Ollama running:', running);
            });
            break;
        case 'models':
            setup.listModels();
            break;
        case 'test':
            setup.testModel(args[1]);
            break;
        default:
            console.log('Usage: node ollama-setup.js [setup|quick|check|models|test]');
    }
}

module.exports = OllamaSetup;
