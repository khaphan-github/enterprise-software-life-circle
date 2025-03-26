"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgMigrationUtil = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class PgMigrationUtil {
    /**
     * Tìm kiếm các tệp phù hợp với biểu thức chính quy trong thư mục.
     */
    static searchFiles(directory, fileRegex, result) {
        fs.readdirSync(directory).forEach((file) => {
            const filePath = path.join(directory, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                this.searchFiles(filePath, fileRegex, result);
            }
            else if (fileRegex.test(file)) {
                result.push(filePath);
            }
        });
    }
    /**
     * Lấy tên module từ đường dẫn tệp.
     */
    static getModuleName(filePath) {
        const parts = filePath.split('/');
        // [ 'src', 'migrate', 'mobile_name', 'Version-1.0.1.ts' ]:
        // 4 - 2 = 2: ['mobile_name']
        const splitModuleNamePosition = 2;
        if (parts.length >= splitModuleNamePosition) {
            return parts[parts.length - splitModuleNamePosition];
        }
        else {
            return null;
        }
    }
    /**
     * Lấy phiên bản từ đường dẫn tệp.
     */
    static getVersionFromPath(path, versionFileRegexFromPath) {
        const match = path.match(versionFileRegexFromPath);
        if (match) {
            return match[1];
        }
        return null;
    }
    static findModuleByName(migrationFiles, moduleName) {
        const foundModule = migrationFiles.find((file) => file.module === moduleName);
        return foundModule || undefined;
    }
    static progressBar(progress) {
        const barLength = 30;
        const filledLength = Math.round(barLength * progress);
        const emptyLength = barLength - filledLength;
        const progressBarString = `Processing: [${'='.repeat(filledLength)}${' '.repeat(emptyLength)}] ${Math.round(progress * 100)}%`;
        process.stdout.write('\r' + progressBarString);
        if (progress === 1) {
            process.stdout.write('\n');
        }
    }
}
exports.PgMigrationUtil = PgMigrationUtil;
_a = PgMigrationUtil;
// Lấy danh sách module từ file.
PgMigrationUtil.getUniqueModuleFromFile = (files) => {
    const uniqueModules = new Set();
    for (const file of files) {
        const moduleName = _a.getModuleName(file);
        if (!moduleName) {
            continue;
        }
        uniqueModules.add(moduleName);
    }
    return Array.from(uniqueModules);
};
/**
 * Ánh xạ tệp và module.
 * @param {string[]} files - Mảng chứa đường dẫn tệp.
 * @returns {Object[]} Mảng chứa thông tin về tệp, module và phiên bản.
 */
PgMigrationUtil.mapFileAndModule = (files, versionFileRegexFromPath) => {
    return files.map((file) => {
        return {
            path: file,
            module: _a.getModuleName(file) || '',
            version: _a.getVersionFromPath(file, versionFileRegexFromPath) || '',
        };
    });
};
/**
 * Lấy thông tin về phiên bản di chuyển mới nhất.
 */
PgMigrationUtil.searchMigrationFiles = (modulePrefix, versionFileRegex, versionFileRegexFromPath) => {
    const matchingFilePaths = [];
    _a.searchFiles(modulePrefix, versionFileRegex, matchingFilePaths);
    return _a.mapFileAndModule(matchingFilePaths, versionFileRegexFromPath);
};
// Lấy danh sách FileMigration version hơn version truyền vào
PgMigrationUtil.getNewerVersions = (migrationFile, moduleName, version) => {
    return migrationFile.filter((file) => file.module === moduleName && file.version > version);
};
