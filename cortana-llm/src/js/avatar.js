class CortanaAvatar {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Avatar state
        this.state = 'idle'; // idle, listening, speaking, thinking
        this.animationFrame = 0;
        this.particles = [];
        this.waveform = [];
        
        // Colors
        this.colors = {
            primary: '#00d4ff',
            secondary: '#0099cc',
            accent: '#ff6b6b',
            white: '#ffffff',
            background: 'rgba(255, 255, 255, 0.1)'
        };
        
        // Initialize
        this.init();
        this.animate();
    }
    
    init() {
        // Create initial particles
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
        
        // Initialize waveform data
        for (let i = 0; i < 64; i++) {
            this.waveform.push(0);
        }
    }
    
    setState(newState) {
        this.state = newState;
        
        // Update canvas classes for CSS effects
        this.canvas.className = '';
        if (newState === 'listening') {
            this.canvas.classList.add('listening');
        } else if (newState === 'speaking') {
            this.canvas.classList.add('speaking');
        }
    }
    
    updateWaveform(audioData) {
        if (audioData && audioData.length > 0) {
            // Update waveform with audio data
            for (let i = 0; i < Math.min(this.waveform.length, audioData.length); i++) {
                this.waveform[i] = audioData[i] / 255;
            }
        } else {
            // Decay existing waveform
            for (let i = 0; i < this.waveform.length; i++) {
                this.waveform[i] *= 0.95;
            }
        }
    }
    
    animate() {
        this.animationFrame++;
        this.clear();
        
        switch (this.state) {
            case 'idle':
                this.drawIdleState();
                break;
            case 'listening':
                this.drawListeningState();
                break;
            case 'speaking':
                this.drawSpeakingState();
                break;
            case 'thinking':
                this.drawThinkingState();
                break;
        }
        
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    drawIdleState() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = 80;
        
        // Main circle with gentle pulse
        const pulseRadius = radius + Math.sin(this.animationFrame * 0.02) * 5;
        
        // Gradient
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, pulseRadius
        );
        gradient.addColorStop(0, this.colors.primary + '80');
        gradient.addColorStop(0.7, this.colors.secondary + '40');
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Inner core
        this.ctx.fillStyle = this.colors.primary;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Rotating rings
        this.drawRotatingRings(centerX, centerY, radius);
    }
    
    drawListeningState() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Pulsing outer ring
        const pulseRadius = 100 + Math.sin(this.animationFrame * 0.1) * 20;
        
        this.ctx.strokeStyle = this.colors.primary + '60';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Sound wave visualization
        this.drawSoundWaves(centerX, centerY);
        
        // Central core
        this.ctx.fillStyle = this.colors.primary;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawSpeakingState() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Waveform visualization
        this.ctx.strokeStyle = this.colors.accent;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        const barWidth = this.width / this.waveform.length;
        for (let i = 0; i < this.waveform.length; i++) {
            const barHeight = this.waveform[i] * 100 + 10;
            const x = i * barWidth;
            const y = centerY - barHeight / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        
        // Speaking indicator
        const speakRadius = 40 + Math.sin(this.animationFrame * 0.15) * 10;
        this.ctx.fillStyle = this.colors.accent + '80';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, speakRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawThinkingState() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Thinking dots
        for (let i = 0; i < 3; i++) {
            const angle = (this.animationFrame * 0.05) + (i * Math.PI * 2 / 3);
            const x = centerX + Math.cos(angle) * 50;
            const y = centerY + Math.sin(angle) * 50;
            const size = 8 + Math.sin(this.animationFrame * 0.1 + i) * 3;
            
            this.ctx.fillStyle = this.colors.secondary;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Central processing indicator
        this.ctx.strokeStyle = this.colors.primary;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawRotatingRings(centerX, centerY, baseRadius) {
        const time = this.animationFrame * 0.01;
        
        for (let ring = 0; ring < 3; ring++) {
            const radius = baseRadius + ring * 15;
            const segments = 8 + ring * 4;
            const rotation = time * (ring + 1) * 0.5;
            
            this.ctx.strokeStyle = this.colors.primary + (40 - ring * 10).toString(16);
            this.ctx.lineWidth = 2;
            
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2 + rotation;
                const startAngle = angle - 0.1;
                const endAngle = angle + 0.1;
                
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                this.ctx.stroke();
            }
        }
    }
    
    drawSoundWaves(centerX, centerY) {
        const time = this.animationFrame * 0.05;
        
        for (let wave = 0; wave < 5; wave++) {
            const radius = 60 + wave * 15;
            const opacity = Math.sin(time - wave * 0.5) * 0.3 + 0.4;
            
            this.ctx.strokeStyle = this.colors.primary + Math.floor(opacity * 255).toString(16).padStart(2, '0');
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    drawParticles() {
        // Update and draw floating particles
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.width;
            if (particle.x > this.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.height;
            if (particle.y > this.height) particle.y = 0;
            
            // Draw particle
            this.ctx.fillStyle = this.colors.white + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    // Public methods for external control
    startListening() {
        this.setState('listening');
    }
    
    startSpeaking() {
        this.setState('speaking');
    }
    
    startThinking() {
        this.setState('thinking');
    }
    
    stopAll() {
        this.setState('idle');
    }
}

// Export for use in other modules
window.CortanaAvatar = CortanaAvatar;
