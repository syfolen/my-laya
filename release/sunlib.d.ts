
declare module suncom {
    /**
     * 调试模式，主要用于日志打印的控制，也用于模块中调试代码的开启与关闭
     */
    enum DebugMode {
        /**
         * 任意
         */
        ANY = 0x1,

        /**
         * 引擎
         */
        ENGINE = 0x2,

        /**
         * 原生
         */
        NATIVE = 0x4,

        /**
         * 网络
         */
        NETWORK = 0x8,

        /**
         * 网络心跳
         */
        NETWORK_HEARTBEAT = 0x10,

        /**
         * 调试模式
         */
        DEBUG = 0x20,

        /**
         * 工程模式
         */
        ENGINEER = 0x40,

        /**
         * 普通
         */
        NORMAL = 0x80,

        /**
         * 测试模式
         */
        TEST = 0x100,

        /**
         * 测试驱动开发模式
         */
        TDD = 0x200,

        /**
         * 验收测试模式
         */
        ATDD = 0x400
    }

    /**
     * 环境模式，主要用于发布控制
     */
    enum EnvMode {
        /**
         * 开发环境
         */
        DEVELOP = 0,

        /**
         * 调试模式
         */
        DEBUG,

        /**
         * 网页版
         */
        WEB,

        /**
         * 原生平台
         */
        NATIVE
    }

    /**
     * 事件优先级
     */
    enum EventPriorityEnum {
        /**
         * 最低
         */
        LOWEST = 0,

        /**
         * 低
         */
        LOW,

        /**
         * 中（默认）
         */
        MID,

        /**
         * 高
         */
        HIGH,

        /**
         * 最高
         */
        HIGHEST,

        /**
         * 框架级别
         */
        FWL,

        /**
         * 引擎级别
         */
        EGL,

        /**
         * 系统级别
         */
        OSL
    }

    interface IPCMInt2 {

        arg1: number;

        arg2: number;
    }

    interface IPCMIntString {

        arg1: number;

        arg2: string;
    }

    /**
     * 自定义事件系统
     */
    class EventSystem {

        /**
         * 事件注册
         * @receiveOnce: 是否只响应一次，默认为false
         * @priority: 事件优先级，优先级高的先被执行，默认为：EventPriorityEnum.MID
         * @args[]: 回调参数列表，默认为: null
         * 说明：
         * 1. 若需覆盖参数，请先调用removeEventListener移除事件后再重新注册
         */
        addEventListener(type: string, method: Function, caller: Object, receiveOnce?: boolean, priority?: EventPriorityEnum): void;

        /**
         * 移除事件
         */
        removeEventListener(type: string, method: Function, caller: Object): void;

        /**
         * 事件派发
         * @data: 参数对象，允许为任意类型的数据，传递多个参数时可指定其为数组，若需要传递的data本身就是数组，则需要传递[data]
         * @cancelable: 通知是否允许被取消，默认为: true
         */
        dispatchEvent(type: string, data?: any, cancelable?: boolean): void;

        /**
         * 取消当前正在派发的事件
         */
        dispatchCancel(): void;
    }

    /**
     * 期望异常测试类
     */
    class Expect {

        /**
         * 指定期望值
         */
        expect(value: any): Expect;

        /**
         * 解释异常
         */
        interpret(str: string): Expect;

        /**
         * 测试执行接口，若测试未通过，则输出description
         */
        test(pass: boolean, message: string): void;

        /**
         * 期望为任意值，但不为null和undefined
         */
        anything(): void;

        /**
         * 期望数组中包含
         */
        arrayContaining<T>(array: T[]): void;

        /**
         * 期望字符串中含有value
         */
        stringContaining(value: string): void;

        /**
         * 期望字符串被包含
         */
        stringMatching(value: string): void;

        /**
         * 期望存在属性
         * @value: 若不为void 0，则同时校验值
         */
        toHaveProperty(key: string, value?: any): void;

        /**
         * 期望值为：value
         */
        toBe(value: any): void;

        /**
         * 期望值为：null
         */
        toBeNull(): void;

        /**
         * 期望值为：undefined
         */
        toBeUndefined(): void;

        /**
         * 期望为：布尔类型
         */
        toBeBoolean(): void;

        /**
         * 期望对象类型为：cls
         */
        toBeInstanceOf(cls: new () => any): void;

        /**
         * 期望在不关心类型的情况下，值在布尔上下文中为假
         */
        toBeFalsy(value: any): void;

        /**
         * 期望在不关心类型的情况下，值在布尔上下文中为真
         */
        toBeTruthy(value: any): void;

        /**
         * 期望两个数字是否相等
         * @deviation: 误差，默认为：0
         */
        toBeCloseTo(value: number, deviation?: number): void;

        /**
         * 期望数字大于
         */
        toBeGreaterThan(value: number): void;

        /**
         * 期望数字大于或等于
         */
        toBeGreaterOrEqualThan(value: number): void;

        /**
         * 期望数字小于
         */
        toBeLessThan(value: number): void;

        /**
         * 期望数字小于或等于
         */
        toBeLessOrEqualThan(value: number): void;

        /**
         * 深度相等
         */
        toEqual(value: any): void;

        /**
         * 深度相等且类型一致
         */
        toStrictEqual(value: any): void;

        /**
         * 期望相反
         */
        readonly not: Expect;
    }

    /**
     * 事件处理器
     */
    class Handler {

        /**
         * 执行处理器
         */
        run(): any;

        /**
         * 执行处理器，携带额外的参数
         * @args 参数列表，允许为任意类型的数据
         */
        runWith(args: any): any;

        /**
         * 回收到对象池
         */
        recover(): void;

        /**
         * 回调对象
         */
        readonly caller: Object;

        /**
         * 回调方法
         */
        readonly method: Function;

        /**
         * 创建Handler的简单工厂方法
         */
        static create(caller: Object, method: Function, args?: any[], once?: boolean): Handler;
    }

    /**
     * 哈希表，通常用于作为一个大量数据的集合，用于快速获取数据集中的某条数据
     */
    class HashMap<T> {
        /**
         * 数据源（请勿直接操作其中的数据）
         */
        source: T[];

        /**
         * @primaryKey: 指定主键字段名，哈希表会使用主键值来作为数据索引，所以请确保主键值是恒值
         */
        constructor(primaryKey: number | string);

        /**
         * 添加数据
         */
        put(data: T): T;

        /**
         * 根据键值返回数据
         */
        getByValue(key: number | string, value: any): T;

        /**
         * 根据主键值快速返回数据
         */
        getByPrimaryValue(value: number | string): T;

        /**
         * 移除数据
         */
        remove(data: T): T;

        /**
         * 根据键值移除数据
         */
        removeByValue(key: number | string, value: any): T;

        /**
         * 根据主键值移除数据
         */
        removeByPrimaryValue(value: number | string): T;

        /**
         * 为每个数据执行方法
         * 说明：
         * 1. 若method返回true，则会中断遍历
         * 2. 谨慎在此方法中新增或移除数据
         */
        forEach(method: (data: T) => any): void;
    }

    /**
     * 常用库（纯JS方法）
     */
    namespace Common {

        /**
         * 获取全局唯一的哈希值
         */
        function createHashId(): number;

        /**
         * 判断属性是否为 null 或未定义
         */
        function isNullOrUndefined(value: any): boolean;

        /**
         * 获取类名
         * @cls: 指定类型
         */
        function getClassName(cls: any): string;

        /**
         * 返回对象的类名
         */
        function getQualifiedClassName(obj: any): string;

        /**
         * 返回某对象上的方法名
         * @caller: 默认为：null
         */
        function getMethodName(method: Function, caller?: Object): string;

        /**
         * 去除字符串的头尾空格
         * 说明：
         * 1. 当 str 为无效字符串时返回 null
         */
        function trim(str: string): string;

        /**
         * 判断字符串是否为空
         * 说明：
         * 1. 当 value 为数字且不为 NaN 时返回 true
         * 2. 当 value 为字符串且不为 "" 时返回 true
         * 3. 否则返回 false
         */
        function isStringNullOrEmpty(value: string | number): boolean;

        /**
         * 格式化字符串
         */
        function formatString(str: string, args: any[]): string;

        /**
         * 将参数转化为 Date
         * @date: 任何格式的时间参数，可以为字符串或时间戳
         * 支持的格式说明：
         * 1. Date对象
         * 2. 时间戳
         * 3. hh:mm:ss
         * 4. yyyy-MM-dd hh:mm:ss
         */
        function convertToDate(date: string | number | Date): Date;

        /**
         * 时间累加
         * @datepart: yy, MM, ww, dd, hh, mm, ss, ms
         * @increment： 增量，可为负
         * @time: 时间参数
         * @return: 时间戳
         */
        function dateAdd(datepart: string, increment: number, time: string | number | Date): number;

        /**
         * 计算时间差
         * @datepart: yy, MM, ww, dd, hh, mm, ss, ms
         * @return: 时间戳
         */
        function dateDiff(datepart: string, date: string | number | Date, date2: string | number | Date): number;

        /**
         * 格式化时间，支持：yy-MM-dd hh:mm:ss MS|ms
         */
        function formatDate(str: string, time: string | number | Date): string;

        /**
         * 返回 md5 加密后的串
         */
        function md5(str: string): string;

        /**
         * 获取 Url 参数值
         */
        function getQueryString(name: string, param?: string): string;

        /**
         * 生成HTTP签名
         * @key: 密钥
         * @sign: 忽略签名字段，默认为："sign"
         */
        function createHttpSign(params: Object, key: string, sign?: string): string;

        /**
         * 获取文件名（不包括扩展名）
         */
        function getFileName(path: string): string;

        /**
         * 获取文件的扩展名
         */
        function getFileExtension(path: string): string;

        /**
         * 替换扩展名，并返回新的路径
         */
        function replacePathExtension(path: string, newExt: string): string;

        /**
         * 从数组中查找数据
         * @array: 数据源
         * @method: 查询规则，返回true表示与规则匹配
         * @out: 若不为null，则返回查询到的所有数据，默认为: null
         * @return: 若out为null，则只返回查询到的第一条数据，否则返回null
         */
        function findInArray<T>(array: T[], method: (data: T) => boolean, out?: T[]): T;

        /**
         * 将数据从数组中移除
         */
        function removeItemFromArray<T>(item: T, array: T[]): void;

        /**
         * 将数据从数组中移除
         */
        function removeItemsFromArray<T>(items: T[], array: T[]): void;

        /**
         * 判断深度相等
         */
        function isEqual(oldData: any, newData: any, strict: boolean): boolean;

        /**
         * 比较版本号
         * 若当前版本低于参数版本，返回 -1
         * 若当前版本高于参数版本，返回 1
         * 否则返回 0
         */
        function compareVersion(ver: string): number;
    }

    /**
     * 伪数据库服务
     * 说明：
     * 1. 用于快速存储或读取数据，数据仅保存在内存中
     */
    namespace DBService {

        /**
         * 获取数据
         */
        function get<T>(name: number): T;

        /**
         * 存储数据
         * @name: 若小于0，则存储的数据不可通过get方法获取
         */
        function put<T>(name: number, data: T): T;

        /**
         * 是否存在
         */
        function exist(name: number): boolean;

        /**
         * 删除数据
         */
        function drop<T>(name: number): T;
    }

    /**
     * 全局常量或变量
     */
    namespace Global {
        /**
         * 运行环境，默认为：EnvMode.DEVELOP
         */
        let envMode: EnvMode;

        /**
         * 调试模式，默认为：0
         */
        let debugMode: DebugMode;

        /**
         * 设计分辨率宽，默认为：1280
         */
        const WIDTH: number;

        /**
         * 设计分辨率高，默认为：720
         */
        const HEIGHT: number;

        /**
         * 实际分辨率宽，默认为：Global.WIDTH
         */
        let width: number;

        /**
         * 实际分辨率高，默认为：Global.HEIGHT
         */
        let height: number;

        /**
         * 游戏版本，默认为：1.0.0
         */
        let VERSION: string;

        /**
         * 全局数据中心
         */
        const dataMap: { [key: string]: any };
    }

    /**
     * 日志接口
     */
    namespace Logger {
        /**
         * 锁定日志，若为false，则旧日志会实时被移除，默认：false
         */
        let locked: boolean;

        /**
         * 获取部分日志
         */
        function getDebugString(index: number, length: number): string[];

        /**
         * 日志总行数
         */
        function getNumOfLines(): number;

        /**
         * 普通日志
         */
        function log(mod: DebugMode, ...args: any[]): void;

        /**
         * 警告日志
         */
        function warn(mod: DebugMode, ...args: any[]): void;

        /**
         * 错误日志
         */
        function error(mod: DebugMode, ...args: any[]): void;

        /**
         * 文件日志
         */
        function log2f(mod: DebugMode, ...args: any[]): void;

        /**
         * 调用追踪日志
         */
        function trace(mod: DebugMode, ...args: any[]): void;
    }

    /**
     * 常用数学函数
     */
    namespace Mathf {
        /**
         * PI
         */
        const PI: number;

        /**
         * 2PI
         */
        const PI2: number;

        /**
         * 整数的最大安全值
         */
        const MAX_SAFE_INTEGER: number;

        /**
         * 整数的最小安全值
         */
        const MIN_SAFE_INTEGER: number;

        /**
         * 角度换算为弧度
         */
        function d2r(d: number): number;

        /**
         * 弧度换算为角度
         */
        function r2d(a: number): number;

        /**
         * 将value限制于min和max之间
         */
        function clamp(value: number, min: number, max: number): number;

        /**
         * 返回近似值
         * @n: 需要保留小数位数，默认为0
         * 1. 因各个平台实现的版本可能不一致，故自定义了此方法
         */
        function round(value: number, n?: number): number;

        /**
         * 返回>=min且<max的随机整数
         */
        function random(min: number, max: number): number;

        /**
         * 判断是否为数字
         */
        function isNumber(str: string | number): boolean;
    }

    /**
     * 对象池
     */
    namespace Pool {

        /**
         * 根据标识从池中获取对象，获取失败时返回null
         */
        function getItem(sign: string): any;

        /**
         * 根据标识从池中获取对象，获取失败时将创建新的对象
         * @cls: 对象类型，支持Laya.Prefab
         * @args: 构造函数参数列表，若cls为Laya.Prefab，则args应当为字符串
         */
        function getItemByClass(sign: string, cls: any, args?: any): any;

        /**
         * 根据标识回收对象
         * @return: 成功入池时返回: true, 否则返回: false
         */
        function recover(sign: string, item: any): boolean;

        /**
         * 清缓指定标识下的所有己缓存对象
         */
        function clear(sign: string): void;
    }

    /**
     * 线性同余发生器
     */
    namespace Random {

        /**
         * 指定随机种子
         */
        function seed(value: number): void;

        /**
         * 返回一个随机数
         */
        function random(): number;
    }

    /**
     * 测试类
     */
    namespace Test {
        /**
         * 断言是否失败，默认为：false
         */
        let ASSERT_FAILED: boolean;

        /**
         * 断言失败时是否自动断点，默认为：true
         */
        let ASSERT_BREAKPOINT: boolean;

        /**
         * 期望测试
         */
        function expect(value: any, description?: string): Expect;

        /**
         * 期望之外的，执行此方法时直接触发ASSERT_FAILED
         */
        function notExpected(message?: string): void;

        /**
         * 测试表达式是否为true
         */
        function assertTrue(value: boolean, message?: string): void;

        /**
         * 测试表达式是否为false
         */
        function assertFalse(value: boolean, message?: string): void;
    }
}

/**
 * @license suncore (c) 2013 Binfeng Sun <christon.sun@qq.com>
 * Released under the Apache License, Version 2.0
 * https://blog.csdn.net/syfolen
 * https://github.com/syfolen/suncore
 */
declare module suncore {
    /**
     * 消息优先级
     * 设计说明：
     * 1. 所有的Message消息都是异步执行的
     * 2. 使用消息机制的意义主要在于解决游戏表现层的流畅性问题
     * 3. 由于消息机制中并没有提供由使用者主动取消消息的功能，所以消息机制并不适用于作线性逻辑方面的构建
     * 4. 消息机制被用于实现场景跳转只是一个意外，因为场景跳转的逻辑是不可回滚的
     */
    enum MessagePriorityEnum {
        /**
         * 始终立即响应
         * 说明：
         * 1. 请谨慎定义此消息的回调执行器的返回值，详见 LAZY 消息说明
         */
        PRIORITY_0 = 0,

        /**
         * 每帧至多响应十次消息
         * 说明：
         * 1. 请谨慎定义此消息的回调执行器的返回值，详见 LAZY 消息说明
         */
        PRIORITY_HIGH,

        /**
         * 每帧至多响应三次消息
         * 说明：
         * 1. 请谨慎定义此消息的回调执行器的返回值，详见 LAZY 消息说明
         */
        PRIORITY_NOR,

        /**
         * 每帧至多响应一次消息
         * 说明：
         * 1. 请谨慎定义此消息的回调执行器的返回值，详见 LAZY 消息说明
         */
        PRIORITY_LOW,

        /**
         * 惰性消息
         * 说明：
         * 1. 当前帧若没有处理过任何消息，则会处理此类型的消息
         * 2. 当消息优先级为 [0, HIGH, NOR, LOW] 的消息回调执行后的返回值为false，则该次执行将会被LAZY忽略
         */
        PRIORITY_LAZY,

        /**
         * 触发器消息
         * 说明：
         * 1. 触发器在指定时刻必定会被触发
         * 2. 为了简化系统，同一个触发器只能被触发一次
         * 3. 请谨慎定义此消息的回调执行器的返回值，详见 LAZY 消息说明
         * 4. 此类型的消息存在的唯一原因是惰性消息的机制无法感知定时器的存在
         */
        PRIORITY_TRIGGER,

        /**
         * 任务消息
         * 说明：
         * 1. 任务消息在执行时，会阻塞整个消息队列，直至任务完成
         * 2. 新的任务只会在下一帧被开始执行
         */
        PRIORITY_TASK,

        /**
         * 承诺消息
         * 说明：
         * 1. 此消息是取代原生js的Promise机制用的
         * 2. 与任务消息类似，承诺也是阻塞式执行的
         * 3. 影响承诺执行优先级的除了承诺的被添加顺序之外，还有承诺的批次
         * 4. 当你在承诺执行的过程中添加新的承诺时，这些承诺将被视为新的批次
         * 5. 新批次的承诺拥有更高的执行优先级，它们将在当前承诺执行完毕之后开始执行
         * 6. 当当前批次中的所有承诺全部执行完毕之后，上一批承诺将会继续执行，直至整个消息队列为空
         */
        PRIORITY_PROMISE
    }

    /**
     * 模块枚举
     * 
     * 说明：
     * 由于游戏中的消息和定时器都是以队列的方式实现响应，所以在场景切换的过程中，就会涉及到未响应的元素的清理问题
     * 故设计了模块系统，队列将以模块来划分，当一个模块退出时，对应的列表将会被清理。
     * 
     * 注意：
     * 尽量不要添加新的模块，因为模块越多，消息响应的调度算法就会越复杂
     */
    enum ModuleEnum {
        /**
         * 系统模块
         * 此模块为常驻模块，该模块下的消息永远不会被清理
         */
        SYSTEM = 0,

        /**
         * 通用模块
         * 此模块下的消息会在当前场景退出的同时被清理
         */
        CUSTOM,

        /**
         * 时间轴模块
         * 此模块下的消息会在时间轴被销毁的同时被清理
         */
        TIMELINE,

        /**
         * 枚举结束
         */
        MAX
    }

    /**
     * MsgQId枚举
     */
    enum MsgQIdEnum {
        /**
         * 网络层消息枚举
         */
        NSL_MSG_ID_BEGIN = 1,

        NSL_MSG_ID_END = 10,

        /**
         * MMI消息枚举
         */
        MMI_MSG_ID_BEGIN = NSL_MSG_ID_END,

        MMI_MSG_ID_END = 100,

        /**
         * CUI消息枚举
         */
        CUI_MSG_ID_BEGIN = MMI_MSG_ID_END,

        CUI_MSG_ID_END = CUI_MSG_ID_BEGIN + 100,

        /**
         * GUI消息枚举
         */
        GUI_MSG_ID_BEGIN = CUI_MSG_ID_END,

        GUI_MSG_ID_END = GUI_MSG_ID_BEGIN + 200,

        /**
         * 逻辑层消息枚举
         */
        L4C_MSG_ID_BEGIN = GUI_MSG_ID_END,

        L4C_MSG_ID_END = L4C_MSG_ID_BEGIN + 300
    }

    /**
     * MsgQ的模块枚举
     */
    enum MsgQModEnum {
        /**
         * 表现层
         * 说明：
         * 1. 表现层的消息允许往CUI或GUI模块传递
         * 2. 请勿修改此值，否则可能会引起MsgQ消息传递合法性校验失效
         */
        MMI = 1,

        /**
         * 逻辑层
         */
        L4C,

        /**
         * 通用界面
         */
        CUI,

        /**
         * 游戏界面
         */
        GUI,

        /**
         * 网络层
         */
        NSL
    }

    /**
     * 任务抽象类
     * 说明：
     * 1. Task必定为MMI层对象，这是不可更改的
     * 2. Task一旦开始则不允许取消，可直接设置done为true来强制结束
     * 3. Task对象有自己的生命周期管理机制，故不建议在外部持有
     */
    abstract class AbstractTask extends puremvc.Notifier {
        /**
         * 是否正在运行
         */
        running: boolean;

        /**
         * 是否己完成
         * 说明：
         * 1. 请勿重写此getter和setter函数，否则可能会出问题
         */
        done: boolean;

        /**
         * 执行函数
         * @return: 为true时表示任务立刻完成，若返回false，则需要在其它函数中将done置为true，否则任务永远无法结束
         */
        abstract run(): boolean;

        /**
         * 任务被取消
         * 说明：
         * 1. 当消息因时间轴停止而被清理时，此方法会被自动执行，用于清理Task内部的数据
         * 2. 当done被设置为true时，此方法亦会被执行，请知悉
         */
        cancel(): void;
    }

    /**
     * 服务（主要用于逻辑层架构）
     * 说明：
     * 1. 每个服务均有独立的生命周期。
     * 2. 服务被设计用来处理与表现层无关的有状态业务。
     */
    abstract class BaseService extends puremvc.Notifier {

        /**
         * 服务启动入口
         */
        run(): void;

        /**
         * 服务停止接口
         */
        stop(): void;

        /**
         * 启动回调
         */
        protected abstract $onRun(): void;

        /**
         * 停止回调
         */
        protected abstract $onStop(): void;

        /**
         * 服务是否正在运行
         */
        readonly running: boolean;
    }

    /**
     * MsgQ服务类（主要用于模块间的解偶）
     * 说明：
     * 1. 理论上每个MsgQ模块都必须实现一个MsgQService对象，否则此模块的消息不能被处理
     */
    abstract class MsgQService extends BaseService {

        /**
         * 启动回调
         */
        protected $onRun(): void;

        /**
         * 停止回调
         */
        protected $onStop(): void;

        /**
         * 处理MsgQ消息
         */
        protected abstract $dealMsgQMsg(id: number, data: any): void;
    }

    /**
     * 暂停时间轴
     */
    class PauseTimelineCommand extends puremvc.SimpleCommand {

        /**
         * @mod: 时间轴模块
         * @stop: 若为true，时间轴将被停止而非暂停
         */
        execute(mod: ModuleEnum, stop: boolean): void;
    }

    /**
     * 简单任务对象
     * 说明：
     */
    class SimpleTask extends AbstractTask {

        constructor(caller: Object, method: Function, args?: any[]);

        /**
         * 执行函数，只能返回: true
         */
        run(): boolean;
    }

    /**
     * 开始时间轴，若时间轴不存在，则会自动创建
     */
    class StartTimelineCommand extends puremvc.SimpleCommand {

        /**
         * @mod: 时间轴模块
         * @pause: 时间轴在开启时是否处于暂停状态
         */
        execute(mod: ModuleEnum, pause: boolean): void;
    }

    /**
     * MsgQ机制
     * 设计说明：
     * 1. 设计MsgQ的主要目的是为了对不同的模块进行彻底的解耦
     * 2. 考虑到在实际环境中，网络可能存在波动，而UI层可能会涉及到资源的动态加载与释放管理，故MsgQ中的消息是以异步的形式进行派发的
     * 3. 由于MsgQ的异步机制，故每条消息的处理都必须考虑并避免因模块间的数据可能的不同步而带来的报错问题
     */
    namespace MsgQ {

        /**
         * 发送消息（异步）
         */
        function send(dst: MsgQModEnum, id: number, data?: any): void;
    }

    /**
     * 命令枚举
     */
    namespace NotifyKey {
        /**
         * 启动命令
         */
        const STARTUP: string;

        /**
         * 停止命令
         */
        const SHUTDOWN: string;

        /**
         * 启用时间轴 { mod: ModuleEnum, pause: boolean }
         * @mod: 时间轴模块
         * @pause: 若为true，时间轴开始后将处于暂停模式
         * 说明：
         * 1. 参数pause并不会对SYSTEM模块的时间轴生效
         */
        const START_TIMELINE: string;

        /**
         * 暂停时间轴 { mod: ModuleEnum, stop: boolean }
         * @mod: 时间轴模块
         * @stop: 若为true，时间轴将被停止而非暂停
         * 说明：
         * 1. 时间轴停止后，对应的模块无法被添加任务
         * 2. 时间轴上所有的任务都会在时间轴被停止时清空
         */
        const PAUSE_TIMELINE: string;

        /**
         * 物理帧事件（后于物理预处理事件执行）
         * 说明：
         * 1. 此事件在物理计算之后派发，故物理世界中的数据应当在此事件中被读取
         * 2. 物理计算优先于定时器事件
         * 比如：
         * 1. 你应当在此事件中获取对象的物理数据来计算，以确保你的所使用的都是物理计算完成之后的数据
         */
        const PHYSICS_FRAME: string;

        /**
         * 物理预处理事件（先于物理帧事件执行）
         * 说明：
         * 1. 此事件在物理计算之前派发，故外部的数据应当在此事件中传入物理引擎
         * 比如：
         * 1. 你可以在此事件中直接更改物理对象的位置，引擎会使用你传入的位置来参与碰撞
         */
        const PHYSICS_PREPARE: string;

        /**
         * 帧事件（进入事件）
         * 说明：
         * 1. 该事件优先于Message消息机制执行
         */
        const ENTER_FRAME: string;

        /**
         * 帧事件（晚于事件）
         * 说明：
         * 1. 该事件次后于Message消息机制执行
         */
        const LATER_FRAME: string;
    }

    /**
     * 系统接口
     */
    namespace System {

        /**
         * 判断指定模块是否己停止
         */
        function isModuleStopped(mod: ModuleEnum): boolean;

        /**
         * 判断指定模块是否己暂停
         */
        function isModulePaused(mod: ModuleEnum): boolean;

        /**
         * 获取时间间隔（所有模块共享）
         */
        function getDelta(): number;

        /**
         * 获取指定模块的时间戳
         */
        function getModuleTimestamp(mod: ModuleEnum): number;

        /**
         * 添加任务
         * @groupId: 不同编组并行执行，若为-1，则自动给预一个groupId，默认为: 0
         * @return: 返回任务的groupId，若为-1，则说明任务添加失败
         * 说明：
         * 1. 自定义的groupId的值不允许超过1000
         */
        function addTask(mod: ModuleEnum, task: AbstractTask, groupId?: number): number;

        /**
         * 取消任务
         */
        function cancelTaskByGroupId(mod: ModuleEnum, groupId: number): void;

        /**
         * 添加触发器
         */
        function addTrigger(mod: ModuleEnum, delay: number, caller: Object, method: Function, args?: any[]): void;

        /**
         * 添加承诺
         * @method: 此方法被调用时，第一个参数必然是resolve方法，你应当在method方法执行完毕时调用resolve方法，否则该promise将永远不会结束
         */
        function addPromise(mod: ModuleEnum, caller: Object, method: Function, args?: any[]): void;

        /**
         * 添加消息
         */
        function addMessage(mod: ModuleEnum, priority: MessagePriorityEnum, caller: Object, method: Function, args?: any[]): void;

        /**
         * 添加自定义定时器
         * @mod: 所属模块
         * @delay: 响应间隔，若为数组，则第二个参数表示首次响应延时，且默认为：0，若首次响应延时为0，则定时器会立即执行一次
         * @method: 回调函数，默认参数：{ count: number, loops: number }
         * @caller: 回调对象
         * @args[]: 参数列表
         * @loops: 响应次数，默认为1
         * @real: 是否计算真实次数，默认为false
         */
        function addTimer(mod: ModuleEnum, delay: number | number[], method: Function, caller: Object, args?: any[], loops?: number, real?: boolean): number;

        /**
         * 移除定时器
         */
        function removeTimer(timerId: number): number;
    }
}

/**
 * @license suntdd (c) 2013 Binfeng Sun <christon.sun@qq.com>
 * Released under the Apache License, Version 2.0
 * https://blog.csdn.net/syfolen
 * https://github.com/syfolen/suntdd
 */
declare module suntdd {
    /**
     * 微服务器WebSocket连接状态枚举
     */
    enum MSWSConnectionStateEnum {
        /**
         * 己连接
         */
        CONNECTED,

        /**
         * 连接中
         */
        CONNECTING,

        /**
         * 己断开
         */
        DISCONNECTED
    }

    /**
     * 微服务器WebSocket状态枚举
     */
    enum MSWSStateEnum {
        /**
         * 己连接
         */
        CONNECTED,

        /**
         * 服务器关闭连接
         */
        CLOSE,

        /**
         * 网络异常断开
         */
        ERROR
    }

    /**
     * 测试用例注册可选项枚举
     */
    enum TestCaseRegOptionEnum {
        /**
         * 插入（优先执行）
         */
        INSERT,

        /**
         * 追加（默认）
         */
        APPEND
    }

    /**
     * 微服务器信息接口
     */
    interface IMSWSInfo {
        /**
         * 连接名称
         */
        name: string;

        /**
         * 连接状态
         */
        state: MSWSConnectionStateEnum;
    }

    /**
     * 微服务器WebSocket数据包接口
     * 说明：
     * 1. 若不默认任何配置项，则消息以逐帧的形式进行派发
     * 2. 若指定的网络连接不存在，则数据包不会被处理
     */
    interface IMSWSPacket {
        /**
         * 下行延时，默认为：0
         */
        delay?: number;

        /**
         * 是否为新消息，若为false，则紧随上一条消息下行，否则在下一帧下行，默认为：true
         */
        asNewMsg?: boolean;

        /**
         * 等待消息名字，默认为：null
         * 说明：
         * 1. 该消息会在客户端上行与此名字一致的消息后再开始下行
         */
        waitName?: string;

        /**
         * 等待次数，不小于1，默认为：1
         * 说明：
         * 1. 该消息会在指定名字的消息上行达到指定次数时再开始下行
         */
        waitTimes?: number;
    }

    /**
     * 微服务器WebSocket协议包
     */
    interface IMSWSProtocalPacket extends IMSWSPacket {
        /**
         * 回复的消息名字，默认为：null
         */
        replyName?: string;

        /**
         * 下行重复次数，默认为：1
         */
        repeatTimes?: number;
    }

    /**
     * 微服务器WebSocket状态包
     */
    interface IMSWSStatePacket extends IMSWSPacket {
        /**
         * WebSocket状态
         */
        state: MSWSStateEnum;
    }

    /**
     * 微服务器
     * 说明：
     * 1. 此服务一旦实例化则自运运行且不可停止
     */
    class MicroService extends suncore.BaseService {

        protected $onRun(): void;

        protected $onStop(): void;
    }

    /**
     * 测试用例抽象类
     * 说明：
     * 1. 同一时间只会有一个测试用例被运行
     */
    abstract class TestCase extends puremvc.Notifier {
        /**
         * 测试用例编号
         */
        protected $caseId: number;

        /**
         * @caseId: 测试用例ID
         */
        constructor(caseId: number);

        /**
         * 新增测试用例
         * @regOption: 默认为：APPEND
         */
        protected $addTest(tcId: number, taskCls: new (tcId: number) => TestCase, regOption?: TestCaseRegOptionEnum): void;

        /**
         * 测试描述
         */
        protected $describe(str: string): void;

        /**
         * 在所有脚本执行以前
         */
        protected $beforeAll(): void;

        /**
         * 在所有脚本执行以后
         */
        protected $afterAll(): void;

        /**
         * 发射信号
         * @delay: 信号发射延时
         */
        protected $emit(id: number, args?: any, delay?: number): void;

        /**
         * 等待信号
         * @handler: 若line为false，则必须为handler指定值
         * @line: 是否进入队列，若为false，则必须指定handler，默认：true
         * @once: 是否只响应一次，若line为true，则once必然为true，默认为：true
         */
        protected $wait(id: number, handler?: suncom.Handler, line?: boolean, once?: boolean): void;

        /**
         * 点击按钮
         * 说明：
         * 1. 按钮的点击会延时500毫秒执行
         */
        protected $click(id: number): void;

        /**
         * 功能有二：
         * 1. 取消信号的监听
         * 2. 注销按钮的注册
         * 说明：
         * 1. 在队列中的信号监听无法取消
         */
        protected $cancel(id: number): void;

        /**
         * 序列化WebSocket状态数据包
         */
        protected $serializeWebSocketStatePacket(packet: suntdd.IMSWSStatePacket): void;

        /**
         * 序列化WebSocket协议数据包
         */
        protected $serializeWebSocketProtocalPacket(packet: suntdd.IMSWSProtocalPacket, data?: any, timeFields?: string[], hashFields?: string[]): void;
    }

    /**
     * 消息枚举
     */
    namespace NotifyKey {
        /**
         * 获取WebSocket连接信息 { out: IMSWSInfo }
         */
        const GET_WEBSOCKET_INFO: string;

        /**
         * 测试服务器连接状态 { state: MSWSStateEnum }
         */
        const TEST_WEBSOCKET_STATE: string;

        /**
         * 测试服务器协议数据 { data: any }
         */
        const TEST_WEBSOCKET_PROTOCAL: string;

        /**
         * 测试WebSocket上行协议 { name: number }
         */
        const TEST_WEBSOCKET_SEND_DATA: string;
    }

    /**
     * 测试类
     */
    namespace Test {

        /**
         * 发射信号
         * @delay: 信号发射延时
         */
        function emit(id: number, args?: any, delay?: number): void;

        /**
         * 注册按钮
         * @once: 是否为一次性的按钮，默认为：true
         * 说明：
         * 1. 通过 TestCase.cancel() 方法可以取消按钮的注册
         */
        function regButton(id: number, button: any, once?: boolean): void;
    }
}

/**
 * @license sunui (c) 2013 Binfeng Sun <christon.sun@qq.com>
 * Released under the MIT License
 * https://blog.csdn.net/syfolen
 * https://github.com/syfolen/sunui
 */
declare module sunui {
    /**
     * 确认框结果类型
     */
    enum ConfirmOptionValueEnum {
        /**
         * 无
         */
        NONE,

        /**
         * 是
         */
        YES,

        /**
         * 否
         */
        NO,

        /**
         * 取消
         */
        CANCEL
    }

    /**
     * 弹出标记枚举
     */
    enum PopupFlagEnum {
        /**
         * 无
         */
        NONE = 0x0,

        /**
         * 禁用缓动
         */
        SIMPLY = 0x1,

        /**
         * 背景通透
         */
        TRANSPARENT = 0x2,

        /**
         * 允许鼠标穿透
         */
        MOUSE_THROUGH = 0x4,

        /**
         * 同步淡入淡出时间
         * 说明：
         * 1. 正常情况下背景蒙灰时间为200毫秒
         * 2. 若启用此标记，则蒙灰时间与弹出设定时间一致
         */
        SYNC_FADE_TIME = 0x8
    }

    /**
     * 下载速度限制
     */
    enum ResourceDownloadSpeedEnum {
        /**
         * 无限制
         */
        NONE = 0,

        /**
         * 快（1M）
         */
        HIGH = 1024 * 1024 / 8,

        /**
         * 中等（256K）
         */
        MID = 256 * 1024 / 8,

        /**
         * 慢（64K）
         */
        LOW = 64 * 1024 / 8
    }

    /**
     * 重试类型枚举
     */
    enum RetryMethodEnum {
        /**
         * 自动重试（默认）
         */
        AUTO = 0x10,

        /**
         * 请求确认，包含是和否选项
         */
        CONFIRM = 0x20,

        /**
         * 终止重试
         */
        TERMINATE = 0x40
    }

    enum UILevel {
        /**
         * 未设置
         */
        NONE = 0,

        /**
         * 背景
         */
        BACKGROUND,

        /**
         * 场景
         */
        SCENE,

        /**
         * 面板，可同时显示多个，且可同时操作多个，当前被操作的面板将置顶显示
         * TODO: 面板暂时是没有实现的，因为没有使用的地方
         */
        PANEL,

        /**
         * 飘浮对象
         */
        FLOAT,

        /**
         * 金币获得
         */
        GOLD_TIPS,

        /**
         * 高倍金币
         */
        HIGH_GOLD_TIPS,

        /**
         * 播报信息
         */
        NOTICE,

        /**
         * 大赢家
         */
        BIGWINNER,

        /**
         * 小游戏
         */
        MINI_GAME,

        /**
         * 通用类型，默认的弹出方式，可同时显示多个，但只允许操作最新弹出的视图
         */
        POPUP,

        /**
         * 异步框对象
         */
        WAITINGBOX,

        /**
         * 加载界面
         * 说明：
         * 1. 层级低于加载界面的在场景中显示
         * 2. 层级等于或高于加载界面的在舞台中显示
         */
        LOADING,

        /**
         * 跑马灯提示
         */
        LAMP_TIPS,

        /**
         * 轻提示
         */
        TIPS,

        /**
         * 顶级弹出对象，特性与POPUP相同，一般情况下只适用于警告、错误等信息提示
         */
        TOP,

        /**
         * 测试对象，处在最顶层
         */
        DEBUG
    }

    /**
     * 弹框组件支持的接口
     */
    interface IPopupView {

        /**
         * 在弹框创建后调用
         */
        $onCreate?(...args: any[]): void;

        /**
         * 在弹框打开后调用，弹框将在弹出缓动完成之后被启用
         */
        $onOpen?(): void;

        /**
         * 在弹框被关闭前调用，弹框将在关闭缓动执行之前被禁用
         */
        $onClose?(): void;

        /**
         * 在弹框被移除前调用
         */
        $onRemove?(): void;
    }

    /**
     * 场景信息
     */
    interface ISceneInfo {
        /**
         * 场景名字
         */
        name: number;

        /**
         * 2D场景文件
         */
        scene2d: string;

        /**
         * 3D场景文件
         */
        scene3d?: string;

        /**
         * 初始化类
         */
        iniCls?: new (info: ISceneInfo, data?: any) => sunui.SceneIniClass;

        /**
         * 反初始化类
         */
        uniCls?: new (info: ISceneInfo, data?: any) => sunui.SceneUniClass;
    }

    /**
     * 弹出缓动信息接口，接口数据展示了执行弹出时支持的所有属性
     */
    interface IViewProps {
        /**
         * 弹框的时间模块，默认为：suncore.ModuleEnum.CUSTOM
         * 说明：
         * 1. 若当前mod为CUSTOM，但该模块处于停止状态，则此值自动变更为SYSTEM
         */
        mod?: suncore.ModuleEnum;

        /**
         * 坐标
         */
        x?: number;

        y?: number;

        /**
         * 缓动方法
         */
        ease?: Function;

        /**
         * 背景是否通透，默认为：false
         * 说明：
         * 1. 此属性己弃用，将在未来的某个版本移除，请知悉
         * 2. 优先级次于PopupFlagEnum.TRANSPARENT标记
         */
        trans?: boolean;

        /**
         * 标记集合（多个标记允许并存）
         */
        flags?: PopupFlagEnum;

        /**
         * 显示层级
         */
        level?: UILevel;

        /**
         * 是否允许取消
         */
        cancelAllowed?: boolean;

        /**
         * 弹框的左右自适应参数
         */
        left?: number;

        right?: number;

        /**
         * 弹框的上下自适应参数
         */
        top?: number;

        bottom?: number;

        /**
         * 弹框的居中自适应参数
         */
        centerX?: number;

        centerY?: number;

        /**
         * 弹出的变形系数
         */
        scaleX?: number;

        scaleY?: number;

        /**
         * 参数列表，此参数会通过IPopupView的$onOpen方法传入IPopupView，用于支持窗口之间的交互
         */
        args?: any;

        /**
         * 弹框关闭时是否保留节点，默认为false
         */
        keepNode?: boolean;
    }

    /**
     * 场景入口抽象类
     */
    abstract class AbstractSceneTask extends suncore.AbstractTask {
        /**
         * 场景配置信息
         */
        protected $info: ISceneInfo;

        /**
         * 场景跳转参数
         */
        protected $data: any;

        /**
         * @info: 当前场景信息
         * @data: 当前场景构建时的传入数据
         */
        constructor(info: ISceneInfo, data?: any);
    }

    /**
     * 逻辑消息拦截器
     */
    abstract class GUILogicInterceptor extends puremvc.Notifier {

        /**
         * @condition: 返回true时表示符合拦截条件
         */
        constructor(command: string, condition: suncom.Handler);
    }

    /**
     * 逻辑执行器，用于维护GUI层的命令执行序列
     */
    class GUILogicRunnable extends puremvc.Notifier {

        /**
         * @autoDestroy: 是否自动销毁，默认为：true
         */
        constructor(autoDestroy?: boolean);

        /**
         * 添加命令
         * @condition: 拦截条件，返回true时进行拦截
         * @dependencies：依赖列表
         */
        protected $addCommand(command: string, condition: suncom.Handler, dependencies: GUILogicDependence[]): void;

        /**
         * 获取Runnable的唯一ID（Runnable销毁时有用）
         */
        readonly hashId: number;
    }

    /**
     * 注册场景信息
     */
    class RegisterScenesCommand extends puremvc.SimpleCommand {

        /**
         * @infos: 场景信息配置列表
         */
        execute(infos: ISceneInfo[]): void;
    }

    /**
     * 重试机制
     */
    class Retryer extends puremvc.Notifier {

        /**
         * @confirmHandler: 若重试超过最大次数，则会执行此回调
         * @options: [ConfirmOptionValueEnum, string, ...]
         * 说明：
         * 1. method允许值为 RetryMethodEnum 或 suncore.ModuleEnum 或同时输入这两种值
         * 2. 若未输入 RetryMethodEnum ，则默认值为 RetryMethodEnum.AUTO
         * 3. 若未输入 suncore.ModuleEnum ，则默认值为 suncore.ModuleEnum.SYSTEM
         */
        constructor(modOrMethod: suncore.ModuleEnum | RetryMethodEnum, confirmHandler?: suncom.Handler, prompt?: string, ...options: Array<ConfirmOptionValueEnum | string>);

        /**
         * 执行接口
         * @delay: 重试延时
         * @maxRetries: 最大重试次数，默认为：2
         * @return: 返回true表示允许重试
         */
        run(delay: number, handler: suncom.Handler, maxRetries?: number): void;

        /**
         * 取消重试
         */
        cancel(): void;

        /**
         * 重置（仅会重置次数统计）
         */
        reset(): void;

        /**
         * 当前重试次数
         */
        readonly currentRetries: number;
    }

    /**
     * 场景初始化入口类
     */
    abstract class SceneIniClass extends AbstractSceneTask {

        constructor(info: ISceneInfo, data?: any);

        /**
         * 进入场景回调，场景数据建议在此方法中初始化
         * 说明：
         * 1. 此方法会后于run执行
         */
        protected $onEnterScene(): void;
    }

    /**
     * 场景反初始化入口类
     */
    abstract class SceneUniClass extends AbstractSceneTask {

        constructor(info: ISceneInfo, data?: any);

        /**
         * 离开场景回调，场景数据建议在此方法中反初始化，场景将在此方法执行完毕后销毁
         * 说明：
         * 1. 此方法会先于run执行
         */
        protected $onLeaveScene(): void;
    }

    /**
     * 缓动类
     * 说明：
     * 1. 缓动类内置了对象池，当缓动结束或被取消后没有立即被指定动作，则会在下一帧自动回收
     * 2. 由于缓动对象只有在被回收后才会自动释放资源，故不建议在外部持有不工作的缓动对象
     * 3. 若你的需求必须这么做，则可以这么来防止Tween被回收：Tween.get(target).usePool(false);
     * 4. 当外部持有的Tween被弃用时，请记得及时回收
     */
    class Tween extends puremvc.Notifier {

        /**
         * 取消缓动
         */
        cancel(): Tween;

        /**
         * 回收到对象池
         */
        recover(): void;

        /**
         * 从当前属性缓动至props属性
         * @props: 变化的属性集合，其中update属性的类型只能指定为suncom.Handler，可用其来观察缓动数值的变化
         * @duration: 缓动时长
         * @ease: 缓动函数，默认为: null
         * @complete: 缓动结束时的回调，默认为: null
         */
        to(props: any, duration: number, ease?: Function, complete?: suncom.Handler): Tween;

        /**
         * 从props属性缓动至当前属性
         * @参数详细说明请参考Tween.to
         */
        from(props: any, duration: number, ease?: Function, complete?: suncom.Handler): Tween;

        /**
         * 以props属性的幅度进行缓动
         * @参数详细说明请参考Tween.to
         */
        by(props: any, duration: number, ease?: Function, complete?: suncom.Handler): Tween;

        /**
         * 等待指定时间
         */
        wait(delay: number, complete?: suncom.Handler): Tween;

        /**
         * 是否使用对象池
         * 说明：
         * 1. 若使用了对象池，且缓动结束或被取消后没有重新指定动作，则在下一帧自动回收
         */
        usePool(value: boolean): Tween;

        /**
         * @target: 执行缓动的对象
         * @mod: 执行缓动的模块，默认为：CUSTOM
         */
        static get(target: any, mod?: suncore.ModuleEnum): Tween;
    }

    class UIManager extends puremvc.Notifier {

        static getInstance(): UIManager;

        /**
         * 进入新场景，并将当前场景压入历史
         * @data: 参数对象，保存在此对象中的数据的生命周期与场景历史的生命周期一致，当场景存在于当前或存在于历史时，数据就不会被销毁
         */
        enterScene(name: number, data?: any): void;

        /**
         * 退出当前场景，并返回历史
         */
        exitScene(): void;

        /**
         * 替换当前场景
         * @data: 参数说明请参考enterScene方法的注释
         * 说明：被替换的场景不会进入历史
         */
        replaceScene(name: number, data?: any): void;

        /**
         * 删除历史
         * @deleteCount: 需要删除的历史场景个数
         */
        deleteHistories(deleteCount: number): void;

        /**
         * 移除视图
         */
        removeView(view: any): void;

        /**
         * 获取2D场景对象
         */
        readonly scene2d: Laya.Scene;

        /**
         * 获取3D场景对象
         */
        readonly scene3d: Laya.Scene3D;

        /**
         * 获取场景名字
         */
        readonly sceneName: number;
    }

    /**
     * 视图关系对象
     */
    class ViewContact extends puremvc.Notifier {

        /**
         * @caller: 回调对象（脚本）
         * @popup: 被监视的显示对象（必须为通过ViewFacade.popup弹出的显示对象）
         * 说明：
         * 1. 若caller为非弹出对象，则销毁前应当主动派发NotifyKey.ON_CALLER_DESTROYED事件，否则ViewContact不会自动回收
         */
        constructor(popup: any, caller: any);

        /**
         * 注册弹框被关闭时需要执行的回调（详见ON_POPUP_CLOSED）
         */
        onPopupClosed(method: Function, caller: any, args?: any[]): ViewContact;

        /**
         * 注册弹框被移除时需要执行的回调（详见ON_POPUP_REMOVED）
         */
        onPopupRemoved(method: Function, caller: any, args?: any[]): ViewContact;
    }

    /**
     * 弹框外观类，实现通用的弹窗功能
     */
    class ViewFacade extends puremvc.Notifier {
        /**
         * 设置是否允许取消，默认为false
         */
        cancelAllowed: boolean;

        /**
         * 弹出框外观
         * @view 弹出对象
         * @duration 缓动时间，默认为200毫秒
         */
        constructor(view: any, duration?: number);

        /**
         * 执行弹出逻辑
         */
        popup(props?: IViewProps): ViewFacade;

        /**
         * 执行关闭逻辑
         * @destroy: 关闭后是否销毁节点，默认为true
         */
        close(destroy?: boolean): void;
    }

    /**
     * 逻辑依赖
     */
    class GUILogicDependence extends GUILogicInterceptor {
    }

    /**
     * 命令枚举
     */
    namespace NotifyKey {
        /**
         * 重试确认请求 { mod: suncore.ModuleEnum, prompt: string, options: IRetryOption[], handler: suncom.Handler }
         */
        const RETRY_CONFIRM: string;

        /**
         * 注册场景信息 { infos: ISceneInfo[] }
         * 说明：
         * 1. 此命令由sunui实现，但需要在外部进行注册
         */
        const REGISTER_SCENES: string;

        /**
         * 加载场景之前 { none }
         * 说明：
         * 1. 此事件主要用于展示LoadingView
         */
        const BEFORE_LOAD_SCENE: string;

        /**
         * 加载场景 { info: ISceneInfo }
         * 说明：
         * 1. 此命令由外部注册并实现
         * 2. 当场景加载完成时，外部应当派发ENTER_SCENE命令以通知sunui继续逻辑
         */
        const LOAD_SCENE: string;

        /**
         * 卸载场景 { scene2d: Laya.Scene, scene3d: Laya.Scene3D }
         * 说明：
         * 1. 此命令由外部注册并实现
         * 2. 不同于LOAD_SCENE命令，当场景卸载完成时，EXIT_SCENE命令不需要由外部派发
         */
        const UNLOAD_SCENE: string;

        /**
         * 进入场景命令 { scene2d: Laya.Scene, scene3d: Laya.Scene3D }
         * 说明：
         * 1. sunui优先响应此命令
         * 2. 此命令由外部在实现LOAD_SCENE命令时于场景加载完成时派发
         * 3. 此命令必然在iniCls.run()被执行之后被派发
         */
        const ENTER_SCENE: string;

        /**
         * 退出场景命令 { sceneName: SceneNameEnum }
         * 说明：
         * 1. 此命令被派发时，意味着退出场景的逻辑即将被执行
         * 2. 场景时间轴将此命令被派发后自动停止，sunui开始进入退出与销毁场景的流程
         * 3. SceneNameEnum 为由外部定义的枚举值
         */
        const EXIT_SCENE: string;

        /**
         * 离开场景命令 { none }
         * 说明：
         * 1. 此命令在完成uniCls的构建之后被派发（此时uniCls.run尚未执行）
         * 2. 表现层中的数据应当在此处销毁
         */
        const LEAVE_SCENE: string;

        /**
         * 弹框己移除 { view: Laya.Sprite }
         * 说明：
         * 1. 此事件会在IPopupView的$onRemove方法执行完毕之后被派发
         * 2. 为了避免不同对象之间的销毁逻辑形成相互干扰，此命令被派发时，意味着弹框对象己被销毁
         */
        const ON_POPUP_REMOVED: string;

        /**
         * 对象被销毁事件 { caller: any }
         * 说明：
         * 1. 此事件主要被设计用来避免与非弹框对象存在联系的弹框在对象被销毁时可能意外残留的问题
         * 2. 若某个非视图对象曾使用ViewContact与某个弹框建立过联系，则对象销毁时应当派发此事件
         */
        const ON_CALLER_DESTROYED: string;

        /**
         * 销毁逻辑命令 { hashId: number }
         */
        const DESTROY_LOGIC_RUNNABLE: string;
    }

    /**
     * 资源管理器（主要用于资源的动态创建和销毁）
     */
    namespace Resource {
        /**
         * 3D资源目录
         */
        let res3dRoot: string;

        /**
         * 设置资源的加载速度
         */
        function setDownloadSpeed(speed: ResourceDownloadSpeedEnum): void;

        /**
         * 锁定资源
         * 说明：
         * 1. 每次请求锁定资源，则资源的引用次数会-1
         * 2. 若为3d资源，则应当同时锁定资源包的配置文件
         */
        function lock(url: string): void;

        /**
         * 解锁资源
         * 说明：
         * 1. 每次请求解锁资源时，资源的引用次数会+1
         * 2. 若为3d资源，则应当同时解锁资源包的配置文件
         * 3. 当2d资源的引用次数为0时，资源会自动释放，当前的加载亦会取消
         * 4. 3d资源只有在资源包的配置文件的引用次数为0时才会释放
         */
        function unlock(url: string): void;

        /**
         * 资源预加载
         * @method: 预加载完成时，会执行此方法
         * @return: 返回资源组ID
         * 说明：
         * 1. 建议将业务逻辑的初始化代码放在资源加载完成之后，这样的话，在加载被取消时，也不需要对初始化进行撤销
         */
        function prepare(urls: string[], method: (id: number) => void, caller: Object): number;

        /**
         * 释放资源组
         * @id: 资源组ID
         * @return: 始终返回0
         */
        function release(id: number): number;

        /**
         * 立即创建对象
         * 说明：
         * 1. 通过此方法创建对象并不会产生引用计数，且只需要在外部销毁即可
         */
        function createSync(url: string, data?: any): any;

        /**
         * 立即创建3d对象
         * 说明：
         * 1. 同createSync
         */
        function createRes3dSync(name: string): any;

        /**
         * 创建预置体
         */
        function createPrefab(url: string): Laya.View;

        /**
         * 获取3D资源的配置文件地址
         */
        function getRes3dJsonUrl(url: string): string;

        /**
         * 获取3D资源地址
         * @name: 如xxx或xxx.lh，若未指定扩展名，则认为是.lh
         * 说明：
         * 1. 所有3d资源都必须放在${Resource.res3dRoot}目录下
         * 2. 完整的3D资源目录必须为 ${Resource.res3dRoot}/LayaScene_${pack}/Conventional/ 否则将不能正确解析
         */
        function getRes3dUrlByName(name: string): string;

        /**
         * 确认加载列表中的url正确性
         */
        function checkLoadList(urls: string[]): string[];
    }

    /**
     * 在对象或子对象中查找
     */
    function find<T>(path: string, parent: Laya.Node): T;
}