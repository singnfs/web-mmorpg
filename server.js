const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const players = {};

io.on('connection', (socket) => {
    console.log('Pemain baru terhubung:', socket.id);

    // Terima pergerakan pemain
    socket.on('playerMovement', (data) => {
        players[socket.id] = {
            x: data.x,
            y: data.y,
            color: 'red' // Pemain lain akan berwarna merah
        };
        // Kirim posisi terbaru ke SEMUA pemain
        io.emit('stateUpdate', players);
    });

    // Jika pemain keluar/disconnect
    socket.on('disconnect', () => {
        console.log('Pemain keluar:', socket.id);
        delete players[socket.id];
        io.emit('stateUpdate', players);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server MMO berjalan di port ${PORT}`);
});
