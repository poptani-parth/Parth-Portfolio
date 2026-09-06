const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const START_DIR = process.cwd();

const REPORT_FILE = path.join(
    START_DIR,
    "PROJECT_RUNTIME_BUG_REPORT.txt"
);

const bugs = {
    frontend: [],
    backend: [],
    runtime: [],
    project: [],
};

const ignored = new Set([
    "node_modules",
    ".git",
    "target",
    "dist",
    "build",
    ".next",
    ".idea",
    ".vscode",
    "coverage",
]);

function log(message = "") {
    console.log(message);
}

function findProjectRoot(start) {
    let current = path.resolve(start);

    while (true) {
        const hasFrontend =
            fs.existsSync(path.join(current, "client")) ||
            fs.existsSync(path.join(current, "package.json"));

        const hasBackend =
            fs.existsSync(path.join(current, "pom.xml")) ||
            fs.existsSync(path.join(current, "build.gradle")) ||
            fs.existsSync(path.join(current, "src"));

        if (hasFrontend || hasBackend) {
            return current;
        }

        const parent = path.dirname(current);

        if (parent === current) {
            return null;
        }

        current = parent;
    }
}

const ROOT = findProjectRoot(START_DIR);

if (!ROOT) {
    console.error("❌ Could not find project root.");
    console.error(
        "Run this command from inside the Parth-Portfolio repository."
    );
    process.exit(1);
}

const FRONTEND = path.join(ROOT, "client");
const BACKEND = path.join(ROOT, "src");

function rel(file) {
    return path.relative(ROOT, file);
}

function add(section, data) {
    bugs[section].push(data);
}

function walk(dir) {
    if (!fs.existsSync(dir)) {
        return [];
    }

    const files = [];

    function scan(current) {
        let entries;

        try {
            entries = fs.readdirSync(current, {
                withFileTypes: true,
            });
        } catch (error) {
            add("project", {
                type: "READ_ERROR",
                file: current,
                message: error.message,
            });

            return;
        }

        for (const entry of entries) {
            if (ignored.has(entry.name)) {
                continue;
            }

            const full = path.join(current, entry.name);

            if (entry.isDirectory()) {
                scan(full);
            } else {
                files.push(full);
            }
        }
    }

    scan(dir);

    return files;
}

function inspectFrontendFile(file) {
    let content;

    try {
        content = fs.readFileSync(file, "utf8");
    } catch (error) {
        add("frontend", {
            type: "READ_ERROR",
            file: rel(file),
            message: error.message,
        });

        return;
    }

    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
        const lineNo = index + 1;
        const trimmed = line.trim();

        // console logging
        if (
            /\.(js|jsx|ts|tsx)$/.test(file) &&
            /console\.(log|debug|trace|warn|error)\s*\(/.test(line)
        ) {
            add("frontend", {
                type: "CONSOLE_LOG",
                file: rel(file),
                line: lineNo,
                message: trimmed,
            });
        }

        // token logging
        if (
            /(accessToken|refreshToken|authorization|jwt)/i.test(line) &&
            /console\.(log|debug|trace)/i.test(line)
        ) {
            add("frontend", {
                type: "SECURITY",
                file: rel(file),
                line: lineNo,
                message: "Possible authentication token logging.",
            });
        }

        // localhost
        if (
            /\.(js|jsx|ts|tsx)$/.test(file) &&
            /https?:\/\/localhost:\d+/i.test(line)
        ) {
            add("frontend", {
                type: "HARDCODED_URL",
                file: rel(file),
                line: lineNo,
                message: trimmed,
            });
        }

        // TODO/FIXME
        if (/\b(TODO|FIXME|XXX)\b/i.test(line)) {
            add("frontend", {
                type: "TODO",
                file: rel(file),
                line: lineNo,
                message: trimmed,
            });
        }

        // Possible uncontrolled React input
        if (
            /\.(tsx|jsx)$/.test(file) &&
            /\bvalue=\{[^}]+\}/.test(line) &&
            !line.includes("??")
        ) {
            add("frontend", {
                type: "POSSIBLE_REACT_INPUT_BUG",
                file: rel(file),
                line: lineNo,
                message:
                    'Possible uncontrolled → controlled input. Check whether value can be undefined.',
            });
        }

        // fetch without Authorization
        if (
            /\.(js|jsx|ts|tsx)$/.test(file) &&
            /\bfetch\s*\(/.test(line)
        ) {
            const nearby = lines
                .slice(index, Math.min(index + 15, lines.length))
                .join("\n");

            if (
                /\/api\/admin\//.test(nearby) &&
                !/Authorization/i.test(nearby)
            ) {
                add("frontend", {
                    type: "ADMIN_API_AUTH",
                    file: rel(file),
                    line: lineNo,
                    message:
                        "Admin API fetch may be missing Authorization header.",
                });
            }
        }
    });
}

function inspectBackendFile(file) {
    let content;

    try {
        content = fs.readFileSync(file, "utf8");
    } catch (error) {
        add("backend", {
            type: "READ_ERROR",
            file: rel(file),
            message: error.message,
        });

        return;
    }

    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
        const lineNo = index + 1;
        const trimmed = line.trim();

        // Password logging
        if (
            /(password|passwd|passwordhash)/i.test(line) &&
            /(log\.|logger\.|System\.out|print)/i.test(line)
        ) {
            add("backend", {
                type: "SECURITY",
                file: rel(file),
                line: lineNo,
                message:
                    "Possible password/password-hash logging.",
            });
        }

        // JWT/token logging
        if (
            /(token|jwt|authorization)/i.test(line) &&
            /(log\.|logger\.|System\.out|print)/i.test(line)
        ) {
            add("backend", {
                type: "SECURITY",
                file: rel(file),
                line: lineNo,
                message:
                    "Possible JWT/token logging.",
            });
        }

        // System.out
        if (/System\.out\.(print|println)\s*\(/.test(line)) {
            add("backend", {
                type: "DEBUG_LOG",
                file: rel(file),
                line: lineNo,
                message: trimmed,
            });
        }

        // TODO
        if (/\b(TODO|FIXME|XXX)\b/i.test(line)) {
            add("backend", {
                type: "TODO",
                file: rel(file),
                line: lineNo,
                message: trimmed,
            });
        }

        // permitAll admin
        if (
            /permitAll\s*\(/.test(line) &&
            /admin|api/i.test(
                lines
                    .slice(Math.max(0, index - 5), index + 6)
                    .join(" ")
            )
        ) {
            add("backend", {
                type: "SECURITY",
                file: rel(file),
                line: lineNo,
                message:
                    "Check admin endpoint using permitAll().",
            });
        }
    });
}

function run(command, cwd, section, name) {
    log("\n----------------------------------------");
    log(`CHECK: ${name}`);
    log(`COMMAND: ${command}`);
    log("----------------------------------------");

    try {
        const output = execSync(command, {
            cwd,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
            maxBuffer: 30 * 1024 * 1024,
        });

        if (output.trim()) {
            log(output.trim());
        }

        log(`✅ ${name} PASSED`);

        return true;
    } catch (error) {
        const output = [
            error.stdout?.toString() || "",
            error.stderr?.toString() || "",
        ]
            .join("\n")
            .trim();

        log("❌ " + name + " FAILED");
        log(output);

        add(section, {
            type: "COMMAND_ERROR",
            name,
            command,
            message: output || error.message,
        });

        return false;
    }
}

function runFrontendChecks() {
    const packageFile = path.join(FRONTEND, "package.json");

    if (!fs.existsSync(packageFile)) {
        add("frontend", {
            type: "MISSING_PACKAGE",
            message:
                `Frontend package.json not found at ${rel(packageFile)}`,
        });

        return;
    }

    let pkg;

    try {
        pkg = JSON.parse(
            fs.readFileSync(packageFile, "utf8")
        );
    } catch (error) {
        add("frontend", {
            type: "INVALID_PACKAGE_JSON",
            file: rel(packageFile),
            message: error.message,
        });

        return;
    }

    const scripts = pkg.scripts || {};

    if (scripts.typecheck) {
        run(
            "npm run typecheck",
            FRONTEND,
            "frontend",
            "Frontend TypeScript"
        );
    }

    if (scripts["type-check"]) {
        run(
            "npm run type-check",
            FRONTEND,
            "frontend",
            "Frontend TypeScript"
        );
    }

    if (scripts.lint) {
        run(
            "npm run lint",
            FRONTEND,
            "frontend",
            "Frontend ESLint"
        );
    }

    if (scripts.build) {
        run(
            "npm run build",
            FRONTEND,
            "frontend",
            "Frontend Build"
        );
    }

    if (scripts.test) {
        run(
            "npm test -- --runInBand",
            FRONTEND,
            "frontend",
            "Frontend Tests"
        );
    }
}

function runBackendChecks() {
    const pom = path.join(ROOT, "pom.xml");
    const mvnw = path.join(ROOT, "mvnw.cmd");

    if (fs.existsSync(pom)) {
        const command = fs.existsSync(mvnw)
            ? ".\\mvnw.cmd test"
            : "mvn test";

        run(
            command,
            ROOT,
            "backend",
            "Backend Maven Tests"
        );

        return;
    }

    const gradle = path.join(ROOT, "build.gradle");

    if (fs.existsSync(gradle)) {
        const wrapper = path.join(ROOT, "gradlew.bat");

        const command = fs.existsSync(wrapper)
            ? ".\\gradlew.bat test"
            : "gradle test";

        run(
            command,
            ROOT,
            "backend",
            "Backend Gradle Tests"
        );
    }
}

function printSection(title, list) {
    log(`\n\n========================================`);
    log(title);
    log(`========================================`);

    if (list.length === 0) {
        log("✅ No issues detected.");
        return;
    }

    list.forEach((bug, index) => {
        log(`\n[${index + 1}] ${bug.type}`);

        if (bug.name) {
            log(`Name    : ${bug.name}`);
        }

        if (bug.file) {
            log(`File    : ${bug.file}`);
        }

        if (bug.line) {
            log(`Line    : ${bug.line}`);
        }

        if (bug.command) {
            log(`Command : ${bug.command}`);
        }

        log(`Message : ${bug.message || "Unknown error"}`);
    });
}

function writeReport() {
    const output = [];

    output.push("PARTH-PORTFOLIO BUG REPORT");
    output.push(`Generated: ${new Date().toISOString()}`);
    output.push(`Project root: ${ROOT}`);

    for (const [section, list] of Object.entries(bugs)) {
        output.push("");
        output.push("========================================");
        output.push(section.toUpperCase());
        output.push("========================================");

        if (list.length === 0) {
            output.push("No issues detected.");
            continue;
        }

        list.forEach((bug, index) => {
            output.push("");
            output.push(`[${index + 1}] ${bug.type}`);

            if (bug.name) {
                output.push(`Name: ${bug.name}`);
            }

            if (bug.file) {
                output.push(`File: ${bug.file}`);
            }

            if (bug.line) {
                output.push(`Line: ${bug.line}`);
            }

            if (bug.command) {
                output.push(`Command: ${bug.command}`);
            }

            output.push(
                `Message: ${bug.message || "Unknown error"}`
            );
        });
    }

    const total = Object.values(bugs)
        .reduce((sum, list) => sum + list.length, 0);

    output.push("");
    output.push("========================================");
    output.push(`TOTAL ISSUES: ${total}`);
    output.push("========================================");

    fs.writeFileSync(
        REPORT_FILE,
        output.join("\n"),
        "utf8"
    );

    log(`\n📄 Report saved: ${REPORT_FILE}`);
}

function main() {
    log("========================================");
    log("     PARTH-PORTFOLIO BUG SCANNER");
    log("========================================");

    log(`\nProject root detected:`);
    log(ROOT);

    log("\nFrontend:");
    log(
        fs.existsSync(FRONTEND)
            ? `✅ ${FRONTEND}`
            : `❌ ${FRONTEND}`
    );

    log("\nBackend:");
    log(
        fs.existsSync(BACKEND)
            ? `✅ ${BACKEND}`
            : `❌ ${BACKEND}`
    );

    // Static frontend scan
    if (fs.existsSync(FRONTEND)) {
        const files = walk(FRONTEND);

        log(`\nScanning ${files.length} frontend files...`);

        files
            .filter((file) =>
                /\.(js|jsx|ts|tsx)$/.test(file)
            )
            .forEach((file) =>
                inspectFrontendFile(file)
            );
    }

    // Static backend scan
    if (fs.existsSync(BACKEND)) {
        const files = walk(BACKEND);

        log(`Scanning ${files.length} backend files...`);

        files
            .filter((file) =>
                /\.(java|properties|yml|yaml|xml)$/.test(file)
            )
            .forEach((file) =>
                inspectBackendFile(file)
            );
    }

    // Build / test checks
    if (fs.existsSync(FRONTEND)) {
        runFrontendChecks();
    }

    if (fs.existsSync(path.join(ROOT, "pom.xml")) ||
        fs.existsSync(path.join(ROOT, "build.gradle"))) {
        runBackendChecks();
    }

    printSection(
        "FRONTEND BUGS",
        bugs.frontend
    );

    printSection(
        "BACKEND BUGS",
        bugs.backend
    );

    printSection(
        "RUNTIME / COMMAND ERRORS",
        bugs.runtime
    );

    printSection(
        "PROJECT BUGS",
        bugs.project
    );

    const total = Object.values(bugs)
        .reduce((sum, list) => sum + list.length, 0);

    log("\n========================================");
    log(`TOTAL DETECTED ISSUES: ${total}`);
    log("========================================");

    writeReport();
}

main();