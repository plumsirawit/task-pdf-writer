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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var express_1 = __importDefault(require("express"));
var serverless_http_1 = __importDefault(require("serverless-http"));
var app = express_1.default();
var USERS_TABLE = (_a = process.env.USERS_TABLE) !== null && _a !== void 0 ? _a : "USERS";
var dynamoDbClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
app.use(express_1.default.json());
app.get("/api/users/:userId", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var params, Item, userId, name, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = {
                        TableName: USERS_TABLE,
                        Key: {
                            userId: req.params.userId,
                        },
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, dynamoDbClient.get(params).promise()];
                case 2:
                    Item = (_a.sent()).Item;
                    if (Item) {
                        userId = Item.userId, name = Item.name;
                        res.json({ userId: userId, name: name });
                    }
                    else {
                        res
                            .status(404)
                            .json({ error: 'Could not find user with provided "userId"' });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.log(error_1);
                    res.status(500).json({ error: "Could not retreive user" });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
});
app.post("/api/users", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, userId, name, params, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, userId = _a.userId, name = _a.name;
                    if (typeof userId !== "string") {
                        res.status(400).json({ error: '"userId" must be a string' });
                    }
                    else if (typeof name !== "string") {
                        res.status(400).json({ error: '"name" must be a string' });
                    }
                    params = {
                        TableName: USERS_TABLE,
                        Item: {
                            userId: userId,
                            name: name,
                        },
                    };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, dynamoDbClient.put(params).promise()];
                case 2:
                    _b.sent();
                    res.json({ userId: userId, name: name });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _b.sent();
                    console.log(error_2);
                    res.status(500).json({ error: "Could not create user" });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
});
app.get("/api/hello", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            res.status(200).json({ message: "Hello, world!" });
            return [2 /*return*/];
        });
    });
});
app.use(function (req, res, next) {
    return res.status(404).json({
        error: "Not Found",
        path: req.url,
    });
});
exports.handler = serverless_http_1.default(app);
//# sourceMappingURL=handler.js.map