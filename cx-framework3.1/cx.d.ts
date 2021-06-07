
declare namespace cxnative
{
    namespace NativeCreator
    {
        //创建原生类
        function createNativeClass(name: string): any;
    }

    namespace NativeUtils
    {
        //保存二进制文件
        function writeDataToFile(data: Uint8Array, fullpath: string): void;
    }
}

declare namespace cx
{
    type Component = import('cc').Component;
    type Node = import('cc').Node;
    type Tween<T> = import('cc').Tween<T>;

    const config: sys.config;
    const os: typeof sys.os;
    const log: typeof import('cc').log;

    const sw: number;
    const sh: number;
    const mainScene: Component;
    const rootNode: Node;
    let uid: number;
    let defaultInitPx: number;
    let defaultInitPy: number;
    let defaultMoveInAction: cx.Tween<any>;
    let defaultMoveOutAction: cx.Tween<any>;
    let defaultNextInAction: cx.Tween<any>;
    let defaultNextOutAction: cx.Tween<any>;
    let touchLockTimelen: number;
    let touchPriorSecond: number;
    function removeLaunchImage(): void;
    function makeNodeMap(node: any): void;
    function gn(pageOrNode: any, name: string): Node;
    function hint(content: string): void;
    function alert(content: string, callback?: Function, labelOk?: string): void;
    function confirm(content: string, callback?: Function, labelOk?: string, labelCancel?: string): void;
    function showLoading(page: Component, parentNode: Node, delayShowSeconds?: number): void;
    function removeLoading(parentNode: Node): void;
    function addPage(parent:Node, prefab:string, scripts?:string[], callbackOrParams?:any, runAction?:boolean): void;
    function showPage(prefab:string, scripts?:string[], callbackOrParams?:any): void;
    function closePage(sender: any): void;
    function getTopPage(fromLast?: number): Node | undefined;
    function setAndroidBackHandler(handler?:any): void;
    function setNativeMaskMask(x: number, y: number, width: number, height: number, radius: number): void;
    function clearNativeMaskMask(): void;
    function createPanel(color4: string, width: number, height: number): Node;
    function createLabelNode(text: string, fontSize: number, fontColor: string): Node;
    function convertToDeviceSize(node:Node | undefined, x:number, y:number, width?:number, height?:number): import('cc').Rect;

    function init(mainScene: Component): void;

    namespace native
    {
        function init(): void;
        function ins(name: string): any;
        function initAndroidIntf(): void;
        function anroidCallback(name: string, v1: any, v2: any): void;
    }

    namespace picker
    {
        function create(page: Component, callback: Function | undefined, dataList: any[]): void;
        function createYearMonthDay(page: Component, callback: Function | undefined, yearData?: any[], year?: number, monthData?: any[], month?: number, dayData?: any[], day?: number): void;
        function createYearMonth(page: Component, callback: Function | undefined, yearData?: any[], year?: number, monthData?: any[], month?: number): void;
        function createMonthDay(page: Component, callback: Function | undefined, monthData?: any[], month?: number, dayData?: any[], day?: number): void;
        function createHourMinute(page: Component, callback: Function | undefined, hourData?: any[], hour?: number, minuteData?: any[], minute?: number): void;
        function number(from?: number, to?: number, label?: string): any;
        function year(from?: number, to?: number): any;
        function month(from?: number, to?: number): any;
        function day(from?: number, to?: number): any;
    }

    namespace res
    {
        function setImageFromRes(spriteOrNode: any, img: string, sizeMode?:number, callback?: Function): void;
        function setImageFromBundle(spriteOrNode: any, path: string, sizeMode?: number, callback?:Function): void;
        function setImageFromRemote(spriteOrNode: any, url: string, localPath?: string, sizeMode?: number, callback?:Function): void;
        function loadBundleRes(prefab: string | string[], callback?:Function): void;
    }

    namespace script
    {
        namespace pageView
        {
            function initAutoScroll(page: Component, pageViewName: string, autoScrollSeconds: number, loop: boolean, callback?: Function): void;
        }
        namespace scrollView
        {
            function initDeltaInsert(page: Component, viewName: string, queryHandler: Function): void;
            function overDeltaInsert(page: Component, noMoreData: boolean): void;
            function initDropRefresh(page: Component, viewName: string, refreshHandler: Function): void;
            function overDropRefresh(page: Component): void;
        }
        namespace nativeMask
        {
            function init(page: Component, node: Node | undefined, x: number, y: number, width: number, height: number): string
        } 
    }

    namespace serv
    {
        function loadFile(url: string, localPath?: string, callback?: Function): void;
        function loadAsset(url: string, callback?: Function): void;
        function call(url: string, callback?: Function, context?: any): void;
        function post(url: string, data?: any, callback?: Function, context?: any): void;
        function upload(url: string, filePath: string, callback?: Function): void;
        function setCommonHeaders(headers: string[]): void;
    }

    namespace sys
    {
        const version: string;
        let userPath: string;
        let cachePath: string;
        const os:
        {
            native: boolean,

            mac: boolean,
            ios: boolean,
            android: boolean,

            wxgame: boolean,
            wxpub: boolean,
            web: boolean
        };
        interface config
        {
            debug: boolean,                 //调试模式输出log
            startPage: string,              //开始页
            autoRemoveLaunchImage: boolean, //自动移除启动屏

            designSizeMinWidth: number,     //最小设计宽度
            designSizeMinHeight: number,    //最小设计高度
            
            slideEventDisabled: boolean,    //禁止子页面右划
            pageActionDisabled: boolean,    //禁止页面显示和退出动画
            androidkeyDisabled: boolean,    //禁止android返回键

            hintFontSize: number,           //cx.hint 文字尺寸
            hintFontColor: string,          //cx.hint 文字颜色
            hintFontOutlineWidth: number,   //cx.hint 文字描边宽度
            hintFontOutlineColor: string,   //cx.hint 文字描边颜色

            [key: string]: any
        }
    }

    namespace utils
    {
        function prefix(str: string | number, len?: number): string;
        function formatTime(time: Date, format?: string): string;  //defualt format: %Y-%m-%d %X
        function getCurrSecond(ms?:boolean): number;
        function strToSecond(stime: string): number;
        function secondToStr(second: number, format?: string): string;
        function getCurrDate(format?: string): string;
        function getCurrTime(format?: string): string;
        function getDiffDate(diff: number, format?: string): string;
        function getDiffTime(diff: number, format?: string): string;
        function getObject(arr: any[], key: string, value: any): any; //获取arr中，key1=value1 && key2=value2...的对象;
        function getObjects(arr: any[]): any[];
        function getObjectIndex(arr: any[]): number;
        function getObjectValues(obj: any): any;
        function copyObject(obj: any): any;
        function updateObject(obj: any, newObj: any): void;
        function extendObject(obj: any, newObj: any, ignoreExist?: boolean): void;
        function updateObjectValue(arr: any[], key: string, newValue: any): void;
        function dict2Object(dictList: any[]): any;
        function isInteger(num: string, min?: number | undefined, max?: number | undefined): boolean;
        function isNumber(num: string, min?: number | undefined, max?: number | undefined): boolean;
        function isNumber2(num: string, min?: number | undefined, max?: number | undefined): boolean;
        function isCurrency(num: string, min?: number | undefined, max?: number | undefined): boolean;
        function isCurrency4(num: string, min?: number | undefined, max?: number | undefined): boolean;
        function isIdCard(value: string): boolean;
        function formatFloat(value: number): number;
        function encode(content: string, key?: string): string;
        function decode(content: string, key?: string): string;
        function md5(content: string, key?: string): string;
        function randomRange(min: number, max: number): number;
        function randomArray(arr: any[]): void;
        function strDelete(str: string, c?: string): string;
        function strTruncate(str: string | undefined, len: number): string
    }
}

declare module "cc"
{
    interface Node
    {
        ignoreTopPage?: boolean;       //本页不计入TopPage
        slideEventDisabled?: boolean;  //禁止本页滑动退出
        pageActionDisabled?: boolean;  //禁止本页进入动画
        androidBackHandler?: Function | string; //本页android回退键处理方法
        mainComponent?: any;           //本页同名的script实例
        onChildPageClosed?: Function;  //当子页面关闭的处理方法
        nextInPercentX?: number;       //上一页面左移的百分比，默认0.3
        _pro: any;
        pro(): any;                    //扩展node属性
        getWidth(): number;
        getHeight(): number;
        getContentSize(): Size;
        
        //添加点击事件，callback: (senderNode, ...params)
        setTouchCallback(target:any, callback:Function, ...params:any): void;
    }

    interface ScrollView
    {
        cx_refreshTopGap?: number;
        startAutoScroll(deltaMove: math.Vec3, timeInSecond: number, attenuated?: boolean): void;
    }

    interface Game
    {
        appConfig: cx.sys.config;
    }
}

declare namespace global 
{
    interface Window {cx: any}
}