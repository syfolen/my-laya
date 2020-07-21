
//程序入口
Laya.init(600, 400, Laya.WebGL);

const caller: Object = {};

const func1 = () => {
	puremvc.Facade.getInstance().sendNotification("CUI_B");
};
const func2 = () => {
	puremvc.Facade.getInstance().sendNotification("MMI_C");
	puremvc.Facade.getInstance().sendNotification("MOD_C");
	// puremvc.Facade.getInstance().sendNotification("MSG_C");
	// puremvc.Facade.getInstance().sendNotification("GUI_C");
};

class Facade extends puremvc.Facade {

	static getInstance(): puremvc.IFacade {
		return puremvc.Facade.inst || new Facade();
	}

	protected $initMsgQ(): void {
		super.$initMsgQ();
		this.$regMMICmd(suncore.MsgQModEnum.CUI, "CUI");
		this.$regMMICmd(suncore.MsgQModEnum.GUI, "GUI");
		this.$regMsgQCmd(suncore.MsgQModEnum.KAL, "KAL");
		this.$regMsgQCmd(suncore.MsgQModEnum.L4C, "MSG");
	}
}

class TestCommand extends puremvc.SimpleCommand {

	execute(x: number, y: number): void {
		console.log("test x:" + x, ", y:" + y);
	}
}

function func(x: number, y: number) {
	console.log("func x:" + x, ", y:" + y);
}

class TestMediator extends puremvc.Mediator {

	static readonly NAME: string = "TestMediator";

	constructor(name: string, viewComponent?: any) {
		super(name, viewComponent);
	}

	listNotificationInterests(): void {
		this.$handleNotification("MMI_A", this.$a);
		this.$handleNotification("CUI_A", this.$a);
		this.$handleNotification("MMI_A", this.$a);
		// this.handleNotification("GUI_A", this.$a);
	}

	private $a(x: number, y: number) {
		console.log("a x:" + x, ", y:" + y);
	}
}


class CUI_A extends puremvc.SimpleCommand {

	execute() {
		this.facade.sendNotification("MMI_B");
	}
}


class MMI_B extends puremvc.SimpleCommand {

	execute() {
		// this.facade.sendNotification("MMI_B");
	}
}


class MMI_A extends puremvc.SimpleCommand {

	execute() {
		this.facade.sendNotification("CUI_A");
	}
}

class A extends puremvc.Notifier {

	constructor() {
		super(suncore.MsgQModEnum.L4C);
		// this.facade.registerObserver("KAL_C", this.$func, this);
		this.facade.registerObserver("MSG_C", this.$func, this);
		this.facade.registerObserver("MSG_B", () => { }, this);
		// this.facade.registerObserver("GUI_A", () => { }, this);
		// this.facade.registerObserver("MMI_A", () => { }, this);
		this.facade.sendNotification("MSG_C", [0, 1]);
		// this.facade.retrieveMediator(TestMediator.NAME);
	}

	private $func(): void {
		this.facade.sendNotification("MSG_B");
		// puremvc.Facade.getInstance().sendNotification("MMI_C");
		// this.facade.sendNotification("MMI_C");
		// this.facade.sendNotification("GUI_C");
	}
}

class TestProxy extends puremvc.Proxy {

	static readonly NAME: string = "TestProxy";

}

class B extends puremvc.Notifier {

	constructor() {
		super(suncore.MsgQModEnum.GUI);
	}
}


setTimeout(() => {
	Facade.getInstance().sendNotification("A");

	puremvc.Facade.getInstance().registerCommand("TEST", TestCommand);

	puremvc.Facade.getInstance().registerObserver("MMI_A", func1, caller);
	puremvc.Facade.getInstance().registerObserver("CUI_A", func1, caller);
	puremvc.Facade.getInstance().registerObserver("MMI_B", func1, caller);
	puremvc.Facade.getInstance().registerObserver("CUI_B", func2, caller);
	// puremvc.Facade.getInstance().registerObserver("GUI_A", func1, caller);
	// puremvc.Facade.getInstance().registerObserver("MOD_A", func, caller);
	// puremvc.Facade.getInstance().registerObserver("KAL_A", func, caller);
	// puremvc.Facade.getInstance().registerObserver("MSG_A", func, caller);

	puremvc.Facade.getInstance().registerObserver("MMI_C", () => { }, {});
	puremvc.Facade.getInstance().registerObserver("GUI_C", () => { }, {});
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