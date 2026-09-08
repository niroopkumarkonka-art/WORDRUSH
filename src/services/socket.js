// ============================================================================
// WORDRUSH ARENA - WebSocket Client Service (JavaScript)
// Handles Real-Time Multiplayer Room Events
// ============================================================================

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectTimer = null;
    this.isConnected = false;
    this.messageQueue = [];
  }

  get connected() {
    return Boolean(this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN);
  }

  connect() {
    return new Promise((resolve) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.isConnected = true;
        resolve(true);
        return;
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      let host = window.location.host;
      if (window.location.port === "5173") {
        host = `${window.location.hostname}:3000`;
      }
      const wsUrl = `${protocol}//${host}`;

      try {
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          this.isConnected = true;
          this.emitInternal("connection_status", { connected: true });
          while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            if (msg && this.socket?.readyState === WebSocket.OPEN) {
              this.socket.send(msg);
            }
          }
          resolve(true);
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const { type, payload } = data;
            this.emitInternal(type, payload);
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };

        this.socket.onclose = () => {
          this.isConnected = false;
          this.emitInternal("connection_status", { connected: false });
          this.scheduleReconnect();
        };

        this.socket.onerror = (error) => {
          console.warn("WebSocket error:", error);
          this.isConnected = false;
          this.emitInternal("connection_status", { connected: false });
          resolve(false);
        };
      } catch (err) {
        console.error("Failed to create WebSocket:", err);
        resolve(false);
      }
    });
  }

  scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 2000);
  }

  send(type, payload = {}) {
    const raw = JSON.stringify({ type, payload });
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(raw);
    } else {
      this.messageQueue.push(raw);
      this.connect();
    }
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);

    return () => {
      this.off(type, callback);
    };
  }

  off(type, callback) {
    const set = this.listeners.get(type);
    if (set) {
      set.delete(callback);
    }
  }

  emitInternal(type, data) {
    const set = this.listeners.get(type);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in socket listener for '${type}':`, e);
        }
      });
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  get connected() {
    return this.isConnected;
  }
}

export const socketService = new SocketService();
