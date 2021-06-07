import {game} from 'cc';

game.appConfig = 
{
    debug: true,                  //调试模式输出log
    startPage: "ui/start",        //开始页
    autoRemoveLaunchImage: false, //自动移除启动屏，为false时，在适当时候自行调用cx.removeLaunchImage()

    designSizeMinWidth: 0,        //最小设计宽度，如果适配后的宽度小于该值，则适配模式自动变为宽度适配
    designSizeMinHeight: 750,     //最小设计高度，如果适配后的高度小于该值，则适配模式自动变为高度适配
        
    slideEventDisabled: false,    //禁止子页面右划
    pageActionDisabled: false,    //禁止页面显示和退出动画
    androidkeyDisabled: false,    //禁止android返回键

    hintFontSize: 36,                //cx.hint 文字尺寸
    hintFontColor: "ff0000",         //cx.hint 文字颜色
    hintFontOutlineWidth: 1,         //cx.hint 文字描边宽度
    hintFontOutlineColor: "777777",  //cx.hint 文字描边颜色
}