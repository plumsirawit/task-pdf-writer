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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
var express_1 = __importDefault(require("express"));
var serverless_http_1 = __importDefault(require("serverless-http"));
var wkhtmltopdf_1 = __importDefault(require("wkhtmltopdf"));
var child_process_1 = require("child_process");
//wkhtmltopdf.command = "/opt/bin/wkhtmltopdf";
wkhtmltopdf_1.default.shell = "bash";
var fs_1 = __importDefault(require("fs"));
var app = express_1.default();
app.use(express_1.default.json());
app.get("/pdf/hello", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            res.status(200).json({ message: "Hello, world!" });
            return [2 /*return*/];
        });
    });
});
app.get("/pdf/generate", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    file = "/tmp/out.pdf";
                    return [4 /*yield*/, new Promise(function (reso) {
                            return wkhtmltopdf_1.default("https://www.google.com/", {
                                pageSize: "A4",
                            })
                                .pipe(fs_1.default.createWriteStream(file))
                                .on("finish", function () { return reso(); });
                        })];
                case 1:
                    _a.sent();
                    res.download(file);
                    return [2 /*return*/];
            }
        });
    });
});
app.get("/pdf/readfiles", function (req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var dir, dirList;
        return __generator(this, function (_b) {
            dir = (_a = req.query.dir) !== null && _a !== void 0 ? _a : __dirname;
            try {
                dirList = fs_1.default.readdirSync(dir);
                res.status(200).json({ listing: dirList, directory: dir });
            }
            catch (e) {
                res.status(500).json({ error: e.message });
            }
            return [2 /*return*/];
        });
    });
});
app.get("/pdf/manual", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        function quote(val) {
            // escape and quote the value if it is a string and this isn't windows
            if (typeof val === "string" && process.platform !== "win32") {
                val = '"' + val.replace(/(["\\$`])/g, "\\$1") + '"';
            }
            return val;
        }
        var args, input, isUrl, child;
        return __generator(this, function (_a) {
            args = [wkhtmltopdf_1.default.command];
            input = req.query.input;
            isUrl = /^(https?|file):\/\//.test(input);
            if (input) {
                args.push(isUrl ? quote(input) : "-");
            }
            args.push("C:/tmp/out-bbb.pdf");
            child = child_process_1.execSync([wkhtmltopdf_1.default.shell, "-c", "set -oe pipefail ; " + args.join(" ")].join(" "));
            res.download("C:/tmp/out-bbb.pdf");
            return [2 /*return*/];
        });
    });
});
app.use(function (req, res, next) {
    return res.status(404).json({
        error: "Not Found",
    });
});
exports.handler = serverless_http_1.default(app);
//# sourceMappingURL=handler-pdf.js.map