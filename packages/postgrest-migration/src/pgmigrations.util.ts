import * as fs from 'fs';
import * as path from 'path';
import { PgMigrationModel } from './pgmigations.model';

export interface FileMigration {
  path: string;
  module: string;
  version: string;
}

export class PgMigrationUtil {
  /**
   * Tìm kiếm các tệp phù hợp với biểu thức chính quy trong thư mục.
   */
  public static searchFiles(
    directory: string,
    fileRegex: RegExp,
    result: string[],
  ) {
    fs.readdirSync(directory).forEach((file) => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        this.searchFiles(filePath, fileRegex, result);
      } else if (fileRegex.test(file)) {
        result.push(filePath);
      }
    });
  }

  /**
   * Lấy tên module từ đường dẫn tệp.
   */
  public static getModuleName(filePath: string): string | null {
    const parts = filePath.split('/');
    // [ 'src', 'migrate', 'mobile_name', 'Version-1.0.1.ts' ]:
    // 4 - 2 = 2: ['mobile_name']
    const splitModuleNamePosition = 2;

    if (parts.length >= splitModuleNamePosition) {
      return parts[parts.length - splitModuleNamePosition];
    } else {
      return null;
    }
  }

  // Lấy danh sách module từ file.
  public static getUniqueModuleFromFile = (files: string[]) => {
    const uniqueModules: Set<string> = new Set();

    for (const file of files) {
      const moduleName = this.getModuleName(file);
      if (!moduleName) {
        continue;
      }
      uniqueModules.add(moduleName);
    }

    return Array.from(uniqueModules);
  };

  /**
   * Lấy phiên bản từ đường dẫn tệp.
   */
  public static getVersionFromPath(
    path: string,
    versionFileRegexFromPath: RegExp,
  ) {
    const match = path.match(versionFileRegexFromPath);

    if (match) {
      return match[1];
    }
    return null;
  }

  /**
   * Ánh xạ tệp và module.
   * @param {string[]} files - Mảng chứa đường dẫn tệp.
   * @returns {Object[]} Mảng chứa thông tin về tệp, module và phiên bản.
   */
  public static mapFileAndModule = (
    files: string[],
    versionFileRegexFromPath: RegExp,
  ): Array<FileMigration> => {
    return files.map((file) => {
      return {
        path: file,
        module: this.getModuleName(file) || '',
        version: this.getVersionFromPath(file, versionFileRegexFromPath) || '',
      };
    });
  };

  /**
   * Lấy thông tin về phiên bản di chuyển mới nhất.
   */
  public static searchMigrationFiles = (
    modulePrefix: string,
    versionFileRegex: RegExp,
    versionFileRegexFromPath: RegExp,
  ) => {
    const matchingFilePaths: string[] = [];
    PgMigrationUtil.searchFiles(
      modulePrefix,
      versionFileRegex,
      matchingFilePaths,
    );
    return this.mapFileAndModule(matchingFilePaths, versionFileRegexFromPath);
  };

  // Lấy danh sách FileMigration version hơn version truyền vào
  public static getNewerVersions = (
    migrationFile: FileMigration[],
    moduleName: string,
    version: string,
  ) => {
    return migrationFile.filter(
      (file) => file.module === moduleName && file.version > version,
    );
  };

  public static findModuleByName(
    migrationFiles: PgMigrationModel[],
    moduleName: string,
  ) {
    const foundModule = migrationFiles.find(
      (file) => file.module === moduleName,
    );
    return foundModule || undefined;
  }

  public static progressBar(progress: number) {
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
