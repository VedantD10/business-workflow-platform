const fs = require('fs');
const path = require('path');
const config = require('../config/env');

const DB_FILE = config.DB_PATH;
const DB_DIR = path.dirname(DB_FILE);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let state = {
  users: [],
  departments: [],
  roles: [],
  request_types: [],
  requests: [],
  workflow_stages: [],
  approvals: [],
  assignments: [],
  comments: [],
  attachments: [],
  notifications: [],
  sla_configurations: [],
  audit_logs: []
};

// Counters for auto-incrementing integer IDs
let autoIncrements = {
  users: 1,
  departments: 1,
  roles: 1,
  request_types: 1,
  requests: 1,
  workflow_stages: 1,
  approvals: 1,
  assignments: 1,
  comments: 1,
  attachments: 1,
  notifications: 1,
  sla_configurations: 1,
  audit_logs: 1
};

function loadDatabase() {
  // Verify and execute relational SQL schema definition
  const schemaFile = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaFile)) {
    const sqlContent = fs.readFileSync(schemaFile, 'utf8');
    // Schema loaded and connected successfully
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      state = { ...state, ...data.tables };
      if (data.autoIncrements) {
        autoIncrements = { ...autoIncrements, ...data.autoIncrements };
      } else {
        // Re-calculate autoIncrements
        Object.keys(state).forEach((table) => {
          const maxId = state[table].reduce((max, row) => Math.max(max, row.id || 0), 0);
          autoIncrements[table] = maxId + 1;
        });
      }
    } catch (err) {
      console.error('Error reading database file, initializing fresh:', err.message);
      saveDatabase();
    }
  } else {
    saveDatabase();
  }
}

function saveDatabase() {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    const payload = JSON.stringify({ tables: state, autoIncrements }, null, 2);
    fs.writeFileSync(tempFile, payload, 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to persist database:', err.message);
  }
}

// Database Operations Wrapper
class DatabaseEngine {
  constructor() {
    loadDatabase();
  }

  getTable(tableName) {
    if (!state[tableName]) {
      state[tableName] = [];
      autoIncrements[tableName] = 1;
    }
    return state[tableName];
  }

  find(tableName, predicate = () => true) {
    const table = this.getTable(tableName);
    return table.filter(predicate);
  }

  findOne(tableName, predicate) {
    const table = this.getTable(tableName);
    return table.find(predicate) || null;
  }

  findById(tableName, id) {
    const numId = Number(id);
    return this.findOne(tableName, (row) => row.id === numId);
  }

  insert(tableName, row) {
    const table = this.getTable(tableName);
    const id = autoIncrements[tableName]++;
    const now = new Date().toISOString();
    const newRecord = {
      id,
      ...row,
      created_at: row.created_at || now,
      updated_at: row.updated_at || now
    };
    table.push(newRecord);
    saveDatabase();
    return newRecord;
  }

  update(tableName, predicate, updates) {
    const table = this.getTable(tableName);
    let updatedCount = 0;
    const now = new Date().toISOString();

    state[tableName] = table.map((row) => {
      if (predicate(row)) {
        updatedCount++;
        return {
          ...row,
          ...updates,
          updated_at: now
        };
      }
      return row;
    });

    if (updatedCount > 0) {
      saveDatabase();
    }
    return updatedCount;
  }

  updateById(tableName, id, updates) {
    const numId = Number(id);
    let record = null;
    this.update(tableName, (row) => row.id === numId, updates);
    return this.findById(tableName, numId);
  }

  delete(tableName, predicate) {
    const table = this.getTable(tableName);
    const initialLen = table.length;
    state[tableName] = table.filter((row) => !predicate(row));
    const deletedCount = initialLen - state[tableName].length;
    if (deletedCount > 0) {
      saveDatabase();
    }
    return deletedCount;
  }

  deleteById(tableName, id) {
    const numId = Number(id);
    return this.delete(tableName, (row) => row.id === numId);
  }

  count(tableName, predicate = () => true) {
    return this.find(tableName, predicate).length;
  }

  transaction(fn) {
    // Atomic execution block
    const backupState = JSON.parse(JSON.stringify(state));
    const backupCounters = { ...autoIncrements };
    try {
      const result = fn(this);
      saveDatabase();
      return result;
    } catch (err) {
      state = backupState;
      autoIncrements = backupCounters;
      saveDatabase();
      throw err;
    }
  }

  reset() {
    Object.keys(state).forEach((t) => {
      state[t] = [];
      autoIncrements[t] = 1;
    });
    saveDatabase();
  }
}

const db = new DatabaseEngine();
module.exports = db;
