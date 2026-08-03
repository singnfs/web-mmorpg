/**
 * =========================================================
 * HTML5 MULTIPLAYER MMORPG PROTOTYPE
 * Arsitektur: Monolithic (Node.js + Express + ws + Canvas 2D)
 * =========================================================
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const MAP_SIZE = 1500; // Ukuran dunia game

// ==========================================
// 1. KODE CLIENT (HTML + CSS + Vanilla JS)
// ==========================================
// Berfungsi sebagai UI dan Game Renderer (Canvas 2D)
const CLIENT_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web MMORPG Prototype</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { overflow: hidden; background-color: #222; }
        canvas { display: block; }
        
        /* UI Layer (Overlay di atas Canvas) */
        #ui-layer { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; }
        
        /* Leaderboard */
        #leaderboard {
            position: absolute; top: 15px; right: 15px;
            background: rgba(0, 0, 0, 0.7); color: white;
            padding: 15px; border-radius: 8px; min-width: 200px;
            pointer-events: auto;
        }
        #leaderboard h3 { margin-bottom: 10px; font-size: 16px; border-bottom: 1px solid #555; padding-bottom: 5px; }
        #leaderboard-list { list-style: none; font-size: 14px; }
        #leaderboard-list li { margin-bottom: 5px; display: flex; justify-content: space-between; }
        
        /* Chat Box */
        #chat-container {
            position: absolute; bottom: 15px; left: 15px;
            background: rgba(0, 0, 0, 0.7); width: 350px;
            border-radius: 8px; display: flex; flex-direction: column;
            pointer-events: auto;
        }
        #chat-messages {
            height: 150px; overflow-y: auto; padding: 10px; color: white;
            font-size: 14px; display: flex; flex-direction: column; gap: 5px;
        }
        #chat-input {
            background: rgba(0, 0, 0, 0.5); border: none; border-top: 1px solid #555;
            color: white; padding: 10px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;
            outline: none;
        }
        .msg { word-wrap: break-word; }
        .msg-sys { color: #ffeb3b; font-style: italic; }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <div id="ui-layer">
        <div id="leaderboard">
            <h3>🏆 Leaderboard (Kills)</h3>
            <ul id="leaderboard-list"></ul>
        </div>
        <div id="chat-container">
            <div id="chat-messages"></div>
            <input type="text" id="chat-input" placeholder="Press Enter to chat..." autocomplete="off">
        </div>
    </div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const chatInput = document.getElementById('chat-input');
        const chatMessages = document.getElementById('chat-messages');
        const leaderboardList = document.getElementById('leaderboard-list');

        // Resize Canvas
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Game State (Di-update dari Server)
        let myId = null;
        let players = {};
        let monsters = [];
        let attackEffects = []; // Animasi sabetan pedang
        const camera = { x: 0, y: 0 };

        // Setup WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = protocol + '//' + window.location.host;
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'init') {
                myId = data.id;
            } 
            else if (data.type === 'state') {
                players = data.players;
                monsters = data.monsters;
                updateLeaderboard();
            } 
            else if (data.type === 'chat') {
                addChatMessage(data.name, data.message, data.isSys);
            } 
            else if (data.type === 'attack_anim') {
                // Tambahkan efek visual sabetan di koordinat tertentu
                attackEffects.push({
                    x: data.x, y: data.y, 
                    radius: data.radius, 
                    color: data.color, 
                    life: 15 // Frame umur efek
                });
            }
        };

        // Input & Pergerakan (WASD / Panah)
        const keys = { w: false, a: false, s: false, d: false };

        window.addEventListener('keydown', (e) => {
            if (document.activeElement === chatInput) return; // Abaikan jika sedang ngetik chat
            
            const key = e.key.toLowerCase();
            if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
                let mappedKey = key.replace('arrowup', 'w').replace('arrowdown', 's').replace('arrowleft', 'a').replace('arrowright', 'd');
                if (!keys[mappedKey]) {
                    keys[mappedKey] = true;
                    sendInput();
                }
            } else if (key === ' ') {
                ws.send(JSON.stringify({ type: 'attack' }));
            }
        });

        window.addEventListener('keyup', (e) => {
            if (document.activeElement === chatInput) return;
            const key = e.key.toLowerCase();
            if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
                let mappedKey = key.replace('arrowup', 'w').replace('arrowdown', 's').replace('arrowleft', 'a').replace('arrowright', 'd');
                keys[mappedKey] = false;
                sendInput();
            }
        });

        function sendInput() {
            let dx = 0, dy = 0;
            if (keys.w) dy -= 1;
            if (keys.s) dy += 1;
            if (keys.a) dx -= 1;
            if (keys.d) dx += 1;
            ws.send(JSON.stringify({ type: 'move', dx, dy }));
        }

        // Fitur Chat
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && chatInput.value.trim() !== '') {
                ws.send(JSON.stringify({ type: 'chat', message: chatInput.value.trim() }));
                chatInput.value = '';
                chatInput.blur(); // Unfocus setelah ngirim
            }
        });

        function addChatMessage(name, msg, isSys) {
            const el = document.createElement('div');
            el.className = isSys ? 'msg msg-sys' : 'msg';
            el.innerHTML = isSys ? msg : '<b>' + name + ':</b> ' + msg;
            chatMessages.appendChild(el);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Leaderboard UI
        function updateLeaderboard() {
            const sortedPlayers = Object.values(players).sort((a, b) => b.kills - a.kills);
            leaderboardList.innerHTML = '';
            sortedPlayers.slice(0, 5).forEach(p => {
                const li = document.createElement('li');
                li.innerHTML = '<span>' + p.name + '</span><span>' + p.kills + ' ⚔️</span>';
                if (p.id === myId) li.style.color = '#4CAF50';
                leaderboardList.appendChild(li);
            });
        }

        // Game Loop / Rendering (60 FPS)
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const me = players[myId];
            if (me) {
                // Kamera mengikuti pemain lokal
                camera.x = me.x - canvas.width / 2;
                camera.y = me.y - canvas.height / 2;
            }

            ctx.save();
            ctx.translate(-camera.x, -camera.y);

            // Gambar Background Grid (Dunia Game)
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            const gridSize = 50;
            const startX = Math.floor(camera.x / gridSize) * gridSize;
            const startY = Math.floor(camera.y / gridSize) * gridSize;
            for (let x = startX; x < camera.x + canvas.width; x += gridSize) {
                ctx.beginPath(); ctx.moveTo(x, camera.y); ctx.lineTo(x, camera.y + canvas.height); ctx.stroke();
            }
            for (let y = startY; y < camera.y + canvas.height; y += gridSize) {
                ctx.beginPath(); ctx.moveTo(camera.x, y); ctx.lineTo(camera.x + canvas.width, y); ctx.stroke();
            }
            
            // Batas Map
            ctx.strokeStyle = 'red';
            ctx.strokeRect(0, 0, ${MAP_SIZE}, ${MAP_SIZE});

            // Gambar Animasi Attack (Hitbox)
            for (let i = attackEffects.length - 1; i >= 0; i--) {
                const fx = attackEffects[i];
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
                ctx.fillStyle = fx.color + Math.floor((fx.life / 15) * 255).toString(16).padStart(2, '0'); // Fade out transparan
                ctx.fill();
                fx.life--;
                if (fx.life <= 0) attackEffects.splice(i, 1);
            }

            // Gambar Monsters (NPC)
            monsters.forEach(m => {
                if (m.respawning) return; // Jangan gambar jika mati
                
                // Tubuh monster
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#ff4444';
                ctx.fill();
                ctx.strokeStyle = 'darkred';
                ctx.lineWidth = 2;
                ctx.stroke();

                // HP Bar Monster
                drawHPBar(m.x, m.y - 25, m.hp, m.maxHp);
            });

            // Gambar Pemain Lain & Diri Sendiri
            Object.values(players).forEach(p => {
                // Arah hadap (Indicator mata/senjata)
                ctx.beginPath();
                ctx.arc(p.x + p.dirX * 10, p.y + p.dirY * 10, 5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.fill();

                // Tubuh pemain
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.strokeStyle = (p.id === myId) ? '#fff' : '#000';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Nama Pemain
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(p.name, p.x, p.y - 35);

                // HP Bar Player
                drawHPBar(p.x, p.y - 25, p.hp, p.maxHp);
            });

            ctx.restore();
            requestAnimationFrame(draw);
        }

        // Helper render HP Bar
        function drawHPBar(x, y, hp, maxHp) {
            const width = 40;
            const height = 6;
            const healthPct = Math.max(0, hp / maxHp);
            
            ctx.fillStyle = 'red';
            ctx.fillRect(x - width/2, y, width, height);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(x - width/2, y, width * healthPct, height);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(x - width/2, y, width, height);
        }

        draw();
    </script>
</body>
</html>
`;


// ==========================================
// 2. KODE SERVER (Logika Game Authoritative)
// ==========================================

// Endpoint web server untuk menyajikan Client
app.get('/', (req, res) => {
    res.send(CLIENT_HTML);
});

// State Server-Side
const players = {};
let monsters = [];

// Utils
function randomColor() {
    const colors = ['#3498db', '#9b59b6', '#e67e22', '#1abc9c', '#f1c40f'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function getDistance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

// Inisialisasi 3 Monster NPC awal
for (let i = 0; i < 3; i++) {
    monsters.push(createMonster(i));
}

function createMonster(id) {
    return {
        id: id,
        x: Math.random() * (MAP_SIZE - 100) + 50,
        y: Math.random() * (MAP_SIZE - 100) + 50,
        radius: 15,
        hp: 100,
        maxHp: 100,
        speed: 1.5,
        respawning: false,
        lastAttackTimer: 0 // Cooldown untuk nyerang pemain
    };
}

// Handling Koneksi Player Baru
let playerCount = 0;
wss.on('connection', (ws) => {
    playerCount++;
    const id = generateId();
    
    // Inisialisasi Player
    players[id] = {
        id: id,
        ws: ws, // Simpan reference socket untuk komunikasi spesifik (tidak dikirim ke client)
        name: 'Player' + playerCount,
        color: randomColor(),
        x: MAP_SIZE / 2,
        y: MAP_SIZE / 2,
        radius: 15,
        hp: 100,
        maxHp: 100,
        speed: 4,
        kills: 0,
        input: { dx: 0, dy: 0 },
        dirX: 0, dirY: 1 // Arah menghadap default (bawah)
    };

    // Kirim ID ke client bersangkutan
    ws.send(JSON.stringify({ type: 'init', id: id }));
    
    // Broadcast sistem log join
    broadcast({ type: 'chat', isSys: true, message: players[id].name + ' joined the game.' });

    // Listener interaksi Player (Move, Attack, Chat)
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const p = players[id];
        if (!p) return;

        if (data.type === 'move') {
            // Update vektor input pergerakan
            p.input.dx = data.dx;
            p.input.dy = data.dy;
            
            // Simpan arah hadap terakhir untuk arah serangan (Attack Direction)
            if (data.dx !== 0 || data.dy !== 0) {
                // Normalisasi vektor agar jarak attack konsisten
                const length = Math.hypot(data.dx, data.dy);
                p.dirX = data.dx / length;
                p.dirY = data.dy / length;
            }
        } 
        else if (data.type === 'attack') {
            handlePlayerAttack(p);
        }
        else if (data.type === 'chat') {
            // Hilangkan tag HTML untuk cegah XSS dasar
            const cleanMsg = data.message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            broadcast({ type: 'chat', name: p.name, message: cleanMsg, isSys: false });
        }
    });

    ws.on('close', () => {
        if(players[id]) {
            broadcast({ type: 'chat', isSys: true, message: players[id].name + ' left the game.' });
            delete players[id];
        }
    });
});

// Sistem Tempur (Melee Attack Logic)
function handlePlayerAttack(attacker) {
    const ATTACK_RANGE = 35; // Jarak tengah pukulan dari tubuh pemain
    const ATTACK_RADIUS = 25; // Besaran/area luasan pukulan
    const DAMAGE = 25;
    
    // Hitung pusat lingkaran serangan berdasarkan arah pemain
    const hitX = attacker.x + (attacker.dirX * ATTACK_RANGE);
    const hitY = attacker.y + (attacker.dirY * ATTACK_RANGE);

    // Broadcast Visualisasi Serangan ke semua client (warna sesuai pemain)
    broadcast({ type: 'attack_anim', x: hitX, y: hitY, radius: ATTACK_RADIUS, color: attacker.color });

    // Cek tabrakan/hitbox dengan Monster
    monsters.forEach(m => {
        if (m.respawning) return;
        const dist = getDistance(hitX, hitY, m.x, m.y);
        if (dist < ATTACK_RADIUS + m.radius) {
            // Monster Kena Hit
            m.hp -= DAMAGE;
            if (m.hp <= 0) {
                killMonster(m, attacker);
            }
        }
    });

    // Cek tabrakan/hitbox dengan Pemain Lain (PVP)
    Object.values(players).forEach(target => {
        if (target.id === attacker.id) return; // Gak bisa mukul diri sendiri
        const dist = getDistance(hitX, hitY, target.x, target.y);
        if (dist < ATTACK_RADIUS + target.radius) {
            // Target Kena Hit
            target.hp -= DAMAGE;
            if (target.hp <= 0) {
                killPlayer(target, attacker);
            }
        }
    });
}

function killMonster(monster, killer) {
    monster.hp = 0;
    monster.respawning = true;
    killer.kills += 1; // Nambah skor
    
    // Respawn monster setelah 5 detik
    setTimeout(() => {
        monster.hp = monster.maxHp;
        monster.x = Math.random() * (MAP_SIZE - 100) + 50;
        monster.y = Math.random() * (MAP_SIZE - 100) + 50;
        monster.respawning = false;
    }, 5000);
}

function killPlayer(victim, killer) {
    victim.hp = victim.maxHp;
    victim.x = MAP_SIZE / 2; // Respawn ke center map
    victim.y = MAP_SIZE / 2;
    killer.kills += 1;
    
    broadcast({ type: 'chat', isSys: true, message: `⚔️ ${killer.name} killed ${victim.name}` });
}

// ==========================================
// 3. SERVER GAME LOOP (Tick Rate: ~30 FPS)
// ==========================================
setInterval(() => {
    // 1. Update Pergerakan Player
    Object.values(players).forEach(p => {
        if (p.input.dx !== 0 || p.input.dy !== 0) {
            // Normalisasi diagonal movement agar tidak lebih cepat
            const length = Math.hypot(p.input.dx, p.input.dy);
            p.x += (p.input.dx / length) * p.speed;
            p.y += (p.input.dy / length) * p.speed;

            // Batasi dalam Map
            p.x = Math.max(p.radius, Math.min(MAP_SIZE - p.radius, p.x));
            p.y = Math.max(p.radius, Math.min(MAP_SIZE - p.radius, p.y));
        }
    });

    // 2. Update AI Monster (Mengejar pemain terdekat secara global)
    monsters.forEach(m => {
        if (m.respawning) return;

        let closestPlayer = null;
        let minDist = Infinity;

        // Cari mangsa
        Object.values(players).forEach(p => {
            const dist = getDistance(m.x, m.y, p.x, p.y);
            if (dist < minDist) {
                minDist = dist;
                closestPlayer = p;
            }
        });

        if (closestPlayer) {
            // Bergerak perlahan ke arah mangsa
            const angle = Math.atan2(closestPlayer.y - m.y, closestPlayer.x - m.x);
            m.x += Math.cos(angle) * m.speed;
            m.y += Math.sin(angle) * m.speed;

            // Serang pemain jika tersentuh (dengan Cooldown 1 detik)
            if (minDist < m.radius + closestPlayer.radius) {
                if (Date.now() - m.lastAttackTimer > 1000) {
                    closestPlayer.hp -= 15; // Monster demage
                    m.lastAttackTimer = Date.now();
                    
                    if (closestPlayer.hp <= 0) {
                        // Jika pemain mati karena digigit monster
                        closestPlayer.hp = closestPlayer.maxHp;
                        closestPlayer.x = MAP_SIZE / 2;
                        closestPlayer.y = MAP_SIZE / 2;
                        broadcast({ type: 'chat', isSys: true, message: `💀 ${closestPlayer.name} was eaten by a Monster.` });
                    }
                }
            }
        }
        
        // Batasi AI dalam map
        m.x = Math.max(m.radius, Math.min(MAP_SIZE - m.radius, m.x));
        m.y = Math.max(m.radius, Math.min(MAP_SIZE - m.radius, m.y));
    });

    // 3. Persiapkan Data State untuk dikirim (Sanitize ws object dari iterasi)
    const sanitizedPlayers = {};
    Object.values(players).forEach(p => {
        sanitizedPlayers[p.id] = {
            id: p.id, name: p.name, color: p.color,
            x: p.x, y: p.y, hp: p.hp, maxHp: p.maxHp, 
            radius: p.radius, kills: p.kills,
            dirX: p.dirX, dirY: p.dirY
        };
    });

    // 4. Broadcast state dunia ke seluruh pemain
    const statePacket = JSON.stringify({
        type: 'state',
        players: sanitizedPlayers,
        monsters: monsters
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(statePacket);
        }
    });

}, 1000 / 30); // ~33ms per Tick (30 FPS)

// Fungsi utilitas helper
function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

function broadcast(dataObj) {
    const msg = JSON.stringify(dataObj);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
}

// Mulai Server
server.listen(PORT, () => {
    console.log(`🚀 Monolithic MMORPG Server running on port ${PORT}`);
});
