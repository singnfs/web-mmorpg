const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ===== Penyimpanan sederhana (JSON di folder data/) =====
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');
let db = { known: {}, listings: [], credits: {}, guilds: {}, nextId: 1 };
try { db = Object.assign(db, JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))); } catch (e) { /* belum ada data */ }
let saveTimer = null;
function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(db));
    }, 500);
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const chat = { Global: [], Trade: [], Support: [] };
const online = {};   // socket.id -> profil pemain
const parties = {};  // id -> {id,name,owner,members:[socket.id]}
const clean = (v, max = 24) => String(v || '').replace(/[<>"'`]/g, '').trim().slice(0, max);
const num = (v) => Math.max(0, Math.min(1e12, Number(v) || 0));

function profileOf(p) {
    return {
        name: clean(p.name), level: num(p.level), str: num(p.str), def: num(p.def), dex: num(p.dex),
        maxHp: num(p.maxHp), av: num(p.av), guild: clean(p.guild, 30), steps: num(p.steps), gold: num(p.gold),
        kills: num(p.kills), pk: num(p.pk), qc: num(p.qc), bk: num(p.bk)
    };
}
function onlineList() {
    return Object.entries(online).map(([id, p]) => ({ id, ...p, party: partyOf(id) && partyOf(id).id }));
}
function partyOf(id) { return Object.values(parties).find(pt => pt.members.includes(id)); }
function partyList() {
    return Object.values(parties).map(pt => ({
        id: pt.id, name: pt.name, owner: online[pt.owner] ? online[pt.owner].name : '?',
        members: pt.members.map(m => online[m] ? { id: m, name: online[m].name, level: online[m].level } : null).filter(Boolean)
    }));
}
function guildList() {
    return Object.entries(db.guilds).map(([name, g]) => ({ name, tag: g.tag, owner: g.owner, members: g.members.length }));
}
function broadcast() {
    io.emit('state', { online: onlineList(), parties: partyList(), listings: db.listings, guilds: guildList() });
}
function leaveParty(id) {
    const pt = partyOf(id);
    if (!pt) return;
    pt.members = pt.members.filter(m => m !== id);
    if (!pt.members.length) delete parties[pt.id];
    else if (pt.owner === id) pt.owner = pt.members[0];
}

io.on('connection', (socket) => {
    socket.on('hello', (p) => {
        const prof = profileOf(p || {});
        if (!prof.name) return;
        online[socket.id] = prof;
        db.known[prof.name.toLowerCase()] = { ...prof, seen: Date.now() };
        const c = db.credits[prof.name.toLowerCase()];
        if (c) { socket.emit('credit', c); delete db.credits[prof.name.toLowerCase()]; }
        persist();
        broadcast();
    });

    socket.on('update', (p) => {
        if (!online[socket.id]) return;
        const prof = profileOf(p || {});
        prof.name = online[socket.id].name;
        online[socket.id] = prof;
        db.known[prof.name.toLowerCase()] = { ...prof, seen: Date.now() };
        persist();
        broadcast();
    });

    socket.on('leaderboard', (cb) => {
        if (typeof cb === 'function') cb(Object.values(db.known));
    });

    // ===== PvP: hanya melawan pemain yang sedang online =====
    socket.on('pvp:result', ({ target, won, gold }) => {
        const me = online[socket.id], t = online[target];
        if (!me || !t) return;
        io.to(target).emit('pvp:attacked', { by: me.name, won: !!won, gold: num(gold) });
    });

    // ===== Party =====
    socket.on('party:create', (name) => {
        if (!online[socket.id]) return;
        leaveParty(socket.id);
        const id = 'p' + (db.nextId++);
        parties[id] = { id, name: clean(name, 30) || (online[socket.id].name + "'s party"), owner: socket.id, members: [socket.id] };
        broadcast();
    });
    socket.on('party:join', (id) => {
        const pt = parties[id];
        if (!pt || !online[socket.id] || pt.members.length >= 4) return;
        leaveParty(socket.id);
        pt.members.push(socket.id);
        broadcast();
    });
    socket.on('party:leave', () => { leaveParty(socket.id); broadcast(); });

    // ===== Player Market =====
    socket.on('market:list', ({ item, price }) => {
        const me = online[socket.id];
        if (!me) return;
        db.listings.push({ id: db.nextId++, item: clean(item, 80), price: Math.max(1, Math.round(num(price))), seller: me.name });
        persist();
        broadcast();
    });
    socket.on('market:buy', (id, cb) => {
        const me = online[socket.id];
        const i = db.listings.findIndex(l => l.id === id);
        if (!me || i < 0) return typeof cb === 'function' && cb({ ok: false });
        const [l] = db.listings.splice(i, 1);
        const sellerSock = Object.keys(online).find(k => online[k].name.toLowerCase() === l.seller.toLowerCase());
        const pay = Math.round(l.price * 0.95);
        if (sellerSock) io.to(sellerSock).emit('credit', { gold: pay, items: [], note: `${l.item} terjual ke ${me.name}` });
        else {
            const k = l.seller.toLowerCase();
            const c = db.credits[k] || { gold: 0, items: [], note: 'Penjualan market saat offline' };
            c.gold += pay;
            db.credits[k] = c;
        }
        persist();
        broadcast();
        if (typeof cb === 'function') cb({ ok: true, listing: l });
    });
    socket.on('market:cancel', (id) => {
        const me = online[socket.id];
        const i = db.listings.findIndex(l => l.id === id && me && l.seller === me.name);
        if (i < 0) return;
        const [l] = db.listings.splice(i, 1);
        socket.emit('credit', { gold: 0, items: [l.item], note: `Listing ${l.item} dibatalkan` });
        persist();
        broadcast();
    });

    // ===== Guild =====
    socket.on('guild:create', ({ name, tag }) => {
        const me = online[socket.id];
        name = clean(name, 30); tag = clean(tag, 5).toUpperCase();
        if (!me || !name || db.guilds[name]) return;
        Object.values(db.guilds).forEach(g => { g.members = g.members.filter(m => m !== me.name); });
        db.guilds[name] = { tag: tag || name.slice(0, 3).toUpperCase(), owner: me.name, members: [me.name] };
        persist();
        broadcast();
    });
    socket.on('guild:join', (name) => {
        const me = online[socket.id], g = db.guilds[name];
        if (!me || !g) return;
        Object.values(db.guilds).forEach(x => { x.members = x.members.filter(m => m !== me.name); });
        g.members.push(me.name);
        persist();
        broadcast();
    });
    socket.on('guild:leave', () => {
        const me = online[socket.id];
        if (!me) return;
        for (const [n, g] of Object.entries(db.guilds)) {
            g.members = g.members.filter(m => m !== me.name);
            if (!g.members.length) delete db.guilds[n];
        }
        persist();
        broadcast();
    });

    // ===== Chat =====
    socket.on('chat:history', (cb) => { if (typeof cb === 'function') cb(chat); });
    socket.on('chat:send', ({ ch, txt, key } = {}) => {
        const me = online[socket.id];
        if (!me || !chat[ch]) return;
        txt = String(txt || '').trim().slice(0, 200);
        if (!txt) return;
        const now = Date.now();
        if (socket.lastChat && now - socket.lastChat < 1500) return; // anti-spam
        socket.lastChat = now;
        const m = { ch, name: me.name, av: me.av, txt, t: now, mod: me.name.toLowerCase() === 'admin' && key === ADMIN_PASSWORD };
        chat[ch].push(m);
        if (chat[ch].length > 60) chat[ch].shift();
        io.emit('chat:msg', m);
    });

    // ===== Admin (butuh ADMIN_PASSWORD) =====
    socket.on('admin', ({ key, cmd, args } = {}, cb) => {
        const reply = (ok, msg, data) => typeof cb === 'function' && cb({ ok, msg, data });
        const me = online[socket.id];
        if (!me || me.name.toLowerCase() !== 'admin' || key !== ADMIN_PASSWORD) return reply(false, 'Password admin salah');
        args = args || {};
        if (cmd === 'announce') {
            const txt = clean(args.txt, 200);
            if (!txt) return reply(false, 'Pesan kosong');
            io.emit('announce', { txt });
            return reply(true, 'Pengumuman terkirim');
        }
        if (cmd === 'gift') {
            if (!online[args.id]) return reply(false, 'Pemain offline');
            io.to(args.id).emit('admin:gift', { gold: num(args.gold), dia: num(args.dia), items: [] });
            return reply(true, 'Hadiah terkirim ke ' + online[args.id].name);
        }
        if (cmd === 'kick') {
            const t = io.sockets.sockets.get(args.id);
            if (!t) return reply(false, 'Pemain offline');
            t.emit('admin:kicked');
            setTimeout(() => t.disconnect(true), 300);
            return reply(true, 'Pemain di-kick');
        }
        if (cmd === 'clearMarket') { db.listings = []; persist(); broadcast(); return reply(true, 'Market dikosongkan'); }
        if (cmd === 'clearChat') { Object.keys(chat).forEach(k => chat[k] = []); return reply(true, 'Chat dikosongkan'); }
        if (cmd === 'delGuild') { delete db.guilds[args.name]; persist(); broadcast(); return reply(true, 'Guild dihapus'); }
        if (cmd === 'stats') {
            return reply(true, 'Statistik', {
                'Pemain online': Object.keys(online).length, 'Pemain terdaftar': Object.keys(db.known).length,
                'Listing market': db.listings.length, 'Guild': Object.keys(db.guilds).length,
                'Party aktif': Object.keys(parties).length, 'Pesan chat': Object.values(chat).reduce((a, c) => a + c.length, 0)
            });
        }
        reply(false, 'Perintah tidak dikenal');
    });

    socket.on('disconnect', () => {
        leaveParty(socket.id);
        delete online[socket.id];
        broadcast();
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server StepQuest berjalan di port ${PORT}`);
});
