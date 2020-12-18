var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
        EnvMode[EnvMode["NATIVE"] = 3] = "NATIVE";
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
    var EventInfo = (function () {
        function EventInfo() {
            this.type = null;
            this.caller = null;
            this.method = null;
            this.priority = EventPriorityEnum.MID;
            this.receiveOnce = false;
        }
        EventInfo.prototype.recover = function () {
            this.caller = null;
            this.method = null;
            Pool.recover("suncom.EventInfo", this);
        };
        return EventInfo;
    }());
    suncom.EventInfo = EventInfo;
    var EventSystem = (function () {
        function EventSystem() {
            this.$var_events = {};
            this.$var_lockers = {};
            this.$var_onceList = [];
            this.$var_isCanceled = false;
        }
        EventSystem.prototype.addEventListener = function (type, method, caller, receiveOnce, priority) {
            if (receiveOnce === void 0) { receiveOnce = false; }
            if (priority === void 0) { priority = EventPriorityEnum.MID; }
            if (Common.isStringNullOrEmpty(type) === true) {
                throw Error("\u6CE8\u518C\u65E0\u6548\u4E8B\u4EF6\uFF01\uFF01\uFF01");
            }
            if (method === void 0 || method === null) {
                throw Error("\u6CE8\u518C\u65E0\u6548\u7684\u4E8B\u4EF6\u56DE\u8C03\uFF01\uFF01\uFF01");
            }
            if (caller === void 0) {
                caller = null;
            }
            var list = this.$var_events[type];
            if (list === void 0) {
                list = this.$var_events[type] = [];
            }
            else if (this.$var_lockers[type] === true) {
                this.$var_events[type] = list = list.slice(0);
                this.$var_lockers[type] = false;
            }
            var index = -1;
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                if (item.method === method && item.caller === caller) {
                    return;
                }
                if (index === -1 && item.priority < priority) {
                    index = i;
                }
            }
            var event = Pool.getItemByClass("suncom.EventInfo", EventInfo);
            event.type = type;
            event.caller = caller;
            event.method = method;
            event.priority = priority;
            event.receiveOnce = receiveOnce;
            if (index < 0) {
                list.push(event);
            }
            else {
                list.splice(index, 0, event);
            }
        };
        EventSystem.prototype.removeEventListener = function (type, method, caller) {
            if (Common.isStringNullOrEmpty(type) === true) {
                throw Error("\u79FB\u9664\u65E0\u6548\u7684\u4E8B\u4EF6\uFF01\uFF01\uFF01");
            }
            if (method === void 0 || method === null) {
                throw Error("\u79FB\u9664\u65E0\u6548\u7684\u4E8B\u4EF6\u56DE\u8C03\uFF01\uFF01\uFF01");
            }
            if (caller === void 0) {
                caller = null;
            }
            var list = this.$var_events[type];
            if (list === void 0) {
                return;
            }
            if (this.$var_lockers[type] === true) {
                this.$var_events[type] = list = list.slice(0);
                this.$var_lockers[type] = false;
            }
            for (var i = 0; i < list.length; i++) {
                var event_1 = list[i];
                if (event_1.method === method && event_1.caller === caller) {
                    list.splice(i, 1)[0].recover();
                    break;
                }
            }
            if (list.length === 0) {
                delete this.$var_events[type];
                delete this.$var_lockers[type];
            }
        };
        EventSystem.prototype.dispatchEvent = function (type, data, cancelable) {
            if (cancelable === void 0) { cancelable = true; }
            if (Common.isStringNullOrEmpty(type) === true) {
                throw Error("\u6D3E\u53D1\u65E0\u6548\u4E8B\u4EF6\uFF01\uFF01\uFF01");
            }
            var list = this.$var_events[type];
            if (list === void 0) {
                return;
            }
            this.$var_lockers[type] = true;
            var isCanceled = this.$var_isCanceled;
            this.$var_isCanceled = false;
            for (var i = 0; i < list.length; i++) {
                var event_2 = list[i];
                if (event_2.receiveOnce === true) {
                    this.$var_onceList.push(event_2);
                }
                if (data instanceof Array) {
                    event_2.method.apply(event_2.caller, data);
                }
                else {
                    event_2.method.call(event_2.caller, data);
                }
                if (this.$var_isCanceled) {
                    if (cancelable === true) {
                        break;
                    }
                    console.error("\u5C1D\u8BD5\u53D6\u6D88\u4E0D\u53EF\u88AB\u53D6\u6D88\u7684\u4E8B\u4EF6\uFF1A" + type);
                    this.$var_isCanceled = false;
                }
            }
            this.$var_isCanceled = isCanceled;
            this.$var_lockers[type] = false;
            while (this.$var_onceList.length > 0) {
                var event_3 = this.$var_onceList.pop();
                this.removeEventListener(event_3.type, event_3.method, event_3.caller);
            }
        };
        EventSystem.prototype.dispatchCancel = function () {
            this.$var_isCanceled = true;
        };
        return EventSystem;
    }());
    suncom.EventSystem = EventSystem;
    var Expect = (function () {
        function Expect(description) {
            if (description === void 0) { description = null; }
            this.$var_value = void 0;
            this.$var_asNot = false;
            this.$var_interpretation = null;
            if (Global.debugMode & DebugMode.TEST) {
                description !== null && Logger.log(DebugMode.ANY, description);
            }
        }
        Expect.prototype.expect = function (value) {
            this.$var_value = value;
            return this;
        };
        Expect.prototype.interpret = function (str) {
            this.$var_interpretation = str;
            return this;
        };
        Expect.prototype.test = function (pass, message) {
            if ((this.$var_asNot === false && pass === false) || (this.$var_asNot === true && pass === true)) {
                Test.ASSERT_FAILED = true;
                message !== null && Logger.error(DebugMode.ANY, message);
                this.$var_interpretation !== null && Logger.error(DebugMode.ANY, this.$var_interpretation);
                if (Test.ASSERT_BREAKPOINT === true) {
                    debugger;
                }
                throw Error("测试失败！");
            }
        };
        Expect.prototype.anything = function () {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$var_value !== null && this.$var_value !== void 0;
                var message = "\u671F\u671B\u503C" + (this.$var_asNot === false ? "" : "不为") + "\uFF1Anull or undefined, \u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(this.$var_value);
                this.test(pass, message);
            }
        };
        Expect.prototype.arrayContaining = function (array) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = true;
                for (var i = 0; i < array.length; i++) {
                    var value = array[i];
                    if (this.$var_value.indexOf(value) < 0) {
                        pass = false;
                        break;
                    }
                }
                var message = "\u671F\u671B" + (this.$var_asNot === false ? "" : "不") + "\u5305\u542B\uFF1A" + Common.toDisplayString(array) + ", \u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(this.$var_value);
                this.test(pass, message);
            }
        };
        Expect.prototype.stringContaining = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$var_value.indexOf(value) > -1;
                var message = "\u671F\u671B" + (this.$var_asNot === false ? "" : "不") + "\u5305\u542B\uFF1A" + value + ", \u5B9E\u9645\u503C\uFF1A" + this.$var_value;
                this.test(pass, message);
            }
        };
        Expect.prototype.stringMatching = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = value.indexOf(this.$var_value) > -1;
                var message = "\u671F\u671B" + (this.$var_asNot === false ? "" : "不") + "\u88AB\u5305\u542B\uFF1A" + value + ", \u5B9E\u9645\u503C\uFF1A" + this.$var_value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toHaveProperty = function (key, value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = value === void 0 ? this.$var_value[key] !== void 0 : this.$var_value[key] === value;
                var message = "\u671F\u671B" + (this.$var_asNot === false ? "" : "不") + "\u5B58\u5728\u5C5E\u6027\uFF1A" + key + ", \u5B9E\u9645\u503C\uFF1A" + this.$var_value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toBe = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$var_value === value;
                var message = "\u671F\u671B\u503C" + (this.$var_asNot === false ? "" : "不为") + "\uFF1A" + Common.toDisplayString(value) + ", \u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(this.$var_value);
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
                var pass = typeof this.$var_value === "boolean";
                var message = "\u671F\u671B" + (this.$var_asNot === false ? "为" : "不为") + "\uFF1A\u5E03\u5C14\u7C7B\u578B, \u5B9E\u9645\u4E3A\uFF1A" + typeof this.$var_value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeInstanceOf = function (cls) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$var_value instanceof cls;
                var message = "\u671F\u671B " + Common.getQualifiedClassName(this.$var_value) + " \u7684\u7C7B\u578B" + (this.$var_asNot === false ? "" : "不") + "\u4E3A " + Common.getClassName(cls);
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeFalsy = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = value ? false : true;
                var message = "\u671F\u671B " + Common.toDisplayString(value) + " " + (this.$var_asNot === false ? "" : "不") + "\u4E3A\u5047, \u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(this.$var_value);
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeTruthy = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = value ? true : false;
                var message = "\u671F\u671B " + Common.toDisplayString(value) + " " + (this.$var_asNot === false ? "" : "不") + "\u4E3A\u5047, \u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(this.$var_value);
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeCloseTo = function (value, deviation) {
            if (deviation === void 0) { deviation = 0; }
            if (Global.debugMode & DebugMode.TEST) {
                var pass = Math.abs(this.$var_value - value) <= Math.abs(deviation);
                var message = "\u671F\u671B\u4E0E" + value + "\u7684\u8BEF\u5DEE" + (this.$var_asNot === true ? "" : "不") + "\u8D85\u8FC7" + deviation + "\uFF0C\u5B9E\u9645\u503C\uFF1A" + this.$var_value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeGreaterThan = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$var_value > value;
                var message = "\u671F\u671B" + (this.$var_asNot === true ? "" : "不") + "\u5927\u4E8E " + value + "\uFF0C\u5B9E\u9645\u503C\uFF1A" + this.$var_value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeGreaterOrEqualThan = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$var_value >= value;
                var message = "\u671F\u671B" + (this.$var_asNot === true ? "" : "不") + "\u5927\u4E8E\u7B49\u4E8E " + value + "\uFF0C\u5B9E\u9645\u503C\uFF1A" + this.$var_value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeLessThan = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$var_value < value;
                var message = "\u671F\u671B" + (this.$var_asNot === true ? "" : "不") + "\u5C0F\u4E8E " + value + "\uFF0C\u5B9E\u9645\u503C\uFF1A" + this.$var_value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toBeLessOrEqualThan = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = this.$var_value <= value;
                var message = "\u671F\u671B" + (this.$var_asNot === true ? "" : "不") + "\u5C0F\u4E8E\u7B49\u4E8E " + value + "\uFF0C\u5B9E\u9645\u503C\uFF1A" + this.$var_value;
                this.test(pass, message);
            }
        };
        Expect.prototype.toEqual = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = Common.isEqual(this.$var_value, value, false);
                var message = "\u671F\u671B\u76F8\u7B49\uFF1A" + Common.toDisplayString(value) + "\uFF0C\u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(this.$var_value);
                this.test(pass, message);
            }
        };
        Expect.prototype.toStrictEqual = function (value) {
            if (Global.debugMode & DebugMode.TEST) {
                var pass = Common.isEqual(this.$var_value, value, true);
                var message = "\u671F\u671B\u76F8\u7B49\uFF1A" + Common.toDisplayString(value) + "\uFF0C\u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(this.$var_value);
                this.test(pass, message);
            }
        };
        Object.defineProperty(Expect.prototype, "not", {
            get: function () {
                this.$var_asNot = true;
                return this;
            },
            enumerable: false,
            configurable: true
        });
        return Expect;
    }());
    suncom.Expect = Expect;
    var Handler = (function () {
        function Handler() {
            this.$var_id = 0;
            this.$var_args = null;
            this.$var_caller = null;
            this.$var_method = null;
            this.$var_once = false;
        }
        Handler.prototype.setTo = function (caller, method, args, once) {
            if (args === void 0) { args = null; }
            if (once === void 0) { once = true; }
            if (this.$var_id === -1) {
                throw Error("Handler\u5DF1\u88AB\u56DE\u6536\uFF01\uFF01\uFF01");
            }
            this.$var_id = Common.createHashId();
            this.$var_caller = caller || null;
            this.$var_method = method || null;
            this.$var_args = args;
            this.$var_once = once;
            return this;
        };
        Handler.prototype.run = function () {
            var id = this.$var_id;
            var res = this.$var_method.apply(this.$var_caller, this.$var_args);
            id === this.$var_id && this.$var_once === true && this.recover();
            return res;
        };
        Handler.prototype.runWith = function (args) {
            var id = this.$var_id;
            var res;
            if (this.$var_args !== null) {
                res = this.$var_method.apply(this.$var_caller, this.$var_args.concat(args));
            }
            else if (args instanceof Array) {
                res = this.$var_method.apply(this.$var_caller, args);
            }
            else {
                res = this.$var_method.call(this.$var_caller, args);
            }
            id === this.$var_id && this.$var_once === true && this.recover();
            return res;
        };
        Handler.prototype.recover = function () {
            if (Pool.recover("suncom.Handler", this) === true) {
                this.$var_id = -1;
                this.$var_args = null;
                this.$var_caller = null;
                this.$var_method = null;
            }
        };
        Object.defineProperty(Handler.prototype, "caller", {
            get: function () {
                return this.$var_caller;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Handler.prototype, "method", {
            get: function () {
                return this.$var_method;
            },
            enumerable: false,
            configurable: true
        });
        Handler.create = function (caller, method, args, once) {
            var handler = Pool.getItemByClass("suncom.Handler", Handler);
            handler.$var_id = 0;
            return handler.setTo(caller, method, args, once);
        };
        return Handler;
    }());
    suncom.Handler = Handler;
    var HashMap = (function () {
        function HashMap(primaryKey) {
            this.$var_primaryKey = null;
            this.$var_dataMap = {};
            this.source = [];
            if (typeof primaryKey === "number") {
                primaryKey = primaryKey + "";
            }
            if (typeof primaryKey !== "string") {
                throw Error("\u975E\u6CD5\u7684\u4E3B\u952E\u5B57\u6BB5\u540D\uFF1A" + primaryKey);
            }
            if (primaryKey.length === 0) {
                throw Error("\u65E0\u6548\u7684\u4E3B\u952E\u5B57\u6BB5\u540D\u5B57\u957F\u5EA6\uFF1A" + primaryKey.length);
            }
            this.$var_primaryKey = primaryKey;
        }
        HashMap.prototype.$func_removeByIndex = function (index) {
            var data = this.source[index];
            this.source.splice(index, 1);
            var value = data[this.$var_primaryKey];
            delete this.$var_dataMap[value];
            return data;
        };
        HashMap.prototype.$func_getIndexByValue = function (key, value) {
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
            var value = data[this.$var_primaryKey];
            if (Common.isStringNullOrEmpty(value) === true) {
                throw Error("\u65E0\u6548\u7684\u4E3B\u952E\u7684\u503C\uFF0Ctype:" + typeof value + ", value:" + value);
            }
            if (this.getByPrimaryValue(value) === null) {
                this.source.push(data);
                this.$var_dataMap[value] = data;
            }
            else {
                throw Error("\u91CD\u590D\u7684\u4E3B\u952E\u503C\uFF1A[" + this.$var_primaryKey + "]" + value);
            }
            return data;
        };
        HashMap.prototype.getByValue = function (key, value) {
            if (key === this.$var_primaryKey) {
                return this.getByPrimaryValue(value);
            }
            var index = this.$func_getIndexByValue(key, value);
            if (index === -1) {
                return null;
            }
            return this.source[index];
        };
        HashMap.prototype.getByPrimaryValue = function (value) {
            return this.$var_dataMap[value.toString()] || null;
        };
        HashMap.prototype.remove = function (data) {
            var index = this.source.indexOf(data);
            if (index === -1) {
                return data;
            }
            return this.$func_removeByIndex(index);
        };
        HashMap.prototype.removeByValue = function (key, value) {
            if (key === this.$var_primaryKey) {
                return this.removeByPrimaryValue(value);
            }
            var index = this.$func_getIndexByValue(key, value);
            if (index === -1) {
                return null;
            }
            return this.$func_removeByIndex(index);
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
        function isNullOrUndefined(value) {
            return value === void 0 || value === null;
        }
        Common.isNullOrUndefined = isNullOrUndefined;
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
            return this.getClassName(prototype.constructor);
        }
        Common.getQualifiedClassName = getQualifiedClassName;
        function getMethodName(method, caller) {
            if (caller === void 0) { caller = null; }
            if (caller === null) {
                return this.getClassName(method);
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
            if (this.isNullOrUndefined(str) === true) {
                return null;
            }
            var chrs = ["\r", "\n", "\t", " "];
            var from = 0;
            while (from < str.length) {
                var chr = str.charAt(from);
                var index = chrs.indexOf(chr);
                if (index === -1) {
                    break;
                }
                from++;
            }
            var to = str.length - 1;
            while (to > from) {
                var chr = str.charAt(to);
                var index = chrs.indexOf(chr);
                if (index === -1) {
                    break;
                }
                to--;
            }
            return str.substring(from, to + 1);
        }
        Common.trim = trim;
        function isStringNullOrEmpty(value) {
            if (typeof value === "number") {
                return isNaN(value);
            }
            if (typeof value === "string" && value !== "") {
                return false;
            }
            return true;
        }
        Common.isStringNullOrEmpty = isStringNullOrEmpty;
        function formatString(str, args) {
            var length = str.length;
            for (var i = 0; i < args.length; i++) {
                var flag = "{" + i + "}";
                var index = str.indexOf(flag, str.length - length);
                if (index === -1) {
                    break;
                }
                str = str.substr(0, index) + args[i] + str.substr(index + 3);
            }
            return str;
        }
        Common.formatString = formatString;
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
            var date = this.convertToDate(time);
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
            var d1 = this.convertToDate(date);
            var d2 = this.convertToDate(date2);
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
            var date = this.convertToDate(time);
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
        function getQueryString(name, param) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var str = param || window.location.search;
            var array = str.substr(1).match(reg) || null;
            return array === null ? null : decodeURIComponent(array[2]);
        }
        Common.getQueryString = getQueryString;
        function createHttpSign(params, key, sign) {
            if (sign === void 0) { sign = "sign"; }
            var array = [];
            for (var key_1 in params) {
                if (key_1 !== sign) {
                    array.push(key_1 + "=" + params[key_1]);
                }
            }
            array.push("key=" + key);
            return this.md5(array.join("&"));
        }
        Common.createHttpSign = createHttpSign;
        function getFileName(path) {
            var index = path.lastIndexOf("/");
            if (index > -1) {
                path = path.substr(index + 1);
            }
            var suffix = this.getFileExtension(path);
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
        function findInArray(array, method, out) {
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
        Common.findInArray = findInArray;
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
                this.removeItemFromArray(items[i], array);
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
                        array.push(this.copy(data[i], deep));
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
                        newData[key] = this.copy(data[key], deep);
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
                    throw Error("克隆意外的数据类型：" + value);
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
                    if (this.isEqual(oldData[i], newData[i], strict) === false) {
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
                    if (oldData.hasOwnProperty(key) === true && this.isEqual(oldData[key], newData[key], strict) === false) {
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
                    array.push(this.toDisplayString(data[i]));
                }
                return "[" + array.join(",") + "]";
            }
            else {
                try {
                    str = JSON.stringify(data);
                }
                catch (error) {
                    str = "[" + this.getQualifiedClassName(data) + "]";
                }
            }
            return str;
        }
        Common.toDisplayString = toDisplayString;
        function compareVersion(ver) {
            if (typeof ver !== "string") {
                Logger.error(DebugMode.ANY, "参数版本号无效");
                return 0;
            }
            if (typeof Global.VERSION !== "string") {
                Logger.error(DebugMode.ANY, "版本号未设置");
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
                Logger.error(DebugMode.ANY, "参数版本号无效 " + ("ver:" + ver));
            }
            if (error & 0x2) {
                Logger.error(DebugMode.ANY, "当前版本号无效 " + ("ver:" + Global.VERSION));
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
            return DBService.$table[name];
        }
        DBService.get = get;
        function put(name, data) {
            if (name < 0) {
                $id++;
                DBService.$table["auto_" + $id] = data;
            }
            else {
                DBService.$table[name] = data;
            }
            return data;
        }
        DBService.put = put;
        function exist(name) {
            return DBService.$table[name] !== void 0;
        }
        DBService.exist = exist;
        function drop(name) {
            var data = DBService.get(name);
            delete DBService.$table[name];
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
        Global.dataMap = {};
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
            if (typeof str === "string") {
                if (str === "") {
                    return false;
                }
                return isNaN(+str) === false;
            }
            return false;
        }
        Mathf.isNumber = isNumber;
    })(Mathf = suncom.Mathf || (suncom.Mathf = {}));
    var Pool;
    (function (Pool) {
        var $pool = {};
        function getItem(sign) {
            var array = $pool[sign];
            if (array === void 0 || array.length === 0) {
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
                return false;
            }
            item["__suncom__$__inPool__"] = true;
            var array = $pool[sign];
            if (array === void 0) {
                $pool[sign] = [item];
            }
            else {
                array.push(item);
            }
            return true;
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
                Test.expect(true).interpret("Test.notExpected \u671F\u671B\u4E4B\u5916\u7684").toBe(false);
            }
        }
        Test.notExpected = notExpected;
        function assertTrue(value, message) {
            if (Global.debugMode & DebugMode.TEST) {
                Test.expect(value).interpret(message || "Test.assertTrue error\uFF0C\u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(value)).toBe(true);
            }
        }
        Test.assertTrue = assertTrue;
        function assertFalse(value, message) {
            if (Global.debugMode & DebugMode.TEST) {
                Test.expect(value).interpret(message || "Test.assertFalse error\uFF0C\u5B9E\u9645\u503C\uFF1A" + Common.toDisplayString(value)).toBe(false);
            }
        }
        Test.assertFalse = assertFalse;
    })(Test = suncom.Test || (suncom.Test = {}));
})(suncom || (suncom = {}));
var suncore;
(function (suncore) {
    var MessagePriorityEnum;
    (function (MessagePriorityEnum) {
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_0"] = 0] = "PRIORITY_0";
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_HIGH"] = 1] = "PRIORITY_HIGH";
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_NOR"] = 2] = "PRIORITY_NOR";
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_LOW"] = 3] = "PRIORITY_LOW";
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_LAZY"] = 4] = "PRIORITY_LAZY";
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_TRIGGER"] = 5] = "PRIORITY_TRIGGER";
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_TASK"] = 6] = "PRIORITY_TASK";
        MessagePriorityEnum[MessagePriorityEnum["PRIORITY_PROMISE"] = 7] = "PRIORITY_PROMISE";
        MessagePriorityEnum[MessagePriorityEnum["E_MAX"] = 8] = "E_MAX";
    })(MessagePriorityEnum = suncore.MessagePriorityEnum || (suncore.MessagePriorityEnum = {}));
    var ModuleEnum;
    (function (ModuleEnum) {
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
        MsgQModEnum[MsgQModEnum["E_NIL"] = -1] = "E_NIL";
        MsgQModEnum[MsgQModEnum["E_KAL"] = 0] = "E_KAL";
        MsgQModEnum[MsgQModEnum["MMI"] = 1] = "MMI";
        MsgQModEnum[MsgQModEnum["L4C"] = 2] = "L4C";
        MsgQModEnum[MsgQModEnum["CUI"] = 3] = "CUI";
        MsgQModEnum[MsgQModEnum["GUI"] = 4] = "GUI";
        MsgQModEnum[MsgQModEnum["NSL"] = 5] = "NSL";
        MsgQModEnum[MsgQModEnum["E_ANY"] = 6] = "E_ANY";
    })(MsgQModEnum = suncore.MsgQModEnum || (suncore.MsgQModEnum = {}));
    var AbstractTask = (function (_super) {
        __extends(AbstractTask, _super);
        function AbstractTask() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$var_done = false;
            _this.$var_running = false;
            return _this;
        }
        AbstractTask.prototype.cancel = function () {
        };
        Object.defineProperty(AbstractTask.prototype, "done", {
            get: function () {
                return this.$var_done;
            },
            set: function (yes) {
                if (this.$var_done !== yes) {
                    this.$var_done = yes;
                    if (yes === true) {
                        this.cancel();
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AbstractTask.prototype, "running", {
            get: function () {
                return this.$var_running;
            },
            set: function (yes) {
                this.$var_running = yes;
            },
            enumerable: false,
            configurable: true
        });
        return AbstractTask;
    }(puremvc.Notifier));
    suncore.AbstractTask = AbstractTask;
    var BaseService = (function (_super) {
        __extends(BaseService, _super);
        function BaseService() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$var_running = false;
            return _this;
        }
        BaseService.prototype.run = function () {
            if (this.$var_running === true) {
                suncom.Logger.warn(suncom.DebugMode.ANY, "\u670D\u52A1[" + suncom.Common.getQualifiedClassName(this) + "]\u5DF1\u8FD0\u884C");
                return;
            }
            this.$var_running = true;
            this.$onRun();
        };
        BaseService.prototype.stop = function () {
            if (this.$var_running === false) {
                suncom.Logger.warn(suncom.DebugMode.ANY, "\u670D\u52A1[" + suncom.Common.getQualifiedClassName(this) + "]\u672A\u8FD0\u884C");
                return;
            }
            this.$var_running = false;
            this.$onStop();
        };
        Object.defineProperty(BaseService.prototype, "running", {
            get: function () {
                return this.$var_running;
            },
            enumerable: false,
            configurable: true
        });
        return BaseService;
    }(puremvc.Notifier));
    suncore.BaseService = BaseService;
    var Engine = (function (_super) {
        __extends(Engine, _super);
        function Engine() {
            var _this = _super.call(this, MsgQModEnum.E_KAL) || this;
            _this.$delta = 0;
            _this.$runTime = 0;
            _this.$localTime = Date.now();
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
            this.$localTime = Date.now();
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
    var Message = (function () {
        function Message() {
            this.mod = ModuleEnum.SYSTEM;
            this.priority = MessagePriorityEnum.PRIORITY_0;
            this.weights = 0;
            this.task = null;
            this.groupId = 0;
            this.args = null;
            this.method = null;
            this.caller = null;
            this.timeout = 0;
        }
        Message.prototype.recover = function () {
            this.task = null;
            this.args = null;
            this.method = null;
            this.caller = null;
            suncom.Pool.recover("suncore.Message", this);
        };
        return Message;
    }());
    suncore.Message = Message;
    var MessageManager = (function () {
        function MessageManager() {
            this.$queues = [];
            for (var mod = 0; mod < ModuleEnum.MAX; mod++) {
                this.$queues[mod] = new MessageQueue(mod);
            }
        }
        MessageManager.prototype.putMessage = function (message) {
            this.$queues[message.mod].putMessage(message);
        };
        MessageManager.prototype.dealMessage = function () {
            for (var mod = 0; mod < ModuleEnum.MAX; mod++) {
                if (System.isModulePaused(mod) === false) {
                    this.$queues[mod].dealMessage();
                }
            }
        };
        MessageManager.prototype.classifyMessages0 = function () {
            for (var mod = 0; mod < ModuleEnum.MAX; mod++) {
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
            this.$canceled = false;
            this.$weights = 0;
            this.$mod = mod;
            for (var priority = 0; priority < MessagePriorityEnum.E_MAX; priority++) {
                this.$queues[priority] = [];
            }
        }
        MessageQueue.prototype.putMessage = function (message) {
            this.$messages0.push(message);
            if (message.priority === MessagePriorityEnum.PRIORITY_PROMISE) {
                this.$initPromiseWeights(message);
            }
        };
        MessageQueue.prototype.$initPromiseWeights = function (message) {
            var promises = this.$queues[MessagePriorityEnum.PRIORITY_PROMISE];
            if (promises.length === 0) {
                message.weights = this.$weights;
            }
            else {
                var promise = promises[0];
                if (promise.task.running === false) {
                    message.weights = this.$weights;
                }
                else {
                    message.weights = this.$weights = promises[0].weights + 1;
                }
            }
        };
        MessageQueue.prototype.dealMessage = function () {
            var dealCount = 0;
            var remainCount = 0;
            for (var priority = 0; priority < MessagePriorityEnum.E_MAX; priority++) {
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
                            tasks.shift().recover();
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
                else if (priority === MessagePriorityEnum.PRIORITY_PROMISE) {
                    while (queue.length > 0) {
                        dealCount++;
                        var promise = queue[0];
                        if (this.$dealTaskMessage(promise) === false) {
                            break;
                        }
                        queue.shift().recover();
                        if (this.$weights > promise.weights) {
                            break;
                        }
                    }
                }
                else if (priority === MessagePriorityEnum.PRIORITY_TRIGGER) {
                    while (queue.length > 0 && this.$dealTriggerMessage(queue[0]) === true) {
                        queue.shift().recover();
                        if (this.$canceled === false) {
                            dealCount++;
                        }
                    }
                }
                else {
                    var okCount = 0;
                    var totalCount = this.$getDealCountByPriority(priority);
                    for (; queue.length > 0 && (totalCount === 0 || okCount < totalCount); okCount++) {
                        var message = queue.shift();
                        if (this.$dealCustomMessage(message) === false) {
                            okCount--;
                        }
                        message.recover();
                    }
                    dealCount += okCount;
                }
                remainCount += queue.length;
            }
            if (remainCount === 0 && dealCount === 0 && this.$messages0.length === 0) {
                var queue = this.$queues[MessagePriorityEnum.PRIORITY_LAZY];
                if (queue.length > 0) {
                    var message = queue.shift();
                    this.$dealCustomMessage(message);
                    dealCount++;
                    message.recover();
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
        MessageQueue.prototype.$dealTriggerMessage = function (message) {
            if (message.timeout > System.getModuleTimestamp(this.$mod)) {
                return false;
            }
            this.$canceled = message.method.apply(message.caller, message.args) === false;
            return true;
        };
        MessageQueue.prototype.$dealCustomMessage = function (message) {
            return message.method.apply(message.caller, message.args) !== false;
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
            throw Error("\u9519\u8BEF\u7684\u6D88\u606F\u4F18\u5148\u7EA7");
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
                else if (message.priority === MessagePriorityEnum.PRIORITY_PROMISE) {
                    this.$addPromiseMessage(message);
                }
                else {
                    this.$queues[message.priority].push(message);
                }
            }
        };
        MessageQueue.prototype.$addPromiseMessage = function (message) {
            var messages = this.$queues[MessagePriorityEnum.PRIORITY_PROMISE];
            var index = -1;
            for (var i = 0; i < messages.length; i++) {
                var promise = messages[i];
                if (promise.task.running === true) {
                    continue;
                }
                if (promise.weights < message.weights) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                messages.push(message);
            }
            else {
                messages.splice(index, 0, message);
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
            for (var priority = 0; priority < MessagePriorityEnum.E_MAX; priority++) {
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
            message.recover();
        };
        MessageQueue.prototype.cancelTaskByGroupId = function (mod, groupId) {
            for (var id = 0; id < this.$tasks.length; id++) {
                var messages = this.$tasks[id];
                if (messages.length > 0 && messages[0].groupId === groupId) {
                    while (messages.length > 0) {
                        var message = messages.shift();
                        message.task.done = true;
                        message.recover();
                    }
                    break;
                }
            }
        };
        return MessageQueue;
    }());
    suncore.MessageQueue = MessageQueue;
    var MsgQMsg = (function () {
        function MsgQMsg() {
            this.dst = MsgQModEnum.E_ANY;
            this.id = 0;
            this.data = null;
            this.batchIndex = 0;
        }
        MsgQMsg.prototype.setTo = function (dst, id, data, batchIndex) {
            this.id = id;
            this.dst = dst;
            this.data = data;
            this.batchIndex = batchIndex;
            return this;
        };
        MsgQMsg.prototype.recover = function () {
            this.data = null;
            suncom.Pool.recover("suncore.MsgQMsg", this);
        };
        return MsgQMsg;
    }());
    suncore.MsgQMsg = MsgQMsg;
    var MsgQService = (function (_super) {
        __extends(MsgQService, _super);
        function MsgQService() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MsgQService.prototype.$onRun = function () {
            MsgQ.setModuleActive(this.msgQMod, true);
            this.facade.registerObserver(NotifyKey.MSG_Q_BUSINESS, this.$func_onMsgQBusiness, this);
        };
        MsgQService.prototype.$onStop = function () {
            MsgQ.setModuleActive(this.msgQMod, false);
            this.facade.removeObserver(NotifyKey.MSG_Q_BUSINESS, this.$func_onMsgQBusiness, this);
        };
        MsgQService.prototype.$func_onMsgQBusiness = function (mod) {
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
                    this.$dealMsgQMsg(msg.id, msg.data);
                    msg.recover();
                }
                MsgQ.batchIndex++;
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
            if (stop !== true && stop !== false) {
                throw Error("\u53C2\u6570stop\u5E94\u5F53\u4E3A\u5E03\u5C14\u503C");
            }
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
                    suncom.Logger.error(suncom.DebugMode.ANY, "SYSTEM \u4E0D\u80FD\u505C\u6B62\u56E0\u4E3A CUSTOM \u6216 TIMELINE \u4F9D\u7136\u5728\u8FD0\u884C");
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
        function SimpleTask(caller, method, args) {
            if (args === void 0) { args = null; }
            var _this = _super.call(this) || this;
            _this.$var_args = null;
            _this.$var_caller = null;
            _this.$var_method = null;
            _this.$var_args = args;
            _this.$var_caller = caller;
            _this.$var_method = method;
            return _this;
        }
        SimpleTask.prototype.run = function () {
            this.$var_method.apply(this.$var_caller, this.$var_args);
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
            if (pause !== true && pause !== false) {
                throw Error("\u53C2\u6570pause\u5E94\u5F53\u4E3A\u5E03\u5C14\u503C");
            }
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
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Timeline.prototype, "stopped", {
            get: function () {
                return this.$stopped;
            },
            enumerable: false,
            configurable: true
        });
        return Timeline;
    }());
    suncore.Timeline = Timeline;
    var Timer = (function () {
        function Timer() {
            this.mod = ModuleEnum.SYSTEM;
            this.active = false;
            this.delay = 0;
            this.method = null;
            this.caller = null;
            this.args = null;
            this.real = false;
            this.count = 0;
            this.loops = 1;
            this.timerId = 0;
            this.timestamp = -1;
            this.timeout = 0;
        }
        Timer.prototype.recover = function () {
            this.method = null;
            this.caller = null;
            this.args = null;
            suncom.Pool.recover("suncore.Timer", this);
        };
        return Timer;
    }());
    suncore.Timer = Timer;
    var TimerManager = (function () {
        function TimerManager() {
            this.$timers = [];
            this.$timerMap = {};
            for (var mod = 0; mod < ModuleEnum.MAX; mod++) {
                this.$timers[mod] = [];
            }
        }
        TimerManager.prototype.executeTimer = function () {
            for (var mod = 0; mod < ModuleEnum.MAX; mod++) {
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
                                timer.count = Math.min(Math.floor((timestamp - timer.timestamp) / timer.delay), timer.loops);
                            }
                        }
                        var recycle = false;
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
                        timer.recover();
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
                timerId = suncom.Common.createHashId();
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
            var timer = suncom.Pool.getItemByClass("suncore.Timer", Timer);
            timer.mod = mod;
            timer.active = true;
            timer.delay = delay;
            timer.method = method;
            timer.caller = caller;
            timer.args = args;
            timer.real = real;
            timer.count = count;
            timer.loops = loops;
            timer.timerId = timerId;
            timer.timestamp = timestamp;
            timer.timeout = timeout;
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
                timer.recover();
            }
        };
        return TimerManager;
    }());
    suncore.TimerManager = TimerManager;
    var PromiseTask = (function (_super) {
        __extends(PromiseTask, _super);
        function PromiseTask() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PromiseTask.prototype.run = function () {
            var method = this.$resolve.bind(this);
            this.$var_method.apply(this.$var_caller, this.$var_args === null ? [method] : [method].concat(this.$var_args));
            return this.done;
        };
        PromiseTask.prototype.$resolve = function () {
            this.done = true;
        };
        return PromiseTask;
    }(SimpleTask));
    suncore.PromiseTask = PromiseTask;
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
        MsgQ.batchIndex = 1;
        function send(dst, id, data) {
            if (isModuleActive(dst) === false) {
                suncom.Logger.warn(suncom.DebugMode.ANY, "\u6D88\u606F\u53D1\u9001\u5931\u8D25\uFF0C\u6A21\u5757\u5DF1\u6682\u505C mod:" + MsgQModEnum[dst]);
                return;
            }
            if (check(dst, id) === false) {
                suncom.Logger.warn(suncom.DebugMode.ANY, "\u6D88\u606F\u53D1\u9001\u5931\u8D25\uFF0C\u6D88\u606FID\u975E\u6CD5 mod:" + dst + ", id:" + id);
                return;
            }
            var array = $queues[dst];
            if (array === void 0) {
                array = $queues[dst] = [];
            }
            var msg = suncom.Pool.getItemByClass("suncore.MsgQMsg", MsgQMsg);
            array.push(msg.setTo(dst, id, data, MsgQ.batchIndex));
        }
        MsgQ.send = send;
        function fetch(mod, id) {
            var queue = $queues[mod];
            if (queue === void 0 || queue.length === 0) {
                return null;
            }
            for (var i = 0; i < queue.length; i++) {
                var msg = queue[i];
                if (mod === MsgQModEnum.NSL || msg.batchIndex < MsgQ.batchIndex) {
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
                throw Error("\u672A\u77E5\u7684\u6D88\u606F\u8303\u56F4 mod:" + mod);
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
                var array = $queues[mod] || [];
                while (array.length > 0) {
                    array.pop().recover();
                }
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
        function addTask(mod, task, groupId) {
            if (groupId === void 0) { groupId = 0; }
            if (System.isModuleStopped(mod) === false) {
                if (groupId === -1) {
                    groupId = createTaskGroupId();
                }
                else if (groupId > 1000) {
                    throw Error("\u81EA\u5B9A\u4E49\u7684Task GroupId\u4E0D\u5141\u8BB8\u8D85\u8FC71000");
                }
                var message = suncom.Pool.getItemByClass("suncore.Message", Message);
                message.mod = mod;
                message.task = task;
                message.groupId = groupId;
                message.priority = MessagePriorityEnum.PRIORITY_TASK;
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
        function addTrigger(mod, delay, caller, method, args) {
            if (args === void 0) { args = null; }
            if (System.isModuleStopped(mod) === false) {
                var message = suncom.Pool.getItemByClass("suncore.Message", Message);
                message.mod = mod;
                message.args = args;
                message.caller = caller;
                message.method = method;
                message.timeout = System.getModuleTimestamp(mod) + delay;
                message.priority = MessagePriorityEnum.PRIORITY_TRIGGER;
                M.messageManager.putMessage(message);
            }
            else {
                suncom.Logger.error(suncom.DebugMode.ANY, "\u5C1D\u8BD5\u6DFB\u52A0\u89E6\u53D1\u5668\uFF0C\u4F46\u6A21\u5757 " + ModuleEnum[mod] + " \u5DF1\u505C\u6B62\uFF01\uFF01\uFF01");
            }
        }
        System.addTrigger = addTrigger;
        function addPromise(mod, caller, method, args) {
            if (args === void 0) { args = null; }
            if (System.isModuleStopped(mod) === false) {
                var message = suncom.Pool.getItemByClass("suncore.Message", Message);
                message.mod = mod;
                message.task = new PromiseTask(caller, method, args);
                message.priority = MessagePriorityEnum.PRIORITY_PROMISE;
                M.messageManager.putMessage(message);
            }
            else {
                suncom.Logger.error(suncom.DebugMode.ANY, "\u5C1D\u8BD5\u6DFB\u52A0Promise\u6D88\u606F\uFF0C\u4F46\u6A21\u5757 " + ModuleEnum[mod] + " \u5DF1\u505C\u6B62\uFF01\uFF01\uFF01");
            }
        }
        System.addPromise = addPromise;
        function addMessage(mod, priority, caller, method, args) {
            if (args === void 0) { args = null; }
            if (System.isModuleStopped(mod) === false) {
                var message = suncom.Pool.getItemByClass("suncore.Message", Message);
                message.mod = mod;
                message.args = args;
                message.caller = caller;
                message.method = method;
                message.priority = priority;
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
            suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_0, _this, _this.$doPrepare);
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
            enumerable: false,
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
            enumerable: false,
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
            suncore.System.addTrigger(info.props.mod, duration, this, this.$onCloseFinish, [view]);
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
            _this.$var_relieved = false;
            _this.$var_command = command;
            _this.$var_condition = condition;
            _this.facade.registerObserver(command, _this.$func_onCommandCallback, _this, false, suncom.EventPriorityEnum.HIGHEST);
            return _this;
        }
        GUILogicInterceptor.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            _super.prototype.destroy.call(this);
            this.facade.removeObserver(this.$var_command, this.$func_onCommandCallback, this);
        };
        Object.defineProperty(GUILogicInterceptor.prototype, "var_command", {
            get: function () {
                return this.$var_command;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GUILogicInterceptor.prototype, "var_relieved", {
            get: function () {
                return this.$var_relieved;
            },
            enumerable: false,
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
            _this.$var_hashId = suncom.Common.createHashId();
            _this.$var_timerId = 0;
            _this.$var_commands = [];
            _this.$var_autoDestroy = false;
            _this.$var_autoDestroy = autoDestroy;
            _this.facade.registerObserver(NotifyKey.NEXT_LOGIC_COMMAND, _this.$func_onNextLogicCommand, _this);
            _this.facade.registerObserver(NotifyKey.DESTROY_LOGIC_RUNNABLE, _this.$func_onDestroyLogicRunnable, _this);
            _this.facade.registerObserver(NotifyKey.DESTROY_ALL_LOGIC_RUNNABLE, _this.$func_onDestroyAllLogicRunnable, _this);
            return _this;
        }
        GUILogicRunnable.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            _super.prototype.destroy.call(this);
            this.facade.removeObserver(NotifyKey.NEXT_LOGIC_COMMAND, this.$func_onNextLogicCommand, this);
            this.facade.removeObserver(NotifyKey.DESTROY_LOGIC_RUNNABLE, this.$func_onDestroyLogicRunnable, this);
            this.facade.removeObserver(NotifyKey.DESTROY_ALL_LOGIC_RUNNABLE, this.$func_onDestroyAllLogicRunnable, this);
            for (var i = 0; i < this.$var_commands.length; i++) {
                this.$var_commands[i].destroy();
            }
        };
        GUILogicRunnable.prototype.$func_onDestroyAllLogicRunnable = function () {
            this.destroy();
        };
        GUILogicRunnable.prototype.$func_onDestroyLogicRunnable = function (hashId) {
            if (this.$var_autoDestroy === false && this.$var_hashId === hashId) {
                this.destroy();
            }
        };
        GUILogicRunnable.prototype.$func_onNextLogicCommand = function (command) {
            var index = -1;
            for (var i = 0; i < this.$var_commands.length; i++) {
                if (this.$var_commands[i] === command) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                return;
            }
            index++;
            this.facade.notifyCancel();
            if (index < this.$var_commands.length) {
                var command_1 = this.$var_commands[index];
                if (command_1.running === false) {
                    command_1.run();
                }
            }
            else if (this.$var_autoDestroy === true) {
                this.destroy();
            }
        };
        GUILogicRunnable.prototype.$addCommand = function (command, condition, dependencies) {
            this.$var_commands.push(new GUILogicCommand(command, condition, dependencies));
            if (this.$var_commands[0].running === false) {
                this.$var_commands[0].run();
            }
        };
        Object.defineProperty(GUILogicRunnable.prototype, "hashId", {
            get: function () {
                return this.$var_hashId;
            },
            enumerable: false,
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
            _this.$var_options = [];
            _this.$var_currentRetries = 0;
            _this.$var_retryHandler = null;
            _this.$var_retryTimerId = 0;
            _this.$var_prompting = false;
            if ((modOrMethod & RetryMethodEnum.CONFIRM) === RetryMethodEnum.CONFIRM) {
                _this.$var_method = RetryMethodEnum.CONFIRM;
            }
            else if ((modOrMethod & RetryMethodEnum.TERMINATE) === RetryMethodEnum.TERMINATE) {
                _this.$var_method = RetryMethodEnum.TERMINATE;
            }
            else {
                _this.$var_method = RetryMethodEnum.AUTO;
            }
            var mode = modOrMethod &= 0xF;
            if (modOrMethod === suncore.ModuleEnum.CUSTOM || modOrMethod === suncore.ModuleEnum.TIMELINE) {
                _this.$var_mod = modOrMethod;
            }
            else {
                _this.$var_mod = suncore.ModuleEnum.SYSTEM;
            }
            _this.$var_prompt = prompt;
            _this.$var_options = options;
            _this.$var_confirmHandler = confirmHandler;
            return _this;
        }
        Retryer.prototype.run = function (delay, handler, maxRetries) {
            if (maxRetries === void 0) { maxRetries = 2; }
            if (this.$var_method === RetryMethodEnum.AUTO || this.$var_currentRetries < maxRetries) {
                if (this.$var_retryTimerId === 0) {
                    this.$var_retryHandler = handler;
                    this.$var_retryTimerId = suncore.System.addTimer(suncore.ModuleEnum.SYSTEM, delay, this.$func_onRetryTimer, this);
                }
                else {
                    suncom.Logger.warn(suncom.DebugMode.ANY, "\u5DF1\u5FFD\u7565\u7684\u91CD\u8BD5\u8BF7\u6C42 method:" + suncom.Common.getMethodName(handler.method, handler.caller) + ", caller:" + suncom.Common.getQualifiedClassName(handler.caller));
                }
            }
            else {
                if (this.$var_prompting === false) {
                    this.$var_prompting = true;
                    if (this.$var_method === RetryMethodEnum.TERMINATE) {
                        suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_0, this, this.$func_onConfirmReplied, [ConfirmOptionValueEnum.NO]);
                    }
                    else {
                        var handler_1 = suncom.Handler.create(this, this.$func_onConfirmReplied);
                        this.facade.sendNotification(NotifyKey.RETRY_CONFIRM, [this.$var_mod, this.$var_prompt, this.$var_options, handler_1]);
                    }
                }
                else {
                    suncom.Logger.warn(suncom.DebugMode.ANY, "\u5DF1\u5FFD\u7565\u7684\u91CD\u8BD5\u7684\u8BE2\u95EE\u8BF7\u6C42 prompt:" + this.$var_prompt);
                }
            }
        };
        Retryer.prototype.$func_onConfirmReplied = function (option) {
            if (this.$var_prompting === true) {
                this.$var_prompting = false;
                if (this.$var_confirmHandler !== null) {
                    this.$var_confirmHandler.runWith(option);
                }
            }
        };
        Retryer.prototype.$func_onRetryTimer = function () {
            this.$var_retryTimerId = 0;
            this.$var_currentRetries++;
            this.$var_retryHandler.run();
        };
        Retryer.prototype.cancel = function () {
            this.$var_prompting = false;
            this.$var_retryTimerId = suncore.System.removeTimer(this.$var_retryTimerId);
        };
        Retryer.prototype.reset = function () {
            this.$var_currentRetries = 0;
        };
        Object.defineProperty(Retryer.prototype, "currentRetries", {
            get: function () {
                return this.$var_currentRetries;
            },
            enumerable: false,
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
            suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_LAZY, this, this.$beforeLoadScene, [info, data]);
            suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_LAZY, this, this.$loadScene, [info]);
        };
        SceneLayer.prototype.$beforeLoadScene = function (info, data) {
            this.$data = data;
            this.$sceneName = info.name;
            this.facade.sendNotification(NotifyKey.BEFORE_LOAD_SCENE);
            info.iniCls && suncore.System.addTask(suncore.ModuleEnum.SYSTEM, new info.iniCls(info, data));
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
            suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_LAZY, this, this.$onLeaveScene, [info]);
        };
        SceneLayer.prototype.$onLeaveScene = function (info) {
            info.uniCls && suncore.System.addTask(suncore.ModuleEnum.SYSTEM, new info.uniCls(info, this.$data));
            this.facade.sendNotification(NotifyKey.DESTROY_ALL_LOGIC_RUNNABLE);
            this.facade.sendNotification(NotifyKey.LEAVE_SCENE);
            this.facade.sendNotification(NotifyKey.UNLOAD_SCENE, [this.$scene2d, this.$scene3d]);
            info.scene2d !== null && Resource.clearResByUrl(info.scene2d);
            suncore.System.addTask(suncore.ModuleEnum.SYSTEM, new suncore.SimpleTask(this, this.$onExitScene));
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
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SceneLayer.prototype, "scene3d", {
            get: function () {
                return this.$scene3d;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SceneLayer.prototype, "sceneName", {
            get: function () {
                return this.$ready === false ? 0 : this.$sceneName;
            },
            enumerable: false,
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
            suncore.System.addTrigger(info.props.mod, duration, this, this.$onPopupFinish, [view]);
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
                suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_0, this, this.$onTempletCreated);
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
                var handler_2 = suncom.Handler.create(_this, _this.$onResourceCreated);
                var loader = new AssetSafetyLoader(url, handler_2);
                _this.$loaders.push(loader);
            }
            return _this;
        }
        Templet.prototype.destroy = function () {
            if (this.$destroyed === true) {
                return;
            }
            _super.prototype.destroy.call(this);
            suncore.System.addMessage(suncore.ModuleEnum.SYSTEM, suncore.MessagePriorityEnum.PRIORITY_0, this, this.$releaseAllResources);
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
        function Tween() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$var_hashId = 0;
            _this.$var_mod = suncore.ModuleEnum.SYSTEM;
            _this.$var_target = null;
            _this.$var_props = null;
            _this.$var_actions = [];
            _this.$var_usePool = false;
            return _this;
        }
        Tween.prototype.$func_setTo = function (target, mod) {
            if (this.$var_hashId === -1) {
                throw Error("Tween\u5DF1\u88AB\u56DE\u6536\uFF01\uFF01\uFF01");
            }
            this.$var_mod = mod;
            this.$var_target = target;
            this.$var_hashId = suncom.Common.createHashId();
            if (suncore.System.isModuleStopped(mod) === false) {
                this.facade.sendNotification(NotifyKey.REGISTER_TWEEN_OBJECT, this);
            }
            else {
                suncom.Logger.error(suncom.DebugMode.ANY, "\u5C1D\u8BD5\u6DFB\u52A0\u7F13\u52A8\uFF0C\u4F46\u65F6\u95F4\u8F74\u5DF1\u505C\u6B62\uFF0Cmod:" + suncore.ModuleEnum[mod]);
            }
            return this;
        };
        Tween.prototype.cancel = function () {
            this.$var_props = null;
            while (this.$var_actions.length > 0) {
                this.$var_actions.pop().recover();
            }
            return this;
        };
        Tween.prototype.recover = function () {
            if (suncom.Pool.recover("sunui.Tween", this.cancel()) === true) {
                this.$var_hashId = -1;
            }
        };
        Tween.prototype.to = function (props, duration, ease, complete) {
            if (ease === void 0) { ease = null; }
            if (complete === void 0) { complete = null; }
            var keys = Object.keys(props);
            var item = this.$var_props === null ? this.$var_target : this.$var_props;
            this.$func_createTweenInfo(keys, item, props, duration, ease, props.update || null, complete);
            return this;
        };
        Tween.prototype.from = function (props, duration, ease, complete) {
            if (ease === void 0) { ease = null; }
            if (complete === void 0) { complete = null; }
            var keys = Object.keys(props);
            var item = this.$var_props === null ? this.$var_target : this.$var_props;
            this.$func_createTweenInfo(keys, props, item, duration, ease, props.update || null, complete);
            return this;
        };
        Tween.prototype.by = function (props, duration, ease, complete) {
            if (ease === void 0) { ease = null; }
            if (complete === void 0) { complete = null; }
            var keys = Object.keys(props);
            var item = this.$var_props === null ? this.$var_target : this.$var_props;
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (this.$var_props === null || this.$var_props[key] === void 0) {
                    props[key] += this.$var_target[key];
                }
                else {
                    props[key] += item[key];
                }
            }
            this.to(props, duration, ease, complete);
            return this;
        };
        Tween.prototype.$func_createTweenInfo = function (keys, from, to, duration, ease, update, complete) {
            this.$var_props = this.$var_props || {};
            var action = TweenAction.create();
            action.ease = ease;
            action.update = update;
            action.complete = complete;
            action.time = suncore.System.getModuleTimestamp(this.$var_mod);
            action.duration = duration;
            this.$func_addAction(action);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (key === "update") {
                    continue;
                }
                var clip = TweenActionClip.create();
                clip.to = to[key];
                clip.from = from[key];
                clip.prop = key;
                if (clip.from === void 0) {
                    clip.from = this.$var_target[key];
                }
                this.$var_props[key] = to[key];
                if (this.$var_actions.length === 0) {
                    this.$var_target[clip.prop] = clip.from;
                }
                action.clips.push(clip);
            }
        };
        Tween.prototype.$func_addAction = function (action) {
            if (this.$var_hashId === -1) {
                throw Error("Tween\u5DF1\u88AB\u56DE\u6536\uFF01\uFF01\uFF01");
            }
            this.$var_actions.push(action);
        };
        Tween.prototype.wait = function (delay, complete) {
            if (complete === void 0) { complete = null; }
            var action = TweenAction.create();
            action.complete = complete;
            action.time = suncore.System.getModuleTimestamp(this.$var_mod);
            action.duration = delay;
            this.$func_addAction(action);
            return this;
        };
        Tween.prototype.func_doAction = function () {
            var time = suncore.System.getModuleTimestamp(this.$var_mod);
            var action = this.$var_actions[0];
            if (this.$var_target.destroyed === true) {
                this.cancel();
                return 0;
            }
            var done = false;
            var timeLeft = 0;
            var duration = time - action.time;
            if (duration > action.duration) {
                done = true;
                timeLeft = duration - action.duration;
                duration = action.duration;
            }
            var func = action.ease || this.$func_easeNone;
            for (var i = 0; i < action.clips.length; i++) {
                var clip = action.clips[i];
                if (done === true) {
                    this.$var_target[clip.prop] = clip.to;
                }
                else {
                    this.$var_target[clip.prop] = func(duration, clip.from, clip.to - clip.from, action.duration);
                }
            }
            if (action.update !== null) {
                action.update.run();
            }
            if (done === false) {
                return 0;
            }
            this.$var_actions.shift().recover();
            if (this.$var_actions.length > 0) {
                this.$var_actions[0].time = suncore.System.getModuleTimestamp(this.$var_mod);
            }
            action.complete !== null && action.complete.run();
            return timeLeft;
        };
        Tween.prototype.$func_easeNone = function (t, b, c, d) {
            var a = t / d;
            if (a > 1) {
                a = 1;
            }
            return a * c + b;
        };
        Tween.prototype.usePool = function (value) {
            this.$var_usePool = value;
            return this;
        };
        Tween.prototype.func_getUsePool = function () {
            return this.$var_usePool;
        };
        Object.defineProperty(Tween.prototype, "var_mod", {
            get: function () {
                return this.$var_mod;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Tween.prototype, "var_canceled", {
            get: function () {
                return this.$var_actions.length === 0;
            },
            enumerable: false,
            configurable: true
        });
        Tween.get = function (target, mod) {
            if (mod === void 0) { mod = suncore.ModuleEnum.CUSTOM; }
            var tween = new Tween();
            tween.$var_hashId = 0;
            return tween.usePool(true).$func_setTo(target, mod);
        };
        return Tween;
    }(puremvc.Notifier));
    sunui.Tween = Tween;
    var TweenAction = (function () {
        function TweenAction() {
            this.ease = null;
            this.clips = [];
            this.update = null;
            this.complete = null;
            this.time = 0;
            this.duration = 0;
        }
        TweenAction.prototype.recover = function () {
            this.ease = null;
            while (this.clips.length > 0) {
                this.clips.pop().recover();
            }
            this.update = null;
            this.complete = null;
            this.time = 0;
            this.duration = 0;
            suncom.Pool.recover("sunui.TweenAction", this);
        };
        TweenAction.create = function () {
            return suncom.Pool.getItemByClass("sunui.TweenAction", TweenAction);
        };
        return TweenAction;
    }());
    sunui.TweenAction = TweenAction;
    var TweenActionClip = (function () {
        function TweenActionClip() {
            this.prop = null;
            this.from = 0;
            this.to = 0;
        }
        TweenActionClip.prototype.recover = function () {
            this.prop = null;
            this.from = 0;
            this.to = 0;
            suncom.Pool.recover("sunui.TweenActionClip", this);
        };
        TweenActionClip.create = function () {
            return suncom.Pool.getItemByClass("sunui.TweenActionClip", TweenActionClip);
        };
        return TweenActionClip;
    }());
    sunui.TweenActionClip = TweenActionClip;
    var TweenService = (function (_super) {
        __extends(TweenService, _super);
        function TweenService() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$locker = false;
            _this.$tweens = [];
            return _this;
        }
        TweenService.prototype.$onRun = function () {
            this.facade.registerObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrame, this, false, suncom.EventPriorityEnum.EGL);
            this.facade.registerObserver(suncore.NotifyKey.PAUSE_TIMELINE, this.$onTimelinePause, this, false, suncom.EventPriorityEnum.EGL);
            this.facade.registerObserver(NotifyKey.REGISTER_TWEEN_OBJECT, this.$onRegisterTweenObject, this);
        };
        TweenService.prototype.$onStop = function () {
            this.facade.removeObserver(suncore.NotifyKey.ENTER_FRAME, this.$onEnterFrame, this);
            this.facade.removeObserver(suncore.NotifyKey.PAUSE_TIMELINE, this.$onTimelinePause, this);
            this.facade.removeObserver(NotifyKey.REGISTER_TWEEN_OBJECT, this.$onRegisterTweenObject, this);
        };
        TweenService.prototype.$onEnterFrame = function () {
            this.$locker = true;
            var tweens = this.$tweens;
            for (var mod = 0; mod < suncore.ModuleEnum.MAX; mod++) {
                if (suncore.System.isModulePaused(mod) === false) {
                    for (var i = 0; i < tweens.length; i++) {
                        var tween = tweens.length[i];
                        if (tween.var_mod === mod) {
                            var timeLeft = 1;
                            while (timeLeft > 0 && tween.var_canceled === false) {
                                timeLeft = tween.func_doAction();
                            }
                        }
                    }
                }
            }
            for (var i = this.$tweens.length - 1; i > -1; i--) {
                var tween = this.$tweens[i];
                if (tween.var_canceled === true && tween.func_getUsePool() === true) {
                    suncom.Pool.recover("sunui.Tweeen", tweens.splice(i, 1)[0]);
                }
            }
            this.$locker = false;
        };
        TweenService.prototype.$onTimelinePause = function (mod, stop) {
            if (stop === true) {
                for (var i = 0; i < this.$tweens.length; i++) {
                    var tween = this.$tweens[i];
                    if (tween.var_mod === mod) {
                        tween.cancel();
                    }
                }
            }
        };
        TweenService.prototype.$onRegisterTweenObject = function (tween) {
            if (this.$locker === true) {
                this.$tweens = this.$tweens.slice(0);
                this.$locker = false;
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
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "scene3d", {
            get: function () {
                return M.sceneLayer.scene3d;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(UIManager.prototype, "sceneName", {
            get: function () {
                return M.sceneLayer.sceneName;
            },
            enumerable: false,
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
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(UrlSafetyLoader.prototype, "destroyed", {
            get: function () {
                return this.$destroyed;
            },
            enumerable: false,
            configurable: true
        });
        return UrlSafetyLoader;
    }(puremvc.Notifier));
    sunui.UrlSafetyLoader = UrlSafetyLoader;
    var ViewContact = (function (_super) {
        __extends(ViewContact, _super);
        function ViewContact(popup, caller) {
            var _this = _super.call(this) || this;
            _this.$var_closedHandler = null;
            _this.$var_removedHandler = null;
            _this.$var_popup = popup || null;
            _this.$var_caller = caller || null;
            if (M.viewLayer.getInfoByView(popup) === null) {
                throw Error("\u627E\u4E0D\u5230" + popup.name + "\u7684\u5F39\u51FA\u4FE1\u606F\uFF0C\u8BF7\u786E\u8BA4\u5176\u4E3A\u5F39\u51FA\u5BF9\u8C61");
            }
            _this.facade.registerObserver(NotifyKey.ON_POPUP_CLOSED, _this.$func_onPopupClosed, _this, false, suncom.EventPriorityEnum.FWL);
            _this.facade.registerObserver(NotifyKey.ON_POPUP_REMOVED, _this.$func_onPopupRemoved, _this, false, suncom.EventPriorityEnum.FWL);
            if (M.viewLayer.getInfoByView(caller) !== null) {
                _this.facade.registerObserver(NotifyKey.ON_POPUP_REMOVED, _this.$func_onCallerDestroy, _this, false, suncom.EventPriorityEnum.FWL);
            }
            else {
                _this.facade.registerObserver(NotifyKey.ON_CALLER_DESTROYED, _this.$func_onCallerDestroy, _this, false, suncom.EventPriorityEnum.FWL);
            }
            _this.facade.registerObserver(NotifyKey.LEAVE_SCENE, _this.$func_onLeaveScene, _this, false, suncom.EventPriorityEnum.OSL);
            return _this;
        }
        ViewContact.prototype.$func_onLeaveScene = function () {
            this.facade.removeObserver(NotifyKey.ON_POPUP_CLOSED, this.$func_onPopupClosed, this);
            this.facade.removeObserver(NotifyKey.ON_POPUP_REMOVED, this.$func_onPopupRemoved, this);
            this.facade.removeObserver(NotifyKey.LEAVE_SCENE, this.$func_onLeaveScene, this);
            this.facade.removeObserver(NotifyKey.ON_POPUP_REMOVED, this.$func_onCallerDestroy, this);
            this.facade.removeObserver(NotifyKey.ON_CALLER_DESTROYED, this.$func_onCallerDestroy, this);
        };
        ViewContact.prototype.$func_onCallerDestroy = function (caller) {
            if (caller === this.$var_caller) {
                this.$func_onLeaveScene();
            }
        };
        ViewContact.prototype.$func_onPopupClosed = function (popup) {
            if (popup === this.$var_popup) {
                if (this.$var_closedHandler !== null) {
                    this.$var_closedHandler.run();
                    this.$var_closedHandler = null;
                }
            }
        };
        ViewContact.prototype.$func_onPopupRemoved = function (popup) {
            if (popup === this.$var_popup) {
                if (this.$var_removedHandler !== null) {
                    this.$var_removedHandler.run();
                    this.$var_removedHandler = null;
                }
                this.$func_onCallerDestroy(this.$var_caller);
            }
        };
        ViewContact.prototype.onPopupClosed = function (method, caller, args) {
            if (this.$var_caller !== caller) {
                throw Error("caller\u4E0E\u6267\u884C\u8005\u4E0D\u4E00\u81F4");
            }
            if (this.$var_closedHandler === null) {
                this.$var_closedHandler = suncom.Handler.create(caller, method, args);
            }
            else {
                throw Error("\u91CD\u590D\u6CE8\u518C\u5F39\u6846\u5173\u95ED\u4E8B\u4EF6");
            }
            return this;
        };
        ViewContact.prototype.onPopupRemoved = function (method, caller, args) {
            if (this.$var_caller !== caller) {
                throw Error("caller\u4E0E\u6267\u884C\u8005\u4E0D\u4E00\u81F4");
            }
            if (this.$var_removedHandler === null) {
                this.$var_removedHandler = suncom.Handler.create(caller, method, args);
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
            _this.$var_info = null;
            _this.$var_view = view;
            if (_this.var_info !== null) {
                _this.$var_duration = _this.var_info.duration;
            }
            else if (duration === void 0) {
                _this.$var_duration = 200;
            }
            else {
                _this.$var_duration = duration;
            }
            return _this;
        }
        ViewFacade.prototype.popup = function (props) {
            if (props === void 0) { props = {}; }
            this.facade.sendNotification(NotifyKey.SHOW_POPUP, [this.$var_view, this.$var_duration, props]);
            return this;
        };
        ViewFacade.prototype.close = function (destroy) {
            this.facade.sendNotification(NotifyKey.CLOSE_POPUP, [this.$var_view, this.$var_duration, destroy]);
        };
        Object.defineProperty(ViewFacade.prototype, "cancelAllowed", {
            get: function () {
                return this.var_info.cancelAllowed;
            },
            set: function (yes) {
                this.var_info.cancelAllowed = yes;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ViewFacade.prototype, "var_info", {
            get: function () {
                if (this.$var_info === null) {
                    this.$var_info = M.viewLayer.getInfoByView(this.$var_view);
                }
                return this.$var_info;
            },
            enumerable: false,
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
                this.$dependencies[i].var_active = true;
            }
            this.$running = true;
        };
        GUILogicCommand.prototype.$onInterceptorRelieved = function (dependence) {
            if (this.$var_relieved === true) {
                return;
            }
            if (this.$dependencies.indexOf(dependence) < 0) {
                return;
            }
            this.facade.notifyCancel();
            var relieved = true;
            for (var i = 0; i < this.$dependencies.length; i++) {
                if (this.$dependencies[i].var_relieved === false) {
                    relieved = false;
                    break;
                }
            }
            if (relieved === true) {
                suncore.System.addMessage(suncore.ModuleEnum.TIMELINE, suncore.MessagePriorityEnum.PRIORITY_0, this, this.$onCommandRelieved);
            }
        };
        GUILogicCommand.prototype.$onCommandRelieved = function () {
            if (this.$destroyed === false && this.$var_relieved === false) {
                this.$var_relieved = true;
                this.facade.sendNotification(NotifyKey.NEXT_LOGIC_COMMAND, this, true);
                for (var i = 0; i < this.$dataList.length; i++) {
                    this.facade.sendNotification(this.$var_command, this.$dataList[i]);
                }
            }
        };
        GUILogicCommand.prototype.$func_onCommandCallback = function () {
            if (this.$var_relieved === true) {
                return;
            }
            var args = [];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            if (this.$var_condition.runWith(args) === false) {
                return;
            }
            this.$var_relieved = true;
            for (var i = 0; i < this.$dependencies.length; i++) {
                if (this.$dependencies[i].var_relieved === false) {
                    this.$var_relieved = false;
                    break;
                }
            }
            if (this.$var_relieved === false) {
                this.$dataList.push(args);
                this.facade.notifyCancel();
            }
        };
        Object.defineProperty(GUILogicCommand.prototype, "running", {
            get: function () {
                return this.$running;
            },
            enumerable: false,
            configurable: true
        });
        return GUILogicCommand;
    }(GUILogicInterceptor));
    sunui.GUILogicCommand = GUILogicCommand;
    var GUILogicDependence = (function (_super) {
        __extends(GUILogicDependence, _super);
        function GUILogicDependence() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.$var_active = false;
            return _this;
        }
        GUILogicDependence.prototype.$func_onCommandCallback = function () {
            if (this.$var_active === true && this.$var_relieved === false) {
                var args = [];
                for (var i = 0; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                if (this.$var_condition.runWith(args) === true) {
                    this.$var_relieved = true;
                    this.facade.sendNotification(NotifyKey.ON_INTERCEPTOR_RELIEVED, this, true);
                }
            }
        };
        Object.defineProperty(GUILogicDependence.prototype, "var_active", {
            get: function () {
                return this.$var_active;
            },
            set: function (value) {
                this.$var_active = value;
            },
            enumerable: false,
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
//# sourceMappingURL=sunlib.js.map