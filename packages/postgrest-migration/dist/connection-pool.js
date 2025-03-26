"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgSQLConnectionPool = void 0;
const pg_1 = require("pg");
class PgSQLConnectionPool {
    constructor(conf) {
        this.pool = new pg_1.Pool(conf);
        // the pool will emit an error on behalf of any idle clients
        // it contains if a backend error or network partition happens
        if (this.pool) {
            this.pool.on('error', (err) => {
                console.error(`Unexpected error on idle client: ${err.message}`);
            });
        }
    }
    execute(query, params = []) {
        return this.pool.query(query, params);
    }
    transaction(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            try {
                yield client.query('BEGIN');
                const result = yield callback(client);
                yield client.query('COMMIT');
                return result;
            }
            catch (error) {
                yield client.query('ROLLBACK');
                throw error;
            }
            finally {
                client.release();
            }
        });
    }
}
exports.PgSQLConnectionPool = PgSQLConnectionPool;
