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
Laya.init(600, 400, Laya.WebGL);
var caller = {};
var func1 = function () {
    puremvc.Facade.getInstance().sendNotification("CUI_B");
};
var func2 = function () {
    puremvc.Facade.getInstance().sendNotification("MMI_C");
    puremvc.Facade.getInstance().sendNotification("MOD_C");
};
var Facade = (function (_super) {
    __extends(Facade, _super);
    function Facade() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Facade.getInstance = function () {
        return puremvc.Facade.inst || new Facade();
    };
    return Facade;
}(puremvc.Facade));
var TestCommand = (function (_super) {
    __extends(TestCommand, _super);
    function TestCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TestCommand.prototype.execute = function (x, y) {
        console.log("test x:" + x, ", y:" + y);
    };
    return TestCommand;
}(puremvc.SimpleCommand));
function func(x, y) {
    console.log("func x:" + x, ", y:" + y);
}
var TestMediator = (function (_super) {
    __extends(TestMediator, _super);
    function TestMediator(name, viewComponent) {
        return _super.call(this, name, viewComponent) || this;
    }
    TestMediator.prototype.listNotificationInterests = function () {
        this.$handleNotification("MMI_A", this.$a);
        this.$handleNotification("CUI_A", this.$a);
        this.$handleNotification("MMI_A", this.$a);
    };
    TestMediator.prototype.$a = function (x, y) {
        console.log("a x:" + x, ", y:" + y);
    };
    TestMediator.NAME = "TestMediator";
    return TestMediator;
}(puremvc.Mediator));
var CUI_A = (function (_super) {
    __extends(CUI_A, _super);
    function CUI_A() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CUI_A.prototype.execute = function () {
        this.facade.sendNotification("MMI_B");
    };
    return CUI_A;
}(puremvc.SimpleCommand));
var MMI_B = (function (_super) {
    __extends(MMI_B, _super);
    function MMI_B() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MMI_B.prototype.execute = function () {
    };
    return MMI_B;
}(puremvc.SimpleCommand));
var MMI_A = (function (_super) {
    __extends(MMI_A, _super);
    function MMI_A() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MMI_A.prototype.execute = function () {
        this.facade.sendNotification("CUI_A");
    };
    return MMI_A;
}(puremvc.SimpleCommand));
var A = (function (_super) {
    __extends(A, _super);
    function A() {
        var _this = _super.call(this) || this;
        _this.facade.registerObserver("MSG_C", _this.$func, _this);
        _this.facade.registerObserver("MSG_B", function () { }, _this);
        _this.facade.sendNotification("MSG_C", [0, 1]);
        return _this;
    }
    A.prototype.$func = function () {
        this.facade.sendNotification("MSG_B");
    };
    return A;
}(puremvc.Notifier));
var TestProxy = (function (_super) {
    __extends(TestProxy, _super);
    function TestProxy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TestProxy.NAME = "TestProxy";
    return TestProxy;
}(puremvc.Proxy));
var B = (function (_super) {
    __extends(B, _super);
    function B() {
        return _super.call(this) || this;
    }
    return B;
}(puremvc.Notifier));
setTimeout(function () {
    Facade.getInstance().sendNotification("A");
    puremvc.Facade.getInstance().registerCommand("TEST", TestCommand);
    puremvc.Facade.getInstance().registerObserver("MMI_A", func1, caller);
    puremvc.Facade.getInstance().registerObserver("CUI_A", func1, caller);
    puremvc.Facade.getInstance().registerObserver("MMI_B", func1, caller);
    puremvc.Facade.getInstance().registerObserver("CUI_B", func2, caller);
    puremvc.Facade.getInstance().registerObserver("MMI_C", function () { }, {});
    puremvc.Facade.getInstance().registerObserver("GUI_C", function () { }, {});
    puremvc.Facade.getInstance().sendNotification("CUI_A", [0, 1]);
    puremvc.Facade.getInstance().removeObserver("MMI_A", func1, caller);
    puremvc.Facade.getInstance().removeObserver("CUI_A", func1, caller);
    puremvc.Facade.getInstance().removeObserver("MMI_B", func1, caller);
    puremvc.Facade.getInstance().removeObserver("CUI_B", func2, caller);
    puremvc.Facade.getInstance().registerProxy(new TestProxy(TestProxy.NAME));
    puremvc.Facade.getInstance().registerMediator(new TestMediator(TestMediator.NAME, 1));
    puremvc.Facade.getInstance().registerCommand("MMI_A", MMI_A);
    puremvc.Facade.getInstance().registerCommand("MMI_B", MMI_B);
    puremvc.Facade.getInstance().registerCommand("CUI_A", CUI_A);
    new A();
    puremvc.Facade.getInstance().sendNotification("MMI_A", [0, 1]);
}, 1000);
console.log("---");
console.log("-333--");
console.log("---");
//# sourceMappingURL=Main.js.map