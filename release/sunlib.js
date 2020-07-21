var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var suncom;
(function (suncom) {
    var DebugMode;
    (function (DebugMode) {
        DebugMode[DebugMode["ANY"] = 1] = "ANY";
        DebugMode[DebugMode["ENGINE"] = 2] = "ENGINE";
        DebugMode[DebugMode["NATIVE"] = 4] = "NATIVE";
        DebugMode[DebugMode["NETWORK"] = 8] = "NETWORK";
        DebugMode[DebugMode["NETWORK_HEARTBEAT"] = 16] = "NETWORK_HEARTBEAT";
        DebugMode[DebugMode["DEBUG"] = 32] = "DEBUG";
        DebugMode[DebugMode["ENGINEER"] = 64] = "ENGINEER";
        DebugMode[DebugMode["NORMAL"] = 128] = "NORMAL";
        DebugMode[DebugMode["TEST"] = 256] = "TEST";
        DebugMode[DebugMode["TDD"] = 512] = "TDD";
        DebugMode[DebugMode["ATDD"] = 1024] = "ATDD";
    })(DebugMode = suncom.DebugMode || (suncom.DebugMode = {}));
    var EnvMode;
    (function (EnvMode) {
        EnvMode[EnvMode["DEVELOP"] = 0] = "DEVELOP";
        EnvMode[EnvMode["DEBUG"] = 1] = "DEBUG";
        EnvMode[EnvMode["WEB"] = 2] = "WEB";
    })(EnvMode = suncom.EnvMode || (suncom.EnvMode = {}));
    var EventPriorityEnum;
    (function (EventPriorityEnum) {
        EventPriorityEnum[EventPriorityEnum["LOWEST"] = 0] = "LOWEST";
        EventPriorityEnum[EventPriorityEnum["LOW"] = 1] = "LOW";
        EventPriorityEnum[EventPriorityEnum["MID"] = 2] = "MID";
        EventPriorityEnum[EventPriorityEnum["HIGH"] = 3] = "HIGH";
        EventPriorityEnum[EventPriorityEnum["HIGHEST"] = 4] = "HIGHEST";
        EventPriorityEnum[EventPriorityEnum["FWL"] = 5] = "FWL";
        EventPriorityEnum[EventPriorityEnum["EGL"] = 6] = "EGL";
        EventPriorityEnum[EventPriorityEnum["OSL"] = 7] = "OSL";
    })(EventPriorityEnum = suncom.EventPriorityEnum || (suncom.EventPriorityEnum = {}));
    var EventSystem = (function () {
        function EventSystem() {
            this.$events = {};
            this.$onceList = [];
            this.$isCanceled = false;
        }
        EventSystem.prototype.dispatchCancel = function () {
            this.$isCanceled = true;
        };
        EventSystem.prototype.dispatchEvent = function (type, args, cancelable) {
            if (cancelable === void 0) { cancelable = false; }
            if (Common.isStringInvalidOrEmpty(type) === true) {
                throw Error("\u6D3E\u53D1\u65E0\u6548\u4E8B\u4EF6\uFF01\uFF01\uFF01");
            }
            var list = this.$events[type] || null;
            if (list === null) {
                return;
            }
            list[0] = true;
            var isCanceled = this.$isCanceled;
            this.$isCanceled = false;
            for (var i = 1; i < list.length; i++) {
                var event_1 = list[i];
                if (event_1.receiveOnce === true) {
                    this.$onceList.push(event_1);
                }
                if (args === void 0) {
                    event_1.method.call(event_1.caller);
                }
                else if (args instanceof Array) {
                    event_1.method.apply(event_1.caller, args);
                }
                else {
                    event_1.method.call(event_1.caller, args);
                }
                if (this.$isCanceled) {
                    if (cancelable === true) {
                        break;
                    }
                    suncom.Test.notExpected("\u5C1D\u8BD5\u53D6\u6D88\u4E0D\u53EF\u88AB\u53D6\u6D88\u7684\u4E8B\u4EF6\uFF1A" + name);
                }
            }
            this.$isCanceled = isCanceled;
            list[0] = false;
            while (this.$onceList.length > 0) {
                var event_2 = this.$onceList.pop();
                this.removeEventListener(event_2.type, event_2.method, event_2.caller);
            }
        };
        EventSystem.prototype.addEventListener = function (type, method, caller, receiveOnce, priority) {
            if (receiveOnce === void 0) { receiveOnce = false; }
            if (priority === void 0) { priority = EventPriorityEnum.MID; }
            if (Common.isStringInvalidOrEmpty(type) === true) {
                throw Error("\u6CE8\u518C\u65E0\u6548\u4E8B\u4EF6\uFF01\uFF01\uFF01");
            }
            if (method === void 0 || method === null) {
                throw Error("\u6CE8\u518C\u65E0\u6548\u7684\u4E8B\u4EF6\u56DE\u8C03\uFF01\uFF01\uFF01");
            }
            var list = this.$events[type] || null;
            if (list === null) {
                list = this.$events[type] = [false];
            }
            else if (list[0] === true) {
                list = this.$events[type] = list.slice(0);
                list[0] = false;
            }
            var index = -1;
            for (var i = 1; i < list.length; i++) {
                var item = list[i];
                if (item.method === method && item.caller === caller) {
                    return;
                }
                if (index === -1 && item.priority < priority) {
                    index = i;
                }
            }
            var event = {
                type: type,
                method: method,
                caller: caller,
                priority: priority,
                receiveOnce: receiveOnce
            };
            if (index < 0) {
                list.push(event);
            }
            else {
                list.splice(index, 0, event);
            }
        };
        EventSystem.prototype.removeEventListener = function (type, method, caller) {
            if (Common.isStringInvalidOrEmpty(type) === true) {
                throw Error("\u79FB\u9664\u65E0\u6548\u7684\u4E8B\u4EF6\uFF01\uFF01\uFF01");
            }
            if (method === void 0 || method === null) {
                throw Error("\u79FB\u9664\u65E0\u6548\u7684\u4E8B\u4EF6\u56DE\u8C03\uFF01\uFF01\uFF01");
            }
            var list = this.$events[type] || null;
            if (list === null) {
                return;
            }
            if (list[0] === true) {
                list = this.$events[type] = list.slice(0);
                list[0] = false;
            }
            for (var i = 0; i < list.length; i++) {
                var event_3 = list[i];
                if (event_3.method === method && event_3.caller === caller) {
                    list.splice(i, 1);
                    break;
                }
            }
            if (list.length === 1) {
                delete this.$events[type];
            }
        };
        return EventSystem;
    }());
    suncom.EventSystem = EventSystem;
    var Expect = (function () {
        function Expect(description) {
            if (description === void 0) { description = null; }
            this.$asNot = false;
            this.$interpretation = null;
            if (Global.debugMode & DebugMode.TEST) {
                description !== null && Logger.log(DebugMode.ANY, description);
            }
        }
        Expect.prototype.expect = function (value) {
            this.$value = value;
            return this;
        };
        Expect.prototype.interpret = function (str) {
            this.$interpretation = str;
            return this;
        };
        Expect.prototype.test = function (pass, message) {
            if ((this.$asNot === false && pass === false) || (this.$asNot === true && pass === true)) {
                Test.ASSERT_FAILED = true;
                message !== null && Logger.error(DebugMode.ANY, message);
                this.$interpretation !== null && Logger.error(DebugMode.ANY, this.$interpretation);
                if (Test.ASSERT_BREAKPOINT === true) {
                    debugger;
                }
                throw Error("测试失败！");
            }
        };
        Expect.prototype.anything = function () {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$value !== null && this.$value !== void 0;
                var message = "\u671F\u671B\u503C" + (this.$asNot === false ? "" : "不为") + "\uFF1Anull or undefined, \u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(this.$value);
                this.test(pass, message);
            }
        };
        Expect.prototype.arrayContaining = function (array) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = true;
                for (var i = 0; i < array.length; i++) {
                    var value = array[i];
                    if (this.$value.indexOf(value) < 0) {
                        pass = false;
                        break;
                    }
                }
                var message = "\u671F\u671B" + (this.$asNot === false ? "" : "不") + "\u5305\u542B\uFF1A" + Common.toDisplayString(array) + ", \u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(this.$value);
                this.test(pass, message);
            }
        };
        Expect.prototype.stringContaining = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$value.indexOf(value) > -1;
                var message = "\u671F\u671B" + (this.$asNot === false ? "" : "不") + "\u5305\u542B\uFF1A" + value + ", \u5B9E\u9645\u503C\uFF1A" + this.$value;
                this.test(pass, message);
            }
        };
        Expect.prototype.stringMatching = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = value.indexOf(this.$value) > -1;
                var message = "\u671F\u671B" + (this.$asNot === false ? "" : "不") + "\u88AB\u5305\u542B\uFF1A" + value + ", \u5B9E\u9645\u503C\uFF1A" + this.$value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toHaveProperty = function (key, value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = value === void 0 ? this.$value[key] !== void 0 : this.$value[key] === value;
                var message = "\u671F\u671B" + (this.$asNot === false ? "" : "不") + "\u5B58\u5728\u5C5E\u6027\uFF1A" + key + ", \u5B9E\u9645\u503C\uFF1A" + this.$value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toBe = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$value === value;
                var message = "\u671F\u671B\u503C" + (this.$asNot === false ? "" : "不为") + "\uFF1A" + Common.toDisplayString(value) + ", \u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(this.$value);
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeNull = function () {
            this.toBe(null);
        };
        Expect.prototype.toBeUndefined = function () {
            this.toBe(void 0);
        };
        Expect.prototype.toBeBoolean = function () {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = typeof this.$value === "boolean";
                var message = "\u671F\u671B" + (this.$asNot === false ? "为" : "不为") + "\uFF1A\u5E03\u5C14\u7C7B\u578B, \u5B9E\u9645\u4E3A\uFF1A" + typeof this.$value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeInstanceOf = function (cls) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$value instanceof cls;
                var message = "\u671F\u671B " + Common.getQualifiedClassName(this.$value) + " \u7684\u7C7B\u578B" + (this.$asNot === false ? "" : "不") + "\u4E3A " + Common.getClassName(cls);
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeFalsy = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = value ? false : true;
                var message = "\u671F\u671B " + Common.toDisplayString(value) + " " + (this.$asNot === false ? "" : "不") + "\u4E3A\u5047, \u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(this.$value);
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeTruthy = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = value ? true : false;
                var message = "\u671F\u671B " + Common.toDisplayString(value) + " " + (this.$asNot === false ? "" : "不") + "\u4E3A\u5047, \u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(this.$value);
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeCloseTo = function (value, deviation) {
            if (deviation === void 0) { deviation = 0; }
            if (Global.debugMode & DebugMode.TEST) {
                var pass = Math.abs(this.$value - value) <= Math.abs(deviation);
                var message = "\u671F\u671B\u4E0E" + value + "\u7684\u8BEF\u5DEE" + (this.$asNot === true ? "" : "不") + "\u8D85\u8FC7" + deviation + "\uFF0C\u5B9E\u9645\u503C\uFF1A" + this.$value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeGreaterThan = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$value > value;
                var message = "\u671F\u671B" + (this.$asNot === true ? "" : "不") + "\u5927\u4E8E " + value + "\uFF0C\u5B9E\u9645\u503C\uFF1A" + this.$value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeGreaterOrEqualThan = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$value >= value;
                var message = "\u671F\u671B" + (this.$asNot === true ? "" : "不") + "\u5927\u4E8E\u7B49\u4E8E " + value + "\uFF0C\u5B9E\u9645\u503C\uFF1A" + this.$value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeLessThan = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$value < value;
                var message = "\u671F\u671B" + (this.$asNot === true ? "" : "不") + "\u5C0F\u4E8E " + value + "\uFF0C\u5B9E\u9645\u503C\uFF1A" + this.$value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeLessOrEqualThan = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$value <= value;
                var message = "\u671F\u671B" + (this.$asNot === true ? "" : "不") + "\u5C0F\u4E8E\u7B49\u4E8E " + value + "\uFF0C\u5B9E\u9645\u503C\uFF1A" + this.$value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toEqual = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = Common.isEqual(this.$value, value, false);
                var message = "\u671F\u671B\u76F8\u7B49\uFF1A" + Common.toDisplayString(value) + "\uFF0C\u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(this.$value);
                this.test(pass, message);
            }
        };
        Expect.prototype.toStrictEqual = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = Common.isEqual(this.$value, value, true);
                var message = "\u671F\u671B\u76F8\u7B49\uFF1A" + Common.toDisplayString(value) + "\uFF0C\u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(this.$value);
                this.test(pass, message);
            }
        };
        Object.defineProperty(Expect.prototype, "not", {
            get: function () {
                this.$asNot = true;
                return this;
            },
            enumerable: true,
            configurable: true
        });
        return Expect;
    }());
    suncom.Expect = Expect;
    var Handler = (function () {
        function Handler(caller, method, args) {
            this.$args = args;
            this.$caller = caller;
            this.$method = method;
        }
        Handler.prototype.run = function () {
            if (this.$args === void 0) {
                return this.$method.call(this.$caller);
            }
            return this.$method.apply(this.$caller, this.$args);
        };
        Handler.prototype.runWith = function (args) {
            if (this.$args === void 0) {
                if (args instanceof Array) {
                    return this.$method.apply(this.$caller, args);
                }
                return this.$method.call(this.$caller, args);
            }
            return this.$method.apply(this.$caller, this.$args.concat(args));
        };
        Object.defineProperty(Handler.prototype, "caller", {
            get: function () {
                return this.$caller;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Handler.prototype, "method", {
            get: function () {
                return this.$method;
            },
            enumerable: true,
            configurable: true
        });
        Handler.create = function (caller, method, args) {
            return new Handler(caller, method, args);
        };
        return Handler;
    }());
    suncom.Handler = Handler;
    var HashMap = (function () {
        function HashMap(primaryKey) {
            this.source = [];
            this.dataMap = {};
            if (typeof primaryKey !== "string") {
                throw Error("\u975E\u6CD5\u7684\u4E3B\u952E\u5B57\u6BB5\u540D\uFF1A" + primaryKey);
            }
            if (primaryKey.length === 0) {
                throw Error("\u65E0\u6548\u7684\u4E3B\u952E\u5B57\u6BB5\u540D\u5B57\u957F\u5EA6\uFF1A" + primaryKey.length);
            }
            this.$primaryKey = primaryKey;
        }
        HashMap.prototype.$removeByIndex = function (index) {
            var data = this.source[index];
            this.source.splice(index, 1);
            var value = data[this.$primaryKey];
            delete this.dataMap[value];
            return data;
        };
        HashMap.prototype.$getIndexByValue = function (key, value) {
            if (value === void 0) {
                return -1;
            }
            for (var i = 0; i < this.source.length; i++) {
                var data = this.source[i];
                if (data[key] === value) {
                    return i;
                }
            }
            return -1;
        };
        HashMap.prototype.put = function (data) {
            var value = data[this.$primaryKey];
            if (Common.isStringInvalidOrEmpty(value) === true) {
                throw Error("\u65E0\u6548\u7684\u4E3B\u952E\u7684\u503C\uFF0Ctype:" + typeof value + ", value:" + value);
            }
            if (this.getByPrimaryValue(value) === null) {
                this.source.push(data);
                this.dataMap[value] = data;
            }
            else {
                throw Error("\u91CD\u590D\u7684\u4E3B\u952E\u503C\uFF1A[" + this.$primaryKey + "]" + value);
            }
            return data;
        };
        HashMap.prototype.getByValue = function (key, value) {
            if (key === this.$primaryKey) {
                return this.getByPrimaryValue(value);
            }
            var index = this.$getIndexByValue(key, value);
            if (index === -1) {
                return null;
            }
            return this.source[index];
        };
        HashMap.prototype.getByPrimaryValue = function (value) {
            return this.dataMap[value.toString()] || null;
        };
        HashMap.prototype.remove = function (data) {
            var index = this.source.indexOf(data);
            if (index === -1) {
                return data;
            }
            return this.$removeByIndex(index);
        };
        HashMap.prototype.removeByValue = function (key, value) {
            if (key === this.$primaryKey) {
                return this.removeByPrimaryValue(value);
            }
            var index = this.$getIndexByValue(key, value);
            if (index === -1) {
                return null;
            }
            return this.$removeByIndex(index);
        };
        HashMap.prototype.removeByPrimaryValue = function (value) {
            var data = this.getByPrimaryValue(value);
            if (data === null) {
                return null;
            }
            return this.remove(data);
        };
        HashMap.prototype.forEach = function (method) {
            for (var i = 0; i < this.source.length; i++) {
                if (method(this.source[i]) === true) {
                    break;
                }
            }
        };
        return HashMap;
    }());
    suncom.HashMap = HashMap;
    var Common;
    (function (Common) {
        var $hashId = 0;
        function createHashId() {
            $hashId++;
            return $hashId;
        }
        Common.createHashId = createHashId;
        function getClassName(cls) {
            var classString = cls.toString().trim();
            var index = classString.indexOf("(");
            return cls.name || classString.substring(9, index);
        }
        Common.getClassName = getClassName;
        function getQualifiedClassName(obj) {
            var type = typeof obj;
            if (type !== "object") {
                return type;
            }
            var prototype = obj.prototype || Object.getPrototypeOf(obj) || null;
            if (prototype === null) {
                return type;
            }
            return Common.getClassName(prototype.constructor);
        }
        Common.getQualifiedClassName = getQualifiedClassName;
        function getMethodName(method, caller) {
            if (caller === void 0) { caller = null; }
            if (caller === null) {
                return Common.getClassName(method);
            }
            for (var key in caller) {
                if (caller[key] === method) {
                    return key;
                }
            }
            return null;
        }
        Common.getMethodName = getMethodName;
        function convertEnumToString(value, oEnum) {
            for (var key in oEnum) {
                if (oEnum[key] === value) {
                    return key;
                }
            }
            return null;
        }
        Common.convertEnumToString = convertEnumToString;
        function trim(str) {
            if (str === void 0) { str = null; }
            if (str === null) {
                return null;
            }
            var chrs = ["\r", "\n", "\t", " "];
            while (str.length > 0) {
                var length_1 = str.length;
                for (var i = 0; i < chrs.length; i++) {
                    var chr = chrs[i];
                    if (str.charAt(0) === chr) {
                        str = str.substr(1);
                        break;
                    }
                    var index = str.length - 1;
                    if (str.charAt(index) === chr) {
                        str = str.substr(0, index);
                        break;
                    }
                }
                if (str.length === length_1) {
                    break;
                }
            }
            return str;
        }
        Common.trim = trim;
        function isStringInvalidOrEmpty(str) {
            if (typeof str === "number") {
                return false;
            }
            if (typeof str === "string" && str !== "") {
                return false;
            }
            return true;
        }
        Common.isStringInvalidOrEmpty = isStringInvalidOrEmpty;
        function formatString(str, args) {
            var signs = ["%d", "%s"];
            var index = 0;
            while (args.length > 0) {
                var key = null;
                var indexOfReplace = -1;
                for (var i = 0; i < signs.length; i++) {
                    var sign = signs[i];
                    var indexOfSign = str.indexOf(sign, index);
                    if (indexOfSign === -1) {
                        continue;
                    }
                    if (indexOfReplace === -1 || indexOfSign < indexOfReplace) {
                        key = sign;
                        indexOfReplace = indexOfSign;
                    }
                }
                if (indexOfReplace === -1) {
                    Logger.warn(DebugMode.ANY, "\u5B57\u7B26\u4E32\u66FF\u6362\u672A\u5B8C\u6210 str:" + str);
                    break;
                }
                var suffix = str.substr(indexOfReplace + key.length);
                str = str.substr(0, indexOfReplace) + args.shift() + suffix;
                index = str.length - suffix.length;
            }
            return str;
        }
        Common.formatString = formatString;
        function formatString$(str, args) {
            var index = 0;
            while (args.length > 0) {
                var indexOfSign = str.indexOf("{$}", index);
                if (index === -1) {
                    Logger.warn(DebugMode.ANY, "\u5B57\u7B26\u4E32\u66FF\u6362\u672A\u5B8C\u6210 str:" + str);
                    break;
                }
                var suffix = str.substr(indexOfSign + 3);
                str = str.substr(0, indexOfSign) + args.shift() + suffix;
                index = str.length - suffix.length;
            }
            return str;
        }
        Common.formatString$ = formatString$;
        function convertToDate(date) {
            if (date instanceof Date) {
                return date;
            }
            if (Mathf.isNumber(date) === true) {
                return new Date(date);
            }
            if (typeof date === "string") {
                var array = date.split(" ");
                var dates = array.length === 1 ? [] : array.shift().split("-");
                var times = array[0].split(":");
                if (times.length === 3) {
                    if (dates.length === 0) {
                        var dt = new Date();
                        dates[0] = dt.getFullYear().toString();
                        dates[1] = (dt.getMonth() + 1).toString();
                        dates[2] = dt.getDate().toString();
                    }
                    return new Date(Number(dates[0]), Number(dates[1]) - 1, Number(dates[2]), Number(times[0]), Number(times[1]), Number(times[2]));
                }
                return new Date(date);
            }
            throw Error("Convert Date Error:" + date);
        }
        Common.convertToDate = convertToDate;
        function dateAdd(datepart, increment, time) {
            var date = Common.convertToDate(time);
            if (datepart === "yy") {
                date.setFullYear(date.getFullYear() + increment);
            }
            else if (datepart === "MM") {
                var rem = increment % 12;
                var mul = (increment - rem) / 12;
                date.setFullYear(date.getFullYear() + mul);
                var month = date.getMonth() + rem;
                if (month > 11) {
                    date.setMonth(month - 12);
                    date.setFullYear(date.getFullYear() + 1);
                }
                else if (month < 0) {
                    date.setMonth(rem + 11);
                    date.setFullYear(date.getFullYear() - 1);
                }
                else {
                    date.setMonth(month);
                }
            }
            var timestamp = date.valueOf();
            if (datepart === "ww") {
                timestamp += increment * 7 * 24 * 3600 * 1000;
            }
            else if (datepart === "dd") {
                timestamp += increment * 24 * 3600 * 1000;
            }
            else if (datepart === "hh") {
                timestamp += increment * 3600 * 1000;
            }
            else if (datepart === "mm") {
                timestamp += increment * 60 * 1000;
            }
            else if (datepart === "ss") {
                timestamp += increment * 1000;
            }
            else if (datepart === "ms") {
                timestamp += increment;
            }
            return timestamp;
        }
        Common.dateAdd = dateAdd;
        function dateDiff(datepart, date, date2) {
            var d1 = Common.convertToDate(date);
            var d2 = Common.convertToDate(date2);
            var t1 = d1.valueOf();
            var t2 = d2.valueOf();
            if (datepart === "ms") {
                return t2 - t1;
            }
            t1 = Math.floor(t1 / 1000);
            t2 = Math.floor(t2 / 1000);
            if (datepart === "ss") {
                return t2 - t1;
            }
            t1 = Math.floor(t1 / 60);
            t2 = Math.floor(t2 / 60);
            if (datepart === "mm") {
                return t2 - t1;
            }
            t1 = Math.floor(t1 / 60);
            t2 = Math.floor(t2 / 60);
            if (datepart === "hh") {
                return t2 - t1;
            }
            t1 = Math.floor(t1 / 24);
            t2 = Math.floor(t2 / 24);
            if (datepart === "dd") {
                return t2 - t1;
            }
            if (datepart === "ww") {
                return Math.floor(((t2 - 4) - (t1 - 4)) / 7);
            }
            if (datepart === "MM") {
                return d2.getMonth() - d1.getMonth() + (d2.getFullYear() - d1.getFullYear()) * 12;
            }
            if (datepart === "yy") {
                return d2.getFullYear() - d1.getFullYear();
            }
            return 0;
        }
        Common.dateDiff = dateDiff;
        function formatDate(str, time) {
            var date = Common.convertToDate(time);
            str = str.replace("MS", ("00" + (date.getMilliseconds()).toString()).substr(-3));
            str = str.replace("ms", (date.getMilliseconds()).toString());
            str = str.replace("yyyy", date.getFullYear().toString());
            str = str.replace("yy", date.getFullYear().toString().substr(2, 2));
            str = str.replace("MM", ("0" + (date.getMonth() + 1).toString()).substr(-2));
            str = str.replace("dd", ("0" + (date.getDate()).toString()).substr(-2));
            str = str.replace("hh", ("0" + (date.getHours()).toString()).substr(-2));
            str = str.replace("mm", ("0" + (date.getMinutes()).toString()).substr(-2));
            str = str.replace("ss", ("0" + (date.getSeconds()).toString()).substr(-2));
            str = str.replace("M", (date.getMonth() + 1).toString());
            str = str.replace("d", (date.getDate()).toString());
            str = str.replace("h", (date.getHours()).toString());
            str = str.replace("m", (date.getMinutes()).toString());
            str = str.replace("s", (date.getSeconds()).toString());
            return str;
        }
        Common.formatDate = formatDate;
        function md5(str) {
            throw Error("未实现的接口！！！");
        }
        Common.md5 = md5;
        function createHttpSign(params, key, sign) {
            if (sign === void 0) { sign = "sign"; }
            var array = [];
            for (var key_1 in params) {
                if (key_1 !== sign) {
                    array.push(key_1 + "=" + params[key_1]);
                }
            }
            array.push("key=" + key);
            return Common.md5(array.join("&"));
        }
        Common.createHttpSign = createHttpSign;
        function getFileName(path) {
            var index = path.lastIndexOf("/");
            if (index > -1) {
                path = path.substr(index + 1);
            }
            var suffix = Common.getFileExtension(path);
            if (suffix === null) {
                return path;
            }
            return path.substr(0, path.length - suffix.length - 1);
        }
        Common.getFileName = getFileName;
        function getFileExtension(path) {
            var index = path.lastIndexOf(".");
            if (index === -1) {
                return null;
            }
            return path.substr(index + 1).toLowerCase();
        }
        Common.getFileExtension = getFileExtension;
        function replacePathExtension(path, newExt) {
            var index = path.lastIndexOf(".");
            if (index === -1) {
                return path;
            }
            return path.substr(0, index + 1) + newExt;
        }
        Common.replacePathExtension = replacePathExtension;
        function findFromArray(array, method, out) {
            if (out === void 0) { out = null; }
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                if (method(item) === true) {
                    if (out === null) {
                        return item;
                    }
                    out.push(item);
                }
            }
            return null;
        }
        Common.findFromArray = findFromArray;
        function removeItemFromArray(item, array) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === item) {
                    array.splice(i, 1);
                    break;
                }
            }
        }
        Common.removeItemFromArray = removeItemFromArray;
        function removeItemsFromArray(items, array) {
            for (var i = 0; i < items.length; i++) {
                Common.removeItemFromArray(items[i], array);
            }
        }
        Common.removeItemsFromArray = removeItemsFromArray;
        function copy(data, deep) {
            if (deep === void 0) { deep = false; }
            if (data instanceof Array) {
                if (deep === false) {
                    return data.slice(0);
                }
                else {
                    var array = [];
                    for (var i = 0; i < data.length; i++) {
                        array.push(Common.copy(data[i], deep));
                    }
                    return array;
                }
            }
            else if (data instanceof Object) {
                var newData = {};
                if (deep === false) {
                    for (var key in data) {
                        newData[key] = data[key];
                    }
                }
                else {
                    for (var key in data) {
                        newData[key] = Common.copy(data[key], deep);
                    }
                }
                return newData;
            }
            return data;
        }
        Common.copy = copy;
        function clone(data) {
            var newData = {};
            for (var key in data) {
                var value = data[key];
                if (typeof value === "number") {
                    newData[key] = 0;
                }
                else if (typeof value === "boolean") {
                    newData[key] = false;
                }
                else if (value instanceof Array) {
                    newData[key] = [];
                }
                else if (value instanceof Object) {
                    newData[key] = null;
                }
                else {
                    throw Error("\u514B\u9686\u610F\u5916\u7684\u6570\u636E\u7C7B\u578B\uFF1A" + value);
                }
            }
            return newData;
        }
        Common.clone = clone;
        function isEqual(oldData, newData, strict) {
            if (oldData === newData) {
                return true;
            }
            if (typeof oldData === "number" && typeof newData === "number" && isNaN(oldData) && isNaN(newData)) {
                return true;
            }
            if (oldData instanceof Array && newData instanceof Array && oldData.length === newData.length) {
                if (strict === false) {
                    oldData = oldData.slice();
                    newData = newData.slice();
                    oldData.sort();
                    newData.sort();
                }
                for (var i = 0; i < oldData.length; i++) {
                    if (Common.isEqual(oldData[i], newData[i], strict) === false) {
                        return false;
                    }
                }
                return true;
            }
            else if (oldData instanceof Object && newData instanceof Object && Object.keys(oldData).length === Object.keys(newData).length) {
                if (strict === true && oldData.constructor !== newData.constructor) {
                    return false;
                }
                for (var key in oldData) {
                    if (oldData.hasOwnProperty(key) === true && Common.isEqual(oldData[key], newData[key], strict) === false) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        Common.isEqual = isEqual;
        function toDisplayString(data) {
            if (data === void 0 || data === null) {
                return data;
            }
            if (typeof data === "number" || typeof data === "string" || typeof data === "boolean") {
                return data.toString();
            }
            var str;
            if (data instanceof Array) {
                var array = [];
                for (var i = 0; i < data.length; i++) {
                    array.push(Common.toDisplayString(data[i]));
                }
                return "[" + array.join(",") + "]";
            }
            else {
                try {
                    str = JSON.stringify(data);
                }
                catch (error) {
                    str = "[" + Common.getQualifiedClassName(data) + "]";
                }
            }
            return str;
        }
        Common.toDisplayString = toDisplayString;
        function compareVersion(ver) {
            if (typeof ver !== "string") {
                Logger.error(DebugMode.ANY, "\u53C2\u6570\u7248\u672C\u53F7\u65E0\u6548");
                return 0;
            }
            if (typeof Global.VERSION !== "string") {
                Logger.error(DebugMode.ANY, "\u7248\u672C\u53F7\u672A\u8BBE\u7F6E");
                return 0;
            }
            var array = ver.split(".");
            var array2 = Global.VERSION.split(".");
            var length = array.length > array2.length ? array.length : array2.length;
            while (array.length < length) {
                array.push("0");
            }
            while (array2.length < length) {
                array2.push("0");
            }
            var error = 0;
            for (var i = 0; i < length; i++) {
                var s0 = array[i];
                var s1 = array2[i];
                if (Mathf.isNumber(s0) === false) {
                    error |= 0x01;
                    array[i] = "0";
                }
                if (Mathf.isNumber(s1) === false) {
                    error |= 0x02;
                    array2[i] = "0";
                }
            }
            if (error & 0x1) {
                Logger.error(DebugMode.ANY, "\u53C2\u6570\u7248\u672C\u53F7\u65E0\u6548 ver:" + ver);
            }
            if (error & 0x2) {
                Logger.error(DebugMode.ANY, "\u5F53\u524D\u7248\u672C\u53F7\u65E0\u6548 ver:" + Global.VERSION);
            }
            if (error > 0) {
                return 0;
            }
            for (var i = 0; i < length; i++) {
                var reg0 = Number(array[i]);
                var reg1 = Number(array2[i]);
                if (reg0 < reg1) {
                    return 1;
                }
                else if (reg0 > reg1) {
                    return -1;
                }
            }
            return 0;
        }
        Common.compareVersion = compareVersion;
    })(Common = suncom.Common || (suncom.Common = {}));
    var DBService;
    (function (DBService) {
        var $id = 0;
        DBService.$table = {};
        function get(name) {
            return DBService.$table[name.toString()];
        }
        DBService.get = get;
        function put(name, data) {
            if (name < 0) {
                $id++;
                DBService.$table["auto_" + $id] = data;
            }
            else {
                DBService.$table[name.toString()] = data;
            }
            return data;
        }
        DBService.put = put;
        function exist(name) {
            return DBService.$table[name.toString()] !== void 0;
        }
        DBService.exist = exist;
        function drop(name) {
            var data = DBService.get(name);
            delete DBService.$table[name.toString()];
            return data;
        }
        DBService.drop = drop;
    })(DBService = suncom.DBService || (suncom.DBService = {}));
    var Global;
    (function (Global) {
        Global.envMode = 0;
        Global.debugMode = 0;
        Global.WIDTH = 1280;
        Global.HEIGHT = 720;
        Global.width = 1280;
        Global.height = 720;
        Global.VERSION = "1.0.0";
    })(Global = suncom.Global || (suncom.Global = {}));
    var Logger;
    (function (Logger) {
        Logger.NUM_OF_BLOCK = 200;
        Logger.LINES_OF_BLOCK = 200;
        var $messages = [];
        Logger.locked = false;
        function $addLine(line) {
            if (Logger.locked === false && $messages.length > Logger.NUM_OF_BLOCK) {
                $messages.shift();
            }
            var lines = null;
            var length = $messages.length;
            if (length > 0) {
                lines = $messages[length - 1];
                if (lines.length === Logger.LINES_OF_BLOCK) {
                    lines = null;
                }
            }
            if (lines === null) {
                lines = [];
                $messages.push(lines);
            }
            lines.push(line);
        }
        function getDebugString(index, length) {
            if (index < 0) {
                length += index;
                index = 0;
            }
            var lineIndex = index % Logger.LINES_OF_BLOCK;
            var groupIndex = (index - lineIndex) / Logger.LINES_OF_BLOCK;
            var lines = [];
            for (var i = 0; i < length; i++) {
                if (groupIndex < $messages.length) {
                    var array = $messages[groupIndex];
                    if (lineIndex < array.length) {
                        lines.push(array[lineIndex]);
                    }
                    lineIndex++;
                    if (lineIndex === array.length) {
                        lineIndex = 0;
                        groupIndex++;
                    }
                }
                else {
                    break;
                }
            }
            return lines;
        }
        Logger.getDebugString = getDebugString;
        function getNumOfLines() {
            var length = 0;
            for (var i = 0; i < $messages.length; i++) {
                length += $messages[i].length;
            }
            return length;
        }
        Logger.getNumOfLines = getNumOfLines;
        function log(mod) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (Global.debugMode > 0 && (mod === DebugMode.ANY || (Global.debugMode & mod) === mod)) {
                var str = args.join(" ");
                console.log(str);
                $addLine(str);
            }
        }
        Logger.log = log;
        function warn(mod) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (Global.debugMode > 0 && (mod === DebugMode.ANY || (Global.debugMode & mod) === mod)) {
                var str = args.join(" ");
                console.warn(str);
                $addLine(str);
            }
        }
        Logger.warn = warn;
        function error(mod) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (Global.debugMode > 0 && (mod === DebugMode.ANY || (Global.debugMode & mod) === mod)) {
                var str = args.join(" ");
                console.error(str);
                $addLine(str);
            }
        }
        Logger.error = error;
        function log2f(mod) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (Global.debugMode > 0 && (mod === DebugMode.ANY || (Global.debugMode & mod) === mod)) {
                var str = args.join(" ");
                console.info(str);
                $addLine(str);
            }
        }
        Logger.log2f = log2f;
        function trace(mod) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (Global.debugMode > 0 && (mod === DebugMode.ANY || (Global.debugMode & mod) === mod)) {
                var str = args.join(" ");
                console.trace(str);
            }
        }
        Logger.trace = trace;
    })(Logger = suncom.Logger || (suncom.Logger = {}));
    var Mathf;
    (function (Mathf) {
        Mathf.PI = Math.PI;
        Mathf.PI2 = Math.PI * 2;
        Mathf.MAX_SAFE_INTEGER = 9007199254740991;
        Mathf.MIN_SAFE_INTEGER = -9007199254740991;
        function d2r(d) {
            return d * Math.PI / 180;
        }
        Mathf.d2r = d2r;
        function r2d(a) {
            return a * 180 / Math.PI;
        }
        Mathf.r2d = r2d;
        function abs(a) {
            if (a < 0) {
                return -a;
            }
            else {
                return a;
            }
        }
        Mathf.abs = abs;
        function min(a, b) {
            if (a < b) {
                return a;
            }
            else {
                return b;
            }
        }
        Mathf.min = min;
        function max(a, b) {
            if (a > b) {
                return a;
            }
            else {
                return b;
            }
        }
        Mathf.max = max;
        function clamp(value, min, max) {
            if (value < min) {
                return min;
            }
            else if (value > max) {
                return max;
            }
            return value;
        }
        Mathf.clamp = clamp;
        function round(value, n) {
            if (n === void 0) { n = 0; }
            var str = value.toString();
            var dotIndex = str.indexOf(".");
            if (dotIndex === -1) {
                return value;
            }
            var integerDotLength = dotIndex + 1;
            if (str.length - integerDotLength <= n) {
                return value;
            }
            var s0 = str.substr(0, dotIndex);
            var s1 = str.substr(integerDotLength, n);
            var s2 = str.substr(integerDotLength + n, 2);
            var a = s2.length === 1 ? s2 : s2.charAt(0);
            var b = s2.length === 1 ? "0" : s2.charAt(1);
            var intValue = parseInt(s0 + s1);
            var floatValue = parseInt(a + b);
            if (intValue < 0 && floatValue > 0) {
                intValue -= 1;
                floatValue = 100 - floatValue;
            }
            var s3 = floatValue.toString();
            var reg0 = parseInt(s3.charAt(0));
            var reg1 = parseInt(s3.charAt(1));
            if (reg0 > 5) {
                intValue += 1;
            }
            else if (reg0 === 5) {
                if (reg1 > 0) {
                    intValue++;
                }
                else {
                    var modValue = intValue % 2;
                    if (modValue === 1 || modValue === -1) {
                        intValue += 1;
                    }
                }
            }
            var newValue = intValue.toString();
            var newDotIndex = newValue.length - n;
            var retValue = newValue.substr(0, newDotIndex) + "." + newValue.substr(newDotIndex);
            var retValueF = parseFloat(retValue);
            return retValueF;
        }
        Mathf.round = round;
        function $round(value, n) {
            if (n === void 0) { n = 0; }
            Logger.warn(DebugMode.ANY, "\u6B64\u63A5\u53E3\u5DF1\u5F03\u7528\uFF1Asuncom.Common.$round(value: number, n: number = 0);");
            var tmpValue = Math.floor(value * Math.pow(10, n + 2));
            var floatValue = tmpValue % 100;
            var intValue = (tmpValue - floatValue) / 100;
            if (floatValue < 0 && floatValue > 0) {
                intValue -= 1;
                floatValue += 100;
            }
            var a = floatValue % 10;
            var b = (floatValue - a) / 10;
            if (b > 5) {
                intValue += 1;
            }
            else if (b === 5) {
                var modValue = a % 2;
                if (modValue === 1 || modValue === -1) {
                    intValue += 1;
                }
            }
            return intValue / Math.pow(10, n);
        }
        Mathf.$round = $round;
        function random(min, max) {
            var value = Random.random() * (max - min);
            return Math.floor(value) + min;
        }
        Mathf.random = random;
        function isNumber(str) {
            if (typeof str === "number") {
                return true;
            }
            if (typeof str === "string" && isNaN(Number(str)) === false) {
                return true;
            }
            return false;
        }
        Mathf.isNumber = isNumber;
    })(Mathf = suncom.Mathf || (suncom.Mathf = {}));
    var Pool;
    (function (Pool) {
        var $pool = {};
        function getItem(sign) {
            var array = $pool[sign] || null;
            if (array === null || array.length === 0) {
                return null;
            }
            var item = array.pop();
            delete item["__suncom__$__inPool__"];
            return item;
        }
        Pool.getItem = getItem;
        function getItemByClass(sign, cls, args) {
            var item = Pool.getItem(sign);
            if (item === null) {
                if (Laya.Prefab !== void 0 && cls === Laya.Prefab) {
                    var prefab = new Laya.Prefab();
                    prefab.json = args;
                    item = prefab.create();
                }
                else {
                    item = {};
                    item.__proto__ = cls.prototype;
                    if (args instanceof Array) {
                        cls.apply(item, args);
                    }
                    else {
                        cls.call(item, args);
                    }
                }
            }
            return item;
        }
        Pool.getItemByClass = getItemByClass;
        function recover(sign, item) {
            if (item["__suncom__$__inPool__"] === true) {
                return;
            }
            item["__suncom__$__inPool__"] = true;
            var array = $pool[sign] || null;
            if (array === null) {
                $pool[sign] = [item];
            }
            else {
                array.push(item);
            }
        }
        Pool.recover = recover;
        function clear(sign) {
            if ($pool[sign] !== void 0) {
                delete $pool[sign];
            }
        }
        Pool.clear = clear;
    })(Pool = suncom.Pool || (suncom.Pool = {}));
    var Random;
    (function (Random) {
        var $r = 1;
        var $A = 1103515245;
        var $C = 12345;
        var $M = 32767;
        function seed(value) {
            if (value < 1) {
                value = 1;
                Logger.warn(DebugMode.ANY, "\u968F\u673A\u79CD\u5B50\u4E0D\u5141\u8BB8\u5C0F\u4E8E1");
            }
            $r = value;
        }
        Random.seed = seed;
        function random() {
            var r = dcodeIO.Long.fromNumber($r);
            var A = dcodeIO.Long.fromNumber($A);
            var C = dcodeIO.Long.fromNumber($C);
            $r = Math.floor(r.mul(A).add(C).low / $M);
            return ($r % $M + $M) / ($M * 2);
        }
        Random.random = random;
    })(Random = suncom.Random || (suncom.Random = {}));
    var Test;
    (function (Test) {
        Test.ASSERT_FAILED = false;
        Test.ASSERT_BREAKPOINT = true;
        var $expect = null;
        function expect(value, description) {
            if (Global.debugMode & DebugMode.TEST) {
                return new Expect(description).expect(value);
            }
            if ($expect === null) {
                $expect = new Expect();
            }
            return $expect;
        }
        Test.expect = expect;
        function notExpected(message) {
            if (Global.debugMode & DebugMode.TEST) {
                suncom.Test.expect(true).interpret("Test.notExpected \u671F\u671B\u4E4B\u5916\u7684").toBe(false);
            }
        }
        Test.notExpected = notExpected;
        function assertTrue(value, message) {
            if (Global.debugMode & DebugMode.TEST) {
                suncom.Test.expect(value).interpret(message || "Test.assertTrue error\uFF0C\u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(value)).toBe(true);
            }
        }
        Test.assertTrue = assertTrue;
        function assertFalse(value, message) {
            if (Global.debugMode & DebugMode.TEST) {
                suncom.Test.expect(value).interpret(message || "Test.assertFalse error\uFF0C\u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(value)).toBe(false);
            }
        }
        Test.assertFalse = assertFalse;
    })(Test = suncom.Test || (suncom.Test = {}));
})(suncom || (suncom = {}));
var suncore;
(function (suncore) {
    var MessagePriorityEnum;
    (function (MessagePriorityEnum) {
        MessagePriorityEnum[MessagePriorityEnum["MIN"] = 0] = "MIN";
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_0"] = 1] = "PRIORITY_0";
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_HIGH"] = 2] = "PRIORITY_HIGH";
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_NOR"] = 3] = "PRIORITY_NOR";
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_LOW"] = 4] = "PRIORITY_LOW";
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_LAZY"] = 5] = "PRIORITY_LAZY";
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_TRIGGER"] = 6] = "PRIORITY_TRIGGER";
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_TASK"] = 7] = "PRIORITY_TASK";
        MessagePriorityEnum[MessagePriorityEnum["MAX"] = 8] = "MAX";
    })(MessagePriorityEnum = suncore.MessagePriorityEnum || (suncore.MessagePriorityEnum = {}));
    var ModuleEnum;
    (function (ModuleEnum) {
        ModuleEnum[ModuleEnum["MIN"] = 0] = "MIN";
        ModuleEnum[ModuleEnum["SYSTEM"] = 0] = "SYSTEM";
        ModuleEnum[ModuleEnum["CUSTOM"] = 1] = "CUSTOM";
        ModuleEnum[ModuleEnum["TIMELINE"] = 2] = "TIMELINE";
        ModuleEnum[ModuleEnum["MAX"] = 3] = "MAX";
    })(ModuleEnum = suncore.ModuleEnum || (suncore.ModuleEnum = {}));
    var MsgQIdEnum;
    (function (MsgQIdEnum) {
        MsgQIdEnum[MsgQIdEnum["NSL_MSG_ID_BEGIN"] = 1] = "NSL_MSG_ID_BEGIN";
        MsgQIdEnum[MsgQIdEnum["NSL_MSG_ID_END"] = 10] = "NSL_MSG_ID_END";
        MsgQIdEnum[MsgQIdEnum["MMI_MSG_ID_BEGIN"] = 10] = "MMI_MSG_ID_BEGIN";
        MsgQIdEnum[MsgQIdEnum["MMI_MSG_ID_END"] = 100] = "MMI_MSG_ID_END";
        MsgQIdEnum[MsgQIdEnum["CUI_MSG_ID_BEGIN"] = 100] = "CUI_MSG_ID_BEGIN";
        MsgQIdEnum[MsgQIdEnum["CUI_MSG_ID_END"] = 200] = "CUI_MSG_ID_END";
        MsgQIdEnum[MsgQIdEnum["GUI_MSG_ID_BEGIN"] = 200] = "GUI_MSG_ID_BEGIN";
        MsgQIdEnum[MsgQIdEnum["GUI_MSG_ID_END"] = 400] = "GUI_MSG_ID_END";
        MsgQIdEnum[MsgQIdEnum["L4C_MSG_ID_BEGIN"] = 400] = "L4C_MSG_ID_BEGIN";
        MsgQIdEnum[MsgQIdEnum["L4C_MSG_ID_END"] = 700] = "L4C_MSG_ID_END";
    })(MsgQIdEnum = suncore.MsgQIdEnum || (suncore.MsgQIdEnum = {}));
    var MsgQModEnum;
    (function (MsgQModEnum) {
        MsgQModEnum[MsgQModEnum["NIL"] = -1] = "NIL";
        MsgQModEnum[MsgQModEnum["KAL"] = 0] = "KAL";
        MsgQModEnum[MsgQModEnum["MMI"] = 1] = "MMI";
        MsgQModEnum[MsgQModEnum["L4C"] = 2] = "L4C";
        MsgQModEnum[MsgQModEnum["CUI"] = 3] = "CUI";
        MsgQModEnum[MsgQModEnum["GUI"] = 4] = "GUI";
        MsgQModEnum[MsgQModEnum["NSL"] = 5] = "NSL";
        MsgQModEnum[MsgQModEnum["ANY"] = 6] = "ANY";
    })(MsgQModEnum = suncore.MsgQModEnum || (suncore.MsgQModEnum = {}));
    var AbstractTask = (function (_super) {
        __extends(AbstractTask, _super);
        function AbstractTask() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$done = false;
            _this.$running = false;
            return _this;
        }
        AbstractTask.prototype.cancel = function () {
        };
        Object.defineProperty(AbstractTask.prototype, "done", {
            get: function () {
                return this.$done;
            },
            set: function (yes) {
                if (this.$done !== yes) {
                    this.$done = yes;
                    if (yes === true) {
                        this.cancel();
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbstractTask.prototype, "running", {
            get: function () {
                return this.$running;
            },
            set: function (yes) {
                this.$running = yes;
            },
            enumerable: true,
            configurable: true
        });
        return AbstractTask;
    }(puremvc.Notifier));
    suncore.AbstractTask = AbstractTask;
    var BaseService = (function (_super) {
        __extends(BaseService, _super);
        function BaseService() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$running = false;
            return _this;
        }
        BaseService.prototype.run = function () {
            if (this.$running === true) {
                suncom.Logger.warn(suncom.DebugMode.ANY, "\u670D\u52A1[" + suncom.Common.getQualifiedClassName(this) + "]\u5DF1\u8FD0\u884C");
                return;
            }
            this.$running = true;
            this.$onRun();
        };
        BaseService.prototype.stop = function () {
            if (this.$running === false) {
                suncom.Logger.warn(suncom.DebugMode.ANY, "\u670D\u52A1[" + suncom.Common.getQualifiedClassName(this) + "]\u672A\u8FD0\u884C");
                return;
            }
            this.$running = false;
            this.$onStop();
        };
        Object.defineProperty(BaseService.prototype, "running", {
            get: function () {
                return this.$running;
            },
            enumerable: true,
            configurable: true
        });
        return BaseService;
    }(puremvc.Notifier));
    suncore.BaseService = BaseService;
    var Engine = (function (_super) {
        __extends(Engine, _super);
        function Engine() {
            var _this = _super.call(this, MsgQModEnum.KAL) || this;
            _this.$delta = 0;
            _this.$runTime = 0;
            _this.$localTime = new Date().valueOf();
            Laya.timer.frameLoop(1, _this, _this.$onFrameLoop);
            return _this;
        }
        Engine.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            _super.prototype.destroy.call(this);
            Laya.timer.clear(this, this.$onFrameLoop);
        };
        Engine.prototype.$onFrameLoop = function () {
            var oldTime = this.$localTime;
            this.$localTime = new Date().valueOf();
            this.$delta = this.$localTime - oldTime;
            if (this.$delta > 0) {
                this.$runTime += this.$delta;
                this.$lapse(this.$delta);
            }
        };
        Engine.prototype.$lapse = function (delta) {
            if (System.isModulePaused(ModuleEnum.CUSTOM) === false) {
                M.timeStamp.lapse(delta);
            }
            if (System.isModulePaused(ModuleEnum.TIMELINE) === false) {
                M.timeline.lapse(delta);
            }
            this.facade.sendNotification(NotifyKey.MSG_Q_BUSINESS, MsgQModEnum.NSL);
            this.facade.sendNotification(NotifyKey.PHYSICS_PREPARE);
            this.facade.sendNotification(NotifyKey.PHYSICS_FRAME);
            M.timerManager.executeTimer();
            this.facade.sendNotification(NotifyKey.ENTER_FRAME);
            M.messageManager !== null && M.messageManager.dealMessage();
            M.messageManager !== null && M.messageManager.classifyMessages0();
            this.facade.sendNotification(NotifyKey.LATER_FRAME);
            this.facade.sendNotification(NotifyKey.MSG_Q_BUSINESS);
        };
        Engine.prototype.getTime = function () {
            return this.$runTime;
        };
        Engine.prototype.getDelta = function () {
            return this.$delta;
        };
        return Engine;
    }(puremvc.Notifier));
    suncore.Engine = Engine;
    var MessageManager = (function () {
        function MessageManager() {
            this.$queues = [];
            for (var mod = ModuleEnum.MIN; mod < ModuleEnum.MAX; mod++) {
                this.$queues[mod] = new MessageQueue(mod);
            }
        }
        MessageManager.prototype.putMessage = function (message) {
            this.$queues[message.mod].putMessage(message);
        };
        MessageManager.prototype.dealMessage = function () {
            for (var mod = ModuleEnum.MIN; mod < ModuleEnum.MAX; mod++) {
                if (System.isModulePaused(mod) === false) {
                    this.$queues[mod].dealMessage();
                }
            }
        };
        MessageManager.prototype.classifyMessages0 = function () {
            for (var mod = ModuleEnum.MIN; mod < ModuleEnum.MAX; mod++) {
                if (System.isModuleStopped(mod) === false) {
                    this.$queues[mod].classifyMessages0();
                }
            }
        };
        MessageManager.prototype.clearMessages = function (mod) {
            this.$queues[mod].clearMessages();
        };
        MessageManager.prototype.cancelTaskByGroupId = function (mod, groupId) {
            this.$queues[mod].cancelTaskByGroupId(mod, groupId);
        };
        return MessageManager;
    }());
    suncore.MessageManager = MessageManager;
    var MessageQueue = (function () {
        function MessageQueue(mod) {
            this.$tasks = [];
            this.$queues = [];
            this.$messages0 = [];
            this.$mod = mod;
            for (var priority = MessagePriorityEnum.MIN; priority < MessagePriorityEnum.MAX; priority++) {
                this.$queues[priority] = [];
            }
        }
        MessageQueue.prototype.putMessage = function (message) {
            this.$messages0.push(message);
        };
        MessageQueue.prototype.dealMessage = function () {
            var dealCount = 0;
            var remainCount = 0;
            for (var priority = MessagePriorityEnum.MIN; priority < MessagePriorityEnum.MAX; priority++) {
                var queue = void 0;
                if (priority === MessagePriorityEnum.PRIORITY_TASK) {
                    queue = this.$tasks;
                }
                else {
                    queue = this.$queues[priority];
                }
                if (queue.length === 0 || priority === MessagePriorityEnum.PRIORITY_LAZY) {
                    continue;
                }
                if (priority === MessagePriorityEnum.PRIORITY_TASK) {
                    for (var id = this.$tasks.length - 1; id > -1; id--) {
                        var tasks = this.$tasks[id];
                        if (tasks.length > 0 && this.$dealTaskMessage(tasks[0]) === true) {
                            tasks.shift();
                            dealCount++;
                        }
                        if (tasks.length > 1) {
                            remainCount += tasks.length - 1;
                        }
                        else if (tasks.length === 0) {
                            this.$tasks.splice(id, 1);
                        }
                    }
                }
                else if (priority === MessagePriorityEnum.PRIORITY_TRIGGER) {
                    var out = { canceled: false };
                    while (queue.length > 0 && this.$dealTriggerMessage(queue[0], out) === true) {
                        queue.shift();
                        if (out.canceled === false) {
                            dealCount++;
                        }
                    }
                }
                else {
                    var okCount = 0;
                    var totalCount = this.$getDealCountByPriority(priority);
                    for (; queue.length > 0 && (totalCount === 0 || okCount < totalCount); okCount++) {
                        if (this.$dealCustomMessage(queue.shift()) === false) {
                            okCount--;
                        }
                    }
                    dealCount += okCount;
                }
                remainCount += queue.length;
            }
            if (remainCount === 0 && dealCount === 0 && this.$messages0.length === 0) {
                var queue = this.$queues[MessagePriorityEnum.PRIORITY_LAZY];
                if (queue.length > 0) {
                    this.$dealCustomMessage(queue.shift());
                    dealCount++;
                }
            }
        };
        MessageQueue.prototype.$dealTaskMessage = function (message) {
            var task = message.task;
            if (task.running === false) {
                task.running = true;
                if (task.run() === true) {
                    task.done = true;
                }
            }
            return task.done === true;
        };
        MessageQueue.prototype.$dealTriggerMessage = function (message, out) {
            if (message.timeout > System.getModuleTimestamp(this.$mod)) {
                return false;
            }
            out.canceled = message.handler.run() === false;
            return true;
        };
        MessageQueue.prototype.$dealCustomMessage = function (message) {
            return message.handler.run() !== false;
        };
        MessageQueue.prototype.$getDealCountByPriority = function (priority) {
            if (priority === MessagePriorityEnum.PRIORITY_0) {
                return 0;
            }
            if (priority === MessagePriorityEnum.PRIORITY_HIGH) {
                return 10;
            }
            if (priority === MessagePriorityEnum.PRIORITY_NOR) {
                return 3;
            }
            if (priority === MessagePriorityEnum.PRIORITY_LOW) {
                return 1;
            }
            throw Error("错误的消息优先级");
        };
        MessageQueue.prototype.classifyMessages0 = function () {
            while (this.$messages0.length > 0) {
                var message = this.$messages0.shift();
                if (message.priority === MessagePriorityEnum.PRIORITY_TASK) {
                    this.$addTaskMessage(message);
                }
                else if (message.priority === MessagePriorityEnum.PRIORITY_TRIGGER) {
                    this.$addTriggerMessage(message);
                }
                else {
                    this.$queues[message.priority].push(message);
                }
            }
        };
        MessageQueue.prototype.$addTriggerMessage = function (message) {
            var queue = this.$queues[MessagePriorityEnum.PRIORITY_TRIGGER];
            var min = 0;
            var mid = 0;
            var max = queue.length - 1;
            var index = -1;
            while (max - min > 1) {
                mid = Math.floor((min + max) * 0.5);
                if (queue[mid].timeout <= message.timeout) {
                    min = mid;
                }
                else if (queue[mid].timeout > message.timeout) {
                    max = mid;
                }
                else {
                    break;
                }
            }
            for (var i = min; i <= max; i++) {
                if (queue[i].timeout > message.timeout) {
                    index = i;
                    break;
                }
            }
            if (index < 0) {
                queue.push(message);
            }
            else {
                queue.splice(index, 0, message);
            }
        };
        MessageQueue.prototype.$addTaskMessage = function (message) {
            var index = -1;
            for (var i = 0; i < this.$tasks.length; i++) {
                var tasks = this.$tasks[i];
                if (tasks.length > 0 && tasks[0].groupId === message.groupId) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                this.$tasks.unshift([message]);
            }
            else {
                this.$tasks[index].push(message);
            }
        };
        MessageQueue.prototype.clearMessages = function () {
            while (this.$messages0.length > 0) {
                this.$cancelMessage(this.$messages0.shift());
            }
            for (var i = 0; i < this.$tasks.length; i++) {
                var tasks = this.$tasks[i];
                while (tasks.length > 0) {
                    this.$cancelMessage(tasks.shift());
                }
            }
            for (var priority = MessagePriorityEnum.MIN; priority < MessagePriorityEnum.MAX; priority++) {
                var queue = this.$queues[priority];
                while (queue.length > 0) {
                    this.$cancelMessage(queue.shift());
                }
            }
        };
        MessageQueue.prototype.$cancelMessage = function (message) {
            if (message.priority === MessagePriorityEnum.PRIORITY_TASK) {
                message.task.done = true;
            }
        };
        MessageQueue.prototype.cancelTaskByGroupId = function (mod, groupId) {
            for (var id = 0; id < this.$tasks.length; id++) {
                var tasks = this.$tasks[id];
                if (tasks.length > 0 && tasks[0].groupId === groupId) {
                    while (tasks.length > 0) {
                        tasks.shift().task.done = true;
                    }
                    break;
                }
            }
        };
        return MessageQueue;
    }());
    suncore.MessageQueue = MessageQueue;
    var MsgQService = (function (_super) {
        __extends(MsgQService, _super);
        function MsgQService() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MsgQService.prototype.$onRun = function () {
            MsgQ.setModuleActive(this.msgQMod, true);
            this.facade.registerObserver(NotifyKey.MSG_Q_BUSINESS, this.$onMsgQBusiness, this);
        };
        MsgQService.prototype.$onStop = function () {
            MsgQ.setModuleActive(this.msgQMod, false);
            this.facade.removeObserver(NotifyKey.MSG_Q_BUSINESS, this.$onMsgQBusiness, this);
        };
        MsgQService.prototype.$onMsgQBusiness = function (mod) {
            var msg = null;
            if (mod === void 0 || mod === this.msgQMod) {
                while (true) {
                    if (mod === MsgQModEnum.NSL) {
                        msg = MsgQ.fetch(MsgQModEnum.NSL, 2);
                    }
                    else if (this.msgQMod === MsgQModEnum.NSL) {
                        msg = MsgQ.fetch(MsgQModEnum.NSL, 1);
                    }
                    else {
                        msg = MsgQ.fetch(this.msgQMod);
                    }
                    if (msg === null) {
                        break;
                    }
                    this.$dealMsgQMsg(msg);
                }
                MsgQ.seqId++;
            }
        };
        return MsgQService;
    }(BaseService));
    suncore.MsgQService = MsgQService;
    var PauseTimelineCommand = (function (_super) {
        __extends(PauseTimelineCommand, _super);
        function PauseTimelineCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PauseTimelineCommand.prototype.execute = function (mod, stop) {
            suncom.Test.expect(stop).interpret("\u5E94\u5F53\u4E3A\u53C2\u6570 stop \u6307\u5B9A\u6709\u6548\u503C").toBeBoolean();
            if (stop === true) {
                if (System.isModuleStopped(mod) === true) {
                    suncom.Logger.error(suncom.DebugMode.ANY, "\u6A21\u5757 " + ModuleEnum[mod] + " \u5DF1\u7ECF\u505C\u6B62\uFF01\uFF01\uFF01");
                    return;
                }
            }
            else if (System.isModulePaused(mod) === true) {
                suncom.Logger.error(suncom.DebugMode.ANY, "\u6A21\u5757 " + ModuleEnum[mod] + " \u5DF1\u7ECF\u6682\u505C\uFF01\uFF01\uFF01");
                return;
            }
            else if (mod === ModuleEnum.SYSTEM) {
                suncom.Logger.error(suncom.DebugMode.ANY, "\u65E0\u6CD5\u6682\u505C " + ModuleEnum[mod] + " \u6A21\u5757\uFF01\uFF01\uFF01");
                return;
            }
            if (mod === ModuleEnum.TIMELINE) {
                M.timeline.pause(stop);
            }
            else if (mod === ModuleEnum.CUSTOM) {
                M.timeStamp.pause(stop);
            }
            if (stop === false) {
                return;
            }
            if (mod === ModuleEnum.SYSTEM) {
                if (System.isModuleStopped(ModuleEnum.TIMELINE) === false || System.isModuleStopped(ModuleEnum.CUSTOM) === false) {
                    suncom.Test.notExpected("SYSTEM \u4E0D\u80FD\u505C\u6B62\u56E0\u4E3A CUSTOM \u6216 TIMELINE \u4F9D\u7136\u5728\u8FD0\u884C");
                    return;
                }
            }
            M.timerManager.clearTimer(mod);
            M.messageManager.clearMessages(mod);
            if (mod === ModuleEnum.TIMELINE) {
                M.timeline = null;
            }
            else if (mod === ModuleEnum.CUSTOM) {
                M.timeStamp = null;
            }
            else {
                M.engine.destroy();
                M.engine = null;
            }
            if (mod === ModuleEnum.SYSTEM) {
                M.timerManager = null;
                M.messageManager = null;
            }
        };
        return PauseTimelineCommand;
    }(puremvc.SimpleCommand));
    suncore.PauseTimelineCommand = PauseTimelineCommand;
    var SimpleTask = (function (_super) {
        __extends(SimpleTask, _super);
        function SimpleTask(handler) {
            var _this = _super.call(this) || this;
            _this.$handler = handler;
            return _this;
        }
        SimpleTask.prototype.run = function () {
            this.$handler.run();
            return true;
        };
        return SimpleTask;
    }(AbstractTask));
    suncore.SimpleTask = SimpleTask;
    var StartTimelineCommand = (function (_super) {
        __extends(StartTimelineCommand, _super);
        function StartTimelineCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StartTimelineCommand.prototype.execute = function (mod, pause) {
            suncom.Test.expect(pause).interpret("\u5E94\u5F53\u4E3A\u53C2\u6570 pause \u6307\u5B9A\u6709\u6548\u503C").toBeBoolean();
            if (System.isModulePaused(mod) === false) {
                suncom.Logger.error(suncom.DebugMode.ANY, "\u6A21\u5757 " + ModuleEnum[mod] + " \u5DF1\u7ECF\u542F\u52A8\uFF01\uFF01\uFF01");
                return;
            }
            if (mod === ModuleEnum.SYSTEM && M.engine === null) {
                M.timerManager = new TimerManager();
                M.messageManager = new MessageManager();
            }
            if (mod === ModuleEnum.TIMELINE) {
                if (M.timeline === null) {
                    M.timeline = new Timeline();
                }
                M.timeline.resume(pause);
            }
            else if (mod === ModuleEnum.CUSTOM) {
                if (M.timeStamp === null) {
                    M.timeStamp = new Timeline();
                }
                M.timeStamp.resume(pause);
            }
            else if (mod === ModuleEnum.SYSTEM) {
                if (M.engine === null) {
                    M.engine = new Engine();
                }
            }
        };
        return StartTimelineCommand;
    }(puremvc.SimpleCommand));
    suncore.StartTimelineCommand = StartTimelineCommand;
    var Timeline = (function () {
        function Timeline() {
            this.$runTime = 0;
            this.$paused = true;
            this.$stopped = true;
        }
        Timeline.prototype.lapse = function (delta) {
            this.$runTime += delta;
        };
        Timeline.prototype.pause = function (stop) {
            this.$paused = true;
            this.$stopped = stop;
        };
        Timeline.prototype.resume = function (paused) {
            this.$paused = paused;
            this.$stopped = false;
        };
        Timeline.prototype.getTime = function () {
            return this.$runTime;
        };
        Object.defineProperty(Timeline.prototype, "paused", {
            get: function () {
                return this.$paused;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Timeline.prototype, "stopped", {
            get: function () {
                return this.$stopped;
            },
            enumerable: true,
            configurable: true
        });
        return Timeline;
    }());
    suncore.Timeline = Timeline;
    var TimerManager = (function () {
        function TimerManager() {
            this.$seedId = 0;
            this.$timers = [];
            this.$timerMap = {};
            for (var mod = ModuleEnum.MIN; mod < ModuleEnum.MAX; mod++) {
                this.$timers[mod] = [];
            }
        }
        TimerManager.prototype.$createNewTimerId = function () {
            this.$seedId++;
            return this.$seedId;
        };
        TimerManager.prototype.executeTimer = function () {
            for (var mod = ModuleEnum.MIN; mod < ModuleEnum.MAX; mod++) {
                if (System.isModulePaused(mod) === false) {
                    var timers = this.$timers[mod];
                    var timestamp = System.getModuleTimestamp(mod);
                    while (timers.length > 0) {
                        var timer = timers[0];
                        if (timer.active === true) {
                            if (timer.timeout > timestamp) {
                                break;
                            }
                            if (timer.real === true) {
                                timer.count++;
                            }
                            else {
                                timer.count = suncom.Mathf.min(Math.floor((timestamp - timer.timestamp) / timer.delay), timer.loops);
                            }
                        }
                        if (timer.active === false || (timer.loops > 0 && timer.count >= timer.loops)) {
                            delete this.$timerMap[timer.timerId];
                        }
                        else {
                            this.addTimer(timer.mod, timer.delay, timer.method, timer.caller, timer.args, timer.loops, timer.real, timer.timerId, timer.timestamp, timer.timeout, timer.count);
                        }
                        timers.shift();
                        if (timer.active === true) {
                            if (timer.args === null) {
                                timer.method.call(timer.caller, timer.count, timer.loops);
                            }
                            else {
                                timer.method.apply(timer.caller, timer.args.concat(timer.count, timer.loops));
                            }
                        }
                    }
                }
            }
        };
        TimerManager.prototype.addTimer = function (mod, delay, method, caller, args, loops, real, timerId, timestamp, timeout, count) {
            if (args === void 0) { args = null; }
            if (loops === void 0) { loops = 1; }
            if (real === void 0) { real = false; }
            if (timerId === void 0) { timerId = 0; }
            if (timestamp === void 0) { timestamp = -1; }
            if (timeout === void 0) { timeout = -1; }
            if (count === void 0) { count = 0; }
            var currentTimestamp = System.getModuleTimestamp(mod);
            if (timerId === 0) {
                timerId = this.$createNewTimerId();
            }
            if (timestamp === -1) {
                timestamp = currentTimestamp;
            }
            if (timeout === -1) {
                timeout = currentTimestamp;
            }
            var firstDelay;
            if (typeof delay === "number") {
                firstDelay = delay;
            }
            else {
                firstDelay = delay[1] || 0;
                delay = delay[0];
            }
            if (delay < 1) {
                delay = 1;
            }
            var dev = 0;
            if (real === true) {
                dev = (currentTimestamp - timeout) % delay;
            }
            else {
                dev = (currentTimestamp - timestamp) % delay;
            }
            timeout = currentTimestamp + delay - dev;
            if (firstDelay === 0) {
                if (args === null) {
                    method.call(caller, 0, loops);
                }
                else {
                    method.apply(caller, args.concat(0, loops));
                }
            }
            else if (firstDelay < delay) {
                var offset = delay - firstDelay;
                timeout = suncom.Mathf.clamp(timeout - offset, currentTimestamp + 1, timeout);
            }
            var timer = {
                mod: mod,
                active: true,
                delay: delay,
                method: method,
                caller: caller,
                args: args,
                real: real,
                count: count,
                loops: loops,
                timerId: timerId,
                timestamp: timestamp,
                timeout: timeout
            };
            var timers = this.$timers[mod];
            var index = -1;
            var min = 0;
            var mid = 0;
            var max = timers.length - 1;
            while (max - min > 1) {
                mid = Math.floor((min + max) * 0.5);
                if (timers[mid].timeout <= timeout) {
                    min = mid;
                }
                else if (timers[mid].timeout > timeout) {
                    max = mid;
                }
                else {
                    break;
                }
            }
            for (var i = min; i <= max; i++) {
                if (timers[i].timeout > timeout) {
                    index = i;
                    break;
                }
            }
            if (index < 0) {
                timers.push(timer);
            }
            else {
                timers.splice(index, 0, timer);
            }
            this.$timerMap[timerId] = timer;
            return timerId;
        };
        TimerManager.prototype.removeTimer = function (timerId) {
            if (timerId > 0 && this.$timerMap[timerId] !== void 0) {
                this.$timerMap[timerId].active = false;
            }
            return 0;
        };
        TimerManager.prototype.clearTimer = function (mod) {
            var timers = this.$timers[mod];
            while (timers.length > 0) {
                var timer = timers.pop();
                delete this.$timerMap[timer.timerId];
            }
        };
        return TimerManager;
    }());
    suncore.TimerManager = TimerManager;
    var M;
    (function (M) {
        M.engine = null;
        M.timeline = null;
        M.timeStamp = null;
        M.timerManager = null;
        M.messageManager = null;
    })(M = suncore.M || (suncore.M = {}));
    var MsgQ;
    (function (MsgQ) {
        var $queues = {};
        var $modStats = {};
        MsgQ.seqId = 1;
        function send(dst, id, data) {
            if (isModuleActive(dst) === false) {
                suncom.Logger.warn(suncom.DebugMode.ANY, "\u6D88\u606F\u53D1\u9001\u5931\u8D25\uFF0C\u6A21\u5757\u5DF1\u6682\u505C mod:" + MsgQModEnum[dst]);
                return;
            }
            if (check(dst, id) === false) {
                suncom.Logger.warn(suncom.DebugMode.ANY, "\u6D88\u606F\u53D1\u9001\u5931\u8D25\uFF0C\u6D88\u606FID\u975E\u6CD5 mod:" + dst + ", id:" + id);
                return;
            }
            var array = $queues[dst] || null;
            if (array === null) {
                array = $queues[dst] = [];
            }
            var msg = {
                dst: dst,
                seqId: MsgQ.seqId,
                id: id,
                data: data
            };
            array.push(msg);
        }
        MsgQ.send = send;
        function fetch(mod, id) {
            var queue = $queues[mod] || null;
            if (queue === null || queue.length === 0) {
                return null;
            }
            for (var i = 0; i < queue.length; i++) {
                var msg = queue[i];
                if (mod === MsgQModEnum.NSL || msg.seqId < MsgQ.seqId) {
                    if (id === void 0 || msg.id === id) {
                        queue.splice(i, 1);
                        return msg;
                    }
                }
            }
            return null;
        }
        MsgQ.fetch = fetch;
        function check(mod, id) {
            var min = suncom.Mathf.MIN_SAFE_INTEGER;
            var max = suncom.Mathf.MAX_SAFE_INTEGER;
            if (mod === MsgQModEnum.MMI) {
                min = MsgQIdEnum.MMI_MSG_ID_BEGIN;
                max = MsgQIdEnum.MMI_MSG_ID_END;
            }
            else if (mod === MsgQModEnum.CUI) {
                min = MsgQIdEnum.CUI_MSG_ID_BEGIN;
                max = MsgQIdEnum.CUI_MSG_ID_END;
            }
            else if (mod === MsgQModEnum.GUI) {
                min = MsgQIdEnum.GUI_MSG_ID_BEGIN;
                max = MsgQIdEnum.GUI_MSG_ID_END;
            }
            else if (mod === MsgQModEnum.L4C) {
                min = MsgQIdEnum.L4C_MSG_ID_BEGIN;
                max = MsgQIdEnum.L4C_MSG_ID_END;
            }
            else if (mod === MsgQModEnum.NSL) {
                min = MsgQIdEnum.NSL_MSG_ID_BEGIN;
                max = MsgQIdEnum.NSL_MSG_ID_END;
            }
            else {
                suncom.Test.notExpected("\u672A\u77E5\u7684\u6D88\u606F\u8303\u56F4 mod:" + mod);
            }
            return id >= min && id < max;
        }
        function isModuleActive(mod) {
            return $modStats[mod] === true;
        }
        MsgQ.isModuleActive = isModuleActive;
        function setModuleActive(mod, active) {
            $modStats[mod] = active;
            if (active === false) {
                delete $queues[mod];
            }
        }
        MsgQ.setModuleActive = setModuleActive;
    })(MsgQ = suncore.MsgQ || (suncore.MsgQ = {}));
    var NotifyKey;
    (function (NotifyKey) {
        NotifyKey.STARTUP = "suncore.NotifyKey.STARTUP";
        NotifyKey.SHUTDOWN = "suncore.NotifyKey.SHUTDOWN";
        NotifyKey.START_TIMELINE = "suncore.NotifyKey.START_TIMELINE";
        NotifyKey.PAUSE_TIMELINE = "suncore.NotifyKey.PAUSE_TIMELINE";
        NotifyKey.PHYSICS_FRAME = "suncore.NotifyKey.PHYSICS_FRAME";
        NotifyKey.PHYSICS_PREPARE = "suncore.NotifyKey.PHYSICS_PREPARE";
        NotifyKey.ENTER_FRAME = "suncore.NotifyKey.ENTER_FRAME";
        NotifyKey.LATER_FRAME = "suncore.NotifyKey.LATER_FRAME";
        NotifyKey.MSG_Q_BUSINESS = "suncore.NotifyKey.MSG_Q_BUSINESS";
    })(NotifyKey = suncore.NotifyKey || (suncore.NotifyKey = {}));
    var System;
    (function (System) {
        var $taskGroupId = 1000;
        function createTaskGroupId() {
            $taskGroupId++;
            return $taskGroupId;
        }
        function isModuleStopped(mod) {
            if (mod === ModuleEnum.TIMELINE) {
                if (M.timeline === null || M.timeline.stopped === true) {
                    return true;
                }
            }
            else if (mod === ModuleEnum.CUSTOM) {
                if (M.timeStamp === null || M.timeStamp.stopped === true) {
                    return true;
                }
            }
            else if (M.engine === null) {
                return true;
            }
            return false;
        }
        System.isModuleStopped = isModuleStopped;
        function isModulePaused(mod) {
            if (isModuleStopped(mod) === true) {
                return true;
            }
            if (mod === ModuleEnum.TIMELINE) {
                return M.timeline.paused;
            }
            else if (mod === ModuleEnum.CUSTOM) {
                return M.timeStamp.paused;
            }
            return false;
        }
        System.isModulePaused = isModulePaused;
        function getDelta() {
            if (isModuleStopped(ModuleEnum.SYSTEM) === false) {
                return M.engine.getDelta();
            }
            else {
                suncom.Logger.error(suncom.DebugMode.ANY, "\u5C1D\u8BD5\u83B7\u53D6\u5E27\u65F6\u95F4\u95F4\u9694\uFF0C\u4F46\u7CFB\u7EDF\u6A21\u5757\u5DF1\u505C\u6B62\uFF01\uFF01\uFF01");
            }
        }
        System.getDelta = getDelta;
        function getModuleTimestamp(mod) {
            if (isModuleStopped(mod) === false) {
                if (mod === ModuleEnum.TIMELINE) {
                    return M.timeline.getTime();
                }
                else if (mod === ModuleEnum.CUSTOM) {
                    return M.timeStamp.getTime();
                }
                return M.engine.getTime();
            }
            else {
                suncom.Logger.error(suncom.DebugMode.ANY, "\u5C1D\u8BD5\u83B7\u53D6\u65F6\u95F4\u6233\uFF0C\u4F46\u6A21\u5757 " + ModuleEnum[mod] + " \u5DF1\u505C\u6B62\uFF01\uFF01\uFF01");
            }
        }
        System.getModuleTimestamp = getModuleTimestamp;
        function addTask(mod, groupId, task) {
            if (System.isModuleStopped(mod) === false) {
                if (groupId === -1) {
                    groupId = createTaskGroupId();
                }
                else if (groupId > 1000) {
                    suncom.Test.notExpected("\u81EA\u5B9A\u4E49\u7684Task GroupId\u4E0D\u5141\u8BB8\u8D85\u8FC71000");
                }
                var message = {
                    mod: mod,
                    task: task,
                    groupId: groupId,
                    priority: MessagePriorityEnum.PRIORITY_TASK
                };
                M.messageManager.putMessage(message);
            }
            else {
                groupId = -1;
                suncom.Logger.error(suncom.DebugMode.ANY, "\u5C1D\u8BD5\u6DFB\u52A0\u4EFB\u52A1\uFF0C\u4F46\u6A21\u5757 " + ModuleEnum[mod] + " \u5DF1\u505C\u6B62\uFF01\uFF01\uFF01");
            }
            return groupId;
        }
        System.addTask = addTask;
        function cancelTaskByGroupId(mod, groupId) {
            M.messageManager.cancelTaskByGroupId(mod, groupId);
        }
        System.cancelTaskByGroupId = cancelTaskByGroupId;
        function addTrigger(mod, delay, handler) {
            if (System.isModuleStopped(mod) === false) {
                var message = {
                    mod: mod,
                    handler: handler,
                    timeout: System.getModuleTimestamp(mod) + delay,
                    priority: MessagePriorityEnum.PRIORITY_TRIGGER
                };
                M.messageManager.putMessage(message);
            }
            else {
                suncom.Logger.error(suncom.DebugMode.ANY, "\u5C1D\u8BD5\u6DFB\u52A0\u89E6\u53D1\u5668\uFF0C\u4F46\u6A21\u5757 " + ModuleEnum[mod] + " \u5DF1\u505C\u6B62\uFF01\uFF01\uFF01");
            }
        }
        System.addTrigger = addTrigger;
        function addMessage(mod, priority, handler) {
            if (System.isModuleStopped(mod) === false) {
                var message = {
                    mod: mod,
                    handler: handler,
                    priority: priority
                };
                M.messageManager.putMessage(message);
            }
            else {
                suncom.Logger.error(suncom.DebugMode.ANY, "\u5C1D\u8BD5\u6DFB\u52A0Message\u6D88\u606F\uFF0C\u4F46\u6A21\u5757 " + ModuleEnum[mod] + " \u5DF1\u505C\u6B62\uFF01\uFF01\uFF01");
            }
        }
        System.addMessage = addMessage;
        function addTimer(mod, delay, method, caller, args, loops, real) {
            if (loops === void 0) { loops = 1; }
            if (real === void 0) { real = false; }
            if (System.isModuleStopped(mod) === false) {
                return M.timerManager.addTimer(mod, delay, method, caller, args, loops, real);
            }
            else {
                suncom.Logger.error(suncom.DebugMode.ANY, "\u5C1D\u8BD5\u6DFB\u52A0\u5B9A\u65F6\u5668\uFF0C\u4F46\u6A21\u5757 " + ModuleEnum[mod] + " \u5DF1\u505C\u6B62\uFF01\uFF01\uFF01");
            }
        }
        System.addTimer = addTimer;
        function removeTimer(timerId) {
            return M.timerManager.removeTimer(timerId);
        }
        System.removeTimer = removeTimer;
    })(System = suncore.System || (suncore.System = {}));
})(suncore || (suncore = {}));
var suntdd;
(function (suntdd) {
    var MSWSConnectionStateEnum;
    (function (MSWSConnectionStateEnum) {
        MSWSConnectionStateEnum[MSWSConnectionStateEnum["CONNECTED"] = 0] = "CONNECTED";
        MSWSConnectionStateEnum[MSWSConnectionStateEnum["CONNECTING"] = 1] = "CONNECTING";
        MSWSConnectionStateEnum[MSWSConnectionStateEnum["DISCONNECTED"] = 2] = "DISCONNECTED";
    })(MSWSConnectionStateEnum = suntdd.MSWSConnectionStateEnum || (suntdd.MSWSConnectionStateEnum = {}));
    var MSWSStateEnum;
    (function (MSWSStateEnum) {
        MSWSStateEnum[MSWSStateEnum["CONNECTED"] = 0] = "CONNECTED";
        MSWSStateEnum[MSWSStateEnum["CLOSE"] = 1] = "CLOSE";
        MSWSStateEnum[MSWSStateEnum["ERROR"] = 2] = "ERROR";
    })(MSWSStateEnum = suntdd.MSWSStateEnum || (suntdd.MSWSStateEnum = {}));
    var TestActionKindEnum;
    (function (TestActionKindEnum) {
        TestActionKindEnum[TestActionKindEnum["NONE"] = 0] = "NONE";
        TestActionKindEnum[TestActionKindEnum["BUTTON_CLICK"] = 1] = "BUTTON_CLICK";
        TestActionKindEnum[TestActionKindEnum["SIGNAL_EMIT"] = 2] = "SIGNAL_EMIT";
        TestActionKindEnum[TestActionKindEnum["SIGNAL_WAIT"] = 3] = "SIGNAL_WAIT";
        TestActionKindEnum[TestActionKindEnum["WS_STATE"] = 4] = "WS_STATE";
        TestActionKindEnum[TestActionKindEnum["WS_PROTOCAL"] = 5] = "WS_PROTOCAL";
    })(TestActionKindEnum = suntdd.TestActionKindEnum || (suntdd.TestActionKindEnum = {}));
    var TestActionResultEnum;
    (function (TestActionResultEnum) {
        TestActionResultEnum[TestActionResultEnum["NONE"] = 1] = "NONE";
        TestActionResultEnum[TestActionResultEnum["NOT_YET"] = 2] = "NOT_YET";
        TestActionResultEnum[TestActionResultEnum["COMPLETE"] = 4] = "COMPLETE";
        TestActionResultEnum[TestActionResultEnum["SUSPEND"] = 8] = "SUSPEND";
    })(TestActionResultEnum = suntdd.TestActionResultEnum || (suntdd.TestActionResultEnum = {}));
    var TestCaseRegOptionEnum;
    (function (TestCaseRegOptionEnum) {
        TestCaseRegOptionEnum[TestCaseRegOptionEnum["INSERT"] = 0] = "INSERT";
        TestCaseRegOptionEnum[TestCaseRegOptionEnum["APPEND"] = 1] = "APPEND";
    })(TestCaseRegOptionEnum = suntdd.TestCaseRegOptionEnum || (suntdd.TestCaseRegOptionEnum = {}));
    var TestCaseStatusEnum;
    (function (TestCaseStatusEnum) {
        TestCaseStatusEnum[TestCaseStatusEnum["PREPARE"] = 0] = "PREPARE";
        TestCaseStatusEnum[TestCaseStatusEnum["EXECUTE"] = 1] = "EXECUTE";
        TestCaseStatusEnum[TestCaseStatusEnum["FINISH"] = 2] = "FINISH";
    })(TestCaseStatusEnum = suntdd.TestCaseStatusEnum || (suntdd.TestCaseStatusEnum = {}));
    var CancelCommand = (function (_super) {
        __extends(CancelCommand, _super);
        function CancelCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CancelCommand.prototype.execute = function (id) {
            delete M.buttonMap[id];
            var cfgs = M.waitMap[id] || null;
            if (cfgs === null) {
                return;
            }
            for (var i = 0; i < cfgs.length; i++) {
                var cfg = cfgs[i];
                if (cfg.line === true) {
                    continue;
                }
                cfg.canceled = true;
            }
        };
        return CancelCommand;
    }(puremvc.SimpleCommand));
    suntdd.CancelCommand = CancelCommand;
    var ClickCommand = (function (_super) {
        __extends(ClickCommand, _super);
        function ClickCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ClickCommand.prototype.execute = function (id) {
            var cfg = {
                id: id
            };
            this.facade.sendNotification(NotifyKey.ADD_ACTION, [TestActionKindEnum.BUTTON_CLICK, cfg]);
        };
        return ClickCommand;
    }(puremvc.SimpleCommand));
    suntdd.ClickCommand = ClickCommand;
    var DoClickCommand = (function (_super) {
        __extends(DoClickCommand, _super);
        function DoClickCommand() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$click = null;
            _this.$button = null;
            return _this;
        }
        DoClickCommand.prototype.execute = function (click) {
            this.$click = click;
            this.$button = M.buttonMap[click.id] || null;
            suncom.Test.expect(this.$button).not.toBeNull();
            if (this.$button.once === true) {
                delete M.buttonMap[click.id];
            }
            suncore.System.addTimer(suncore.ModuleEnum.SYSTEM, 500, this.$doClick, this);
        };
        DoClickCommand.prototype.$doClick = function () {
            var event = new Laya.Event();
            event.setTo(Laya.Event.CLICK, this.$button.button, this.$button.button);
            this.$button.button.event(Laya.Event.CLICK, event);
            this.$click.done = true;
        };
        return DoClickCommand;
    }(puremvc.SimpleCommand));
    suntdd.DoClickCommand = DoClickCommand;
    var DoEmitCommand = (function (_super) {
        __extends(DoEmitCommand, _super);
        function DoEmitCommand() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$cfg = null;
            return _this;
        }
        DoEmitCommand.prototype.execute = function (cfg) {
            this.$cfg = cfg;
            suncom.Test.expect(cfg.id).toBeGreaterThan(0);
            if (cfg.delay <= 0) {
                this.$doEmit();
            }
            else {
                suncore.System.addTimer(suncore.ModuleEnum.SYSTEM, cfg.delay, this.$doEmit, this);
            }
        };
        DoEmitCommand.prototype.$doEmit = function () {
            suncom.Test.expect(M.currentSignalId).interpret("\u4FE1\u53F7\u53D1\u5C04\u5E72\u6270").toBe(0);
            M.currentSignalId = this.$cfg.id;
            var array = M.waitMap[this.$cfg.id] || null;
            if (array !== null) {
                for (var i = 0; i < array.length; i++) {
                    var item = array[i];
                    if (item.once === true && item.done === true) {
                        continue;
                    }
                    if (item.once === true) {
                        item.done = true;
                    }
                    if (item.canceled === true) {
                        continue;
                    }
                    var handler = item.handler || null;
                    if (handler === null) {
                        continue;
                    }
                    handler.runWith(this.$cfg.args);
                }
            }
            this.$cfg.done = true;
            M.currentSignalId = 0;
        };
        return DoEmitCommand;
    }(puremvc.SimpleCommand));
    suntdd.DoEmitCommand = DoEmitCommand;
    var EmitCommand = (function (_super) {
        __extends(EmitCommand, _super);
        function EmitCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EmitCommand.prototype.execute = function (id, args, line, delay) {
            var cfg = {
                id: id,
                args: args,
                line: line,
                delay: delay
            };
            if (line === false) {
                this.facade.sendNotification(NotifyKey.DO_EMIT, cfg);
            }
            else {
                this.facade.sendNotification(NotifyKey.ADD_ACTION, [TestActionKindEnum.SIGNAL_EMIT, cfg]);
            }
        };
        return EmitCommand;
    }(puremvc.SimpleCommand));
    suntdd.EmitCommand = EmitCommand;
    var MicroService = (function (_super) {
        __extends(MicroService, _super);
        function MicroService() {
            var _this = _super.call(this, 0) || this;
            _this.$actions = [];
            M.timeDiff = suncom.Mathf.random(-8000, 8000);
            if (suncore.System.isModuleStopped(suncore.ModuleEnum.SYSTEM) === true) {
                throw Error("\u5FAE\u670D\u52A1\u5668\u672A\u8FD0\u884C\uFF0C\u56E0\u4E3ASYSTEM\u65F6\u95F4\u8F74\u672A\u5F00\u542F");
            }
            return _this;
        }
        MicroService.prototype.$onRun = function () {
            this.facade.registerCommand(NotifyKey.EMIT, EmitCommand);
            this.facade.registerCommand(NotifyKey.WAIT, WaitCommand);
            this.facade.registerCommand(NotifyKey.CLICK, ClickCommand);
            this.facade.registerCommand(NotifyKey.CANCEL, CancelCommand);
            this.facade.registerCommand(NotifyKey.DO_EMIT, DoEmitCommand);
            this.facade.registerCommand(NotifyKey.DO_CLICK, DoClickCommand);
            this.facade.registerCommand(NotifyKey.REG_BUTTON, RegButtonCommand);
            this.facade.registerCommand(NotifyKey.PREPARE_PROTOCAL_PACKET, PrepareProtocalPacketCommand);
            this.facade.registerCommand(NotifyKey.SERIALIZE_WEBSOCKET_STATE_PACKET, SerializeWebSocketStatePacketCommand);
            this.facade.registerCommand(NotifyKey.SERIALIZE_WEBSOCKET_PROTOCAL_PACKET, SerializeWebSocketProtocalPacketCommand);
            this.facade.registerObserver(NotifyKey.ADD_WAIT, this.$addWait, this);
            this.facade.registerObserver(NotifyKey.ADD_ACTION, this.$addAction, this);
            this.facade.registerObserver(NotifyKey.TEST_WEBSOCKET_SEND_DATA, this.$onWebSocketSendData, this);
            this.facade.registerObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrame, this);
        };
        MicroService.prototype.$onStop = function () {
            this.facade.removeCommand(NotifyKey.EMIT);
            this.facade.removeCommand(NotifyKey.WAIT);
            this.facade.removeCommand(NotifyKey.CLICK);
            this.facade.removeCommand(NotifyKey.CANCEL);
            this.facade.removeCommand(NotifyKey.DO_EMIT);
            this.facade.removeCommand(NotifyKey.DO_CLICK);
            this.facade.removeCommand(NotifyKey.REG_BUTTON);
            this.facade.removeCommand(NotifyKey.PREPARE_PROTOCAL_PACKET);
            this.facade.removeCommand(NotifyKey.SERIALIZE_WEBSOCKET_STATE_PACKET);
            this.facade.removeCommand(NotifyKey.SERIALIZE_WEBSOCKET_PROTOCAL_PACKET);
            this.facade.removeObserver(NotifyKey.ADD_WAIT, this.$addWait, this);
            this.facade.removeObserver(NotifyKey.ADD_ACTION, this.$addAction, this);
            this.facade.removeObserver(NotifyKey.TEST_WEBSOCKET_SEND_DATA, this.$onWebSocketSendData, this);
            this.facade.removeObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrame, this);
        };
        MicroService.prototype.$onEnterFrame = function () {
            var protocalNotified = false;
            while (this.$actions.length > 0) {
                var action = this.$actions[0];
                var result = TestActionResultEnum.NONE;
                switch (action.kind) {
                    case TestActionKindEnum.SIGNAL_WAIT:
                        result = this.$doWait(action.cfg);
                        break;
                    case TestActionKindEnum.SIGNAL_EMIT:
                        result = this.$doEmit(action.cfg);
                        break;
                    case TestActionKindEnum.BUTTON_CLICK:
                        result = this.$doClick(action.cfg);
                        break;
                    case TestActionKindEnum.WS_STATE:
                        result = this.$notifyStatePacket(action.cfg);
                        break;
                    case TestActionKindEnum.WS_PROTOCAL:
                        result = this.$notifyProtocalPacket(action.cfg);
                        break;
                    default:
                        suncom.Test.notExpected();
                        break;
                }
                if (result & TestActionResultEnum.NOT_YET) {
                    break;
                }
                if (result & TestActionResultEnum.COMPLETE) {
                    this.$actions.shift();
                }
                if (result & TestActionResultEnum.SUSPEND) {
                    break;
                }
                if (action.kind === TestActionKindEnum.WS_PROTOCAL) {
                    protocalNotified = true;
                }
                if (protocalNotified === true && this.$actions.length > 0) {
                    var next = this.$actions[0];
                    if (next.kind === TestActionKindEnum.WS_PROTOCAL) {
                        var packet = next.cfg;
                        if (packet.asNewMsg === true) {
                            break;
                        }
                    }
                }
            }
            if (this.$actions.length > 0) {
                return;
            }
            if (M.currentTestCase === null) {
                var cfg = M.tccQueue.shift() || null;
                M.currentTestCase = cfg === null ? null : new cfg.taskCls(cfg.tcId);
            }
            else if (M.currentTestCase.status === TestCaseStatusEnum.EXECUTE) {
                M.currentTestCase.done();
            }
            else if (M.currentTestCase.status === TestCaseStatusEnum.FINISH) {
                suncom.Test.expect(this.$actions.length).toBe(0);
                M.currentTestCase = null;
            }
        };
        MicroService.prototype.$onWebSocketSendData = function (name) {
            for (var i = 0; i < this.$actions.length; i++) {
                var action = this.$actions[i];
                if (action.kind === TestActionKindEnum.WS_PROTOCAL) {
                    var packet = action.cfg;
                    if (packet.waitName === name && packet.waitTimes > 0 && packet.waitCount < packet.waitTimes) {
                        packet.waitCount++;
                    }
                    break;
                }
            }
        };
        MicroService.prototype.$addAction = function (kind, cfg) {
            var action = {
                kind: kind,
                cfg: cfg
            };
            this.$actions.push(action);
        };
        MicroService.prototype.$addWait = function (cfg) {
            var array = M.waitMap[cfg.id] || null;
            if (array === null) {
                array = M.waitMap[cfg.id] = [];
            }
            var index = -1;
            for (var i = 0; i < array.length; i++) {
                if (array[i] === cfg) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                array.push(cfg);
            }
        };
        MicroService.prototype.$notifyProtocalPacket = function (packet) {
            if (this.$notYet(packet) === true) {
                return TestActionResultEnum.NOT_YET;
            }
            this.facade.sendNotification(NotifyKey.PREPARE_PROTOCAL_PACKET, packet);
            this.facade.sendNotification(NotifyKey.TEST_WEBSOCKET_PROTOCAL, [packet.replyName, packet.data]);
            if (packet.repeatTimes === 1) {
                return TestActionResultEnum.COMPLETE;
            }
            packet.repeatTimes--;
            packet.waitCount = 0;
            delete packet.createTime;
            return TestActionResultEnum.SUSPEND;
        };
        MicroService.prototype.$notifyStatePacket = function (packet) {
            var out = {
                name: packet.connName,
                state: MSWSConnectionStateEnum.DISCONNECTED
            };
            this.facade.sendNotification(NotifyKey.GET_WEBSOCKET_INFO, out);
            if (out.state === MSWSConnectionStateEnum.DISCONNECTED) {
                return TestActionResultEnum.NOT_YET;
            }
            if (this.$notYet(packet) === true) {
                return TestActionResultEnum.NOT_YET;
            }
            if (out.state === MSWSConnectionStateEnum.CONNECTING) {
                suncom.Test.assertTrue(packet.state === MSWSStateEnum.CONNECTED || packet.state === MSWSStateEnum.ERROR, "\u5F53\u524D\u7F51\u7EDC\u6B63\u5728\u8FDE\u63A5\uFF0C\u4EC5\u5141\u8BB8\u4E0B\u884CCONNECTED\u6216ERROR\u72B6\u6001");
            }
            else if (out.state === MSWSConnectionStateEnum.CONNECTED) {
                suncom.Test.assertTrue(packet.state === MSWSStateEnum.CLOSE || packet.state === MSWSStateEnum.ERROR, "\u5F53\u524D\u7F51\u7EDC\u5DF1\u8FDE\u63A5\uFF0C\u4EC5\u5141\u8BB8\u4E0B\u884CCLOSE\u6216ERROR\u72B6\u6001");
            }
            this.facade.sendNotification(NotifyKey.TEST_WEBSOCKET_STATE, packet.state);
            return TestActionResultEnum.COMPLETE | TestActionResultEnum.SUSPEND;
        };
        MicroService.prototype.$notYet = function (packet) {
            if (packet.waitName !== null && packet.waitCount < packet.waitTimes) {
                return true;
            }
            if (packet.createTime === void 0) {
                packet.createTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
            }
            if (packet.createTime + packet.delay > suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM)) {
                return true;
            }
            if (packet.asNewMsg === true && packet.createTime === suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM)) {
                return true;
            }
            return false;
        };
        MicroService.prototype.$doClick = function (cfg) {
            if (cfg.actTime === void 0) {
                if (M.buttonMap[cfg.id] === void 0) {
                    return TestActionResultEnum.NOT_YET;
                }
                cfg.actTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
                this.facade.sendNotification(NotifyKey.DO_CLICK, cfg);
                return TestActionResultEnum.NONE;
            }
            else if (cfg.done === true) {
                return TestActionResultEnum.COMPLETE;
            }
            else {
                return TestActionResultEnum.NOT_YET;
            }
        };
        MicroService.prototype.$doEmit = function (cfg) {
            if (cfg.done === true) {
                return TestActionResultEnum.COMPLETE;
            }
            if (cfg.actTime === void 0) {
                cfg.actTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
                this.facade.sendNotification(NotifyKey.DO_EMIT, cfg);
            }
            else {
                return TestActionResultEnum.NOT_YET;
            }
            return TestActionResultEnum.NONE;
        };
        MicroService.prototype.$doWait = function (cfg) {
            if (cfg.done === true) {
                return TestActionResultEnum.COMPLETE;
            }
            if (cfg.actTime === void 0) {
                cfg.actTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
                this.$addWait(cfg);
            }
            else {
                return TestActionResultEnum.NOT_YET;
            }
            return TestActionResultEnum.NONE;
        };
        return MicroService;
    }(suncore.BaseService));
    suntdd.MicroService = MicroService;
    var PrepareProtocalPacketCommand = (function (_super) {
        __extends(PrepareProtocalPacketCommand, _super);
        function PrepareProtocalPacketCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PrepareProtocalPacketCommand.prototype.execute = function (packet) {
            if (packet.data === null) {
                return;
            }
            for (var i = 0; i < packet.hashFileds.length; i++) {
                this.$setFieldValue(packet.data, packet.hashFileds[i], suncom.Common.createHashId());
            }
            for (var i = 0; i < packet.timeFields.length; i++) {
                var timeFiled = packet.timeFields[i];
                var timestamp = new Date().valueOf() + M.timeDiff + timeFiled.arg1;
                this.$setFieldValue(packet.data, timeFiled.arg2, dcodeIO.Long.fromNumber(timestamp));
            }
        };
        PrepareProtocalPacketCommand.prototype.$setFieldValue = function (data, field, value) {
            var array = field.split(".");
            while (array.length > 1) {
                data = data[array.shift()];
            }
            data[array.shift()] = value;
        };
        return PrepareProtocalPacketCommand;
    }(puremvc.SimpleCommand));
    suntdd.PrepareProtocalPacketCommand = PrepareProtocalPacketCommand;
    var RegButtonCommand = (function (_super) {
        __extends(RegButtonCommand, _super);
        function RegButtonCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RegButtonCommand.prototype.execute = function (id, button, once) {
            suncom.Test.expect(button).anything();
            suncom.Test.expect(M.buttonMap[id]).toBeUndefined();
            var cfg = {
                button: button,
                once: once
            };
            M.buttonMap[id] = cfg;
        };
        return RegButtonCommand;
    }(puremvc.SimpleCommand));
    suntdd.RegButtonCommand = RegButtonCommand;
    var SerializeWebSocketPacketCommand = (function (_super) {
        __extends(SerializeWebSocketPacketCommand, _super);
        function SerializeWebSocketPacketCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SerializeWebSocketPacketCommand.prototype.$initializePacket = function (packet) {
            if (packet.delay === void 0) {
                packet.delay = 0;
            }
            if (packet.connName === void 0) {
                packet.connName = "default";
            }
            if (packet.asNewMsg === void 0) {
                packet.asNewMsg = true;
            }
            if (packet.waitName === void 0) {
                packet.waitName = null;
            }
            if (packet.waitTimes === void 0) {
                packet.waitTimes = 1;
            }
            packet.waitCount = 0;
            suncom.Test.expect(packet.delay).interpret("消息下行延时必须大于或等于0").toBeGreaterOrEqualThan(0);
            suncom.Test.expect(packet.waitTimes).interpret("消息上行等待次数必须大于0").toBeGreaterThan(0);
        };
        SerializeWebSocketPacketCommand.prototype.$initializePacketDefaultValue = function (packet, timeFields, hashFields) {
            if (timeFields === void 0) { timeFields = []; }
            if (hashFields === void 0) { hashFields = []; }
            if (packet.data === null) {
                return;
            }
            packet.hashFileds = hashFields;
            packet.timeFields = [];
            for (var i = 0; i < timeFields.length; i++) {
                var value = this.$getFieldValue(packet.data, timeFields[i], 0);
                packet.timeFields.push({
                    arg1: value,
                    arg2: timeFields[i]
                });
            }
        };
        SerializeWebSocketPacketCommand.prototype.$getFieldValue = function (data, field, defaultValue) {
            var array = field.split(".");
            while (array.length > 0) {
                data = data[array.shift()];
            }
            return data === void 0 ? defaultValue : data;
        };
        return SerializeWebSocketPacketCommand;
    }(puremvc.SimpleCommand));
    suntdd.SerializeWebSocketPacketCommand = SerializeWebSocketPacketCommand;
    var SerializeWebSocketProtocalPacketCommand = (function (_super) {
        __extends(SerializeWebSocketProtocalPacketCommand, _super);
        function SerializeWebSocketProtocalPacketCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SerializeWebSocketProtocalPacketCommand.prototype.execute = function (packet, timeFields, hashFields) {
            this.$initializePacket(packet);
            if (packet.data === void 0) {
                packet.data = null;
            }
            if (packet.replyName === void 0) {
                packet.replyName = null;
            }
            if (packet.repeatTimes === void 0) {
                packet.repeatTimes = 1;
            }
            this.$initializePacketDefaultValue(packet, timeFields, hashFields);
            suncom.Test.expect(packet.repeatTimes).interpret("消息的下行次数必须大于或等于1").toBeGreaterOrEqualThan(1);
            this.facade.sendNotification(NotifyKey.ADD_ACTION, [TestActionKindEnum.WS_PROTOCAL, packet]);
        };
        return SerializeWebSocketProtocalPacketCommand;
    }(SerializeWebSocketPacketCommand));
    suntdd.SerializeWebSocketProtocalPacketCommand = SerializeWebSocketProtocalPacketCommand;
    var SerializeWebSocketStatePacketCommand = (function (_super) {
        __extends(SerializeWebSocketStatePacketCommand, _super);
        function SerializeWebSocketStatePacketCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SerializeWebSocketStatePacketCommand.prototype.execute = function (packet) {
            this.$initializePacket(packet);
            suncom.Test.expect(packet.state).interpret("必须指定WebSocket状态包的状态值").not.toBeUndefined();
            this.facade.sendNotification(NotifyKey.ADD_ACTION, [TestActionKindEnum.WS_STATE, packet]);
        };
        return SerializeWebSocketStatePacketCommand;
    }(SerializeWebSocketPacketCommand));
    suntdd.SerializeWebSocketStatePacketCommand = SerializeWebSocketStatePacketCommand;
    var TestCase = (function (_super) {
        __extends(TestCase, _super);
        function TestCase(caseId) {
            var _this = _super.call(this, 0) || this;
            _this.$status = TestCaseStatusEnum.PREPARE;
            _this.$caseId = caseId;
            M.currentTestCase = _this;
            suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_0, suncom.Handler.create(_this, _this.$doPrepare));
            return _this;
        }
        TestCase.prototype.done = function () {
            this.$afterAll();
            this.$status = TestCaseStatusEnum.FINISH;
        };
        TestCase.prototype.$doPrepare = function () {
            this.$status = TestCaseStatusEnum.EXECUTE;
            this.$beforeAll();
        };
        TestCase.prototype.$addTest = function (tcId, taskCls, regOption) {
            if (regOption === void 0) { regOption = TestCaseRegOptionEnum.APPEND; }
            var cfg = {
                tcId: tcId,
                taskCls: taskCls
            };
            if (regOption === TestCaseRegOptionEnum.APPEND) {
                M.tccQueue.push(cfg);
            }
            else {
                M.tccQueue.unshift(cfg);
            }
        };
        TestCase.prototype.$describe = function (str) {
            suncom.Logger.log(suncom.DebugMode.TDD, str);
        };
        TestCase.prototype.$beforeAll = function () {
        };
        TestCase.prototype.$afterAll = function () {
        };
        TestCase.prototype.$emit = function (id, args, delay) {
            if (delay === void 0) { delay = 0; }
            this.facade.sendNotification(NotifyKey.EMIT, [id, args, true, delay]);
        };
        TestCase.prototype.$wait = function (id, handler, line, once) {
            if (handler === void 0) { handler = null; }
            if (line === void 0) { line = true; }
            if (once === void 0) { once = true; }
            if (line === true) {
                once = true;
            }
            else {
                suncom.Test.expect(handler).interpret("\u5F53\u53C2\u6570line\u4E3Afalse\u65F6\u5FC5\u987B\u6307\u5B9Ahandler").toBeInstanceOf(suncom.Handler);
            }
            this.facade.sendNotification(NotifyKey.WAIT, [id, handler, line, once]);
        };
        TestCase.prototype.$click = function (id) {
            this.facade.sendNotification(NotifyKey.CLICK, id);
        };
        TestCase.prototype.$cancel = function (id) {
            this.facade.sendNotification(NotifyKey.CANCEL, id);
        };
        TestCase.prototype.$serializeWebSocketStatePacket = function (packet) {
            this.facade.sendNotification(NotifyKey.SERIALIZE_WEBSOCKET_STATE_PACKET, packet);
        };
        TestCase.prototype.$serializeWebSocketProtocalPacket = function (packet, data, timeFields, hashFields) {
            packet.data = data;
            this.facade.sendNotification(NotifyKey.SERIALIZE_WEBSOCKET_PROTOCAL_PACKET, [packet, timeFields, hashFields]);
        };
        Object.defineProperty(TestCase.prototype, "status", {
            get: function () {
                return this.$status;
            },
            enumerable: true,
            configurable: true
        });
        return TestCase;
    }(puremvc.Notifier));
    suntdd.TestCase = TestCase;
    var WaitCommand = (function (_super) {
        __extends(WaitCommand, _super);
        function WaitCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        WaitCommand.prototype.execute = function (id, handler, line, once) {
            var cfg = {
                id: id,
                handler: handler,
                line: line,
                once: once
            };
            if (line === true) {
                this.facade.sendNotification(NotifyKey.ADD_ACTION, [TestActionKindEnum.SIGNAL_WAIT, cfg]);
            }
            else {
                this.facade.sendNotification(NotifyKey.ADD_WAIT, cfg);
            }
        };
        return WaitCommand;
    }(puremvc.SimpleCommand));
    suntdd.WaitCommand = WaitCommand;
    var M;
    (function (M) {
        M.timeDiff = 0;
        M.currentSignalId = 0;
        M.currentTestCase = null;
        M.tccQueue = [];
        M.waitMap = {};
        M.buttonMap = {};
    })(M = suntdd.M || (suntdd.M = {}));
    var NotifyKey;
    (function (NotifyKey) {
        NotifyKey.EMIT = "suntdd.NotifyKey.EMIT";
        NotifyKey.WAIT = "suntdd.NotifyKey.WAIT";
        NotifyKey.DO_EMIT = "suntdd.NotifyKey.DO_EMIT";
        NotifyKey.CANCEL = "suntdd.NotifyKey.CANCEL";
        NotifyKey.CLICK = "suntdd.NotifyKey.CLICK";
        NotifyKey.DO_CLICK = "suntdd.NotifyKey.DO_CLICK";
        NotifyKey.REG_BUTTON = "suntdd.NotifyKey.REG_BUTTON";
        NotifyKey.ADD_WAIT = "suntdd.NotifyKey.ADD_WAIT";
        NotifyKey.ADD_ACTION = "suntdd.NotifyKey.ADD_ACTION";
        NotifyKey.GET_WEBSOCKET_INFO = "suntdd.NotifyKey.GET_WEBSOCKET_INFO";
        NotifyKey.TEST_WEBSOCKET_STATE = "suntdd.NotifyKey.TEST_WEBSOCKET_STATE";
        NotifyKey.TEST_WEBSOCKET_PROTOCAL = "suntdd.NotifyKey.TEST_WEBSOCKET_PROTOCAL";
        NotifyKey.TEST_WEBSOCKET_SEND_DATA = "suntdd.NotifyKey.TEST_WEBSOCKET_SEND_DATA";
        NotifyKey.PREPARE_PROTOCAL_PACKET = "suntdd.NotifyKey.PREPARE_PROTOCAL_PACKET";
        NotifyKey.SERIALIZE_WEBSOCKET_STATE_PACKET = "suntdd.NotifyKey.SERIALIZE_WEBSOCKET_STATE_PACKET";
        NotifyKey.SERIALIZE_WEBSOCKET_PROTOCAL_PACKET = "suntdd.NotifyKey.SERIALIZE_WEBSOCKET_PROTOCAL_PACKET";
    })(NotifyKey = suntdd.NotifyKey || (suntdd.NotifyKey = {}));
    var Test;
    (function (Test) {
        function emit(id, args, delay) {
            if (delay === void 0) { delay = 0; }
            puremvc.Facade.getInstance().sendNotification(NotifyKey.EMIT, [id, args, false, delay]);
        }
        Test.emit = emit;
        function regButton(id, button, once) {
            if (once === void 0) { once = true; }
            puremvc.Facade.getInstance().sendNotification(NotifyKey.REG_BUTTON, [id, button, once]);
        }
        Test.regButton = regButton;
    })(Test = suntdd.Test || (suntdd.Test = {}));
})(suntdd || (suntdd = {}));
var sunui;
(function (sunui) {
    var ConfirmOptionValueEnum;
    (function (ConfirmOptionValueEnum) {
        ConfirmOptionValueEnum[ConfirmOptionValueEnum["NONE"] = 0] = "NONE";
        ConfirmOptionValueEnum[ConfirmOptionValueEnum["YES"] = 1] = "YES";
        ConfirmOptionValueEnum[ConfirmOptionValueEnum["NO"] = 2] = "NO";
        ConfirmOptionValueEnum[ConfirmOptionValueEnum["CANCEL"] = 3] = "CANCEL";
    })(ConfirmOptionValueEnum = sunui.ConfirmOptionValueEnum || (sunui.ConfirmOptionValueEnum = {}));
    var PopupFlagEnum;
    (function (PopupFlagEnum) {
        PopupFlagEnum[PopupFlagEnum["NONE"] = 0] = "NONE";
        PopupFlagEnum[PopupFlagEnum["SIMPLY"] = 1] = "SIMPLY";
        PopupFlagEnum[PopupFlagEnum["TRANSPARENT"] = 2] = "TRANSPARENT";
        PopupFlagEnum[PopupFlagEnum["MOUSE_THROUGH"] = 4] = "MOUSE_THROUGH";
        PopupFlagEnum[PopupFlagEnum["SYNC_FADE_TIME"] = 8] = "SYNC_FADE_TIME";
    })(PopupFlagEnum = sunui.PopupFlagEnum || (sunui.PopupFlagEnum = {}));
    var ResourceDownloadSpeedEnum;
    (function (ResourceDownloadSpeedEnum) {
        ResourceDownloadSpeedEnum[ResourceDownloadSpeedEnum["NONE"] = 0] = "NONE";
        ResourceDownloadSpeedEnum[ResourceDownloadSpeedEnum["HIGH"] = 131072] = "HIGH";
        ResourceDownloadSpeedEnum[ResourceDownloadSpeedEnum["MID"] = 32768] = "MID";
        ResourceDownloadSpeedEnum[ResourceDownloadSpeedEnum["LOW"] = 8192] = "LOW";
    })(ResourceDownloadSpeedEnum = sunui.ResourceDownloadSpeedEnum || (sunui.ResourceDownloadSpeedEnum = {}));
    var RetryMethodEnum;
    (function (RetryMethodEnum) {
        RetryMethodEnum[RetryMethodEnum["AUTO"] = 16] = "AUTO";
        RetryMethodEnum[RetryMethodEnum["CONFIRM"] = 32] = "CONFIRM";
        RetryMethodEnum[RetryMethodEnum["TERMINATE"] = 64] = "TERMINATE";
    })(RetryMethodEnum = sunui.RetryMethodEnum || (sunui.RetryMethodEnum = {}));
    var UILevel;
    (function (UILevel) {
        UILevel[UILevel["NONE"] = 0] = "NONE";
        UILevel[UILevel["BACKGROUND"] = 1] = "BACKGROUND";
        UILevel[UILevel["SCENE"] = 2] = "SCENE";
        UILevel[UILevel["PANEL"] = 3] = "PANEL";
        UILevel[UILevel["FLOAT"] = 4] = "FLOAT";
        UILevel[UILevel["GOLD_TIPS"] = 5] = "GOLD_TIPS";
        UILevel[UILevel["HIGH_GOLD_TIPS"] = 6] = "HIGH_GOLD_TIPS";
        UILevel[UILevel["NOTICE"] = 7] = "NOTICE";
        UILevel[UILevel["BIGWINNER"] = 8] = "BIGWINNER";
        UILevel[UILevel["MINI_GAME"] = 9] = "MINI_GAME";
        UILevel[UILevel["POPUP"] = 10] = "POPUP";
        UILevel[UILevel["WAITINGBOX"] = 11] = "WAITINGBOX";
        UILevel[UILevel["LOADING"] = 12] = "LOADING";
        UILevel[UILevel["LAMP_TIPS"] = 13] = "LAMP_TIPS";
        UILevel[UILevel["TIPS"] = 14] = "TIPS";
        UILevel[UILevel["TOP"] = 15] = "TOP";
        UILevel[UILevel["DEBUG"] = 16] = "DEBUG";
    })(UILevel = sunui.UILevel || (sunui.UILevel = {}));
    var AbstractPopupCommand = (function (_super) {
        __extends(AbstractPopupCommand, _super);
        function AbstractPopupCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AbstractPopupCommand.prototype.$makeProps = function (props) {
            if (props.x === void 0 && props.left === void 0 && props.right === void 0) {
                props.centerX = 0;
            }
            if (props.y === void 0 && props.top === void 0 && props.bottom === void 0) {
                props.centerY = 0;
            }
        };
        AbstractPopupCommand.prototype.$applyShowProps = function (view, props, duration) {
            if (props.x !== void 0) {
                view.x = props.x;
            }
            if (props.y !== void 0) {
                view.y = props.y;
            }
            if (props.centerX !== void 0) {
                view.centerX = props.centerX;
            }
            if (props.centerY !== void 0) {
                view.centerY = props.centerY;
            }
            if (duration === 0 || (props.flags & PopupFlagEnum.SIMPLY)) {
                if (props.left !== void 0) {
                    view.left = props.left;
                }
                if (props.right !== void 0) {
                    view.right = props.right;
                }
                if (props.top !== void 0) {
                    view.top = props.top;
                }
                if (props.bottom !== void 0) {
                    view.bottom = props.bottom;
                }
                if (props.scaleX !== void 0) {
                    view.scaleX = props.scaleX;
                }
                if (props.scaleY !== void 0) {
                    view.scaleY = props.scaleY;
                }
            }
            else {
                if (props.left !== void 0) {
                    view.left = -view.width;
                }
                if (props.right !== void 0) {
                    view.right = -view.width;
                }
                if (props.top !== void 0) {
                    view.top = -view.height;
                }
                if (props.bottom !== void 0) {
                    view.bottom = -view.height;
                }
                if (props.left === void 0 && props.right === void 0 && props.top === void 0 && props.bottom === void 0) {
                    view.alpha = 0;
                    view.scaleX = 0;
                    view.scaleY = 0;
                    props.alpha = 1;
                    if (props.scaleX === void 0) {
                        props.scaleX = 1;
                    }
                    if (props.scaleY === void 0) {
                        props.scaleY = 1;
                    }
                }
                Tween.get(view, props.mod).to(props, duration, props.ease);
            }
        };
        AbstractPopupCommand.prototype.$applyCloseProps = function (view, props, duration) {
            if (duration > 0 && (props.flags & PopupFlagEnum.SIMPLY) === PopupFlagEnum.NONE) {
                if (props.left !== void 0) {
                    props.left = -view.width;
                }
                if (props.right !== void 0) {
                    props.right = -view.width;
                }
                if (props.top !== void 0) {
                    props.top = -view.height;
                }
                if (props.bottom !== void 0) {
                    props.bottom = -view.height;
                }
                if (props.left === void 0 && props.right === void 0 && props.top === void 0 && props.bottom === void 0) {
                    props.alpha = 0;
                    props.scaleX = 0;
                    props.scaleY = 0;
                }
                Tween.get(view, props.mod).to(props, duration);
            }
        };
        return AbstractPopupCommand;
    }(puremvc.SimpleCommand));
    sunui.AbstractPopupCommand = AbstractPopupCommand;
    var AbstractSceneTask = (function (_super) {
        __extends(AbstractSceneTask, _super);
        function AbstractSceneTask(info, data) {
            var _this = _super.call(this) || this;
            _this.$info = null;
            _this.$info = info;
            _this.$data = data;
            return _this;
        }
        return AbstractSceneTask;
    }(suncore.AbstractTask));
    sunui.AbstractSceneTask = AbstractSceneTask;
    var AssetLoader = (function (_super) {
        __extends(AssetLoader, _super);
        function AssetLoader(url, complete) {
            var _this = _super.call(this) || this;
            _this.$loading = false;
            _this.$complete = null;
            _this.$url = null;
            _this.$loaders = [];
            _this.$doneCount = 0;
            _this.$url = url;
            _this.$complete = complete;
            Resource.lock(_this.$url);
            return _this;
        }
        AssetLoader.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            _super.prototype.destroy.call(this);
            for (var i = 0; i < this.$loaders.length; i++) {
                this.$loaders[i].destroy();
            }
            Resource.unlock(this.$url);
        };
        AssetLoader.prototype.load = function () {
            if (this.$loading === false && this.$destroyed === false) {
                this.$loading = true;
                this.$doLoad();
            }
        };
        AssetLoader.prototype.$loadAssets = function (urls) {
            this.$doneCount = this.$loaders.length;
            for (var i = 0; i < urls.length; i++) {
                this.$loaders.push(new UrlSafetyLoader(urls[i], suncom.Handler.create(this, this.$onLoadAsset)));
            }
        };
        AssetLoader.prototype.$onLoadAsset = function (ok) {
            if (ok === false) {
                this.$onAssetsLoaded(false);
            }
            else {
                this.$doneCount++;
                if (this.$doneCount === this.$loaders.length) {
                    this.$onAssetsLoaded(true);
                }
            }
        };
        AssetLoader.prototype.$onComplete = function (ok) {
            if (this.$destroyed === false) {
                this.$complete.runWith(ok);
            }
            this.destroy();
            this.$loading = false;
        };
        return AssetLoader;
    }(puremvc.Notifier));
    sunui.AssetLoader = AssetLoader;
    var AssetSafetyLoader = (function (_super) {
        __extends(AssetSafetyLoader, _super);
        function AssetSafetyLoader(url, complete) {
            var _this = _super.call(this) || this;
            _this.$url = null;
            _this.$complete = null;
            _this.$loader = null;
            _this.$retryer = new Retryer(RetryMethodEnum.TERMINATE, suncom.Handler.create(_this, _this.$onRetryConfirmed), "资源加载失败，点击确定重新尝试！");
            Resource.lock(url);
            _this.$url = url;
            _this.$complete = complete;
            _this.$doLoad();
            return _this;
        }
        AssetSafetyLoader.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            _super.prototype.destroy.call(this);
            this.$retryer.cancel();
            this.$loader !== null && this.$loader.destroy();
            Resource.unlock(this.$url);
        };
        AssetSafetyLoader.prototype.$doLoad = function () {
            var handler = suncom.Handler.create(this, this.$onLoad);
            if (Resource.isRes3dUrl(this.$url) === true) {
                this.$loader = new Res3dLoader(this.$url, handler);
            }
            else if (suncom.Common.getFileExtension(this.$url) === "sk") {
                this.$loader = new SkeletonLoader(this.$url, handler);
            }
            else {
                this.$loader = new UrlLoader(this.$url, handler);
            }
            this.$loader.load();
        };
        AssetSafetyLoader.prototype.$onLoad = function (ok) {
            if (ok === true) {
                this.$complete.runWith(this.$url);
            }
            else {
                this.$retryer.run(1000, suncom.Handler.create(this, this.$doLoad), 2);
            }
            this.$loader = null;
        };
        AssetSafetyLoader.prototype.$onRetryConfirmed = function (option) {
            if (option === ConfirmOptionValueEnum.NO) {
                this.$retryer.reset();
                suncom.Logger.warn(suncom.DebugMode.ANY, "\u5931\u8D25\uFF1A" + this.$url);
                this.facade.sendNotification(NotifyKey.ON_ASSET_SAFETY_LOADER_FAILED);
                this.facade.registerObserver(NotifyKey.ASSET_SAFETY_LOADER_RETRY, this.$onAssetSafetyLoaderRetry, this, true);
            }
            else {
                this.facade.sendNotification(suncore.NotifyKey.SHUTDOWN);
            }
        };
        AssetSafetyLoader.prototype.$onAssetSafetyLoaderRetry = function () {
            if (this.$destroyed === false) {
                suncom.Logger.warn(suncom.DebugMode.ANY, "\u91CD\u8BD5\uFF1A" + this.$url);
                this.$doLoad();
            }
        };
        Object.defineProperty(AssetSafetyLoader.prototype, "complete", {
            get: function () {
                return this.$complete;
            },
            enumerable: true,
            configurable: true
        });
        return AssetSafetyLoader;
    }(puremvc.Notifier));
    sunui.AssetSafetyLoader = AssetSafetyLoader;
    var ClosePopupCommand = (function (_super) {
        __extends(ClosePopupCommand, _super);
        function ClosePopupCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ClosePopupCommand.prototype.execute = function (view, duration, destroy) {
            var info = M.viewLayer.getInfoByView(view);
            if (info === null) {
                suncom.Logger.error(suncom.DebugMode.ANY, view + "[" + (view && view.name) + "]'s infomation is not exist.");
                return;
            }
            if (destroy !== void 0) {
                info.keepNode = !destroy;
            }
            if (info.closed === true) {
                return;
            }
            info.closed = true;
            M.viewLayer.onViewClose(view);
            this.facade.sendNotification(NotifyKey.ON_POPUP_CLOSED, view);
            if ((info.props.flags & PopupFlagEnum.TRANSPARENT) === PopupFlagEnum.NONE) {
                var tween = Tween.get(info.mask, info.props.mod);
                if (duration > 200 && (info.props.flags & PopupFlagEnum.SYNC_FADE_TIME) === PopupFlagEnum.NONE) {
                    tween.wait(duration - 200).to({ alpha: 0 }, 200);
                }
                else {
                    tween.to({ alpha: 0 }, duration);
                }
            }
            this.$applyCloseProps(view, info.props, duration);
            var handler = suncom.Handler.create(this, this.$onCloseFinish, [view]);
            suncore.System.addTrigger(info.props.mod, duration, handler);
        };
        ClosePopupCommand.prototype.$onCloseFinish = function (view) {
            M.viewLayer.removeStackInfoByView(view);
        };
        return ClosePopupCommand;
    }(AbstractPopupCommand));
    sunui.ClosePopupCommand = ClosePopupCommand;
    var GUILogicInterceptor = (function (_super) {
        __extends(GUILogicInterceptor, _super);
        function GUILogicInterceptor(command, condition) {
            var _this = _super.call(this) || this;
            _this.$relieved = false;
            _this.$command = command;
            _this.$condition = condition;
            _this.facade.registerObserver(command, _this.$onCommandCallback, _this, false, suncom.EventPriorityEnum.HIGHEST);
            return _this;
        }
        GUILogicInterceptor.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            _super.prototype.destroy.call(this);
            this.facade.removeObserver(this.$command, this.$onCommandCallback, this);
        };
        Object.defineProperty(GUILogicInterceptor.prototype, "command", {
            get: function () {
                return this.$command;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GUILogicInterceptor.prototype, "relieved", {
            get: function () {
                return this.$relieved;
            },
            enumerable: true,
            configurable: true
        });
        return GUILogicInterceptor;
    }(puremvc.Notifier));
    sunui.GUILogicInterceptor = GUILogicInterceptor;
    var GUILogicRunnable = (function (_super) {
        __extends(GUILogicRunnable, _super);
        function GUILogicRunnable(autoDestroy) {
            if (autoDestroy === void 0) { autoDestroy = true; }
            var _this = _super.call(this) || this;
            _this.$hashId = suncom.Common.createHashId();
            _this.$timerId = 0;
            _this.$commands = [];
            _this.$autoDestroy = false;
            _this.$autoDestroy = autoDestroy;
            _this.facade.registerObserver(NotifyKey.NEXT_LOGIC_COMMAND, _this.$onNextLogicCommand, _this);
            _this.facade.registerObserver(NotifyKey.DESTROY_LOGIC_RUNNABLE, _this.$onDestroyLogicRunnable, _this);
            _this.facade.registerObserver(NotifyKey.DESTROY_ALL_LOGIC_RUNNABLE, _this.$onDestroyAllLogicRunnable, _this);
            return _this;
        }
        GUILogicRunnable.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            _super.prototype.destroy.call(this);
            this.facade.removeObserver(NotifyKey.NEXT_LOGIC_COMMAND, this.$onNextLogicCommand, this);
            this.facade.removeObserver(NotifyKey.DESTROY_LOGIC_RUNNABLE, this.$onDestroyAllLogicRunnable, this);
            this.facade.removeObserver(NotifyKey.DESTROY_ALL_LOGIC_RUNNABLE, this.$onDestroyAllLogicRunnable, this);
            for (var i = 0; i < this.$commands.length; i++) {
                this.$commands[i].destroy();
            }
        };
        GUILogicRunnable.prototype.$onDestroyAllLogicRunnable = function () {
            this.destroy();
        };
        GUILogicRunnable.prototype.$onDestroyLogicRunnable = function (hashId) {
            if (this.$autoDestroy === false && this.$hashId === hashId) {
                this.destroy();
            }
        };
        GUILogicRunnable.prototype.$onNextLogicCommand = function (command) {
            var index = -1;
            for (var i = 0; i < this.$commands.length; i++) {
                if (this.$commands[i] === command) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                return;
            }
            index++;
            this.facade.notifyCancel();
            if (index < this.$commands.length) {
                var command_1 = this.$commands[index];
                if (command_1.running === false) {
                    command_1.run();
                }
            }
            else if (this.$autoDestroy === true) {
                this.destroy();
            }
        };
        GUILogicRunnable.prototype.$addCommand = function (command, condition, dependencies) {
            this.$commands.push(new GUILogicCommand(command, condition, dependencies));
            if (this.$commands[0].running === false) {
                this.$commands[0].run();
            }
        };
        Object.defineProperty(GUILogicRunnable.prototype, "hashId", {
            get: function () {
                return this.$hashId;
            },
            enumerable: true,
            configurable: true
        });
        return GUILogicRunnable;
    }(puremvc.Notifier));
    sunui.GUILogicRunnable = GUILogicRunnable;
    var RegisterScenesCommand = (function (_super) {
        __extends(RegisterScenesCommand, _super);
        function RegisterScenesCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RegisterScenesCommand.prototype.execute = function (infos) {
            for (var i = 0; i < infos.length; i++) {
                var info = infos[i];
                SceneManager.regScene(info);
            }
        };
        return RegisterScenesCommand;
    }(puremvc.SimpleCommand));
    sunui.RegisterScenesCommand = RegisterScenesCommand;
    var Res3dLoader = (function (_super) {
        __extends(Res3dLoader, _super);
        function Res3dLoader() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Res3dLoader.prototype.$doLoad = function () {
            var url = Resource.getRes3dJsonUrl(this.$url);
            var loaded = Laya.loader.getRes(this.$url) === void 0 ? false : true;
            if (suncom.Common.getFileExtension(this.$url) === "ls" || loaded === true) {
                this.$loadAssets([url]);
            }
            else {
                this.$loaders.push(new UrlSafetyLoader(url, suncom.Handler.create(this, this.$onUrlLoaded)));
            }
        };
        Res3dLoader.prototype.$onUrlLoaded = function (ok, url) {
            if (ok === true) {
                var res = M.cacheMap[this.$url] || null;
                if (res === null) {
                    this.$loadAssets([this.$url]);
                }
                else {
                    this.$onAssetsLoaded(true);
                }
            }
            else {
                this.$onComplete(false);
            }
        };
        Res3dLoader.prototype.$onAssetsLoaded = function (ok) {
            if (suncom.Common.getFileExtension(this.$url) === "ls") {
                this.$onComplete(ok);
            }
            else {
                var res = M.cacheMap[this.$url] || null;
                if (res === null) {
                    res = M.cacheMap[this.$url] = Laya.loader.getRes(this.$url);
                }
                this.$onComplete(ok);
            }
        };
        return Res3dLoader;
    }(AssetLoader));
    sunui.Res3dLoader = Res3dLoader;
    var ResourceService = (function (_super) {
        __extends(ResourceService, _super);
        function ResourceService() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$undoList = [];
            _this.$loadingList = [];
            _this.$isRetryPrompting = false;
            return _this;
        }
        ResourceService.prototype.$onRun = function () {
            this.facade.registerObserver(NotifyKey.ON_URL_SAFETY_LOADER_CREATED, this.$onUrlSafetyLoaderCreated, this);
            this.facade.registerObserver(NotifyKey.ON_URL_SAFETY_LOADER_COMPLETE, this.$onUrlSafetyLoaderComplete, this);
            this.facade.registerObserver(NotifyKey.ON_ASSET_SAFETY_LOADER_FAILED, this.$onAssetSafetyLoaderFailed, this);
        };
        ResourceService.prototype.$onStop = function () {
            this.facade.removeObserver(NotifyKey.ON_URL_SAFETY_LOADER_CREATED, this.$onUrlSafetyLoaderCreated, this);
            this.facade.removeObserver(NotifyKey.ON_URL_SAFETY_LOADER_COMPLETE, this.$onUrlSafetyLoaderComplete, this);
            this.facade.removeObserver(NotifyKey.ON_ASSET_SAFETY_LOADER_FAILED, this.$onAssetSafetyLoaderFailed, this);
        };
        ResourceService.prototype.$onUrlSafetyLoaderCreated = function (loader) {
            this.$undoList.unshift(loader);
            if (suncom.Global.debugMode & suncom.DebugMode.DEBUG) {
                suncom.Logger.trace(suncom.DebugMode.ANY, "create loader for url " + loader.url + ", loading list length:" + this.$loadingList.length + ", undo list length:" + this.$undoList.length);
            }
            this.$next();
        };
        ResourceService.prototype.$onUrlSafetyLoaderComplete = function (loader) {
            var index = this.$loadingList.indexOf(loader);
            suncom.Test.expect(index).toBeGreaterOrEqualThan(0);
            this.$loadingList.splice(index, 1);
            if (suncom.Global.debugMode & suncom.DebugMode.DEBUG) {
                suncom.Logger.trace(suncom.DebugMode.ANY, "remove loader for url " + loader.url + ", loading list length:" + this.$loadingList.length + ", undo list length:" + this.$undoList.length);
            }
            this.$next();
        };
        ResourceService.prototype.$next = function () {
            while (this.$undoList.length > 0 && this.$loadingList.length < ResourceService.MAX_LOAD_COUNT) {
                var ok = false;
                for (var i = this.$undoList.length - 1; i > -1; i--) {
                    var loader = this.$undoList[i];
                    if (loader.destroyed === true) {
                        this.$undoList.splice(i, 1);
                        continue;
                    }
                    if (this.$isUrlInLoading(loader.url) === true) {
                        continue;
                    }
                    if (suncom.Global.debugMode & suncom.DebugMode.DEBUG) {
                        suncom.Logger.trace(suncom.DebugMode.ANY, "load next url " + loader.url + ", loading list length:" + this.$loadingList.length + " + 1");
                    }
                    ok = true;
                    loader.load();
                    this.$loadingList.push(loader);
                    break;
                }
                if (ok === false) {
                    break;
                }
            }
        };
        ResourceService.prototype.$isUrlInLoading = function (url) {
            for (var i = 0; i < this.$loadingList.length; i++) {
                var loader = this.$loadingList[i];
                if (loader.url === url) {
                    return true;
                }
            }
            return false;
        };
        ResourceService.prototype.$onAssetSafetyLoaderFailed = function () {
            if (this.$isRetryPrompting === false) {
                this.$isRetryPrompting = true;
                this.facade.sendNotification(NotifyKey.RETRY_CONFIRM, [
                    suncore.ModuleEnum.SYSTEM,
                    "资源加载失败，点击确定重新尝试！",
                    [ConfirmOptionValueEnum.YES, "确定", ConfirmOptionValueEnum.NO, "取消"],
                    suncom.Handler.create(this, this.$onRetryConfirmed)
                ]);
            }
        };
        ResourceService.prototype.$onRetryConfirmed = function (option) {
            if (option === ConfirmOptionValueEnum.YES) {
                this.facade.sendNotification(NotifyKey.ASSET_SAFETY_LOADER_RETRY);
            }
            else {
                this.facade.sendNotification(suncore.NotifyKey.SHUTDOWN);
            }
            this.$isRetryPrompting = false;
        };
        ResourceService.MAX_LOAD_COUNT = 5;
        return ResourceService;
    }(suncore.BaseService));
    sunui.ResourceService = ResourceService;
    var Retryer = (function (_super) {
        __extends(Retryer, _super);
        function Retryer(modOrMethod, confirmHandler, prompt) {
            if (confirmHandler === void 0) { confirmHandler = null; }
            if (prompt === void 0) { prompt = null; }
            var options = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                options[_i - 3] = arguments[_i];
            }
            var _this = _super.call(this, suncore.MsgQModEnum.MMI) || this;
            _this.$options = [];
            _this.$currentRetries = 0;
            _this.$retryHandler = null;
            _this.$retryTimerId = 0;
            _this.$prompting = false;
            if ((modOrMethod & RetryMethodEnum.CONFIRM) === RetryMethodEnum.CONFIRM) {
                _this.$method = RetryMethodEnum.CONFIRM;
            }
            else if ((modOrMethod & RetryMethodEnum.TERMINATE) === RetryMethodEnum.TERMINATE) {
                _this.$method = RetryMethodEnum.TERMINATE;
            }
            else {
                _this.$method = RetryMethodEnum.AUTO;
            }
            var mode = modOrMethod &= 0xF;
            if (modOrMethod === suncore.ModuleEnum.CUSTOM || modOrMethod === suncore.ModuleEnum.TIMELINE) {
                _this.$mod = modOrMethod;
            }
            else {
                _this.$mod = suncore.ModuleEnum.SYSTEM;
            }
            _this.$prompt = prompt;
            _this.$options = options;
            _this.$confirmHandler = confirmHandler;
            return _this;
        }
        Retryer.prototype.run = function (delay, handler, maxRetries) {
            if (maxRetries === void 0) { maxRetries = 2; }
            if (this.$method === RetryMethodEnum.AUTO || this.$currentRetries < maxRetries) {
                if (this.$retryTimerId === 0) {
                    this.$retryHandler = handler;
                    this.$retryTimerId = suncore.System.addTimer(suncore.ModuleEnum.SYSTEM, delay, this.$onRetryTimer, this);
                }
                else {
                    suncom.Logger.warn(suncom.DebugMode.ANY, "\u5DF1\u5FFD\u7565\u7684\u91CD\u8BD5\u8BF7\u6C42 method:" + suncom.Common.getMethodName(handler.method, handler.caller) + ", caller:" + suncom.Common.getQualifiedClassName(handler.caller));
                }
            }
            else {
                if (this.$prompting === false) {
                    this.$prompting = true;
                    if (this.$method === RetryMethodEnum.TERMINATE) {
                        var handler_1 = suncom.Handler.create(this, this.$onConfirmReplied, [ConfirmOptionValueEnum.NO]);
                        suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_0, handler_1);
                    }
                    else {
                        var handler_2 = suncom.Handler.create(this, this.$onConfirmReplied);
                        this.facade.sendNotification(NotifyKey.RETRY_CONFIRM, [this.$mod, this.$prompt, this.$options, handler_2]);
                    }
                }
                else {
                    suncom.Logger.warn(suncom.DebugMode.ANY, "\u5DF1\u5FFD\u7565\u7684\u91CD\u8BD5\u7684\u8BE2\u95EE\u8BF7\u6C42 prompt:" + this.$prompt);
                }
            }
        };
        Retryer.prototype.$onConfirmReplied = function (option) {
            if (this.$prompting === true) {
                this.$prompting = false;
                if (this.$confirmHandler !== null) {
                    this.$confirmHandler.runWith(option);
                }
            }
        };
        Retryer.prototype.$onRetryTimer = function () {
            this.$retryTimerId = 0;
            this.$currentRetries++;
            this.$retryHandler.run();
        };
        Retryer.prototype.cancel = function () {
            this.$prompting = false;
            this.$retryTimerId = suncore.System.removeTimer(this.$retryTimerId);
        };
        Retryer.prototype.reset = function () {
            this.$currentRetries = 0;
        };
        Object.defineProperty(Retryer.prototype, "currentRetries", {
            get: function () {
                return this.$currentRetries;
            },
            enumerable: true,
            configurable: true
        });
        return Retryer;
    }(puremvc.Notifier));
    sunui.Retryer = Retryer;
    var SceneIniClass = (function (_super) {
        __extends(SceneIniClass, _super);
        function SceneIniClass(info, data) {
            var _this = _super.call(this, info, data) || this;
            _this.facade.registerObserver(NotifyKey.ENTER_SCENE, _this.$onEnterScene, _this, true, suncom.EventPriorityEnum.EGL);
            return _this;
        }
        SceneIniClass.prototype.$onEnterScene = function () {
        };
        return SceneIniClass;
    }(AbstractSceneTask));
    sunui.SceneIniClass = SceneIniClass;
    var SceneLayer = (function (_super) {
        __extends(SceneLayer, _super);
        function SceneLayer() {
            var _this = _super.call(this) || this;
            _this.$ready = true;
            _this.$sceneName = 0;
            _this.$scene2d = null;
            _this.$scene3d = null;
            _this.$data = null;
            _this.facade.registerObserver(NotifyKey.ENTER_SCENE, _this.$onEnterScene, _this, false, suncom.EventPriorityEnum.OSL);
            return _this;
        }
        SceneLayer.prototype.$enterScene = function (name, data) {
            var info = SceneManager.getConfigByName(name);
            suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_LAZY, suncom.Handler.create(this, this.$beforeLoadScene, [info, data]));
            suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_LAZY, suncom.Handler.create(this, this.$loadScene, [info]));
        };
        SceneLayer.prototype.$beforeLoadScene = function (info, data) {
            this.$data = data;
            this.$sceneName = info.name;
            this.facade.sendNotification(NotifyKey.BEFORE_LOAD_SCENE);
            info.iniCls && suncore.System.addTask(suncore.ModuleEnum.SYSTEM, 0, new info.iniCls(info, data));
        };
        SceneLayer.prototype.$loadScene = function (info) {
            this.facade.sendNotification(suncore.NotifyKey.START_TIMELINE, [suncore.ModuleEnum.CUSTOM, true]);
            info.scene3d = info.scene3d || null;
            this.facade.sendNotification(NotifyKey.LOAD_SCENE, info);
        };
        SceneLayer.prototype.$onEnterScene = function (scene2d, scene3d) {
            this.$ready = true;
            this.$scene2d = scene2d || null;
            this.$scene3d = scene3d || null;
            this.facade.sendNotification(suncore.NotifyKey.START_TIMELINE, [suncore.ModuleEnum.CUSTOM, false]);
        };
        SceneLayer.prototype.$exitScene = function () {
            this.facade.sendNotification(NotifyKey.EXIT_SCENE, this.$sceneName);
            this.facade.sendNotification(suncore.NotifyKey.PAUSE_TIMELINE, [suncore.ModuleEnum.CUSTOM, true]);
            var info = SceneManager.getConfigByName(this.$sceneName);
            suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_LAZY, suncom.Handler.create(this, this.$onLeaveScene, [info]));
        };
        SceneLayer.prototype.$onLeaveScene = function (info) {
            info.uniCls && suncore.System.addTask(suncore.ModuleEnum.SYSTEM, 0, new info.uniCls(info, this.$data));
            this.facade.sendNotification(NotifyKey.DESTROY_ALL_LOGIC_RUNNABLE);
            this.facade.sendNotification(NotifyKey.LEAVE_SCENE);
            this.facade.sendNotification(NotifyKey.UNLOAD_SCENE, [this.$scene2d, this.$scene3d]);
            info.scene2d !== null && Resource.clearResByUrl(info.scene2d);
            suncore.System.addTask(suncore.ModuleEnum.SYSTEM, 0, new suncore.SimpleTask(suncom.Handler.create(this, this.$onExitScene)));
        };
        SceneLayer.prototype.$onExitScene = function () {
            this.$sceneName = 0;
        };
        SceneLayer.prototype.enterScene = function (name, data) {
            if (this.$ready === false) {
                return false;
            }
            this.$ready = false;
            this.$sceneName != 0 && this.$exitScene();
            this.$enterScene(name, data);
            SceneHeap.addHistory(name, data);
            return true;
        };
        SceneLayer.prototype.exitScene = function () {
            if (this.$ready === false) {
                return;
            }
            this.$ready = false;
            this.$sceneName != 0 && this.$exitScene();
            SceneHeap.removeHistory(this.$sceneName);
            var info = SceneHeap.getLastestSceneInfo();
            info !== null && this.$enterScene(info.name, info.data);
        };
        SceneLayer.prototype.replaceScene = function (name, data) {
            var info = SceneHeap.getLastestSceneInfo();
            if (this.enterScene(name, data) === true) {
                info !== null && SceneHeap.removeHistory(info.name);
            }
        };
        SceneLayer.prototype.deleteHistories = function (deleteCount) {
            SceneHeap.deleteHistories(deleteCount);
        };
        Object.defineProperty(SceneLayer.prototype, "scene2d", {
            get: function () {
                return this.$scene2d;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SceneLayer.prototype, "scene3d", {
            get: function () {
                return this.$scene3d;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SceneLayer.prototype, "sceneName", {
            get: function () {
                return this.$ready === false ? 0 : this.$sceneName;
            },
            enumerable: true,
            configurable: true
        });
        return SceneLayer;
    }(puremvc.Notifier));
    sunui.SceneLayer = SceneLayer;
    var SceneUniClass = (function (_super) {
        __extends(SceneUniClass, _super);
        function SceneUniClass(info, data) {
            var _this = _super.call(this, info, data) || this;
            _this.facade.registerObserver(NotifyKey.LEAVE_SCENE, _this.$onLeaveScene, _this, true, suncom.EventPriorityEnum.EGL);
            return _this;
        }
        SceneUniClass.prototype.$onLeaveScene = function () {
        };
        return SceneUniClass;
    }(AbstractSceneTask));
    sunui.SceneUniClass = SceneUniClass;
    var ShowPopupCommand = (function (_super) {
        __extends(ShowPopupCommand, _super);
        function ShowPopupCommand() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ShowPopupCommand.prototype.execute = function (view, duration, props) {
            if (M.viewLayer.getInfoByView(view) !== null) {
                suncom.Logger.error(suncom.DebugMode.ANY, view + "[" + view.name + "] is already popup.");
                return;
            }
            if (props.mod === void 0) {
                props.mod = suncore.ModuleEnum.CUSTOM;
            }
            if (props.ease === void 0) {
                props.ease = Laya.Ease.backOut;
            }
            if (props.flags === void 0) {
                props.flags = PopupFlagEnum.NONE;
            }
            if (props.keepNode === void 0) {
                props.keepNode = false;
            }
            var args = props.args;
            var level = props.level || view.zOrder || UILevel.POPUP;
            var keepNode = props.keepNode;
            delete props.args;
            delete props.level;
            delete props.keepNode;
            this.$makeProps(props);
            if (props.trans === true && (props.flags & PopupFlagEnum.TRANSPARENT) === PopupFlagEnum.NONE) {
                suncom.Logger.warn(suncom.DebugMode.ANY, "ViewFacade\uFF1Aprops\u7684trans\u5C5E\u6027\u5DF1\u5F03\u7528\uFF0C\u8BF7\u4F7F\u7528flags\u4EE3\u66FF\uFF01\uFF01\uFF01");
                props.flags |= PopupFlagEnum.TRANSPARENT;
            }
            var mask = M.viewLayer.createMask(view, props);
            mask.name = "Mask$" + view.name;
            mask.zOrder = view.zOrder = level;
            var info = {
                view: view,
                mask: mask,
                props: props,
                closed: false,
                keepNode: keepNode,
                displayed: false,
                duration: duration,
                cancelAllowed: false
            };
            M.viewLayer.addToStack(info);
            M.viewLayer.addChild(mask);
            M.viewLayer.addChild(view);
            suncom.Test.expect(view["pivot"]).anything();
            view["pivot"](view.width * 0.5, view.height * 0.5);
            M.viewLayer.onViewCreate(view, args);
            if ((props.flags & PopupFlagEnum.TRANSPARENT) === PopupFlagEnum.NONE) {
                if (props.flags & PopupFlagEnum.SYNC_FADE_TIME) {
                    Tween.get(mask, info.props.mod).from({ alpha: 0 }, duration);
                }
                else {
                    Tween.get(mask, info.props.mod).from({ alpha: 0 }, duration > 200 ? 200 : duration);
                }
            }
            this.$applyShowProps(view, props, duration);
            var handler = suncom.Handler.create(this, this.$onPopupFinish, [view]);
            suncore.System.addTrigger(info.props.mod, duration, handler);
        };
        ShowPopupCommand.prototype.$onPopupFinish = function (view) {
            var info = M.viewLayer.getInfoByView(view);
            if (info !== null && info.closed === false) {
                info.displayed = true;
                M.viewLayer.onViewOpen(view);
            }
        };
        return ShowPopupCommand;
    }(AbstractPopupCommand));
    sunui.ShowPopupCommand = ShowPopupCommand;
    var SkeletonLoader = (function (_super) {
        __extends(SkeletonLoader, _super);
        function SkeletonLoader() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SkeletonLoader.prototype.$doLoad = function () {
            this.$loadAssets([this.$url, suncom.Common.replacePathExtension(this.$url, "png")]);
        };
        SkeletonLoader.prototype.$onAssetsLoaded = function (ok) {
            if (ok === true) {
                var templet = M.cacheMap[this.$url] || null;
                if (templet === null) {
                    templet = M.cacheMap[this.$url] = new Laya.Templet();
                    templet.loadAni(this.$url);
                }
                var handler = suncom.Handler.create(this, this.$onTempletCreated);
                suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_0, handler);
                Resource.lock(this.$url);
            }
            else {
                this.$onComplete(false);
            }
        };
        SkeletonLoader.prototype.$onTempletCreated = function () {
            if (this.destroyed === false) {
                var templet = M.cacheMap[this.$url];
                this.$onComplete(true);
            }
            Resource.unlock(this.$url);
        };
        return SkeletonLoader;
    }(AssetLoader));
    sunui.SkeletonLoader = SkeletonLoader;
    var Templet = (function (_super) {
        __extends(Templet, _super);
        function Templet(id, urls, handler) {
            var _this = _super.call(this) || this;
            _this.$id = 0;
            _this.$handler = null;
            _this.$doneList = [];
            _this.$loaders = [];
            _this.$id = id;
            _this.$handler = handler;
            urls = Resource.checkLoadList(urls);
            suncom.Test.expect(urls.length).toBeGreaterThan(0);
            while (urls.length > 0) {
                var url = urls.shift();
                var handler_3 = suncom.Handler.create(_this, _this.$onResourceCreated);
                var loader = new AssetSafetyLoader(url, handler_3);
                _this.$loaders.push(loader);
            }
            return _this;
        }
        Templet.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            _super.prototype.destroy.call(this);
            var handler = suncom.Handler.create(this, this.$releaseAllResources);
            suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_0, handler);
        };
        Templet.prototype.$onResourceCreated = function (url) {
            this.$doneList.push(url);
            if (this.$doneList.length < this.$loaders.length) {
                return;
            }
            if (this.$destroyed === true) {
                return;
            }
            this.$handler.runWith([this.$id]);
        };
        Templet.prototype.$releaseAllResources = function () {
            for (var i = 0; i < this.$loaders.length; i++) {
                this.$loaders[i].destroy();
            }
        };
        return Templet;
    }(puremvc.Notifier));
    sunui.Templet = Templet;
    var Tween = (function (_super) {
        __extends(Tween, _super);
        function Tween(item, mod) {
            var _this = _super.call(this) || this;
            _this.$infos = [];
            _this.$props = null;
            _this.$mod = mod;
            _this.$item = item;
            if (suncore.System.isModuleStopped(mod) === false) {
                _this.facade.sendNotification(NotifyKey.REGISTER_TWEEN_OBJECT, _this);
            }
            else {
                suncom.Logger.error(suncom.DebugMode.ANY, "\u5C1D\u8BD5\u6DFB\u52A0\u7F13\u52A8\uFF0C\u4F46\u65F6\u95F4\u8F74\u5DF1\u505C\u6B62\uFF0Cmod:" + suncore.ModuleEnum[mod]);
            }
            return _this;
        }
        Tween.prototype.cancel = function () {
            this.$props = null;
            this.$infos.length = 0;
            return this;
        };
        Tween.prototype.to = function (props, duration, ease, handler) {
            if (ease === void 0) { ease = null; }
            if (handler === void 0) { handler = null; }
            var keys = Object.keys(props);
            var item = this.$props === null ? this.$item : this.$props;
            this.$createTweenInfo(keys, item, props, duration, ease, props.update || null, handler);
            return this;
        };
        Tween.prototype.from = function (props, duration, ease, handler) {
            if (ease === void 0) { ease = null; }
            if (handler === void 0) { handler = null; }
            var keys = Object.keys(props);
            var item = this.$props === null ? this.$item : this.$props;
            this.$createTweenInfo(keys, props, item, duration, ease, props.update || null, handler);
            return this;
        };
        Tween.prototype.by = function (props, duration, ease, handler) {
            if (ease === void 0) { ease = null; }
            if (handler === void 0) { handler = null; }
            var keys = Object.keys(props);
            var item = this.$props === null ? this.$item : this.$props;
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (this.$props === null || this.$props[key] === void 0) {
                    props[key] += this.$item[key];
                }
                else {
                    props[key] += item[key];
                }
            }
            this.to(props, duration, ease, handler);
            return this;
        };
        Tween.prototype.$createTweenInfo = function (keys, from, to, duration, ease, update, handler) {
            this.$props = this.$props || {};
            var actions = [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (key === "update") {
                    continue;
                }
                var action = {
                    prop: key,
                    from: from[key],
                    to: to[key]
                };
                if (action.from === void 0) {
                    action.from = this.$item[key];
                }
                actions.push(action);
                this.$props[key] = to[key];
                if (this.$infos.length === 0) {
                    this.$item[action.prop] = action.from;
                }
            }
            var info = {
                ease: ease,
                actions: actions,
                update: update,
                handler: handler,
                time: suncore.System.getModuleTimestamp(this.$mod),
                duration: duration
            };
            this.$infos.push(info);
        };
        Tween.prototype.wait = function (delay, handler) {
            if (handler === void 0) { handler = null; }
            var info = {
                ease: null,
                actions: [],
                update: null,
                handler: handler,
                time: suncore.System.getModuleTimestamp(this.$mod),
                duration: delay
            };
            this.$infos.push(info);
            return this;
        };
        Tween.prototype.doAction = function () {
            var time = suncore.System.getModuleTimestamp(this.$mod);
            var info = this.$infos[0];
            if (this.$item.destroyed === true) {
                this.cancel();
                return 0;
            }
            var done = false;
            var timeLeft = 0;
            var duration = time - info.time;
            if (duration > info.duration) {
                done = true;
                timeLeft = duration - info.duration;
                duration = info.duration;
            }
            var func = info.ease || this.$easeNone;
            for (var i = 0; i < info.actions.length; i++) {
                var action = info.actions[i];
                if (done === true) {
                    this.$item[action.prop] = action.to;
                }
                else {
                    this.$item[action.prop] = func(duration, action.from, action.to - action.from, info.duration);
                }
            }
            if (info.update !== null) {
                info.update.run();
            }
            if (done === false) {
                return 0;
            }
            this.$infos.shift();
            if (this.$infos.length > 0) {
                this.$infos[0].time = suncore.System.getModuleTimestamp(this.$mod);
            }
            info.handler !== null && info.handler.run();
            return timeLeft;
        };
        Tween.prototype.$easeNone = function (t, b, c, d) {
            var a = t / d;
            if (a > 1) {
                a = 1;
            }
            return a * c + b;
        };
        Object.defineProperty(Tween.prototype, "mod", {
            get: function () {
                return this.$mod;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tween.prototype, "canceled", {
            get: function () {
                return this.$infos.length === 0;
            },
            enumerable: true,
            configurable: true
        });
        Tween.get = function (item, mod) {
            if (mod === void 0) { mod = suncore.ModuleEnum.CUSTOM; }
            return new Tween(item, mod);
        };
        return Tween;
    }(puremvc.Notifier));
    sunui.Tween = Tween;
    var TweenService = (function (_super) {
        __extends(TweenService, _super);
        function TweenService() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$tweens = [false];
            return _this;
        }
        TweenService.prototype.$onRun = function () {
            this.facade.registerObserver(NotifyKey.REGISTER_TWEEN_OBJECT, this.$onAddTweenObject, this);
            this.facade.registerObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrame, this, false, suncom.EventPriorityEnum.EGL);
            this.facade.registerObserver(suncore.NotifyKey.PAUSE_TIMELINE, this.$onTimelinePause, this, false, suncom.EventPriorityEnum.EGL);
        };
        TweenService.prototype.$onStop = function () {
            this.facade.removeObserver(NotifyKey.REGISTER_TWEEN_OBJECT, this.$onAddTweenObject, this);
            this.facade.removeObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrame, this);
            this.facade.removeObserver(suncore.NotifyKey.PAUSE_TIMELINE, this.$onTimelinePause, this);
        };
        TweenService.prototype.$onEnterFrame = function () {
            this.$tweens[0] = true;
            var tweens = this.$tweens;
            for (var mod = suncore.ModuleEnum.MIN; mod < suncore.ModuleEnum.MAX; mod++) {
                if (suncore.System.isModulePaused(mod) === false) {
                    var length_2 = tweens.length;
                    for (var i = 0; i < length_2; i++) {
                        var tween = tweens[i];
                        if (tween.mod === mod) {
                            var timeLeft = 1;
                            while (timeLeft > 0 && tween.canceled === false) {
                                timeLeft = tween.doAction();
                            }
                        }
                    }
                }
            }
            for (var i = this.$tweens.length - 1; i > 0; i--) {
                var tween = this.$tweens[i];
                if (tween.canceled === true) {
                    tweens.splice(i, 1);
                }
            }
            this.$tweens[0] = false;
        };
        TweenService.prototype.$onTimelinePause = function (mod, stop) {
            if (stop === true) {
                for (var i = 1; i < this.$tweens.length; i++) {
                    var tween = this.$tweens[i];
                    if (tween.mod === mod) {
                        tween.cancel();
                    }
                }
            }
        };
        TweenService.prototype.$onAddTweenObject = function (tween) {
            if (this.$tweens[0] === true) {
                this.$tweens = this.$tweens.slice(0);
                this.$tweens[0] = false;
            }
            this.$tweens.push(tween);
        };
        return TweenService;
    }(suncore.BaseService));
    sunui.TweenService = TweenService;
    var UIManager = (function (_super) {
        __extends(UIManager, _super);
        function UIManager() {
            var _this = _super.call(this) || this;
            M.sceneLayer = new SceneLayer();
            if (Laya.Scene3D === void 0) {
                M.viewLayer = new ViewLayerLaya2D();
            }
            else {
                M.viewLayer = new ViewLayerLaya3D();
            }
            suncom.DBService.put(-1, new TweenService()).run();
            suncom.DBService.put(-1, new ResourceService()).run();
            _this.facade.registerCommand(NotifyKey.SHOW_POPUP, ShowPopupCommand, suncom.EventPriorityEnum.OSL);
            _this.facade.registerCommand(NotifyKey.CLOSE_POPUP, ClosePopupCommand, suncom.EventPriorityEnum.OSL);
            return _this;
        }
        UIManager.getInstance = function () {
            if (UIManager.$inst === null) {
                UIManager.$inst = new UIManager();
            }
            return UIManager.$inst;
        };
        UIManager.prototype.enterScene = function (name, data) {
            puremvc.MutexLocker.backup(this);
            M.sceneLayer.enterScene(name, data);
            puremvc.MutexLocker.restore();
        };
        UIManager.prototype.exitScene = function () {
            puremvc.MutexLocker.backup(this);
            M.sceneLayer.exitScene();
            puremvc.MutexLocker.restore();
        };
        UIManager.prototype.replaceScene = function (name, data) {
            puremvc.MutexLocker.backup(this);
            M.sceneLayer.replaceScene(name, data);
            puremvc.MutexLocker.restore();
        };
        UIManager.prototype.deleteHistories = function (deleteCount) {
            M.sceneLayer.deleteHistories(deleteCount);
        };
        UIManager.prototype.removeView = function (view) {
            M.viewLayer.removeStackInfoByView(view);
        };
        Object.defineProperty(UIManager.prototype, "scene2d", {
            get: function () {
                return M.sceneLayer.scene2d;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "scene3d", {
            get: function () {
                return M.sceneLayer.scene3d;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "sceneName", {
            get: function () {
                return M.sceneLayer.sceneName;
            },
            enumerable: true,
            configurable: true
        });
        UIManager.$inst = null;
        return UIManager;
    }(puremvc.Notifier));
    sunui.UIManager = UIManager;
    var UrlDownloadLimiter = (function (_super) {
        __extends(UrlDownloadLimiter, _super);
        function UrlDownloadLimiter(url, handler) {
            var _this = _super.call(this) || this;
            _this.$url = null;
            _this.$data = null;
            _this.$handler = null;
            _this.$totalSize = 0;
            _this.$currentSize = 0;
            _this.$priority = 0;
            _this.$url = url;
            _this.$handler = handler;
            _this.$priority = suncom.Mathf.random(0, 6);
            if (Laya.loader.getRes(url) !== void 0) {
                _this.$totalSize = -1;
            }
            M.downloadLimiters.push(_this);
            return _this;
        }
        UrlDownloadLimiter.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            _super.prototype.destroy.call(this);
            var index = M.downloadLimiters.indexOf(this);
            if (index < 0) {
                throw Error("\u52A0\u8F7D\u9650\u5236\u5668\u4E0D\u5B58\u5728\uFF1Aindex:" + index);
            }
            M.downloadLimiters.splice(index, 1);
            this.facade.removeObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrame, this);
        };
        UrlDownloadLimiter.prototype.updateDownloadSize = function (res) {
            if (res === null || this.$totalSize === -1) {
                this.$totalSize = 1;
            }
            else if (suncom.Common.getFileExtension(this.$url) === "atlas") {
                var png = Laya.loader.getRes(suncom.Common.replacePathExtension(this.$url, "png")) || null;
                var size = (png === null ? 0 : png["gpuMemory"]) || 1;
                this.$totalSize = size + this.$getStringSize(Laya.loader.getRes(this.$url) || null);
            }
            else if (suncom.Common.getFileExtension(this.$url) === "png" || suncom.Common.getFileExtension(this.$url) === "jpg") {
                var png = Laya.loader.getRes(suncom.Common.replacePathExtension(this.$url, "png")) || null;
                this.$totalSize = (png === null ? 0 : png.bitmap["gpuMemory"]) || 1;
            }
            else if (suncom.Common.getFileExtension(this.$url) === "json") {
                this.$totalSize = this.$getStringSize(Laya.loader.getRes(this.$url) || null);
            }
            else if (suncom.Common.getFileExtension(this.$url) === "sk") {
                var sk = res;
                this.$totalSize = sk.byteLength;
            }
            else if (suncom.Common.getFileExtension(this.$url) === "lh") {
                var json = Laya.loader.getRes(suncom.Common.replacePathExtension(this.$url, "json"));
                var urls = Resource.getAssetUrlsByRes3dJson(json);
                for (var i = 0; i < urls.length; i++) {
                    var url = urls[i];
                    var data = Laya.loader.getRes(url) || null;
                    if (data["gpuMemory"] > 0) {
                        this.$totalSize += data["gpuMemory"];
                    }
                    else {
                        try {
                            this.$totalSize += this.$getStringSize(data);
                        }
                        catch (error) {
                            this.$totalSize += 1;
                        }
                    }
                }
            }
            else {
                this.$totalSize = 1;
            }
            this.$data = res;
            this.facade.registerObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrame, this);
        };
        UrlDownloadLimiter.prototype.$onEnterFrame = function () {
            this.$currentSize += this.$getDowloadSpeed() * (10 - this.$priority) / 10;
            if (this.$totalSize > 0 && this.$currentSize > this.$totalSize) {
                suncom.Logger.log(suncom.DebugMode.DEBUG, "[100%] " + this.$url + ":{" + this.$currentSize + ":" + this.$totalSize + "}");
                this.$handler.runWith(this.$data);
                this.destroy();
            }
            else {
                if (this.$totalSize > 0) {
                    suncom.Logger.log(suncom.DebugMode.DEBUG, "[" + Math.floor(this.$currentSize / this.$totalSize * 100) + "%] " + this.$url + ":{" + this.$currentSize + ":" + this.$totalSize + "}");
                }
                else {
                    suncom.Logger.log(suncom.DebugMode.DEBUG, "[0%] " + this.$url + ":{" + this.$currentSize + ":" + this.$totalSize + "}");
                }
            }
        };
        UrlDownloadLimiter.prototype.$getDowloadSpeed = function () {
            if (M.downloadLimiters.length <= 1) {
                return M.downloadSpeed;
            }
            else {
                return M.downloadSpeed / M.downloadLimiters.length;
            }
        };
        UrlDownloadLimiter.prototype.$getStringSize = function (data) {
            var str = null;
            var size = 0;
            if (data === null) {
                return 1;
            }
            if (typeof data === "number" || typeof data === "string") {
                str = data.toString();
            }
            else {
                str = JSON.stringify(data);
            }
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) <= 255) {
                    size++;
                }
                else {
                    size += 2;
                }
            }
            return size;
        };
        return UrlDownloadLimiter;
    }(puremvc.Notifier));
    sunui.UrlDownloadLimiter = UrlDownloadLimiter;
    var UrlLoader = (function (_super) {
        __extends(UrlLoader, _super);
        function UrlLoader() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        UrlLoader.prototype.$doLoad = function () {
            this.$loadAssets([this.$url]);
        };
        UrlLoader.prototype.$onAssetsLoaded = function (ok) {
            this.$onComplete(ok);
        };
        return UrlLoader;
    }(AssetLoader));
    sunui.UrlLoader = UrlLoader;
    var UrlSafetyLoader = (function (_super) {
        __extends(UrlSafetyLoader, _super);
        function UrlSafetyLoader(url, complete) {
            var _this = _super.call(this) || this;
            _this.$url = null;
            _this.$limiter = null;
            _this.$complete = null;
            _this.$loading = false;
            _this.$url = url;
            _this.$complete = complete;
            _this.facade.sendNotification(NotifyKey.ON_URL_SAFETY_LOADER_CREATED, _this);
            return _this;
        }
        UrlSafetyLoader.prototype.load = function () {
            if (this.$loading === false && this.$destroyed === false) {
                this.$loading = true;
                UrlLocker.lock(this.$url);
                if (suncom.Global.debugMode & suncom.DebugMode.DEBUG) {
                    suncom.Logger.trace(suncom.DebugMode.ANY, "load " + this.$url);
                }
                if (Resource.isRes3dUrl(this.$url) === false || Resource.getRes3dJsonUrl(this.$url) === this.$url) {
                    Laya.loader.load(this.$url, Laya.Handler.create(this, this.$onComplete));
                }
                else {
                    Laya.loader.create(this.$url, Laya.Handler.create(this, this.$onComplete));
                }
                if (M.downloadSpeed !== ResourceDownloadSpeedEnum.NONE) {
                    this.$limiter = new UrlDownloadLimiter(this.$url, suncom.Handler.create(this, this.$onDownloaded));
                }
            }
        };
        UrlSafetyLoader.prototype.$onComplete = function (data) {
            if (suncom.Global.debugMode & suncom.DebugMode.DEBUG) {
                suncom.Logger.trace(suncom.DebugMode.ANY, "load " + this.$url + " complete");
            }
            if (this.$limiter === null) {
                if (this.$destroyed === false) {
                    this.$destroyed = true;
                    this.$complete.runWith([data === null ? false : true, this.$url]);
                }
                this.facade.sendNotification(NotifyKey.ON_URL_SAFETY_LOADER_COMPLETE, this);
                UrlLocker.unlock(this.$url);
                this.$loading = false;
            }
            else {
                this.$limiter.updateDownloadSize(data);
            }
        };
        UrlSafetyLoader.prototype.$onDownloaded = function (data) {
            this.$limiter = null;
            this.$onComplete(data);
        };
        Object.defineProperty(UrlSafetyLoader.prototype, "url", {
            get: function () {
                return this.$url;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UrlSafetyLoader.prototype, "destroyed", {
            get: function () {
                return this.$destroyed;
            },
            enumerable: true,
            configurable: true
        });
        return UrlSafetyLoader;
    }(puremvc.Notifier));
    sunui.UrlSafetyLoader = UrlSafetyLoader;
    var ViewContact = (function (_super) {
        __extends(ViewContact, _super);
        function ViewContact(popup, caller) {
            var _this = _super.call(this) || this;
            _this.$closedHandler = null;
            _this.$removedHandler = null;
            _this.$popup = popup || null;
            _this.$caller = caller || null;
            if (M.viewLayer.getInfoByView(popup) === null) {
                throw Error("\u627E\u4E0D\u5230" + popup.name + "\u7684\u5F39\u51FA\u4FE1\u606F\uFF0C\u8BF7\u786E\u8BA4\u5176\u4E3A\u5F39\u51FA\u5BF9\u8C61");
            }
            _this.facade.registerObserver(NotifyKey.ON_POPUP_CLOSED, _this.$onPopupClosed, _this, false, suncom.EventPriorityEnum.FWL);
            _this.facade.registerObserver(NotifyKey.ON_POPUP_REMOVED, _this.$onPopupRemoved, _this, false, suncom.EventPriorityEnum.FWL);
            if (M.viewLayer.getInfoByView(caller) !== null) {
                _this.facade.registerObserver(NotifyKey.ON_POPUP_REMOVED, _this.$onCallerDestroy, _this, false, suncom.EventPriorityEnum.FWL);
            }
            else {
                _this.facade.registerObserver(NotifyKey.ON_CALLER_DESTROYED, _this.$onCallerDestroy, _this, false, suncom.EventPriorityEnum.FWL);
            }
            _this.facade.registerObserver(NotifyKey.LEAVE_SCENE, _this.$onLeaveScene, _this, false, suncom.EventPriorityEnum.OSL);
            return _this;
        }
        ViewContact.prototype.$onLeaveScene = function () {
            this.facade.removeObserver(NotifyKey.ON_POPUP_CLOSED, this.$onPopupClosed, this);
            this.facade.removeObserver(NotifyKey.ON_POPUP_REMOVED, this.$onPopupRemoved, this);
            this.facade.removeObserver(NotifyKey.LEAVE_SCENE, this.$onCallerDestroy, this);
            this.facade.removeObserver(NotifyKey.ON_POPUP_REMOVED, this.$onCallerDestroy, this);
            this.facade.removeObserver(NotifyKey.ON_CALLER_DESTROYED, this.$onCallerDestroy, this);
        };
        ViewContact.prototype.$onCallerDestroy = function (caller) {
            if (caller === this.$caller) {
                this.$onLeaveScene();
            }
        };
        ViewContact.prototype.$onPopupClosed = function (popup) {
            if (popup === this.$popup) {
                if (this.$closedHandler !== null) {
                    this.$closedHandler.run();
                    this.$closedHandler = null;
                }
            }
        };
        ViewContact.prototype.$onPopupRemoved = function (popup) {
            if (popup === this.$popup) {
                if (this.$removedHandler !== null) {
                    this.$removedHandler.run();
                    this.$removedHandler = null;
                }
                this.$onCallerDestroy(this.$caller);
            }
        };
        ViewContact.prototype.onPopupClosed = function (method, caller, args) {
            if (this.$caller !== caller) {
                throw Error("caller\u4E0E\u6267\u884C\u8005\u4E0D\u4E00\u81F4");
            }
            if (this.$closedHandler === null) {
                this.$closedHandler = suncom.Handler.create(caller, method, args);
            }
            else {
                throw Error("\u91CD\u590D\u6CE8\u518C\u5F39\u6846\u5173\u95ED\u4E8B\u4EF6");
            }
            return this;
        };
        ViewContact.prototype.onPopupRemoved = function (method, caller, args) {
            if (this.$caller !== caller) {
                throw Error("caller\u4E0E\u6267\u884C\u8005\u4E0D\u4E00\u81F4");
            }
            if (this.$removedHandler === null) {
                this.$removedHandler = suncom.Handler.create(caller, method, args);
            }
            else {
                throw Error("\u91CD\u590D\u6CE8\u518C\u5F39\u6846\u79FB\u9664\u4E8B\u4EF6");
            }
            return this;
        };
        return ViewContact;
    }(puremvc.Notifier));
    sunui.ViewContact = ViewContact;
    var ViewFacade = (function (_super) {
        __extends(ViewFacade, _super);
        function ViewFacade(view, duration) {
            var _this = _super.call(this) || this;
            _this.$info = null;
            _this.$view = view;
            if (_this.info !== null) {
                _this.$duration = _this.info.duration;
            }
            else if (duration === void 0) {
                _this.$duration = 200;
            }
            else {
                _this.$duration = duration;
            }
            return _this;
        }
        ViewFacade.prototype.popup = function (props) {
            if (props === void 0) { props = {}; }
            this.facade.sendNotification(NotifyKey.SHOW_POPUP, [this.$view, this.$duration, props]);
            return this;
        };
        ViewFacade.prototype.close = function (destroy) {
            this.facade.sendNotification(NotifyKey.CLOSE_POPUP, [this.$view, this.$duration, destroy]);
        };
        Object.defineProperty(ViewFacade.prototype, "cancelAllowed", {
            get: function () {
                return this.info.cancelAllowed;
            },
            set: function (yes) {
                this.info.cancelAllowed = yes;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewFacade.prototype, "info", {
            get: function () {
                if (this.$info === null) {
                    this.$info = M.viewLayer.getInfoByView(this.$view);
                }
                return this.$info;
            },
            enumerable: true,
            configurable: true
        });
        return ViewFacade;
    }(puremvc.Notifier));
    sunui.ViewFacade = ViewFacade;
    var ViewLayer = (function (_super) {
        __extends(ViewLayer, _super);
        function ViewLayer() {
            var _this = _super.call(this) || this;
            _this.$stack = [];
            _this.facade.registerObserver(NotifyKey.UNLOAD_SCENE, _this.$onUnloadScene, _this, false, suncom.EventPriorityEnum.EGL);
            return _this;
        }
        ViewLayer.prototype.$onUnloadScene = function () {
            var array = this.$stack.concat();
            for (var i = array.length - 1; i > -1; i--) {
                var info = array[i];
                if (info.props.mod !== suncore.ModuleEnum.SYSTEM) {
                    this.removeStackInfo(info);
                }
            }
        };
        ViewLayer.prototype.getInfoByView = function (view) {
            for (var i = 0; i < this.$stack.length; i++) {
                var info = this.$stack[i];
                if (info.view === view) {
                    return info;
                }
            }
            return null;
        };
        ViewLayer.prototype.addToStack = function (newInfo) {
            this.$stack.push(newInfo);
        };
        ViewLayer.prototype.removeStackInfo = function (info) {
            var index = this.$stack.indexOf(info);
            if (index < 0) {
                return;
            }
            this.$stack.splice(index, 1);
            this.onViewRemove(info.view);
            this.removeChild(info.view);
            this.removeChild(info.mask);
            if (info.keepNode === false) {
                this.destroyView(info.view);
                this.destroyMask(info.mask);
            }
            this.facade.sendNotification(NotifyKey.ON_POPUP_REMOVED, info.view);
        };
        ViewLayer.prototype.removeStackInfoByView = function (view) {
            for (var i = 0; i < this.$stack.length; i++) {
                var info = this.$stack[i];
                if (info.view === view) {
                    this.removeStackInfo(info);
                    break;
                }
            }
        };
        return ViewLayer;
    }(puremvc.Notifier));
    sunui.ViewLayer = ViewLayer;
    var ViewLayerLaya = (function (_super) {
        __extends(ViewLayerLaya, _super);
        function ViewLayerLaya() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ViewLayerLaya.prototype.addChild = function (view) {
            var node = view;
            if (M.sceneLayer.scene2d === null || view.zOrder >= sunui.UILevel.LOADING) {
                Laya.stage.addChild(node);
            }
            else {
                M.sceneLayer.scene2d.addChild(node);
            }
        };
        ViewLayerLaya.prototype.removeChild = function (view) {
            var node = view;
            var parent = node.parent || null;
            if (parent === null) {
                throw Error("\u65E0\u6CD5\u79FB\u9664\u663E\u793A\u5BF9\u8C61\uFF0C\u56E0\u4E3A\u7236\u8282\u70B9\u4E0D\u5B58\u5728 " + node.name);
            }
            parent.removeChild(node);
        };
        ViewLayerLaya.prototype.createMask = function (view, props) {
            var mask = new Laya.Image("common/mask_b.png");
            mask.left = mask.right = mask.top = mask.bottom = 0;
            mask.sizeGrid = "1,1,1,1";
            if (props.flags & PopupFlagEnum.TRANSPARENT) {
                mask.alpha = 0;
            }
            else {
                mask.alpha = 1;
            }
            if ((props.flags & PopupFlagEnum.MOUSE_THROUGH) === PopupFlagEnum.NONE) {
                mask.mouseThrough = false;
                mask.on(Laya.Event.CLICK, this, this.$onMaskClick, [view]);
            }
            return mask;
        };
        ViewLayerLaya.prototype.$onMaskClick = function (view) {
            var info = M.viewLayer.getInfoByView(view);
            if (info !== null && info.closed === false && info.cancelAllowed === true) {
                new ViewFacade(view).close();
            }
        };
        ViewLayerLaya.prototype.destroyMask = function (mask) {
            mask.off(Laya.Event.CLICK, this, this.$onMaskClick);
            mask.destroy();
        };
        ViewLayerLaya.prototype.destroyView = function (view) {
            var node = view;
            node.destroy();
        };
        return ViewLayerLaya;
    }(ViewLayer));
    sunui.ViewLayerLaya = ViewLayerLaya;
    var ViewLayerLaya2D = (function (_super) {
        __extends(ViewLayerLaya2D, _super);
        function ViewLayerLaya2D() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ViewLayerLaya2D.prototype.onViewCreate = function (view, args) {
            var node = view;
            if (node.$onCreate) {
                if (args instanceof Array === false) {
                    node.$onCreate.call(node, args);
                }
                else {
                    node.$onCreate.apply(node, args);
                }
            }
        };
        ViewLayerLaya2D.prototype.onViewOpen = function (view) {
            var node = view;
            if (node.$onOpen) {
                node.$onOpen.call(node);
            }
        };
        ViewLayerLaya2D.prototype.onViewClose = function (view) {
            var node = view;
            if (node.$onClose) {
                node.$onClose.call(node);
            }
        };
        ViewLayerLaya2D.prototype.onViewRemove = function (view) {
            var node = view;
            if (node.$onRemove) {
                node.$onRemove.call(node);
            }
        };
        return ViewLayerLaya2D;
    }(ViewLayerLaya));
    sunui.ViewLayerLaya2D = ViewLayerLaya2D;
    var ViewLayerLaya3D = (function (_super) {
        __extends(ViewLayerLaya3D, _super);
        function ViewLayerLaya3D() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ViewLayerLaya3D.prototype.onViewCreate = function (view, args) {
            var components = view.getComponents(Laya.Component) || [];
            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                if (component.$onCreate) {
                    if (args instanceof Array === false) {
                        component.$onCreate.call(component, args);
                    }
                    else {
                        component.$onCreate.apply(component, args);
                    }
                }
            }
        };
        ViewLayerLaya3D.prototype.onViewOpen = function (view) {
            var components = view.getComponents(Laya.Component) || [];
            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                if (component.$onOpen) {
                    component.$onOpen.call(component);
                }
            }
        };
        ViewLayerLaya3D.prototype.onViewClose = function (view) {
            var components = view.getComponents(Laya.Component) || [];
            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                if (component.$onClose) {
                    component.$onClose.call(component);
                }
            }
        };
        ViewLayerLaya3D.prototype.onViewRemove = function (view) {
            var components = view.getComponents(Laya.Component) || [];
            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                if (component.$onRemove) {
                    component.$onRemove.call(component);
                }
            }
        };
        return ViewLayerLaya3D;
    }(ViewLayerLaya));
    sunui.ViewLayerLaya3D = ViewLayerLaya3D;
    var GUILogicCommand = (function (_super) {
        __extends(GUILogicCommand, _super);
        function GUILogicCommand(command, condition, dependencies) {
            var _this = _super.call(this, command, condition) || this;
            _this.$dataList = [];
            _this.$running = false;
            _this.$dependencies = dependencies;
            suncom.Test.expect(dependencies.length).toBeGreaterThan(0);
            _this.facade.registerObserver(NotifyKey.ON_INTERCEPTOR_RELIEVED, _this.$onInterceptorRelieved, _this);
            return _this;
        }
        GUILogicCommand.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            _super.prototype.destroy.call(this);
            this.facade.removeObserver(NotifyKey.ON_INTERCEPTOR_RELIEVED, this.$onInterceptorRelieved, this);
        };
        GUILogicCommand.prototype.run = function () {
            suncom.Test.expect(this.$running).toBe(false);
            for (var i = 0; i < this.$dependencies.length; i++) {
                this.$dependencies[i].active = true;
            }
            this.$running = true;
        };
        GUILogicCommand.prototype.$onInterceptorRelieved = function (dependence) {
            if (this.$relieved === true) {
                return;
            }
            if (this.$dependencies.indexOf(dependence) < 0) {
                return;
            }
            this.facade.notifyCancel();
            var relieved = true;
            for (var i = 0; i < this.$dependencies.length; i++) {
                if (this.$dependencies[i].relieved === false) {
                    relieved = false;
                    break;
                }
            }
            if (relieved === true) {
                var handler = suncom.Handler.create(this, this.$onCommandRelieved);
                suncore.System.addMessage(suncore.ModuleEnum.TIMELINE, suncore.MessagePriorityEnum.PRIORITY_0, handler);
            }
        };
        GUILogicCommand.prototype.$onCommandRelieved = function () {
            if (this.$destroyed === false && this.$relieved === false) {
                this.$relieved = true;
                this.facade.sendNotification(NotifyKey.NEXT_LOGIC_COMMAND, this, true);
                for (var i = 0; i < this.$dataList.length; i++) {
                    this.facade.sendNotification(this.$command, this.$dataList[i]);
                }
            }
        };
        GUILogicCommand.prototype.$onCommandCallback = function () {
            if (this.$relieved === true) {
                return;
            }
            var args = [];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            if (this.$condition.runWith(args) === false) {
                return;
            }
            this.$relieved = true;
            for (var i = 0; i < this.$dependencies.length; i++) {
                if (this.$dependencies[i].relieved === false) {
                    this.$relieved = false;
                    break;
                }
            }
            if (this.$relieved === false) {
                this.$dataList.push(args);
                this.facade.notifyCancel();
            }
        };
        Object.defineProperty(GUILogicCommand.prototype, "running", {
            get: function () {
                return this.$running;
            },
            enumerable: true,
            configurable: true
        });
        return GUILogicCommand;
    }(GUILogicInterceptor));
    sunui.GUILogicCommand = GUILogicCommand;
    var GUILogicDependence = (function (_super) {
        __extends(GUILogicDependence, _super);
        function GUILogicDependence() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$active = false;
            return _this;
        }
        GUILogicDependence.prototype.$onCommandCallback = function () {
            if (this.$active === true && this.$relieved === false) {
                var args = [];
                for (var i = 0; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                if (this.$condition.runWith(args) === true) {
                    this.$relieved = true;
                    this.facade.sendNotification(NotifyKey.ON_INTERCEPTOR_RELIEVED, this, true);
                }
            }
        };
        Object.defineProperty(GUILogicDependence.prototype, "active", {
            get: function () {
                return this.$active;
            },
            set: function (value) {
                this.$active = value;
            },
            enumerable: true,
            configurable: true
        });
        return GUILogicDependence;
    }(GUILogicInterceptor));
    sunui.GUILogicDependence = GUILogicDependence;
    var M;
    (function (M) {
        M.downloadSpeed = ResourceDownloadSpeedEnum.NONE;
        M.cacheMap = {};
        M.templets = {};
        M.references = {};
        M.downloadLimiters = [];
    })(M = sunui.M || (sunui.M = {}));
    var NotifyKey;
    (function (NotifyKey) {
        NotifyKey.RETRY_CONFIRM = "sunui.NotifyKey.RETRY_CONFIRM";
        NotifyKey.REGISTER_SCENES = "sunui.NotifyKey.REGISTER_SCENES";
        NotifyKey.BEFORE_LOAD_SCENE = "sunui.NotifyKey.BEFORE_LOAD_SCENE";
        NotifyKey.LOAD_SCENE = "sunui.NotifyKey.LOAD_SCENE";
        NotifyKey.UNLOAD_SCENE = "sunui.NotifyKey.UNLOAD_SCENE";
        NotifyKey.ENTER_SCENE = "sunui.NotifyKey.ENTER_SCENE";
        NotifyKey.EXIT_SCENE = "sunui.NotifyKey.EXIT_SCENE";
        NotifyKey.LEAVE_SCENE = "sunui.NotifyKey.LEAVE_SCENE";
        NotifyKey.SHOW_POPUP = "sunui.NotifyKey.SHOW_POPUP";
        NotifyKey.CLOSE_POPUP = "sunui.NotifyKey.CLOSE_POPUP";
        NotifyKey.ON_POPUP_CLOSED = "sunui.NotifyKey.ON_POPUP_CLOSED";
        NotifyKey.ON_POPUP_REMOVED = "sunui.NotifyKey.ON_POPUP_REMOVED";
        NotifyKey.ON_CALLER_DESTROYED = "sunui.NotifyKey.ON_CALLER_DESTROYED";
        NotifyKey.ON_ASSET_SAFETY_LOADER_FAILED = "sunui.NotifyKey.ON_ASSET_SAFETY_LOADER_FAILED";
        NotifyKey.ON_URL_SAFETY_LOADER_CREATED = "sunui.NotifyKey.ON_URL_SAFETY_LOADER_CREATED";
        NotifyKey.ON_URL_SAFETY_LOADER_COMPLETE = "sunui.NotifyKey.ON_URL_SAFETY_LOADER_COMPLETE";
        NotifyKey.ASSET_SAFETY_LOADER_RETRY = "sunui.NotifyKey.ASSET_SAFETY_LOADER_RETRY";
        NotifyKey.REGISTER_TWEEN_OBJECT = "sunui.NotifyKey.REGISTER_TWEEN_OBJECT";
        NotifyKey.NEXT_LOGIC_COMMAND = "sunui.NotifyKey.NEXT_LOGIC_COMMAND";
        NotifyKey.ON_INTERCEPTOR_RELIEVED = "sunui.NotifyKey.ON_INTERCEPTOR_RELIEVED";
        NotifyKey.DESTROY_LOGIC_RUNNABLE = "sunui.NotifyKey.DESTROY_LOGIC_RUNNABLE";
        NotifyKey.DESTROY_ALL_LOGIC_RUNNABLE = "sunui.NotifyKey.DESTROY_ALL_LOGIC_RUNNABLE";
    })(NotifyKey = sunui.NotifyKey || (sunui.NotifyKey = {}));
    var Resource;
    (function (Resource) {
        Resource.res3dRoot = null;
        function setDownloadSpeed(speed) {
            M.downloadSpeed = speed;
        }
        Resource.setDownloadSpeed = setDownloadSpeed;
        function lock(url) {
            if (suncom.Global.debugMode & suncom.DebugMode.ENGINE) {
                if (Resource.isRes3dUrl(url) === true && Resource.getRes3dJsonUrl(url) === url) {
                    return;
                }
            }
            var ext = suncom.Common.getFileExtension(url);
            var str = url.substr(0, url.length - ext.length);
            var urls = [url];
            if (ext === "sk" || ext === "atlas") {
                urls.push(str + "png");
            }
            else if (Resource.isRes3dUrl(url) === true) {
                urls.push(str + "json");
            }
            for (var i = 0; i < urls.length; i++) {
                UrlLocker.lock(urls[i]);
            }
        }
        Resource.lock = lock;
        function unlock(url) {
            if (suncom.Global.debugMode & suncom.DebugMode.ENGINE) {
                if (Resource.isRes3dUrl(url) === true && Resource.getRes3dJsonUrl(url) === url) {
                    return;
                }
            }
            var ext = suncom.Common.getFileExtension(url);
            var str = url.substr(0, url.length - ext.length);
            var urls = [url];
            if (ext === "sk" || ext === "atlas") {
                urls.push(str + "png");
            }
            else if (Resource.isRes3dUrl(url) === true) {
                urls.push(str + "json");
            }
            for (var i = 0; i < urls.length; i++) {
                UrlLocker.unlock(urls[i]);
            }
        }
        Resource.unlock = unlock;
        function prepare(urls, method, caller) {
            var handler = null;
            if (method === null) {
                handler = suncom.Handler.create(null, function (id) { });
            }
            else {
                handler = suncom.Handler.create(caller, method);
            }
            var id = suncom.Common.createHashId();
            M.templets[id] = new Templet(id, urls, handler);
            return id;
        }
        Resource.prepare = prepare;
        function release(id) {
            var templet = M.templets[id] || null;
            if (templet !== null) {
                delete M.templets[id];
                templet.destroy();
            }
            return 0;
        }
        Resource.release = release;
        function createSync(url, data) {
            var res = M.cacheMap[url] || null;
            if (suncom.Common.getFileExtension(url) === "sk") {
                return res.buildArmature(data);
            }
            else if (Resource.isRes3dUrl(url) === true) {
                if (res === null) {
                    res = M.cacheMap[url] = Laya.loader.getRes(url);
                }
                return Laya.Sprite3D.instantiate(res);
            }
            else {
                return Laya.loader.getRes(url);
            }
        }
        Resource.createSync = createSync;
        function createRes3dSync(name) {
            return Resource.createSync(Resource.getRes3dUrlByName(name));
        }
        Resource.createRes3dSync = createRes3dSync;
        function createPrefab(url) {
            var prefab = new Laya.Prefab();
            prefab.json = Laya.loader.getRes(url);
            return prefab.create();
        }
        Resource.createPrefab = createPrefab;
        function clearResByUrl(url) {
            UrlLocker.clearResByUrl(url);
        }
        Resource.clearResByUrl = clearResByUrl;
        function getRes3dPackRoot(pack) {
            if (Resource.res3dRoot === null) {
                throw Error("\u8BF7\u5148\u6307\u5B9A3D\u8D44\u6E90\u76EE\u5F55\uFF1Asunui.Resource.res3dRoot=");
            }
            return Resource.res3dRoot + "/LayaScene_" + pack + "/Conventional/";
        }
        Resource.getRes3dPackRoot = getRes3dPackRoot;
        function isRes3dUrl(url) {
            return url.indexOf(Resource.res3dRoot) === 0;
        }
        Resource.isRes3dUrl = isRes3dUrl;
        function getRes3dJsonUrl(url) {
            return suncom.Common.replacePathExtension(url, "json");
        }
        Resource.getRes3dJsonUrl = getRes3dJsonUrl;
        function getRes3dUrlByName(name) {
            if (suncom.Common.getFileExtension(name) === null) {
                name += ".lh";
            }
            return Resource.getRes3dPackRoot(suncom.Common.getFileName(name)) + name;
        }
        Resource.getRes3dUrlByName = getRes3dUrlByName;
        function getAssetUrlsByRes3dJson(json) {
            var urls = [];
            var root = Resource.getRes3dPackRoot(json.pack);
            for (var i = 0; i < json.files.length; i++) {
                urls.push(root + json.files[i]);
            }
            for (var i = 0; i < json.resources.length; i++) {
                urls.push(root + json.resources[i]);
            }
            return urls;
        }
        Resource.getAssetUrlsByRes3dJson = getAssetUrlsByRes3dJson;
        function checkLoadList(urls) {
            Resource.removeUnnecessaryResources(urls, "sk", "png", "龙骨预加载无需指定PNG资源");
            Resource.removeUnnecessaryResources(urls, "atlas", "png", "图集预加载无需指定PNG资源");
            return Resource.removeDuplicateResources(urls);
        }
        Resource.checkLoadList = checkLoadList;
        function removeDuplicateResources(urls) {
            if (suncom.Global.debugMode & suncom.DebugMode.ENGINE) {
                var array = [];
                for (var i = 0; i < urls.length; i++) {
                    var url = urls[i];
                    if (array.indexOf(url) === -1) {
                        array.push(url);
                    }
                    else {
                        suncom.Logger.error(suncom.DebugMode.ANY, "\u91CD\u590D\u7684\u9884\u52A0\u8F7D\u8D44\u6E90\u6587\u4EF6 " + url);
                    }
                }
                return array;
            }
            return urls;
        }
        Resource.removeDuplicateResources = removeDuplicateResources;
        function removeUnnecessaryResources(urls, match, remove, msg) {
            if (suncom.Global.debugMode & suncom.DebugMode.ENGINE) {
                var array = [];
                for (var i = 0; i < urls.length; i++) {
                    var url = urls[i];
                    if (suncom.Common.getFileExtension(url) === match) {
                        array.push(url);
                    }
                }
                for (var i = 0; i < array.length; i++) {
                    var url = array[i];
                    var png = url.substring(0, url.length - match.length) + remove;
                    do {
                        var index = urls.indexOf(png);
                        if (index === -1) {
                            break;
                        }
                        urls.splice(index, 1);
                        suncom.Logger.error(suncom.DebugMode.ANY, msg + " " + url);
                    } while (true);
                }
            }
        }
        Resource.removeUnnecessaryResources = removeUnnecessaryResources;
    })(Resource = sunui.Resource || (sunui.Resource = {}));
    var SceneHeap;
    (function (SceneHeap) {
        var $infos = [];
        function findLatestHeapIndexByName(name) {
            for (var i = $infos.length - 1; i > -1; i--) {
                if ($infos[i].name === name) {
                    return i;
                }
            }
            return -1;
        }
        function addHistory(name, data) {
            var info = {
                name: name,
                data: data
            };
            $infos.push(info);
        }
        SceneHeap.addHistory = addHistory;
        function removeHistory(name) {
            var index = findLatestHeapIndexByName(name);
            if (index > -1) {
                $infos.splice(index, 1);
            }
            return index > -1;
        }
        SceneHeap.removeHistory = removeHistory;
        function hasHistory(name) {
            return findLatestHeapIndexByName(name) > -1;
        }
        SceneHeap.hasHistory = hasHistory;
        function getLastestSceneInfo() {
            if ($infos.length > 0) {
                return $infos[$infos.length - 1];
            }
            return null;
        }
        SceneHeap.getLastestSceneInfo = getLastestSceneInfo;
        function getLastestSceneInfoByName(name) {
            var index = findLatestHeapIndexByName(name);
            if (index > -1) {
                return $infos[index];
            }
            return null;
        }
        SceneHeap.getLastestSceneInfoByName = getLastestSceneInfoByName;
        function deleteHistories(deleteCount) {
            while ($infos.length > 1 && deleteCount > 0) {
                $infos.pop();
                deleteCount--;
            }
        }
        SceneHeap.deleteHistories = deleteHistories;
    })(SceneHeap = sunui.SceneHeap || (sunui.SceneHeap = {}));
    var SceneManager;
    (function (SceneManager) {
        var $infos = [];
        function regScene(info) {
            for (var i = 0; i < $infos.length; i++) {
                if ($infos[i].name === info.name) {
                    throw Error("重复注册场景");
                }
            }
            $infos.push(info);
        }
        SceneManager.regScene = regScene;
        function getConfigByName(name) {
            for (var i = 0; i < $infos.length; i++) {
                var info = $infos[i];
                if (info.name === name) {
                    return info;
                }
            }
            throw Error("场景配置不存在");
        }
        SceneManager.getConfigByName = getConfigByName;
    })(SceneManager = sunui.SceneManager || (sunui.SceneManager = {}));
    var UrlLocker;
    (function (UrlLocker) {
        function lock(url) {
            var reference = M.references[url] || 0;
            if (suncom.Global.debugMode & suncom.DebugMode.DEBUG) {
                suncom.Logger.trace(suncom.DebugMode.ANY, "reference:" + reference + ", lock:" + url);
            }
            M.references[url] = reference + 1;
        }
        UrlLocker.lock = lock;
        function unlock(url) {
            var reference = M.references[url] || 0;
            if (suncom.Global.debugMode & suncom.DebugMode.DEBUG) {
                suncom.Logger.trace(suncom.DebugMode.ANY, "reference:" + reference + ", unlock:" + url);
            }
            suncom.Test.expect(reference).interpret("\u5C1D\u8BD5\u89E3\u9501\u4E0D\u5B58\u5728\u7684\u8D44\u6E90 url\uFF1A" + url).toBeGreaterThan(0);
            if (reference > 1) {
                M.references[url] = reference - 1;
            }
            else {
                delete M.references[url];
                $clearRes(url);
            }
        }
        UrlLocker.unlock = unlock;
        function clearResByUrl(url) {
            if (suncom.Global.debugMode & suncom.DebugMode.DEBUG) {
                suncom.Logger.trace(suncom.DebugMode.ANY, "clearResUrl:" + url);
            }
            var item = M.cacheMap[url] || null;
            if (item !== null) {
                item.dispose && item.dispose();
                item.destroy && item.destroy();
                delete M.cacheMap[url];
            }
            var res = Laya.loader.getRes(url) || null;
            if (res === null) {
                Laya.loader.cancelLoadByUrl(url);
            }
            else {
                res.dispose && res.dispose();
                res.destroy && res.destroy();
                Laya.loader.clearRes(url);
            }
            var suffix = suncom.Common.getFileExtension(url);
            if (suffix === "ani") {
                Laya.Animation.clearCache(url);
            }
            else if (suffix === "sk") {
                Laya.Templet.TEMPLET_DICTIONARY[url] && Laya.Templet.TEMPLET_DICTIONARY[url].destroy();
                delete Laya.Templet.TEMPLET_DICTIONARY[url];
            }
        }
        UrlLocker.clearResByUrl = clearResByUrl;
        function $clearRes(url) {
            if (Resource.isRes3dUrl(url) === true && Resource.getRes3dJsonUrl(url) === url) {
                var urls = Resource.getAssetUrlsByRes3dJson(Laya.loader.getRes(url));
                for (var i = 0; i < urls.length; i++) {
                    UrlLocker.clearResByUrl(urls[i]);
                }
            }
            UrlLocker.clearResByUrl(url);
        }
    })(UrlLocker = sunui.UrlLocker || (sunui.UrlLocker = {}));
    function find(path, parent) {
        var array = path.split("/");
        while (parent != null && array.length > 0) {
            var name_1 = array.shift();
            parent = parent.getChildByName(name_1);
        }
        return parent;
    }
    sunui.find = find;
})(sunui || (sunui = {}));
var sunnet;
(function (sunnet) {
    var HttpResStatus;
    (function (HttpResStatus) {
        HttpResStatus[HttpResStatus["OK"] = 0] = "OK";
        HttpResStatus[HttpResStatus["IO_ERROR"] = -1] = "IO_ERROR";
        HttpResStatus[HttpResStatus["PARSE_ERROR"] = -2] = "PARSE_ERROR";
    })(HttpResStatus = sunnet.HttpResStatus || (sunnet.HttpResStatus = {}));
    var MsgQIdEnum;
    (function (MsgQIdEnum) {
        MsgQIdEnum[MsgQIdEnum["NSL_SEND_DATA"] = 1] = "NSL_SEND_DATA";
        MsgQIdEnum[MsgQIdEnum["NSL_RECV_DATA"] = 2] = "NSL_RECV_DATA";
    })(MsgQIdEnum = sunnet.MsgQIdEnum || (sunnet.MsgQIdEnum = {}));
    var NetConnectionStateEnum;
    (function (NetConnectionStateEnum) {
        NetConnectionStateEnum[NetConnectionStateEnum["CONNECTED"] = 0] = "CONNECTED";
        NetConnectionStateEnum[NetConnectionStateEnum["CONNECTING"] = 1] = "CONNECTING";
        NetConnectionStateEnum[NetConnectionStateEnum["DISCONNECTED"] = 2] = "DISCONNECTED";
    })(NetConnectionStateEnum = sunnet.NetConnectionStateEnum || (sunnet.NetConnectionStateEnum = {}));
    var ServerTimeUpdateFlagEnum;
    (function (ServerTimeUpdateFlagEnum) {
        ServerTimeUpdateFlagEnum[ServerTimeUpdateFlagEnum["RESET"] = 0] = "RESET";
        ServerTimeUpdateFlagEnum[ServerTimeUpdateFlagEnum["UPDATE"] = 1] = "UPDATE";
    })(ServerTimeUpdateFlagEnum = sunnet.ServerTimeUpdateFlagEnum || (sunnet.ServerTimeUpdateFlagEnum = {}));
    var VirtualNetworkLevelEnum;
    (function (VirtualNetworkLevelEnum) {
        VirtualNetworkLevelEnum[VirtualNetworkLevelEnum["NONE"] = 0] = "NONE";
        VirtualNetworkLevelEnum[VirtualNetworkLevelEnum["GOOD"] = 1] = "GOOD";
        VirtualNetworkLevelEnum[VirtualNetworkLevelEnum["BAD"] = 2] = "BAD";
        VirtualNetworkLevelEnum[VirtualNetworkLevelEnum["UNSTABLE"] = 3] = "UNSTABLE";
    })(VirtualNetworkLevelEnum = sunnet.VirtualNetworkLevelEnum || (sunnet.VirtualNetworkLevelEnum = {}));
    var NetConnection = (function (_super) {
        __extends(NetConnection, _super);
        function NetConnection(name) {
            var _this = _super.call(this, suncore.MsgQModEnum.NSL) || this;
            _this.$hashId = 0;
            _this.$socket = null;
            _this.$pipeline = null;
            _this.$state = NetConnectionStateEnum.DISCONNECTED;
            _this.$closedByError = false;
            _this.$ping = 0;
            _this.$latency = 0;
            _this.$srvTime = 0;
            _this.$clientTime = 0;
            _this.$dispatcher = new suncom.EventSystem();
            _this.$name = name;
            _this.$pipeline = new NetConnectionPipeline(_this);
            M.connetionMap[name] = _this;
            _this.facade.registerObserver(suntdd.NotifyKey.GET_WEBSOCKET_INFO, _this.$onGetWebSocketInfo, _this);
            _this.facade.registerObserver(suntdd.NotifyKey.TEST_WEBSOCKET_STATE, _this.$onTestWebSocketState, _this);
            _this.facade.registerObserver(suntdd.NotifyKey.TEST_WEBSOCKET_PROTOCAL, _this.$onTestWebSocketPacket, _this);
            return _this;
        }
        NetConnection.prototype.$onGetWebSocketInfo = function (out) {
            var connection = M.connetionMap[out.name] || null;
            if (connection === null) {
                return;
            }
            if (connection.state === NetConnectionStateEnum.CONNECTED) {
                out.state = suntdd.MSWSConnectionStateEnum.CONNECTED;
            }
            else if (connection.state === NetConnectionStateEnum.CONNECTING) {
                out.state = suntdd.MSWSConnectionStateEnum.CONNECTING;
            }
            else {
                out.state = suntdd.MSWSConnectionStateEnum.DISCONNECTED;
            }
        };
        NetConnection.prototype.$onTestWebSocketState = function (state) {
            this.testChangeState(state);
        };
        NetConnection.prototype.$onTestWebSocketPacket = function (name, data) {
            this.testProtocal(name, data);
        };
        NetConnection.prototype.connect = function (ip, port, byDog) {
            var byError = byDog === false ? false : this.$closedByError;
            this.close(byError);
            this.$ip = ip;
            this.$port = port;
            this.$state = NetConnectionStateEnum.CONNECTING;
            this.$socket = new Laya.Socket();
            this.$socket.endian = Laya.Byte.LITTLE_ENDIAN;
            this.$socket.on(Laya.Event.OPEN, this, this.$onOpen);
            this.$socket.on(Laya.Event.CLOSE, this, this.$onClose);
            this.$socket.on(Laya.Event.ERROR, this, this.$onError);
            this.$socket.on(Laya.Event.MESSAGE, this, this.$onMessage);
            this.$hashId = suncom.Common.createHashId();
            if (suncom.Global.debugMode & suncom.DebugMode.TDD) {
            }
            else {
                this.$socket.connectByUrl("ws://" + ip + ":" + port);
            }
            if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                suncom.Logger.log(suncom.DebugMode.ANY, "Netconnection=> \u8BF7\u6C42\u8FDE\u63A5 ws://" + this.$ip + ":" + this.$port);
            }
            this.addEventListener(EventKey.CLOSE_CONNECT_BY_VIRTUAL, this.$onError, this);
            this.facade.sendNotification(NotifyKey.SOCKET_STATE_CHANGE, [this.$name, this.$state, false]);
        };
        NetConnection.prototype.close = function (byError) {
            if (byError === void 0) { byError = false; }
            if (byError === false) {
                this.$closedByError = false;
            }
            else if (this.$state === NetConnectionStateEnum.CONNECTED) {
                this.$closedByError = true;
                this.dispatchEvent(EventKey.CLEAR_REQUEST_DATA);
            }
            if (this.$socket !== null) {
                if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                    suncom.Logger.log(suncom.DebugMode.ANY, "Netconnection=> \u5173\u95ED\u8FDE\u63A5 ws://" + this.$ip + ":" + this.$port);
                }
                this.$socket.off(Laya.Event.OPEN, this, this.$onOpen);
                this.$socket.off(Laya.Event.CLOSE, this, this.$onClose);
                this.$socket.off(Laya.Event.ERROR, this, this.$onError);
                this.$socket.off(Laya.Event.MESSAGE, this, this.$onMessage);
                this.$socket.close();
                this.$socket = null;
                this.$hashId = 0;
            }
            if (this.$state !== NetConnectionStateEnum.DISCONNECTED) {
                this.dispatchEvent(EventKey.SOCKET_DISCONNECTED, byError);
            }
            if (byError === false) {
                this.dispatchEvent(EventKey.KILL_WATCH_DOG);
            }
            if (this.$state !== NetConnectionStateEnum.DISCONNECTED) {
                this.$state = NetConnectionStateEnum.DISCONNECTED;
                this.facade.sendNotification(NotifyKey.SOCKET_STATE_CHANGE, [this.$name, this.$state, byError]);
            }
        };
        NetConnection.prototype.send = function (bytes) {
            if (this.$state === NetConnectionStateEnum.CONNECTED) {
                this.$socket.send(bytes);
            }
            else {
                suncom.Logger.error(suncom.DebugMode.ANY, "NetConnection=> 网络未连接，发送数据失败！！！");
            }
        };
        NetConnection.prototype.sendBytes = function (cmd, bytes, ip, port) {
            if (bytes === void 0) { bytes = null; }
            if (ip === void 0) { ip = null; }
            if (port === void 0) { port = 0; }
            this.$pipeline.send(cmd, bytes, ip, port);
        };
        NetConnection.prototype.flush = function () {
            this.$socket.flush();
        };
        NetConnection.prototype.testChangeState = function (state) {
            if (suncom.Global.debugMode & suncom.DebugMode.TDD) {
                var handler = suncom.Handler.create(this, this.$onTestChangeState, [this.$hashId, state]);
                suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_0, handler);
            }
        };
        NetConnection.prototype.$onTestChangeState = function (hashId, state) {
            if (this.$hashId === hashId) {
                if (state === suntdd.MSWSStateEnum.CONNECTED) {
                    this.$onOpen();
                }
                else if (state === suntdd.MSWSStateEnum.CLOSE) {
                    this.$onClose();
                }
                else if (state === suntdd.MSWSStateEnum.ERROR) {
                    this.$onError();
                }
            }
        };
        NetConnection.prototype.testPacket = function (cmd) {
            if (suncom.Global.debugMode & suncom.DebugMode.TDD) {
                var handler = suncom.Handler.create(this, this.$onTestPacket, [this.$hashId, cmd]);
                suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_0, handler);
            }
        };
        NetConnection.prototype.$onTestPacket = function (hashId, cmd) {
            if (this.$hashId === hashId) {
                var protocal = ProtobufManager.getInstance().getProtocalByCommand(cmd);
                this.facade.sendNotification(suntdd.NotifyKey.TEST_WEBSOCKET_SEND_DATA, protocal && protocal.Name);
            }
        };
        NetConnection.prototype.testProtocal = function (name, data) {
            if (suncom.Global.debugMode & suncom.DebugMode.TDD) {
                var handler = suncom.Handler.create(this, this.$onTestProtocal, [this.$hashId, name, data]);
                suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_0, handler);
            }
        };
        NetConnection.prototype.$onTestProtocal = function (hashId, name, data) {
            if (this.$hashId === hashId) {
                var protocal = ProtobufManager.getInstance().getProtocalByName(name);
                this.$pipeline.recv(protocal.Id, 0, null, data);
            }
        };
        NetConnection.prototype.logMsgIsSent = function (cmd, bytes, ip, port) {
            var protocal = ProtobufManager.getInstance().getProtocalByCommand(cmd);
            var data = protocal === null ? null : ProtobufManager.getInstance().decode("msg." + protocal.Name, bytes);
            if (cmd === Config.HEARTBEAT_REQUEST_COMMAND) {
                if (suncom.Global.debugMode & suncom.DebugMode.NETWORK_HEARTBEAT) {
                    suncom.Logger.log(suncom.DebugMode.ANY, "\u53D1\u9001\u5FC3\u8DF3 name:" + protocal.Name + ", data:" + JSON.stringify(data));
                }
            }
            else if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                suncom.Logger.log(suncom.DebugMode.ANY, "\u53D1\u9001\u6D88\u606F name:" + protocal.Name + ", data:" + JSON.stringify(data));
            }
        };
        NetConnection.prototype.dispatchCancel = function () {
            this.$dispatcher.dispatchCancel();
        };
        NetConnection.prototype.dispatchEvent = function (type, args, cancelable) {
            this.$dispatcher.dispatchEvent(type, args, cancelable);
        };
        NetConnection.prototype.addEventListener = function (type, method, caller, receiveOnce, priority) {
            this.$dispatcher.addEventListener(type, method, caller, receiveOnce, priority);
        };
        NetConnection.prototype.removeEventListener = function (type, method, caller) {
            this.$dispatcher.removeEventListener(type, method, caller);
        };
        NetConnection.prototype.$onOpen = function () {
            this.$state = NetConnectionStateEnum.CONNECTED;
            if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                suncom.Logger.log(suncom.DebugMode.ANY, "Netconnection=> 网络连接成功！");
            }
            this.dispatchEvent(EventKey.SOCKET_CONNECTED);
            this.dispatchEvent(EventKey.CACHE_SEND_BYTES, false);
            this.dispatchEvent(EventKey.FLUSH_CACHED_BYTES);
            this.$closedByError = false;
            this.facade.sendNotification(NotifyKey.SOCKET_STATE_CHANGE, [this.$name, this.$state, false]);
        };
        NetConnection.prototype.$onClose = function () {
            if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                suncom.Logger.log(suncom.DebugMode.ANY, "Netconnection=> 连接异常关闭！");
            }
            this.close(true);
        };
        NetConnection.prototype.$onError = function () {
            if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                suncom.Logger.log(suncom.DebugMode.ANY, "Netconnection=> 连接异常断开！");
            }
            this.close(true);
        };
        NetConnection.prototype.$onMessage = function (event) {
            this.$pipeline.recv(0, 0, null, void 0);
        };
        Object.defineProperty(NetConnection.prototype, "name", {
            get: function () {
                return this.$name || null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetConnection.prototype, "ip", {
            get: function () {
                return this.$ip || null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetConnection.prototype, "port", {
            get: function () {
                return this.$port || 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetConnection.prototype, "state", {
            get: function () {
                return this.$state;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetConnection.prototype, "input", {
            get: function () {
                if (this.$socket === null) {
                    return null;
                }
                else {
                    return this.$socket.input || null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetConnection.prototype, "output", {
            get: function () {
                if (this.$socket === null) {
                    return null;
                }
                else {
                    return this.$socket.output || null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetConnection.prototype, "ping", {
            get: function () {
                return this.$ping;
            },
            set: function (value) {
                this.$ping = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetConnection.prototype, "latency", {
            get: function () {
                return this.$latency;
            },
            set: function (value) {
                this.$latency = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetConnection.prototype, "srvTime", {
            get: function () {
                return this.$srvTime;
            },
            set: function (value) {
                this.$srvTime = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetConnection.prototype, "clientTime", {
            get: function () {
                return this.$clientTime;
            },
            set: function (value) {
                this.$clientTime = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NetConnection.prototype, "pipeline", {
            get: function () {
                return this.$pipeline;
            },
            enumerable: true,
            configurable: true
        });
        return NetConnection;
    }(puremvc.Notifier));
    sunnet.NetConnection = NetConnection;
    var NetConnectionInterceptor = (function (_super) {
        __extends(NetConnectionInterceptor, _super);
        function NetConnectionInterceptor(connection) {
            var _this = _super.call(this, suncore.MsgQModEnum.NSL) || this;
            _this.$connection = null;
            _this.$connection = connection;
            _this.$connection.addEventListener(EventKey.SOCKET_CONNECTED, _this.$onConnected, _this, false, suncom.EventPriorityEnum.FWL);
            _this.$connection.addEventListener(EventKey.SOCKET_DISCONNECTED, _this.$onDisconnected, _this, false, suncom.EventPriorityEnum.FWL);
            return _this;
        }
        NetConnectionInterceptor.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            _super.prototype.destroy.call(this);
            this.$connection.removeEventListener(EventKey.SOCKET_CONNECTED, this.$onConnected, this);
            this.$connection.removeEventListener(EventKey.SOCKET_DISCONNECTED, this.$onDisconnected, this);
            this.$connection = null;
        };
        NetConnectionInterceptor.prototype.$onConnected = function () {
        };
        NetConnectionInterceptor.prototype.$onDisconnected = function (byError) {
        };
        NetConnectionInterceptor.prototype.send = function (cmd, bytes, ip, port) {
            return [cmd, bytes, ip, port];
        };
        NetConnectionInterceptor.prototype.recv = function (cmd, srvId, bytes, data) {
            return [cmd, srvId, bytes, data];
        };
        return NetConnectionInterceptor;
    }(puremvc.Notifier));
    sunnet.NetConnectionInterceptor = NetConnectionInterceptor;
    var NetConnectionPing = (function (_super) {
        __extends(NetConnectionPing, _super);
        function NetConnectionPing() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$trackers = [];
            return _this;
        }
        NetConnectionPing.prototype.$onConnected = function () {
            this.$trackers.length = 0;
        };
        NetConnectionPing.prototype.send = function (cmd, bytes, ip, port) {
            if (this.$isReliableProtocal(cmd) === true) {
                var tracker = {
                    rsp: cmd,
                    rep: this.$getProtocalReplyCommand(cmd),
                    time: new Date().valueOf()
                };
                this.$trackers.push(tracker);
            }
            return [cmd, bytes, ip, port];
        };
        NetConnectionPing.prototype.recv = function (cmd, srvId, bytes, data) {
            if (this.$trackers.length > 0) {
                var tracker = this.$trackers[0];
                if (tracker.rep === cmd) {
                    this.$trackers.shift();
                    this.$connection.ping = new Date().valueOf() - tracker.time;
                    this.$dealRecvData(cmd, data);
                }
            }
            return [cmd, srvId, bytes, data];
        };
        NetConnectionPing.prototype.$updateServerTimestamp = function (time, flag) {
            var latency = Math.ceil(this.$connection.ping / 2);
            if (flag === ServerTimeUpdateFlagEnum.RESET || latency < this.$connection.latency) {
                this.$connection.srvTime = time;
                this.$connection.latency = latency;
                this.$connection.clientTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
            }
            if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                var srvTime = this.$connection.srvTime + suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM) - this.$connection.clientTime;
                suncom.Logger.log(suncom.DebugMode.ANY, "\u670D\u52A1\u5668\u65F6\u95F4\uFF1A" + suncom.Common.formatDate("yy-MM-dd hh:mm:ss MS", srvTime) + "\uFF0CPing\uFF1A" + this.$connection.ping + "\uFF0C\u65F6\u95F4\u63A8\u7B97\u5EF6\u5EF6\uFF1A" + this.$connection.latency);
            }
        };
        return NetConnectionPing;
    }(NetConnectionInterceptor));
    sunnet.NetConnectionPing = NetConnectionPing;
    var NetConnectionPipeline = (function (_super) {
        __extends(NetConnectionPipeline, _super);
        function NetConnectionPipeline(connection) {
            var _this = _super.call(this) || this;
            _this.$items = [];
            _this.$connection = connection;
            return _this;
        }
        NetConnectionPipeline.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            _super.prototype.destroy.call(this);
            while (this.$items.length > 0) {
                var item = this.$items.shift();
                item.interceptor.destroy();
            }
        };
        NetConnectionPipeline.prototype.add = function (arg0, arg1) {
            var item = new NetConnectionPipelineItem();
            item.type = typeof arg0 === "string" ? arg0 : null;
            item.interceptor = typeof arg0 !== "string" ? new arg0(this.$connection) : new arg1(this.$connection);
            this.$items.push(item);
        };
        NetConnectionPipeline.prototype.remove = function (cls) {
            for (var i = 0; i < this.$items.length; i++) {
                var interceptor = this.$items[i].interceptor;
                if (interceptor instanceof cls) {
                    this.$items.splice(i, 1);
                    interceptor.destroy();
                    break;
                }
            }
        };
        NetConnectionPipeline.prototype.recv = function (cmd, srvId, bytes, data) {
            var params = [cmd, srvId, bytes, data];
            for (var i = 0; i < this.$items.length; i++) {
                var item = this.$items[i];
                if (item.type === "send") {
                    continue;
                }
                var interceptor = item.interceptor;
                params = interceptor.recv.apply(interceptor, params);
                if (params === null) {
                    return;
                }
            }
            if (params[3] === void 0) {
                suncom.Logger.warn(suncom.DebugMode.ANY, "NetConnectionPipeline=> decode \u610F\u5916\u7684\u6307\u4EE4 cmd:" + params[0].toString() + ", buff:" + (params[1] ? "[Object]" : "null"));
            }
        };
        NetConnectionPipeline.prototype.send = function (cmd, bytes, ip, port) {
            for (var i = this.$items.length - 1; i > -1; i--) {
                var item = this.$items[i];
                if (item.type === "recv") {
                    continue;
                }
                var interceptor = item.interceptor;
                var res = interceptor.send.call(interceptor, cmd, bytes, ip, port);
                if (res === null) {
                    return null;
                }
            }
            return null;
        };
        return NetConnectionPipeline;
    }(puremvc.Notifier));
    sunnet.NetConnectionPipeline = NetConnectionPipeline;
    var NetConnectionPipelineItem = (function () {
        function NetConnectionPipelineItem() {
        }
        return NetConnectionPipelineItem;
    }());
    sunnet.NetConnectionPipelineItem = NetConnectionPipelineItem;
    var NetConnectionProtobufDecoder = (function (_super) {
        __extends(NetConnectionProtobufDecoder, _super);
        function NetConnectionProtobufDecoder() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NetConnectionProtobufDecoder.prototype.recv = function (cmd, srvId, bytes, data) {
            if (data !== void 0) {
                return [cmd, srvId, bytes, data];
            }
            var newData = this.$decode(cmd, bytes);
            if (newData === null) {
                return [cmd, srvId, bytes, data];
            }
            if (newData === bytes) {
                throw Error("请勿返回未处理的消息！！！");
            }
            var msg = {
                id: cmd,
                name: null,
                data: newData
            };
            if (Config.VIRTUAL_NETWORK_LEVEL === VirtualNetworkLevelEnum.NONE) {
                suncore.MsgQ.send(suncore.MsgQModEnum.NSL, MsgQIdEnum.NSL_RECV_DATA, msg);
            }
            else {
                this.$connection.dispatchEvent(EventKey.SOCKET_MESSAGE_DECODED, msg);
            }
            return [cmd, srvId, bytes, newData];
        };
        return NetConnectionProtobufDecoder;
    }(NetConnectionInterceptor));
    sunnet.NetConnectionProtobufDecoder = NetConnectionProtobufDecoder;
    var NetConnectionVirtualNetwork = (function (_super) {
        __extends(NetConnectionVirtualNetwork, _super);
        function NetConnectionVirtualNetwork() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$datas = [];
            _this.$currentSeconds = 0;
            _this.$isNetworkWaving = false;
            _this.$lastConnectedTimestamp = 0;
            _this.$currentConnectionReliableTime = 0;
            return _this;
        }
        NetConnectionVirtualNetwork.prototype.$onConnected = function () {
            this.$lastConnectedTimestamp = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
            this.$currentConnectionReliableTime = this.$getReliableTimeOfConnection() * 1000;
            this.facade.registerObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrame, this);
            this.$connection.addEventListener(EventKey.SOCKET_MESSAGE_DECODED, this.$onSocketMessageDecoded, this);
        };
        NetConnectionVirtualNetwork.prototype.$onDisconnected = function (byError) {
            this.$datas.length = 0;
            this.$currentSeconds = 0;
            this.facade.removeObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrame, this);
            this.$connection.removeEventListener(EventKey.SOCKET_MESSAGE_DECODED, this.$onSocketMessageDecoded, this);
        };
        NetConnectionVirtualNetwork.prototype.$onEnterFrame = function () {
            var time = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
            if (this.$lastConnectedTimestamp > 0 && time > this.$lastConnectedTimestamp + this.$currentConnectionReliableTime) {
                this.$connection.dispatchEvent(EventKey.CLOSE_CONNECT_BY_VIRTUAL);
                return;
            }
            var seconds = Math.floor(time / 1000);
            if (this.$currentSeconds !== seconds) {
                this.$currentSeconds = seconds;
                this.$isNetworkWaving = suncom.Mathf.random(0, 100) < this.$getProbabilyOfNetworkWave();
            }
            if (this.$datas.length > 0) {
                var data = this.$datas[0];
                if (time > data.time + data.delay) {
                    suncore.MsgQ.send(suncore.MsgQModEnum.NSL, MsgQIdEnum.NSL_RECV_DATA, this.$datas.shift().msg);
                }
            }
        };
        NetConnectionVirtualNetwork.prototype.$onSocketMessageDecoded = function (msg) {
            var data = {
                msg: msg,
                time: suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM),
                delay: this.$calculateMessageDelayTime()
            };
            this.$datas.push(data);
        };
        NetConnectionVirtualNetwork.prototype.$getReliableTimeOfConnection = function () {
            if (Config.VIRTUAL_NETWORK_LEVEL === VirtualNetworkLevelEnum.UNSTABLE) {
                return suncom.Mathf.random(180, 300);
            }
            else {
                return 1440 * 30;
            }
        };
        NetConnectionVirtualNetwork.prototype.$getProbabilyOfNetworkWave = function () {
            if (Config.VIRTUAL_NETWORK_LEVEL === VirtualNetworkLevelEnum.BAD) {
                return 10;
            }
            else if (Config.VIRTUAL_NETWORK_LEVEL === VirtualNetworkLevelEnum.UNSTABLE) {
                return 25;
            }
            else {
                return 0;
            }
        };
        NetConnectionVirtualNetwork.prototype.$calculateMessageDelayTime = function () {
            if (Config.VIRTUAL_NETWORK_LEVEL === VirtualNetworkLevelEnum.GOOD) {
                return suncom.Mathf.random(60, 150);
            }
            else if (Config.VIRTUAL_NETWORK_LEVEL === VirtualNetworkLevelEnum.BAD) {
                if (this.$isNetworkWaving === false) {
                    return suncom.Mathf.random(200, 800);
                }
                else {
                    return suncom.Mathf.random(1000, 2000);
                }
            }
            else if (Config.VIRTUAL_NETWORK_LEVEL === VirtualNetworkLevelEnum.UNSTABLE) {
                if (this.$isNetworkWaving === false) {
                    return suncom.Mathf.random(1000, 2500);
                }
                else {
                    return suncom.Mathf.random(3000, 8000);
                }
            }
            else {
                return 0;
            }
        };
        return NetConnectionVirtualNetwork;
    }(NetConnectionInterceptor));
    sunnet.NetConnectionVirtualNetwork = NetConnectionVirtualNetwork;
    var NetConnectionWatchDog = (function (_super) {
        __extends(NetConnectionWatchDog, _super);
        function NetConnectionWatchDog(connection) {
            var _this = _super.call(this, connection) || this;
            _this.$retryer = null;
            _this.$retryer = new sunui.Retryer(sunui.RetryMethodEnum.TERMINATE, suncom.Handler.create(_this, _this.$onConnectFailed, [connection.name]));
            _this.$connection.addEventListener(EventKey.KILL_WATCH_DOG, _this.$onKillWatchDog, _this);
            return _this;
        }
        NetConnectionWatchDog.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            this.$connection.removeEventListener(EventKey.KILL_WATCH_DOG, this.$onKillWatchDog, this);
            _super.prototype.destroy.call(this);
        };
        NetConnectionWatchDog.prototype.$onConnected = function () {
            this.$retryer.cancel();
            this.$retryer.reset();
        };
        NetConnectionWatchDog.prototype.$onDisconnected = function (byError) {
            if (byError === true) {
                if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                    suncom.Logger.log(suncom.DebugMode.ANY, "NetConnectionWatchDog=> \u7F51\u7EDC\u8FDE\u63A5\u5F02\u5E38\uFF0C" + Config.TCP_RETRY_DELAY + "\u6BEB\u79D2\u540E\u91CD\u8FDE\uFF01");
                }
                this.$ip = this.$connection.ip;
                this.$port = this.$connection.port;
                this.$retryer.run(Config.TCP_RETRY_DELAY, suncom.Handler.create(this, this.$doConnect), Config.TCP_MAX_RETRIES);
            }
        };
        NetConnectionWatchDog.prototype.$onKillWatchDog = function () {
            this.$retryer.cancel();
        };
        NetConnectionWatchDog.prototype.$doConnect = function () {
            if (this.$connection.state === NetConnectionStateEnum.DISCONNECTED) {
                this.$connection.connect(this.$ip, this.$port, true);
            }
            else if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                suncom.Logger.log(suncom.DebugMode.ANY, "\u68C0\u6D4B\u72D7\u4E0D\u80FD\u6B63\u5E38\u5DE5\u4F5C\uFF0C\u56E0\u4E3A state:" + NetConnectionStateEnum[this.$connection.state]);
            }
        };
        NetConnectionWatchDog.prototype.$onConnectFailed = function (name) {
            this.$retryer.reset();
            this.facade.sendNotification(NotifyKey.SOCKET_CONNECT_FAILED, name);
        };
        return NetConnectionWatchDog;
    }(NetConnectionInterceptor));
    sunnet.NetConnectionWatchDog = NetConnectionWatchDog;
    var ProtobufManager = (function () {
        function ProtobufManager() {
            this.$proto = null;
            this.$commands = null;
            this.$protocals = null;
        }
        ProtobufManager.getInstance = function () {
            return ProtobufManager.instance;
        };
        ProtobufManager.prototype.buildProto = function (url) {
            var root = new Laya.Browser.window.protobuf.Root();
            var protostr = Laya.loader.getRes(url);
            Laya.Browser.window.protobuf.parse(protostr, root, { keepCase: true });
            this.$proto = root;
        };
        ProtobufManager.prototype.buildProtocal = function (url) {
            var json = Laya.loader.getRes(url);
            this.$commands = Object.keys(json.data);
            this.$protocals = json.data;
        };
        ProtobufManager.prototype.buildProtocalJson = function (json) {
            this.$commands = Object.keys(json);
            this.$protocals = json;
        };
        ProtobufManager.prototype.getProtocalByCommand = function (cmd) {
            return this.$protocals[cmd] || null;
        };
        ProtobufManager.prototype.getProtocalByName = function (name) {
            for (var i = 0; i < this.$commands.length; i++) {
                var command = this.$commands[i];
                var protocal = this.getProtocalByCommand(command);
                if (protocal === null) {
                    continue;
                }
                if (protocal.Name === name) {
                    return protocal;
                }
            }
            return null;
        };
        ProtobufManager.prototype.getProtoClass = function (name) {
            return this.$proto.lookup(name);
        };
        ProtobufManager.prototype.getProtoEnum = function (name) {
            return this.getProtoClass(name).values;
        };
        ProtobufManager.prototype.encode = function (name, data) {
            if (suncom.Global.debugMode & suncom.DebugMode.DEBUG) {
                if (name === "msg.Common_Heartbeat") {
                    if (suncom.Global.debugMode & suncom.DebugMode.NETWORK_HEARTBEAT) {
                        suncom.Logger.log(suncom.DebugMode.ANY, "\u6253\u5305\u5FC3\u8DF3\u6210\u529F ==> " + JSON.stringify(data));
                    }
                }
                else if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                    suncom.Logger.log(suncom.DebugMode.ANY, "\u6253\u5305\u6570\u636E\u6210\u529F ==> " + JSON.stringify(data));
                }
            }
            return this.getProtoClass(name).encode(data).finish();
        };
        ProtobufManager.prototype.decode = function (name, bytes) {
            var data = this.getProtoClass(name).decode(bytes);
            if (suncom.Global.debugMode & suncom.DebugMode.DEBUG) {
                if (name === "msg.Common_Heartbeat") {
                    if (suncom.Global.debugMode & suncom.DebugMode.NETWORK_HEARTBEAT) {
                        suncom.Logger.log(suncom.DebugMode.ANY, "\u89E3\u6790\u5FC3\u8DF3\u6210\u529F ==> " + JSON.stringify(data));
                    }
                }
                else if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                    suncom.Logger.log(suncom.DebugMode.ANY, "\u89E3\u6790\u6570\u636E\u6210\u529F ==> " + JSON.stringify(data));
                }
            }
            return data;
        };
        ProtobufManager.instance = new ProtobufManager();
        return ProtobufManager;
    }());
    sunnet.ProtobufManager = ProtobufManager;
    var SequentialSlice = (function (_super) {
        __extends(SequentialSlice, _super);
        function SequentialSlice() {
            var _this = _super.call(this) || this;
            _this.$hashId = suncom.Common.createHashId();
            _this.$destroyed = false;
            _this.facade.registerObserver(suncore.NotifyKey.ENTER_FRAME, _this.$onEnterFrameCB, _this, false, suncom.EventPriorityEnum.FWL);
            return _this;
        }
        SequentialSlice.prototype.release = function () {
            if (this.$destroyed === true) {
                return;
            }
            this.$destroyed = true;
            this.facade.removeObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrameCB, this);
        };
        SequentialSlice.prototype.$onEnterFrameCB = function () {
            if (this.$destroyed === false) {
                this.$onEnterFrame();
            }
        };
        Object.defineProperty(SequentialSlice.prototype, "hashId", {
            get: function () {
                return this.$hashId;
            },
            enumerable: true,
            configurable: true
        });
        return SequentialSlice;
    }(puremvc.Notifier));
    sunnet.SequentialSlice = SequentialSlice;
    var SequentialTimeSlice = (function (_super) {
        __extends(SequentialTimeSlice, _super);
        function SequentialTimeSlice(lifeTime, conName) {
            if (conName === void 0) { conName = "default"; }
            var _this = _super.call(this) || this;
            _this.$connection = null;
            _this.$srvCreateTime = 0;
            _this.$lifeTime = 0;
            _this.$pastTime = 0;
            _this.$killedTime = 0;
            _this.$timeMultiple = 1;
            _this.$chaseMultiple = 1;
            _this.$lifeTime = lifeTime;
            _this.$connection = M.connetionMap[conName] || null;
            _this.$srvCreateTime = getCurrentServerTimestamp(conName);
            return _this;
        }
        SequentialTimeSlice.prototype.updateCreateTime = function (createTime, pastTime, chaseMultiple) {
            if (createTime === void 0) { createTime = 0; }
            if (pastTime === void 0) { pastTime = 0; }
            if (chaseMultiple === void 0) { chaseMultiple = 1; }
            this.$pastTime = pastTime;
            this.$chaseMultiple = chaseMultiple;
            this.$srvCreateTime = createTime > 0 ? createTime : this.$srvCreateTime;
            this.$onEnterFrame();
        };
        SequentialTimeSlice.prototype.$onEnterFrame = function () {
            if (this.$timeMultiple < 0) {
                suncom.Logger.error(suncom.DebugMode.ANY, "\u5F53\u524D\u65F6\u95F4\u6D41\u901D\u500D\u7387\u4E0D\u5141\u8BB8\u5C0F\u4E8E0");
                return;
            }
            var delta = suncore.System.getDelta() * this.$timeMultiple;
            if (delta < suncore.System.getDelta()) {
                this.$killedTime += suncore.System.getDelta() - delta;
            }
            if (this.$timeMultiple === 0) {
                return;
            }
            this.$pastTime += delta;
            var timeDiff = getCurrentServerTimestamp(this.$connection.name) - (this.$srvCreateTime + this.$pastTime + this.$killedTime);
            if (timeDiff > 0) {
                delta *= this.$chaseMultiple;
                if (delta > timeDiff) {
                    delta = timeDiff;
                }
                this.$pastTime += delta;
            }
            if (this.$pastTime > this.$lifeTime) {
                this.$pastTime = this.$lifeTime;
            }
            this.$frameLoop();
            if (this.$pastTime >= this.$lifeTime) {
                this.$onTimeup();
            }
        };
        Object.defineProperty(SequentialTimeSlice.prototype, "timeLen", {
            get: function () {
                return this.$lifeTime;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SequentialTimeSlice.prototype, "pastTime", {
            get: function () {
                return this.$pastTime;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SequentialTimeSlice.prototype, "timeMultiple", {
            get: function () {
                return this.$timeMultiple;
            },
            set: function (value) {
                this.$timeMultiple = value;
            },
            enumerable: true,
            configurable: true
        });
        return SequentialTimeSlice;
    }(SequentialSlice));
    sunnet.SequentialTimeSlice = SequentialTimeSlice;
    var NetConnectionCreator = (function (_super) {
        __extends(NetConnectionCreator, _super);
        function NetConnectionCreator(connection) {
            var _this = _super.call(this, connection) || this;
            _this.$datas = [];
            _this.$cacheSendBytes = false;
            _this.$connection.addEventListener(EventKey.CACHE_SEND_BYTES, _this.$onCacheSendBytes, _this);
            _this.$connection.addEventListener(EventKey.FLUSH_CACHED_BYTES, _this.$onFlushCachedBytes, _this);
            _this.$connection.addEventListener(EventKey.CLEAR_REQUEST_DATA, _this.$onClearRequestData, _this);
            return _this;
        }
        NetConnectionCreator.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            this.$connection.removeEventListener(EventKey.CACHE_SEND_BYTES, this.$onCacheSendBytes, this);
            this.$connection.removeEventListener(EventKey.FLUSH_CACHED_BYTES, this.$onFlushCachedBytes, this);
            this.$connection.removeEventListener(EventKey.CLEAR_REQUEST_DATA, this.$onClearRequestData, this);
            _super.prototype.destroy.call(this);
        };
        NetConnectionCreator.prototype.$onCacheSendBytes = function (yes) {
            this.$cacheSendBytes = yes;
        };
        NetConnectionCreator.prototype.$onFlushCachedBytes = function () {
            while (this.$datas.length > 0 && this.$connection.state === NetConnectionStateEnum.CONNECTED) {
                var data = this.$datas.shift();
                this.$connection.sendBytes(data.cmd, data.bytes, data.ip, data.port);
            }
        };
        NetConnectionCreator.prototype.$onClearRequestData = function () {
            this.$datas.length = 0;
        };
        NetConnectionCreator.prototype.$needCreate = function (ip, port) {
            if (ip === null || port === 0) {
                return false;
            }
            if (this.$connection.state === NetConnectionStateEnum.DISCONNECTED) {
                return true;
            }
            if (this.$connection.state === NetConnectionStateEnum.CONNECTED) {
                if (this.$connection.ip !== ip || this.$connection.port !== port) {
                    return true;
                }
            }
            return false;
        };
        NetConnectionCreator.prototype.send = function (cmd, bytes, ip, port) {
            if (this.$needCreate(ip, port) == true) {
                this.$connection.connect(ip, port, false);
                this.$cacheSendBytes = true;
            }
            if (this.$connection.state === NetConnectionStateEnum.CONNECTED) {
                return [cmd, bytes, ip, port];
            }
            else if (this.$cacheSendBytes === true) {
                var data = {
                    cmd: cmd,
                    bytes: bytes,
                    ip: ip,
                    port: port
                };
                this.$datas.push(data);
            }
            return null;
        };
        return NetConnectionCreator;
    }(NetConnectionInterceptor));
    sunnet.NetConnectionCreator = NetConnectionCreator;
    var NetConnectionDecoder = (function (_super) {
        __extends(NetConnectionDecoder, _super);
        function NetConnectionDecoder() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NetConnectionDecoder.prototype.recv = function (cmd, srvId, bytes, data) {
            var done = false;
            if (suncom.Global.debugMode & suncom.DebugMode.TDD) {
                if (data !== null) {
                    var protocal = ProtobufManager.getInstance().getProtocalByCommand(cmd);
                    bytes = ProtobufManager.getInstance().encode("msg." + protocal.Name, data);
                }
                done = true;
                data = void 0;
            }
            if (done === false) {
                var input = this.$connection.input || null;
                if (input === null) {
                    suncom.Logger.error(suncom.DebugMode.ANY, "Decoder \u7F51\u7EDC\u5DF1\u65AD\u5F00\uFF01\uFF01\uFF01");
                    return null;
                }
                cmd = input.getUint16();
                srvId = input.getUint16();
                var buffer = input.buffer.slice(input.pos);
                input.pos += buffer.byteLength;
                done = true;
                bytes = new Uint8Array(buffer);
            }
            return [cmd, srvId, bytes, data];
        };
        return NetConnectionDecoder;
    }(NetConnectionInterceptor));
    sunnet.NetConnectionDecoder = NetConnectionDecoder;
    var NetConnectionEncoder = (function (_super) {
        __extends(NetConnectionEncoder, _super);
        function NetConnectionEncoder() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NetConnectionEncoder.prototype.send = function (cmd, bytes, ip, port) {
            if (suncom.Global.debugMode & suncom.DebugMode.TDD) {
                this.$connection.testPacket(cmd);
                this.$connection.logMsgIsSent(cmd, bytes, ip, port);
                return null;
            }
            var output = this.$connection.output || null;
            if (output === null) {
                suncom.Logger.error(suncom.DebugMode.ANY, "Encoder \u7F51\u7EDC\u5DF1\u65AD\u5F00\uFF01\uFF01\uFF01");
                return null;
            }
            output.writeUint16(cmd);
            output.writeUint16(0);
            bytes !== null && output.writeArrayBuffer(bytes);
            this.$connection.flush();
            this.$connection.logMsgIsSent(cmd, bytes, ip, port);
            return null;
        };
        return NetConnectionEncoder;
    }(NetConnectionInterceptor));
    sunnet.NetConnectionEncoder = NetConnectionEncoder;
    var NetConnectionHeartbeat = (function (_super) {
        __extends(NetConnectionHeartbeat, _super);
        function NetConnectionHeartbeat() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NetConnectionHeartbeat.prototype.$onConnected = function () {
            this.$lastRecvTime = this.$lastSendTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
            this.facade.registerObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrame, this);
        };
        NetConnectionHeartbeat.prototype.$onDisconnected = function () {
            this.facade.removeObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrame, this);
        };
        NetConnectionHeartbeat.prototype.$onEnterFrame = function () {
            var timestamp = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
            if (this.$lastRecvTime < this.$lastSendTime) {
                if (timestamp - this.$lastSendTime > Config.HEARTBEAT_TIMEOUT_MILLISECONDS) {
                    this.$lastRecvTime = this.$lastSendTime;
                    this.$connection.close(true);
                }
            }
            else if (timestamp - this.$lastSendTime > Config.HEARTBEAT_INTERVAL_MILLISECONDS) {
                if (suncom.Global.debugMode & suncom.DebugMode.NETWORK_HEARTBEAT) {
                    suncom.Logger.log(suncom.DebugMode.ANY, "heartbeat=> current timestamp:" + suncom.Common.formatDate("hh:mm:ss MS", new Date().valueOf()));
                }
                var bytes = ProtobufManager.getInstance().encode("msg.Common_Heartbeat", { Cnt: 1 });
                this.$connection.sendBytes(Config.HEARTBEAT_REQUEST_COMMAND, bytes);
            }
        };
        NetConnectionHeartbeat.prototype.send = function (cmd, bytes, ip, port) {
            if (Config.HEARTBEAT_FIXED_FREQUENCY === false || cmd === Config.HEARTBEAT_REQUEST_COMMAND) {
                if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                    if (cmd === Config.HEARTBEAT_REQUEST_COMMAND) {
                        if (suncom.Global.debugMode & suncom.DebugMode.NETWORK_HEARTBEAT) {
                            suncom.Logger.log(suncom.DebugMode.ANY, "send heartbeat=> current timestamp:" + suncom.Common.formatDate("hh:mm:ss MS", new Date().valueOf()));
                        }
                    }
                    else if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                        suncom.Logger.log(suncom.DebugMode.ANY, "send bytes=> current timestamp:" + suncom.Common.formatDate("hh:mm:ss MS", new Date().valueOf()));
                    }
                }
                this.$lastSendTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
            }
            return [cmd, bytes, ip, port];
        };
        NetConnectionHeartbeat.prototype.recv = function (cmd, srvId, bytes, data) {
            if (Config.HEARTBEAT_FIXED_FREQUENCY === false || cmd === Config.HEARTBEAT_RESPONSE_COMMAND) {
                if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                    if (cmd === Config.HEARTBEAT_RESPONSE_COMMAND) {
                        if (suncom.Global.debugMode & suncom.DebugMode.NETWORK_HEARTBEAT) {
                            suncom.Logger.log(suncom.DebugMode.ANY, "recv heartbeat=> current timestamp:" + suncom.Common.formatDate("hh:mm:ss MS", new Date().valueOf()));
                        }
                    }
                    else if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                        suncom.Logger.log(suncom.DebugMode.ANY, "recv bytes=> current timestamp:" + suncom.Common.formatDate("hh:mm:ss MS", new Date().valueOf()));
                    }
                }
                this.$lastRecvTime = suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM);
            }
            return [cmd, srvId, bytes, data];
        };
        return NetConnectionHeartbeat;
    }(NetConnectionInterceptor));
    sunnet.NetConnectionHeartbeat = NetConnectionHeartbeat;
    var Config;
    (function (Config) {
        Config.TCP_RETRY_DELAY = 20 * 1000;
        Config.TCP_MAX_RETRIES = 10;
        Config.HEARTBEAT_REQUEST_COMMAND = -1;
        Config.HEARTBEAT_RESPONSE_COMMAND = -1;
        Config.HEARTBEAT_TIMEOUT_MILLISECONDS = 3000;
        Config.HEARTBEAT_INTERVAL_MILLISECONDS = 5000;
        Config.HEARTBEAT_FIXED_FREQUENCY = false;
        Config.VIRTUAL_NETWORK_LEVEL = VirtualNetworkLevelEnum.NONE;
    })(Config = sunnet.Config || (sunnet.Config = {}));
    var EventKey;
    (function (EventKey) {
        EventKey.SOCKET_CONNECTED = "sunnet.EventKey.SOCKET_CONNECTED";
        EventKey.SOCKET_DISCONNECTED = "sunnet.EventKey.SOCKET_DISCONNECTED";
        EventKey.SOCKET_CONNECTING = "sunnet.EventKey.SOCKET_CONNECTING";
        EventKey.SOCKET_CONNECT_FAILED = "sunnet.EventKey.SOCKET_CONNECT_FAILED";
        EventKey.KILL_WATCH_DOG = "sunnet.EventKey.KILL_WATCH_DOG";
        EventKey.CACHE_SEND_BYTES = "sunnet.EventKey.CACHE_SEND_BYTES";
        EventKey.FLUSH_CACHED_BYTES = "sunnet.EventKey.FLUSH_CACHED_BYTES";
        EventKey.CLEAR_REQUEST_DATA = "sunnet.EventKey.CLEAR_REQUEST_DATA";
        EventKey.SOCKET_MESSAGE_DECODED = "sunnet.EventKey.SOCKET_MESSAGE_DECODED";
        EventKey.CLOSE_CONNECT_BY_VIRTUAL = "sunnet.EventKey.CLOSE_CONNECT_BY_VIRTUAL";
    })(EventKey = sunnet.EventKey || (sunnet.EventKey = {}));
    var M;
    (function (M) {
        M.HEAD_LENGTH = 28;
        M.connetionMap = {};
    })(M = sunnet.M || (sunnet.M = {}));
    var MessageNotifier;
    (function (MessageNotifier) {
        var $notifier = new suncom.EventSystem();
        function notify(name, data, cancelable) {
            if (name === "msg.Common_Heartbeat") {
                if (suncom.Global.debugMode & suncom.DebugMode.NETWORK_HEARTBEAT) {
                    suncom.Logger.log(suncom.DebugMode.ANY, "响应心跳");
                }
            }
            else {
                if (suncom.Global.debugMode & suncom.DebugMode.NETWORK) {
                    suncom.Logger.log(suncom.DebugMode.ANY, "响应消息 name:" + name + ", data:" + JSON.stringify(data));
                }
            }
            $notifier.dispatchEvent(name, data, cancelable);
        }
        MessageNotifier.notify = notify;
        function register(name, method, caller, priority) {
            $notifier.addEventListener(name, method, caller, false, priority);
        }
        MessageNotifier.register = register;
        function unregister(name, method, caller) {
            $notifier.removeEventListener(name, method, caller);
        }
        MessageNotifier.unregister = unregister;
    })(MessageNotifier = sunnet.MessageNotifier || (sunnet.MessageNotifier = {}));
    var NotifyKey;
    (function (NotifyKey) {
        NotifyKey.SOCKET_STATE_CHANGE = "sunnet.NotifyKey.SOCKET_STATE_CHANGE";
        NotifyKey.SOCKET_CONNECT_FAILED = "sunnet.NotifyKey.SOCKET_CONNECT_FAILED";
        NotifyKey.SEQUENTIAL_SLICE_RELEASED = "sunnet.NotifyKey.SEQUENTIAL_SLICE_RELEASED";
        NotifyKey.GUI_SEQUENTIAL_NOTIFICATION = "sunnet.NotifyKey.GUI_SEQUENTIAL_NOTIFICATION";
    })(NotifyKey = sunnet.NotifyKey || (sunnet.NotifyKey = {}));
    function getCurrentServerTimestamp(connName) {
        if (connName === void 0) { connName = "default"; }
        var connection = M.connetionMap[connName] || null;
        if (connection === null) {
            return 0;
        }
        return connection.srvTime + suncore.System.getModuleTimestamp(suncore.ModuleEnum.SYSTEM) - connection.clientTime;
    }
    sunnet.getCurrentServerTimestamp = getCurrentServerTimestamp;
})(sunnet || (sunnet = {}));
var world2d;
(function (world2d) {
    var ColliderShapEnum2D;
    (function (ColliderShapEnum2D) {
        ColliderShapEnum2D[ColliderShapEnum2D["CIRCLE"] = 0] = "CIRCLE";
        ColliderShapEnum2D[ColliderShapEnum2D["POLYGON"] = 1] = "POLYGON";
    })(ColliderShapEnum2D = world2d.ColliderShapEnum2D || (world2d.ColliderShapEnum2D = {}));
    var CollisionLayerEnum;
    (function (CollisionLayerEnum) {
        CollisionLayerEnum[CollisionLayerEnum["DEFAULT"] = 1] = "DEFAULT";
        CollisionLayerEnum[CollisionLayerEnum["FISH"] = 2] = "FISH";
        CollisionLayerEnum[CollisionLayerEnum["BULLET"] = 4] = "BULLET";
        CollisionLayerEnum[CollisionLayerEnum["POLYGON"] = 8] = "POLYGON";
        CollisionLayerEnum[CollisionLayerEnum["CIRCLE"] = 16] = "CIRCLE";
        CollisionLayerEnum[CollisionLayerEnum["RECTANLE"] = 32] = "RECTANLE";
        CollisionLayerEnum[CollisionLayerEnum["FISH_2"] = 64] = "FISH_2";
        CollisionLayerEnum[CollisionLayerEnum["BULLET_2"] = 128] = "BULLET_2";
    })(CollisionLayerEnum = world2d.CollisionLayerEnum || (world2d.CollisionLayerEnum = {}));
    var CollisionShapEnum2D;
    (function (CollisionShapEnum2D) {
        CollisionShapEnum2D[CollisionShapEnum2D["CIRCLE"] = 0] = "CIRCLE";
        CollisionShapEnum2D[CollisionShapEnum2D["POLYGON"] = 1] = "POLYGON";
        CollisionShapEnum2D[CollisionShapEnum2D["RECTANGLE"] = 2] = "RECTANGLE";
    })(CollisionShapEnum2D = world2d.CollisionShapEnum2D || (world2d.CollisionShapEnum2D = {}));
    var CollisionType;
    (function (CollisionType) {
        CollisionType[CollisionType["COLLISION_ENTER"] = 0] = "COLLISION_ENTER";
        CollisionType[CollisionType["COLLISION_STAY"] = 1] = "COLLISION_STAY";
        CollisionType[CollisionType["COLLISION_EXIT"] = 2] = "COLLISION_EXIT";
    })(CollisionType = world2d.CollisionType || (world2d.CollisionType = {}));
    var CrossTypeEnum;
    (function (CrossTypeEnum) {
        CrossTypeEnum[CrossTypeEnum["NONE"] = 0] = "NONE";
        CrossTypeEnum[CrossTypeEnum["CROSS"] = 1] = "CROSS";
        CrossTypeEnum[CrossTypeEnum["CROSS_2"] = 2] = "CROSS_2";
        CrossTypeEnum[CrossTypeEnum["OVERLAP"] = 3] = "OVERLAP";
    })(CrossTypeEnum = world2d.CrossTypeEnum || (world2d.CrossTypeEnum = {}));
    var RaycastTypeEnum;
    (function (RaycastTypeEnum) {
        RaycastTypeEnum[RaycastTypeEnum["ANY"] = 0] = "ANY";
        RaycastTypeEnum[RaycastTypeEnum["CLOSEST"] = 1] = "CLOSEST";
        RaycastTypeEnum[RaycastTypeEnum["ALL"] = 2] = "ALL";
        RaycastTypeEnum[RaycastTypeEnum["ALL_CLOSEST"] = 3] = "ALL_CLOSEST";
    })(RaycastTypeEnum = world2d.RaycastTypeEnum || (world2d.RaycastTypeEnum = {}));
    var Bounds = (function () {
        function Bounds() {
        }
        Bounds.prototype.updateBounds = function (left, right, top, bottom) {
            this.left = left;
            this.right = right;
            this.top = top;
            this.bottom = bottom;
        };
        return Bounds;
    }());
    world2d.Bounds = Bounds;
    var Collider2D = (function () {
        function Collider2D(shap) {
            this.$shap = shap;
        }
        Object.defineProperty(Collider2D.prototype, "shap", {
            get: function () {
                return this.$shap;
            },
            enumerable: true,
            configurable: true
        });
        return Collider2D;
    }());
    world2d.Collider2D = Collider2D;
    var ColliderCircle2D = (function (_super) {
        __extends(ColliderCircle2D, _super);
        function ColliderCircle2D(radius) {
            var _this = _super.call(this, ColliderShapEnum2D.CIRCLE) || this;
            _this.radius = radius;
            return _this;
        }
        ColliderCircle2D.prototype.clone = function () {
            return new ColliderCircle2D(this.radius);
        };
        return ColliderCircle2D;
    }(Collider2D));
    world2d.ColliderCircle2D = ColliderCircle2D;
    var ColliderPolygon2D = (function (_super) {
        __extends(ColliderPolygon2D, _super);
        function ColliderPolygon2D(vertexs) {
            var _this = _super.call(this, ColliderShapEnum2D.POLYGON) || this;
            _this.vertexs = vertexs;
            return _this;
        }
        ColliderPolygon2D.prototype.clone = function () {
            var vertexs = [];
            for (var i = 0; i < this.vertexs.length; i++) {
                vertexs.push(this.vertexs[i].copy());
            }
            return new ColliderPolygon2D(vertexs);
        };
        return ColliderPolygon2D;
    }(Collider2D));
    world2d.ColliderPolygon2D = ColliderPolygon2D;
    var Collision2D = (function () {
        function Collision2D(shap) {
            this.bounds = new Bounds();
            this.$shap = shap;
        }
        Object.defineProperty(Collision2D.prototype, "shap", {
            get: function () {
                return this.$shap;
            },
            enumerable: true,
            configurable: true
        });
        return Collision2D;
    }());
    world2d.Collision2D = Collision2D;
    var CollisionCircle2D = (function (_super) {
        __extends(CollisionCircle2D, _super);
        function CollisionCircle2D(radius) {
            var _this = _super.call(this, CollisionShapEnum2D.CIRCLE) || this;
            _this.radius = radius;
            return _this;
        }
        CollisionCircle2D.prototype.updateBounds = function () {
            this.bounds.updateBounds(this.x - this.radius, this.x + this.radius, this.y - this.radius, this.y + this.radius);
        };
        return CollisionCircle2D;
    }(Collision2D));
    world2d.CollisionCircle2D = CollisionCircle2D;
    var CollisionContact2D = (function () {
        function CollisionContact2D(a, b) {
            this.useBox2d = false;
            this.$testAABB = true;
            this.$touching = false;
            if (a.collision.shap === CollisionShapEnum2D.CIRCLE) {
                this.$a = a;
                this.$b = b;
                if (b.collision.shap === CollisionShapEnum2D.CIRCLE) {
                    this.$testFunc = this.$c2c;
                    this.$testAABB = false;
                }
                else if (b.collision.shap === CollisionShapEnum2D.RECTANGLE) {
                    this.$testFunc = this.$c2r;
                }
                else {
                    this.$testFunc = this.$c2p;
                }
            }
            else if (a.collision.shap === CollisionShapEnum2D.RECTANGLE) {
                if (b.collision.shap === CollisionShapEnum2D.CIRCLE) {
                    this.$a = b;
                    this.$b = a;
                    this.$testFunc = this.$c2r;
                }
                else if (b.collision.shap === CollisionShapEnum2D.RECTANGLE) {
                    this.$a = a;
                    this.$b = b;
                    this.$testFunc = this.$r2r;
                    this.$testAABB = false;
                }
                else {
                    this.$a = a;
                    this.$b = b;
                    this.$testFunc = this.$r2p;
                }
            }
            else {
                this.$a = b;
                this.$b = a;
                if (b.collision.shap === CollisionShapEnum2D.CIRCLE) {
                    this.$testFunc = this.$c2p;
                }
                else if (b.collision.shap === CollisionShapEnum2D.RECTANGLE) {
                    this.$testFunc = this.$r2p;
                }
                else {
                    this.$testFunc = this.$p2p;
                }
            }
        }
        CollisionContact2D.prototype.test = function () {
            var a = this.$a;
            var b = this.$b;
            if (a.enabled === false || b.enabled === false) {
                return;
            }
            var x, y;
            if (a.rigidbody !== null) {
                x = a;
                y = b;
            }
            else {
                x = b;
                y = a;
            }
            if (x.rigidbody.target !== null && x.rigidbody.target !== y) {
                return;
            }
            var collide = this.$testAABB === false ? true : CollisionResolution2D.bounds2Bounds(a.collision.bounds, b.collision.bounds);
            if (collide === true) {
                collide = this.$testFunc.call(this, a.collision, b.collision);
            }
            if (collide === true) {
                if (this.$touching === false) {
                    this.$touching = true;
                    this.doCollide(CollisionType.COLLISION_ENTER);
                }
                else {
                    this.doCollide(CollisionType.COLLISION_STAY);
                }
            }
            else if (this.$touching === true) {
                this.$touching = false;
                this.doCollide(CollisionType.COLLISION_EXIT);
            }
        };
        CollisionContact2D.prototype.doCollide = function (type) {
            var a = this.$a;
            var b = this.$b;
            if (type === CollisionType.COLLISION_ENTER) {
                a.hitNum++;
                b.hitNum++;
                a.entity.onCollisionEnter(b.entity);
                b.entity.onCollisionEnter(a.entity);
            }
            else if (type === CollisionType.COLLISION_EXIT) {
                a.hitNum--;
                b.hitNum--;
                a.entity.onCollisionExit(b.entity);
                b.entity.onCollisionExit(a.entity);
            }
            else {
                a.entity.onCollisionStay(b.entity);
                b.entity.onCollisionStay(a.entity);
            }
        };
        CollisionContact2D.prototype.$c2c = function (a, b) {
            return CollisionResolution2D.circle2Circle(a, b);
        };
        CollisionContact2D.prototype.$c2r = function (c, r) {
            return CollisionResolution2D.circle2Polygin(c, r);
        };
        CollisionContact2D.prototype.$c2p = function (a, b) {
            return CollisionResolution2D.circle2Polygin(a, b);
        };
        CollisionContact2D.prototype.$r2r = function () {
            return CollisionResolution2D.bounds2Bounds(this.$a.collision.bounds, this.$b.collision.bounds);
        };
        CollisionContact2D.prototype.$r2p = function (r, p) {
            return CollisionResolution2D.polygon2Vertexs(p, r.vertexs);
        };
        CollisionContact2D.prototype.$p2p = function (p1, p2) {
            return CollisionResolution2D.polygon2Vertexs(p1, p2.vertexs) && CollisionResolution2D.polygon2Vertexs(p2, p1.vertexs);
        };
        Object.defineProperty(CollisionContact2D.prototype, "a", {
            get: function () {
                return this.$a;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CollisionContact2D.prototype, "b", {
            get: function () {
                return this.$b;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CollisionContact2D.prototype, "touching", {
            get: function () {
                return this.$touching;
            },
            enumerable: true,
            configurable: true
        });
        return CollisionContact2D;
    }());
    world2d.CollisionContact2D = CollisionContact2D;
    var CollisionPolygon2D = (function (_super) {
        __extends(CollisionPolygon2D, _super);
        function CollisionPolygon2D(collider) {
            var _this = _super.call(this, CollisionShapEnum2D.POLYGON) || this;
            _this.$tempVertexs = null;
            _this.vertexs = [];
            _this.segments = [];
            for (var i = 0; i < collider.vertexs.length; i++) {
                var vertex = collider.vertexs[i];
                _this.vertexs.push(vertex.copy());
                _this.segments.push(new Segment2D());
            }
            return _this;
        }
        CollisionPolygon2D.prototype.updateBounds = function () {
            Helper2D.calculateBoundsForVertexs(this.vertexs, this.bounds);
        };
        CollisionPolygon2D.prototype.updateVertexs = function (vertexs) {
            this.$tempVertexs = vertexs;
        };
        CollisionPolygon2D.prototype.prepareVertexs = function () {
            for (var i = 0; i < this.$tempVertexs.length; i++) {
                var a = this.vertexs[i];
                var b = this.$tempVertexs[i];
                a.assign(b.x, b.y);
            }
            this.$tempVertexs = null;
        };
        CollisionPolygon2D.prototype.prepareSegments = function () {
            for (var i = 0; i < this.vertexs.length; i++) {
                var segment = this.segments[i];
                segment.a = this.vertexs[i];
                segment.b = i > 0 ? this.vertexs[i - 1] : this.vertexs[this.vertexs.length - 1];
                var a = this.vertexs[i];
                var b = i > 0 ? this.vertexs[i - 1] : this.vertexs[this.vertexs.length - 1];
                this.segments[i].assign(a, b);
            }
        };
        Object.defineProperty(CollisionPolygon2D.prototype, "modified", {
            get: function () {
                return this.$tempVertexs !== null;
            },
            enumerable: true,
            configurable: true
        });
        return CollisionPolygon2D;
    }(Collision2D));
    world2d.CollisionPolygon2D = CollisionPolygon2D;
    var CollisionRectangle2D = (function (_super) {
        __extends(CollisionRectangle2D, _super);
        function CollisionRectangle2D() {
            var _this = _super.call(this, CollisionShapEnum2D.RECTANGLE) || this;
            _this.vertexs = [];
            _this.segments = [];
            for (var i = 0; i < 4; i++) {
                _this.vertexs.push(new Vector2D(0, 0));
                _this.segments.push(new Segment2D());
            }
            return _this;
        }
        CollisionRectangle2D.prototype.updateBounds = function () {
            Helper2D.calculateBoundsForVertexs(this.vertexs, this.bounds);
        };
        CollisionRectangle2D.prototype.prepareVertexs = function () {
            this.vertexs[0].assign(this.bounds.left, this.bounds.bottom);
            this.vertexs[1].assign(this.bounds.right, this.bounds.bottom);
            this.vertexs[2].assign(this.bounds.right, this.bounds.top);
            this.vertexs[3].assign(this.bounds.left, this.bounds.top);
        };
        CollisionRectangle2D.prototype.prepareSegments = function () {
            for (var i = 0; i < this.vertexs.length; i++) {
                var segment = this.segments[i];
                var a = this.vertexs[i];
                var b = i > 0 ? this.vertexs[i - 1] : this.vertexs[this.vertexs.length - 1];
                segment.assign(a, b);
            }
        };
        return CollisionRectangle2D;
    }(Collision2D));
    world2d.CollisionRectangle2D = CollisionRectangle2D;
    var Physics2D = (function () {
        function Physics2D() {
        }
        Physics2D.testPoint = function (p, layers) {
            if (layers === void 0) { layers = 0; }
            var transforms = World2D.inst.transforms.slice(0);
            for (var i = 0; i < transforms.length; i++) {
                var transform = transforms[i];
                var collision = transform.collision;
                if (layers > 0 && (transform.layer & layers) === 0) {
                    continue;
                }
                if (transform.collision.shap === CollisionShapEnum2D.CIRCLE) {
                    if (CollisionResolution2D.pointInCircle(p, collision)) {
                        return transform;
                    }
                }
                else if (transform.collision.shap === CollisionShapEnum2D.RECTANGLE) {
                    if (CollisionResolution2D.pointInRectangle(p, transform.collision.bounds)) {
                        return transform;
                    }
                }
                else {
                    if (CollisionResolution2D.pointInPolygon(p, transform.collision)) {
                        return transform;
                    }
                }
            }
            return null;
        };
        Physics2D.raycast = function (origin, direction, maxDistance, layers, type) {
            if (layers === void 0) { layers = 0; }
            if (type === void 0) { type = RaycastTypeEnum.CLOSEST; }
            var destination = direction.copy().normalize().mul(maxDistance).add(origin);
            world2d.World2D.DEBUG === true && DrawAPI2D.drawLine(origin, destination, "#FF0000");
            var segment = new Segment2D();
            segment.assign(origin, destination);
            var bounds = new Bounds();
            bounds.updateBounds(suncom.Mathf.min(origin.x, destination.x), suncom.Mathf.max(origin.x, destination.x), suncom.Mathf.min(origin.y, destination.y), suncom.Mathf.max(origin.y, destination.y));
            var transforms = World2D.inst.transforms;
            var out = null;
            var array = [];
            for (var i = 0; i < transforms.length; i++) {
                transforms[i].hitNum = 0;
            }
            for (var i = 0; i < transforms.length; i++) {
                var transform = transforms[i];
                if (layers > 0 && (transform.layer & layers) === 0) {
                    continue;
                }
                if (CollisionResolution2D.bounds2Bounds(bounds, transform.collision.bounds) === false) {
                    continue;
                }
                if (out === null) {
                    out = {
                        type: CrossTypeEnum.NONE,
                        transform: null,
                        p1: new Vector2D(0, 0),
                        p2: new Vector2D(0, 0),
                        normal: null,
                        distance: 0
                    };
                }
                if (transform.collision.shap === CollisionShapEnum2D.CIRCLE) {
                    CollisionResolution2D.line2Circle(segment, transform.collision, out);
                }
                else {
                    CollisionResolution2D.line2Polygon(segment, transform.collision, type, out);
                }
                if (out.type === CrossTypeEnum.NONE) {
                    continue;
                }
                out.transform = transform;
                transform.hitNum = 1;
                if (type === RaycastTypeEnum.CLOSEST) {
                    if (array.length === 1) {
                        array[0].transform.hitNum = 0;
                    }
                    array[0] = out;
                    bounds.updateBounds(suncom.Mathf.min(origin.x, out.p1.x), suncom.Mathf.max(origin.x, out.p1.x), suncom.Mathf.min(origin.y, out.p1.y), suncom.Mathf.max(origin.y, out.p1.y));
                }
                else {
                    array.push(out);
                }
                if (type === RaycastTypeEnum.ANY) {
                    break;
                }
                else if (type === RaycastTypeEnum.CLOSEST || type === RaycastTypeEnum.ALL_CLOSEST) {
                    out.distance = out.p1.distanceTo(origin);
                }
                out = null;
            }
            if (type === RaycastTypeEnum.ALL_CLOSEST && array.length > 1) {
                var newArray = [];
                while (array.length > 1) {
                    var res = array[0];
                    var index = 0;
                    for (var i = 1; i < array.length; i++) {
                        var item = array[i];
                        if (res === null || item.distance < res.distance) {
                            res = item;
                            index = i;
                        }
                    }
                    array.splice(index, 1);
                    newArray.push(res);
                }
                newArray.push(array[0]);
                array = newArray;
            }
            return array;
        };
        return Physics2D;
    }());
    world2d.Physics2D = Physics2D;
    var Rigidbody2D = (function () {
        function Rigidbody2D() {
            this.$torque = 180;
            this.target = null;
            this.moveSpeed = 0;
        }
        Rigidbody2D.prototype.update = function (delta) {
            if (this.moveSpeed === 0) {
                return;
            }
            if (this.target !== null && this.target.enabled === false) {
                this.target = null;
            }
            var p = suncom.Pool.getItemByClass("world2d.Vector2D", Vector2D, [0, 0]);
            if (this.target !== null) {
                p.assign(this.target.x - this.transform.x, this.target.y - this.transform.y);
                var rotate2 = p.angle();
                if (this.$torque === 180) {
                    this.transform.rotateTo(rotate2);
                }
                else {
                    var min = this.transform.rotation - suncom.Mathf.PI;
                    var max = this.transform.rotation + suncom.Mathf.PI;
                    if (rotate2 < min) {
                        rotate2 += suncom.Mathf.PI2;
                    }
                    else if (rotate2 > max) {
                        rotate2 -= suncom.Mathf.PI2;
                    }
                    var rotation = rotate2 - this.transform.rotation;
                    var torque = suncom.Mathf.clamp(this.$torque * delta * 10, 0, suncom.Mathf.PI);
                    if (rotation < -torque) {
                        this.transform.rotateBy(-torque);
                    }
                    else if (rotation > torque) {
                        this.transform.rotateBy(torque);
                    }
                    else {
                        this.transform.rotateBy(rotation);
                    }
                }
            }
            p.assign(this.moveSpeed, 0).rotate(this.transform.rotation);
            this.transform.moveBy(p.x * delta, p.y * delta);
            suncom.Pool.recover("world2d.Vector2D", p);
        };
        Object.defineProperty(Rigidbody2D.prototype, "torque", {
            get: function () {
                return suncom.Mathf.r2d(this.$torque);
            },
            set: function (value) {
                this.$torque = suncom.Mathf.d2r(value);
            },
            enumerable: true,
            configurable: true
        });
        return Rigidbody2D;
    }());
    world2d.Rigidbody2D = Rigidbody2D;
    var Segment2D = (function () {
        function Segment2D() {
            this.a = null;
            this.b = null;
            this.ab = new Vector2D(0, 0);
        }
        Segment2D.prototype.assign = function (a, b) {
            this.a = a;
            this.b = b;
            this.ab.assign(b.x - a.x, b.y - a.y);
            return this;
        };
        return Segment2D;
    }());
    world2d.Segment2D = Segment2D;
    var Transform2D = (function (_super) {
        __extends(Transform2D, _super);
        function Transform2D(entity, collider, rigidbody, collision) {
            var _this = _super.call(this) || this;
            _this.$x = 0;
            _this.$y = 0;
            _this.$scaleTo = 1;
            _this.$rotateTo = 0;
            _this.$rotation = 0;
            _this.$enabled = true;
            _this.$entity = null;
            _this.$rigidbody = null;
            _this.hitNum = 0;
            _this.$entity = entity;
            _this.$collider = collider;
            _this.$rigidbody = rigidbody;
            _this.$collision = collision;
            if (rigidbody !== null) {
                rigidbody.transform = _this;
            }
            return _this;
        }
        Transform2D.prototype.transform = function (delta) {
            if (this.$rigidbody !== null) {
                this.$rigidbody.update(delta);
            }
            var needUpdate = this.$needUpdate();
            var isModifiedByExtern = this.$isModifiedByExtern();
            if (needUpdate === false && isModifiedByExtern === false) {
                return;
            }
            this.$scale = this.$scaleTo;
            this.$radian = this.$rotateTo;
            this.$collision.x = this.$x;
            this.$collision.y = this.$y;
            if (isModifiedByExtern === false) {
                this.$applyScale();
                this.$applyRotate();
                this.$applyPosition();
            }
            else {
                var collision = this.$collision;
                collision.prepareVertexs();
            }
            this.$updateCollision();
        };
        Transform2D.prototype.moveBy = function (x, y) {
            this.$x += x;
            this.$y += y;
        };
        Transform2D.prototype.moveTo = function (x, y) {
            this.$x = x;
            this.$y = y;
        };
        Transform2D.prototype.scaleBy = function (value) {
            this.$scaleTo *= value;
        };
        Transform2D.prototype.scaleTo = function (value) {
            this.$scaleTo = value;
        };
        Transform2D.prototype.rotateBy = function (value) {
            this.$updateRadian(this.$rotateTo + value);
        };
        Transform2D.prototype.rotateTo = function (value) {
            this.$updateRadian(value);
        };
        Transform2D.prototype.$updateRadian = function (radian) {
            if (radian < 0) {
                radian %= suncom.Mathf.PI2;
                radian += suncom.Mathf.PI2;
            }
            else if (radian >= suncom.Mathf.PI2) {
                radian %= suncom.Mathf.PI2;
            }
            if (this.$rotateTo !== radian) {
                this.$rotateTo = radian;
                this.$rotation = suncom.Mathf.r2d(radian);
            }
        };
        Transform2D.prototype.$updateCollision = function () {
            this.$collision.updateBounds();
            if (this.$collision.shap === CollisionShapEnum2D.POLYGON) {
                var collision = this.$collision;
                collision.prepareSegments();
            }
            else if (this.$collision.shap === CollisionShapEnum2D.RECTANGLE) {
                var collision = this.$collision;
                collision.prepareVertexs();
                collision.prepareSegments();
            }
        };
        Transform2D.prototype.$applyPosition = function () {
            if (this.$collider.shap !== ColliderShapEnum2D.CIRCLE) {
                var collision = this.$collision;
                for (var i = 0; i < collision.vertexs.length; i++) {
                    var p = collision.vertexs[i];
                    p.x += this.$x;
                    p.y += this.$y;
                }
            }
        };
        Transform2D.prototype.$applyRotate = function () {
            if (this.$collider.shap === ColliderShapEnum2D.POLYGON) {
                var collision = this.$collision;
                for (var i = 0; i < collision.vertexs.length; i++) {
                    var p = collision.vertexs[i];
                    p.rotate(this.$radian);
                }
            }
        };
        Transform2D.prototype.$applyScale = function () {
            if (this.$collision.shap === CollisionShapEnum2D.CIRCLE) {
                var collider = this.$collider;
                var collision = this.$collision;
                collision.radius = collider.radius * this.$scale;
            }
            else {
                var collider = this.$collider;
                var collision = this.$collision;
                for (var i = 0; i < collider.vertexs.length; i++) {
                    var a = collider.vertexs[i];
                    var b = collision.vertexs[i];
                    b.assign(a.x, a.y).mul(this.$scale);
                }
            }
        };
        Transform2D.prototype.$needUpdate = function () {
            if (this.$scale !== this.$scaleTo) {
                return true;
            }
            else if (this.$radian !== this.$rotateTo) {
                return true;
            }
            else if (this.$x !== this.$collision.x || this.$y !== this.$collision.y) {
                return true;
            }
            else {
                return false;
            }
        };
        Transform2D.prototype.$isModifiedByExtern = function () {
            if (this.$collision.shap === CollisionShapEnum2D.POLYGON) {
                var collision = this.$collision;
                return collision.modified;
            }
            return false;
        };
        Transform2D.prototype.getRotation = function () {
            return this.$rotation;
        };
        Transform2D.prototype.setRotation = function (rotation) {
            this.rotateTo(suncom.Mathf.d2r(rotation));
        };
        Transform2D.prototype.disabled = function () {
            this.$enabled = false;
        };
        Object.defineProperty(Transform2D.prototype, "layer", {
            get: function () {
                return this.$layer;
            },
            set: function (value) {
                this.$layer = value;
                this.dispatchEvent(World2D.TRANSFORM_LAYER_CHANGED, this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform2D.prototype, "x", {
            get: function () {
                return this.$x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform2D.prototype, "y", {
            get: function () {
                return this.$y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform2D.prototype, "scale", {
            get: function () {
                return this.$scaleTo;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform2D.prototype, "rotation", {
            get: function () {
                return this.$rotateTo;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform2D.prototype, "enabled", {
            get: function () {
                return this.$enabled;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform2D.prototype, "entity", {
            get: function () {
                return this.$entity;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform2D.prototype, "collider", {
            get: function () {
                return this.$collider;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform2D.prototype, "collision", {
            get: function () {
                return this.$collision;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform2D.prototype, "rigidbody", {
            get: function () {
                return this.$rigidbody;
            },
            enumerable: true,
            configurable: true
        });
        return Transform2D;
    }(suncom.EventSystem));
    world2d.Transform2D = Transform2D;
    var Vector2D = (function () {
        function Vector2D(x, y) {
            this.x = x;
            this.y = y;
        }
        Vector2D.prototype.assign = function (x, y) {
            this.x = x;
            this.y = y;
            return this;
        };
        Vector2D.prototype.add = function (vec2) {
            this.x += vec2.x;
            this.y += vec2.y;
            return this;
        };
        Vector2D.prototype.sub = function (vec2) {
            this.x -= vec2.x;
            this.y -= vec2.y;
            return this;
        };
        Vector2D.prototype.mul = function (value) {
            this.x *= value;
            this.y *= value;
            return this;
        };
        Vector2D.prototype.dot = function (a) {
            return this.x * a.x + this.y * a.y;
        };
        Vector2D.prototype.cross = function (a) {
            return this.x * a.y - this.y * a.x;
        };
        Vector2D.prototype.negate = function () {
            this.x = -this.x;
            this.y = -this.y;
            return this;
        };
        Vector2D.prototype.rotate = function (radian) {
            var x = this.x;
            var y = this.y;
            var cos = Math.cos(radian);
            var sin = Math.sin(radian);
            this.x = x * cos - y * sin;
            this.y = x * sin + y * cos;
            return this;
        };
        Vector2D.prototype.angle = function () {
            var radian = Math.atan2(this.y, this.x);
            if (radian < 0) {
                return radian + 2 * Math.PI;
            }
            else {
                return radian;
            }
        };
        Vector2D.prototype.zero = function () {
            this.x = this.y = 0;
            return this;
        };
        Vector2D.prototype.normal = function () {
            return new Vector2D(this.y, -this.x);
        };
        Vector2D.prototype.normalize = function () {
            var length = this.length();
            if (length < 1e-9) {
                return this;
            }
            this.x /= length;
            this.y /= length;
            return this;
        };
        Vector2D.prototype.length = function () {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        };
        Vector2D.prototype.lengthSquared = function () {
            return this.x * this.x + this.y * this.y;
        };
        Vector2D.prototype.distanceTo = function (p) {
            var dx = this.x - p.x;
            var dy = this.y - p.y;
            return Math.sqrt(dx * dx + dy * dy);
        };
        Vector2D.prototype.distanceToSquared = function (p) {
            var dx = this.x - p.x;
            var dy = this.y - p.y;
            return dx * dx + dy * dy;
        };
        Vector2D.prototype.copy = function () {
            return new Vector2D(this.x, this.y);
        };
        Vector2D.prototype.toString = function () {
            return "{" + this.x + "," + this.y + "}";
        };
        Vector2D.add = function (a, b) {
            return new Vector2D(a.x + b.x, a.y + b.y);
        };
        Vector2D.sub = function (a, b) {
            return new Vector2D(b.x - a.x, b.y - a.y);
        };
        Vector2D.normal = function (a, b) {
            return new Vector2D(b.y - a.y, a.x - b.x);
        };
        Vector2D.angle = function (a, b) {
            var m = a.length();
            var n = b.length();
            if (m <= 1e-9 || n < 1e-9) {
                return 0;
            }
            return Math.acos(a.dot(b) / (m * n));
        };
        return Vector2D;
    }());
    world2d.Vector2D = Vector2D;
    var World2D = (function () {
        function World2D(graphics) {
            this.$detectors = [];
            this.$contacts = [];
            this.$transforms = [];
            World2D.inst = this;
            DrawAPI2D.graphics = graphics;
            this.addDetector(CollisionLayerEnum.DEFAULT, CollisionLayerEnum.DEFAULT);
        }
        World2D.prototype.update = function (delta) {
            for (var i = 0; i < this.$transforms.length; i++) {
                this.$transforms[i].transform(delta);
            }
            for (var i = 0; i < this.$contacts.length; i++) {
                this.$contacts[i].test();
            }
            World2D.DEBUG === true && DrawAPI2D.draw(this.$transforms);
        };
        World2D.prototype.addTransform = function (transform, layer) {
            if (layer === void 0) { layer = CollisionLayerEnum.DEFAULT; }
            transform.layer = layer;
            transform.addEventListener(World2D.TRANSFORM_LAYER_CHANGED, this.$onTransformLayerChanged, this);
            for (var i = 0; i < this.$transforms.length; i++) {
                var transform2 = this.$transforms[i];
                if (this.$shouldCollide(transform.layer, transform2.layer) === true) {
                    var contact = new CollisionContact2D(transform, transform2);
                    this.$contacts.push(contact);
                }
            }
            this.$transforms.push(transform);
        };
        World2D.prototype.removeTransform = function (transform) {
            var index = this.$transforms.indexOf(transform);
            if (index < 0) {
                return;
            }
            transform.disabled();
            this.$transforms.splice(index, 1);
            transform.removeEventListener(World2D.TRANSFORM_LAYER_CHANGED, this.$onTransformLayerChanged, this);
            for (var i = this.$contacts.length - 1; i > -1; i--) {
                var contact = this.$contacts[i];
                if (contact.a === transform || contact.b === transform) {
                    if (contact.touching === true) {
                        contact.doCollide(CollisionType.COLLISION_EXIT);
                    }
                    this.$contacts.splice(i, 1);
                }
            }
        };
        World2D.prototype.$onTransformLayerChanged = function (transform) {
            this.removeTransform(transform);
            this.addTransform(transform, transform.layer);
        };
        World2D.prototype.addDetector = function (a, b) {
            if (a > b) {
                var t = a;
                a = b;
                b = t;
            }
            if (this.$detectors[a] === void 0) {
                this.$detectors[a] = [];
            }
            this.$detectors[a][b] = true;
        };
        World2D.prototype.$shouldCollide = function (a, b) {
            if (a > b) {
                var t = a;
                a = b;
                b = t;
            }
            if (this.$detectors[a] !== void 0 && this.$detectors[a][b] === true) {
                return true;
            }
            return false;
        };
        Object.defineProperty(World2D.prototype, "transforms", {
            get: function () {
                return this.$transforms;
            },
            enumerable: true,
            configurable: true
        });
        World2D.DEBUG = false;
        World2D.TRANSFORM_LAYER_CHANGED = "world2d.TRANSFORM_LAYER_CHANGED";
        return World2D;
    }());
    world2d.World2D = World2D;
    var CollisionResolution2D;
    (function (CollisionResolution2D) {
        function pointInCircle(p, c) {
            return p.distanceToSquared(c) <= c.radius * c.radius;
        }
        CollisionResolution2D.pointInCircle = pointInCircle;
        function pointInRectangle(p, r) {
            return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom;
        }
        CollisionResolution2D.pointInRectangle = pointInRectangle;
        function pointInPolygon(p, p2d) {
            var vertexs = p2d.vertexs;
            var radian = 0;
            for (var i = 0; i < vertexs.length; i++) {
                var a = vertexs[i];
                var b = i === 0 ? vertexs[vertexs.length - 1] : vertexs[i - 1];
                if (a.x === b.x && a.y === b.y) {
                    continue;
                }
                radian += Vector2D.angle(Vector2D.sub(a, p), Vector2D.sub(b, p));
            }
            return suncom.Mathf.abs(suncom.Mathf.r2d(radian) - 360) < 0.01;
        }
        CollisionResolution2D.pointInPolygon = pointInPolygon;
        function bounds2Bounds(a, b) {
            if (a.left > b.right || b.left > a.right || a.top > b.bottom || b.top > a.bottom) {
                return false;
            }
            return true;
        }
        CollisionResolution2D.bounds2Bounds = bounds2Bounds;
        function circle2Circle(a, b) {
            var dx = b.x - a.x;
            var dy = b.y - a.y;
            var dr = a.radius + b.radius;
            if (dx * dx + dy * dy > dr * dr) {
                return false;
            }
            return true;
        }
        CollisionResolution2D.circle2Circle = circle2Circle;
        function lineCrossCircle(line, circle, out) {
            var a2p = line.a.distanceToSquared(circle);
            var b2p = line.b.distanceToSquared(circle);
            var rxr = circle.radius * circle.radius;
            if (a2p <= rxr && b2p <= rxr) {
                out.p1.assign(line.a.x, line.a.y);
                out.type = CrossTypeEnum.CROSS;
            }
            else {
            }
            return false;
        }
        function circle2Polygin(c, d) {
            var vertexs = d.vertexs;
            var radiusSquared = c.radius * c.radius;
            var nearestVertex = null;
            var nearestDistanceSquared = suncom.Mathf.MAX_SAFE_INTEGER;
            var distanceLessOrEqualThanRadius = false;
            for (var i = 0; i < vertexs.length; i++) {
                var vertex = vertexs[i];
                var distance = vertex.distanceToSquared(c);
                if (distance <= radiusSquared) {
                    distanceLessOrEqualThanRadius = true;
                    break;
                }
                if (distance < nearestDistanceSquared) {
                    nearestVertex = vertex;
                    nearestDistanceSquared = distance;
                }
            }
            if (distanceLessOrEqualThanRadius === true) {
                return true;
            }
            var a = new Vector2D(c.x, c.y);
            var b = nearestVertex.copy();
            var ab = new Vector2D(b.x - a.x, b.y - a.y);
            var normal = ab.normal();
            var p = ab.copy().normalize().mul(c.radius).add(a);
            if (vertex2VertexInDirection([p], vertexs, normal) === false) {
                return false;
            }
            var array = [a, b];
            var segments = d.segments;
            for (var i = 0; i < segments.length; i++) {
                var segment = segments[i];
                if (segment.ab.length() === 0) {
                    continue;
                }
                normal.assign(segment.ab.y, -segment.ab.x).normalize().mul(c.radius);
                a.assign(c.x, c.y).add(normal);
                b.assign(c.x, c.y).sub(normal);
                if (vertex2VertexInDirection(array, vertexs, segment.ab) === false) {
                    return false;
                }
            }
            return true;
        }
        CollisionResolution2D.circle2Polygin = circle2Polygin;
        function vertex2VertexInDirection(array, array2, direction) {
            var k = direction.y / direction.x;
            var m = direction.x / direction.y;
            var min1 = suncom.Mathf.MAX_SAFE_INTEGER;
            var max1 = suncom.Mathf.MIN_SAFE_INTEGER;
            var min2 = suncom.Mathf.MAX_SAFE_INTEGER;
            var max2 = suncom.Mathf.MIN_SAFE_INTEGER;
            var x = 0, y = 0;
            var collide = false;
            if (k < -1 || k > 1) {
                while (x < array.length || y < array2.length) {
                    if (x < array.length) {
                        var p = array[x];
                        var b = p.x - m * p.y;
                        if (min1 > b) {
                            min1 = b;
                        }
                        if (max1 < b) {
                            max1 = b;
                        }
                        x++;
                    }
                    if (y < array2.length) {
                        var p = array2[y];
                        var b = p.x - m * p.y;
                        if (min2 > b) {
                            min2 = b;
                        }
                        if (max2 < b) {
                            max2 = b;
                        }
                        y++;
                    }
                    if ((max1 < min2 || min1 > max2) === false) {
                        collide = true;
                        break;
                    }
                }
            }
            else {
                while (x < array.length || y < array2.length) {
                    if (x < array.length) {
                        var p = array[x];
                        var b = p.y - k * p.x;
                        if (min1 > b) {
                            min1 = b;
                        }
                        if (max1 < b) {
                            max1 = b;
                        }
                        x++;
                    }
                    if (y < array2.length) {
                        var p = array2[y];
                        var b = p.y - k * p.x;
                        if (min2 > b) {
                            min2 = b;
                        }
                        if (max2 < b) {
                            max2 = b;
                        }
                        y++;
                    }
                    if ((max1 < min2 || min1 > max2) === false) {
                        collide = true;
                        break;
                    }
                }
            }
            return collide;
        }
        function polygon2Vertexs(polygon, vertexs) {
            var array = polygon.vertexs;
            var segments = polygon.segments;
            for (var i = 0; i < segments.length; i++) {
                var segment = segments[i];
                if (segment.ab.length() === 0) {
                    continue;
                }
                if (vertex2VertexInDirection(array, vertexs, segments[i].ab) === false) {
                    return false;
                }
            }
            return true;
        }
        CollisionResolution2D.polygon2Vertexs = polygon2Vertexs;
        function line2Circle(line, circle, out) {
            var rxr = circle.radius * circle.radius;
            var a2cs = line.a.distanceToSquared(circle);
            var b2cs = line.b.distanceToSquared(circle);
            if (a2cs <= rxr && b2cs <= rxr) {
                out.p1.assign(line.a.x, line.a.y);
                out.type = CrossTypeEnum.CROSS;
                return true;
            }
            var normal = line.ab.normal().normalize().mul(circle.radius);
            var a = new Vector2D(circle.x, circle.y).add(normal);
            var b = new Vector2D(circle.x, circle.y).sub(normal);
            var info = {
                p: new Vector2D(0, 0),
                type: CrossTypeEnum.NONE
            };
            isLineBetweenPoints(line.a, line.ab, a, b, info);
            if (info.type === CrossTypeEnum.NONE) {
                return false;
            }
            info.type = CrossTypeEnum.NONE;
            var lxl = info.p.copy().sub(circle).lengthSquared();
            var distance = Math.sqrt(rxr - lxl);
            normal.assign(line.ab.x, line.ab.y).normalize().mul(distance);
            a = info.p.copy().add(normal);
            b = info.p.copy().sub(normal);
            var isAinLine = isInRange(a.x, line.a.x, line.b.x) && isInRange(a.y, line.a.y, line.b.y);
            var isBinLine = isInRange(b.x, line.a.x, line.b.x) && isInRange(b.y, line.a.y, line.b.y);
            if (isAinLine && isBinLine) {
                makeP1andP2(line.a, a, b, out);
                out.type = CrossTypeEnum.CROSS_2;
            }
            else if (isAinLine) {
                out.p1 = a;
                out.type = CrossTypeEnum.CROSS;
            }
            else if (isBinLine) {
                out.p1 = b;
                out.type = CrossTypeEnum.CROSS;
            }
            else {
                return false;
            }
        }
        CollisionResolution2D.line2Circle = line2Circle;
        function line2Polygon(line, polygon, type, out) {
            var segments = polygon.segments;
            var info = {
                p: new world2d.Vector2D(0, 0),
                type: CrossTypeEnum.NONE
            };
            for (var i = 0; i < segments.length; i++) {
                var seg = segments[i];
                if (type === RaycastTypeEnum.ANY || type === RaycastTypeEnum.ALL) {
                    if (line2Line(line.ab, line.a, line.b, seg.ab, seg.a, seg.b, null)) {
                        out.type = CrossTypeEnum.CROSS;
                        break;
                    }
                }
                else {
                    line2Line(line.ab, line.a, line.b, seg.ab, seg.a, seg.b, info);
                    if (info.type === CrossTypeEnum.CROSS) {
                        if (out.type === CrossTypeEnum.NONE) {
                            out.type = CrossTypeEnum.CROSS;
                            out.p1.assign(info.p.x, info.p.y);
                        }
                        else {
                            out.type = CrossTypeEnum.CROSS_2;
                            out.p2.assign(info.p.x, info.p.y);
                        }
                        if (out.type === CrossTypeEnum.CROSS_2) {
                            break;
                        }
                        info.type = CrossTypeEnum.NONE;
                    }
                }
            }
            if (out.type === CrossTypeEnum.NONE) {
                if (pointInPolygon(line.a, polygon) && pointInPolygon(line.b, polygon)) {
                    out.p1.assign(line.a.x, line.a.y);
                    out.type = CrossTypeEnum.CROSS;
                }
            }
            else if (out.type === CrossTypeEnum.CROSS_2) {
                makeP1andP2(line.a, out.p1, out.p2, out);
            }
            return out.type !== CrossTypeEnum.NONE;
        }
        CollisionResolution2D.line2Polygon = line2Polygon;
        function makeP1andP2(p, p1, p2, out) {
            if (p2.distanceToSquared(p) < p1.distanceToSquared(p)) {
                out.p1 = p2;
                out.p2 = p1;
            }
            else {
                out.p1 = p1;
                out.p2 = p2;
            }
        }
        function line2Line(a, a1, a2, b, b1, b2, info) {
            var type;
            if (a.x === 0 && b.x === 0) {
                if (a1.x === b1.x && (isInRange(a1.y, b1.y, b2.y) || isInRange(a2.y, b1.y, b2.y) || isInRange(b1.y, a1.y, a2.y) || isInRange(b2.y, a1.y, a2.y))) {
                    type = CrossTypeEnum.OVERLAP;
                }
                else {
                    type = CrossTypeEnum.NONE;
                }
            }
            else if (a.y === 0 && b.y === 0) {
                if (a1.y === b1.y && (isInRange(a1.x, b1.x, b2.x) || isInRange(a2.x, b1.x, b2.x) || isInRange(b1.x, a1.x, a2.x) || isInRange(b2.x, a1.x, a2.x))) {
                    type = CrossTypeEnum.OVERLAP;
                }
                else {
                    type = CrossTypeEnum.NONE;
                }
            }
            else if (isLineBetweenPoints(b1, b, a1, a2, info) && isLineBetweenPoints(a1, a, b1, b2, info)) {
                type = CrossTypeEnum.CROSS;
            }
            else {
                type = CrossTypeEnum.NONE;
            }
            if (info !== null && info.type !== type) {
                info.type = type;
            }
            return type !== CrossTypeEnum.NONE;
        }
        CollisionResolution2D.line2Line = line2Line;
        function isLineBetweenPoints(a, ab, p1, p2, info) {
            if (ab.x === 0) {
                return isInRange(a.x, p1.x, p2.x) && fixCrossInfo(a.x, a.x, p1.y, p2.y, info);
            }
            else if (ab.y === 0) {
                return isInRange(a.y, p1.y, p2.y) && fixCrossInfo(p1.x, p2.x, a.y, a.y, info);
            }
            else {
                var k = ab.y / ab.x;
                if (k > -1 && k < 1) {
                    var b = a.y - k * a.x;
                    var p1b = p1.y - k * p1.x;
                    var p2b = p2.y - k * p2.x;
                    return isInRange(b, p1b, p2b) && makeCrossInfo(b, p1b, p2b, p1, p2, info);
                }
                else {
                    var m = ab.x / ab.y;
                    var n = a.x - m * a.y;
                    var p1n = p1.x - m * p1.y;
                    var p2n = p2.x - m * p2.y;
                    return isInRange(n, p1n, p2n) && makeCrossInfo(n, p1n, p2n, p1, p2, info);
                }
            }
        }
        CollisionResolution2D.isLineBetweenPoints = isLineBetweenPoints;
        function isInRange(x, a, b) {
            if (a < b) {
                return a <= x && x <= b;
            }
            else {
                return b <= x && x <= a;
            }
        }
        CollisionResolution2D.isInRange = isInRange;
        function fixCrossInfo(x1, x2, y1, y2, info) {
            if (info !== null && info.type === CrossTypeEnum.NONE && x1 === x2 && y1 === y2) {
                info.p.assign(x1, y1);
                info.type = CrossTypeEnum.CROSS;
            }
            return true;
        }
        function makeCrossInfo(k, k1, k2, p1, p2, info) {
            if (info !== null && info.type === CrossTypeEnum.NONE) {
                info.p = new Vector2D(p2.x - p1.x, p2.y - p1.y).mul((k - k1) / (k2 - k1)).add(p1);
                info.type = CrossTypeEnum.CROSS;
            }
            return true;
        }
    })(CollisionResolution2D = world2d.CollisionResolution2D || (world2d.CollisionResolution2D = {}));
    var DrawAPI2D;
    (function (DrawAPI2D) {
        function clear() {
            DrawAPI2D.graphics.clear();
        }
        DrawAPI2D.clear = clear;
        function draw(transforms) {
            for (var i = 0; i < transforms.length; i++) {
                var transform = transforms[i];
                var bounds = transform.collision.bounds;
                DrawAPI2D.drawRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top, "#FF0000");
            }
            for (var i = 0; i < transforms.length; i++) {
                var transform = transforms[i];
                if (transform.collision.shap === CollisionShapEnum2D.CIRCLE) {
                    var collision = transform.collision;
                    DrawAPI2D.drawCircle(transform.x, transform.y, collision.radius, "#FF0000");
                }
                else if (transform.collision.shap === CollisionShapEnum2D.POLYGON) {
                    var collision = transform.collision;
                    DrawAPI2D.drawPolygon(0, 0, collision.vertexs, "#FF0000");
                }
                else {
                    var collision = transform.collision;
                    DrawAPI2D.drawPolygon(0, 0, collision.vertexs, "#FF0000");
                }
            }
            for (var i = 0; i < transforms.length; i++) {
                var transform = transforms[i];
                var lineColor = transform.hitNum === 0 ? "#0000FF" : "#00FF00";
                if (transform.collision.shap === CollisionShapEnum2D.CIRCLE) {
                    var collision = transform.collision;
                    DrawAPI2D.drawCircle(transform.x, transform.y, collision.radius, lineColor);
                }
                else if (transform.collision.shap === CollisionShapEnum2D.POLYGON) {
                    var collision = transform.collision;
                    DrawAPI2D.drawPolygon(0, 0, collision.vertexs, lineColor);
                }
                else {
                    var bounds = transform.collision.bounds;
                    DrawAPI2D.drawRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top, lineColor);
                }
            }
        }
        DrawAPI2D.draw = draw;
        function drawLine(a, b, lineColor) {
            DrawAPI2D.graphics.drawLine(a.x, a.y, b.x, b.y, lineColor);
        }
        DrawAPI2D.drawLine = drawLine;
        function drawNormal(a, lineColor) {
            var normal = a.copy().normalize().mul(1000);
            DrawAPI2D.graphics.drawLine(a.x, a.y, -a.x, -a.y, lineColor);
        }
        DrawAPI2D.drawNormal = drawNormal;
        function drawRect(x, y, width, height, lineColor) {
            DrawAPI2D.graphics.drawRect(x, y, width, height, void 0, lineColor);
        }
        DrawAPI2D.drawRect = drawRect;
        function drawCircle(x, y, radius, lineColor) {
            DrawAPI2D.graphics.drawCircle(x, y, radius, void 0, lineColor);
        }
        DrawAPI2D.drawCircle = drawCircle;
        function drawPolygon(x, y, vertexs, lineColor) {
            for (var i = 0; i < vertexs.length; i++) {
                var a = vertexs[i];
                var b = i === 0 ? vertexs[vertexs.length - 1] : vertexs[i - 1];
                DrawAPI2D.graphics.drawLine(a.x + x, a.y + y, b.x + x, b.y + y, lineColor);
            }
        }
        DrawAPI2D.drawPolygon = drawPolygon;
    })(DrawAPI2D = world2d.DrawAPI2D || (world2d.DrawAPI2D = {}));
    var Helper2D;
    (function (Helper2D) {
        function calculateBoundsForVertexs(vertexs, bounds) {
            var p = vertexs[0];
            var left = p.x;
            var right = p.x;
            var top = p.y;
            var bottom = p.y;
            for (var i = 1; i < vertexs.length; i++) {
                var p_1 = vertexs[i];
                if (left > p_1.x) {
                    left = p_1.x;
                }
                else if (right < p_1.x) {
                    right = p_1.x;
                }
                if (top > p_1.y) {
                    top = p_1.y;
                }
                else if (bottom < p_1.y) {
                    bottom = p_1.y;
                }
            }
            bounds.updateBounds(left, right, top, bottom);
        }
        Helper2D.calculateBoundsForVertexs = calculateBoundsForVertexs;
    })(Helper2D = world2d.Helper2D || (world2d.Helper2D = {}));
})(world2d || (world2d = {}));
