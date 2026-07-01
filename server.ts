import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import os from 'os';

const db = new Database('restaurant.db');

// Get local IP address
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    table_number TEXT,
    items TEXT,
    subtotal REAL,
    gst REAL,
    total REAL,
    status TEXT,
    payment_status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/orders', (req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(orders.map((o: any) => ({
      ...o,
      items: JSON.parse(o.items as string)
    })));
  });

  app.post('/api/orders', (req, res) => {
    const { id, table_number, items, subtotal, gst, total, status, payment_status } = req.body;
    const stmt = db.prepare('INSERT INTO orders (id, table_number, items, subtotal, gst, total, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, table_number, JSON.stringify(items), subtotal, gst, total, status, payment_status);
    
    const newOrder = { id, table_number, items, subtotal, gst, total, status, payment_status, created_at: new Date().toISOString() };
    console.log(`📦 New order created: ${id} for table ${table_number}`);
    io.emit('order:new', newOrder);
    console.log(`✓ Emitted 'order:new' event to ${io.engine.clientsCount} clients`);
    res.status(201).json(newOrder);
  });

  app.patch('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const { status, payment_status } = req.body;
    
    if (status && payment_status) {
      db.prepare('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?').run(status, payment_status, id);
    } else if (status) {
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    } else if (payment_status) {
      db.prepare('UPDATE orders SET payment_status = ? WHERE id = ?').run(payment_status, id);
    }

    const updatedOrder: any = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
    if (!updatedOrder) {
  return res.status(404).json({ error: "Order not found" });
}
    console.log(`🔄 Order updated: ${id}, new status: ${status || 'unchanged'}, payment: ${payment_status || 'unchanged'}`);
    io.emit('order:update', { ...updatedOrder, items: JSON.parse(updatedOrder.items) });
    console.log(`✓ Emitted 'order:update' event to ${io.engine.clientsCount} clients`);
    res.json(updatedOrder);
  });

  // Server info endpoint for mobile access
  app.get('/api/server-info', (req, res) => {
    const localIP = getLocalIP();
    const port = PORT;
    const mobileURL = `http://${localIP}:${port}`;
    res.json({ 
      mobileURL,
      ip: localIP,
      port
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  io.on('connection', (socket) => {
    console.log(`✓ Client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`✗ Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
