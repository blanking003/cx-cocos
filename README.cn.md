# cx-cocos
**一个基于cocos creator3.1.1的应用App和游戏开发框架**  

关键词：cocos creator、应用开发、App开发、游戏开发、跨平台、框架

    cocos creator是一个开源的游戏开发引擎，在游戏开发方面，拥有大量开发者。然而在应用App方面，却少有人使用，cx-cocos的出现，填补了cocos creator在应用App开发上的空白。

   使用cx-cocos，你可以轻松愉快地开发出一个跨平台应用App，包括ios、mac、android、web等，当然你也可以使用cx-cocos开发游戏，这是一个高效简洁的开发框架，极大提升开发者的效率。

**本说明文档包括以下内容：**
- cx-cocos主要功能
- cx-cocos结构和原理
- 如何运行demo app
- 如何使用cx-cocos开始一个自己的项目
- 问题和技术支持


## 1. 主要功能
**cx-cocos的主要功能包括以下内容：**   
- 应用App的核心UI交互
- 页面和组件访问、资源访问、远程服务访问
- 与原生代码的交互
- 真正的启动屏
- 热更新


### 1.1 应用App的核心UI交互
----
    cx-cocos在页面的显示与交互细节上，与iOS原生App有着相似的体验，
    包括页面的进入退出与手势、提示弹窗、ScrollView、Loading等待、选择器等等。
    cx3-demo是一个demo，建议你从它入手，了解cx-cocos。

- **屏幕适配：** 通常情况下，应用App是宽度适应（fitWidth）、高度随着屏幕高度自动铺满。cx-cocos提供了一个“最小设计宽/高度”的配置，即使在浏览器或Pad上，App也能按最佳的方式显示界面——你只需按你的设计尺寸来设计UI。

- **刘海屏适配：** 对于iphoneX等屏幕，通过添加cx.safearea脚本，可自动调节标题栏、内容层、底部导航栏的高度和位置。

- **界面进入与退出：** 动画进入与退出、手势划动退出、上一页面随动、阴影效果、响应android返回键。

- **对话框：** Alert提示框、Confirm确认框。框架还提供了一种Hint动画文字提示，你可以多点击几次试试。

- **选择器：** 框架提供了1栏或多栏的选择器，你可以轻松地实现年月日选择、年月选择、文字或对象列表选择。

- **ScrollView：** 扩展了下拉刷新、上滑增量添加数据的能力。

- **PageView：** 扩展了定时自动下一页、循环播放、点击回调的能力。

- **等待动画：** 可以在页面正中或任意控件内显示Loading动画，并且有延时显示能力，这在查询数据时非常实用，比如0.5秒后还没有返回数据，才显示Loading动画。

- **原生视图：** 原生UI在cocos UI中显示，并且随着ScrollView滚动或窗体滑动；原生UI遮罩能力，例如对话弹框、标题栏在原生UI之上显示，不被遮挡。
  

### 1.2 页面和组件访问、资源访问、远程服务访问
----
    操作UI组件在应用开发中非常频繁，cx-cocos提供了便捷的方式对组件进行访问和操作。

|  UI常用方法   | 说明   |
|  ----  | ----  |
| cx.sw  | 适配后的屏幕宽度 |
| cx.sh  | 适配后的屏幕高度 |
| cx.gn(pageOrNode, nodeName)  | 获取场景树中的节点 |
| setTouchCallback(page, callback, ...params)   | 给Node添加点击事件  |
| cx.hint(content)  | 显示提示 |
| cx.alert(content, callback?, labelOK?)  | 显示对话窗 |
| cx.confrm(content, callback?, labelOK?, labelCancel?)  | 显示确认窗 |
| cx.showLoading(page, parentNode, delayShowSeconds?)  | 显示等待动画 |
| cx.removeLoading(parentNode)  | 移除等待动画 |
| cx.addPage(parentNode, prefabName, scripts?, callbackOrParams, runAction?)  | 添加一个页面 |
| cx.showPage(prefabName, scripts?, callbackOrParams)  | 添加一个页面(动画进入) |
| cx.closePage(pageOrSender)  | 关闭本页面 |
|   |  |

**示例代码：**
```typescript
var lblTitle: Node = cx.gn(this, "lblTitle"); //获取场景树中的名称为lblTitle的节点

//给lblTitle添加一个点击事件
lblTitle.setTouchCallback(this, this.myClick); 

//你也可以定义回调时的参数：
lblTitle.setTouchCallback(this, this.myClick, 1, "a", {tip:"任意类型和数量的参数"}); 

myClick(sender, p1, p2, p3)
{
    //sender = lblTitle
    //p1 = 1
    //p2 = "a"
    //p3 = {remark:"任意类型和数量的参数"}
}

cx.showPage("ui/pageChild"); //显示ui/pageChild.prefab
cx.hint("cx.hint(content)");
cx.alert("cx.alert(content, callback, labelOk)");
cx.confirm("cx.confirm(content, callback, labelOk, labelCancel)", cx.hint);
cx.showLoading(this);
cx.removeLoading(this);
cx.closePage(this);

//给scrollView添加增量新增数据能力
cx.script.scrollView.initDeltaInsert(this, "view", this.queryData);

//给scrollView添加下拉刷新能力
cx.script.scrollView.initDropRefresh(this, "view", this.refreshData); 

//给PageView添加自动循环滚动能力
cx.script.pageView.initAutoScroll(this, "viewBanner", 2, true, this.onBannerClick); 
````

|  资源常用方法   | 说明   |
|  ----  | ----  |
| cx.setImageFromRes(spriteOrNode, prefab, sizeMode?, callback?)  | 给节点设置图片(从resources) |
| cx.setImageFromBundle(spriteOrNode, prefab, sizeMode?, callback?)  | 给节点设置图片(从bundle)  |
| cx.setImageFromRemote(spriteOrNode, url, localPath?, sizeMode?, callback?)  | 给节点设置图片(从远程url，存储至本地localPath，并优先从localPath加载图片) |
| cx.loadBundleRes(prefab, callback?)  | 加载1个或多个prefab |
|   |  |


|  远程访问常用方法   | 说明   |
|  ----  | ----  |
| cx.call(url, callback?, context?)  | 调用服务端服务(call方式) |
| cx.post(url, data?, callback?, context?)  | 调用服务端服务(post方式) |
| cx.upload(url, filePath, callback?)  | 调用服务端服务，上传文件  |
| cx.setCommonHeaders(headers: string[])  | 设置http请求的默认headers |
| cx.loadFile(url, localPath?, callback?)  | 从url加载文件，存储至本地并优先从本地加载 |
| cx.loadAsset(url: string, callback?)  | 从url加载Asset  |
|   |  |


|  utils常用方法   | 说明   |
|  ----  | ----  |
| cx.utils.xxx  | cx.func中定义了常用的工具方法，如时间等，具体参见cx.d.ts |
|   |  |


### 1.3 与原生代码的交互
----
    cx-cocos提供了一个cxnative原生类，通过它可以方便地与原生代码、第三方SDK交互。
    与iOS/mac的交互是通过jsb/c++ ———— 避免了苹果审核风险
    与android的交互是通过jsb.reflection

    * 可参照demo中的SystemIntf编写你自己的原生类

**原生类的定义：**  
iOS/mac：在jsIntf.cpp中定义你的类名和处理类，类继承自cxDefine.h中的NativeIntfClass  
android：在jsIntf.java中定义你的类名和处理类
  
- 在JavaScript/TypeScript中调用原生方法：
```typescript
cx.native.ins("className").call("functionName", [...params], callback);
````

- 在iOS/mac中调用JS方法：
```c++
this->callback(int, string);
````

- 在android中调用JS方法：
```java
NativeIntf.callJs("className", int, string); 
````


### 1.4 真正的启动屏
----
    cocos creator提供了一个定时长的启动画面，你无法在首页渲染完成后再移除画面，也无法提前移除。并且它只能在加载cc.js之后显示，而不是在App真正启动时。
    cx-cocos针对iOS/mac和Android，提供了原生的启动画面处理，你可以在App启动时显示，在任意时刻移除。

iOS/mac启动屏实现代码：见demo中的AppController.mm  
android启动屏实现代码：见demo中的CocosActivity.java  

```typescript
// ios/Mac: LaunchImage.png
// android: lanuch_image.png
// 移除启动屏，如果你在config.ts中配置了自动移除，那么不需要执行这句，cx会在开始页(startPage)加入场景时自动调用
cx.removeLaunchImage();
````


### 1.5 热更新
----
    cx-cocos在执行main.js之前执行热更新。
    cx-cocos提供了一个update.js工具用于生成热更新需要的manifest文件，执行命令为：
    $ node update.js -v 1.0
    * 在执行之前，你需要将update.js中的更新地址替换为你的服务器地址。

****实现原理：见demo中的boot.js***  


## 2. cx-cocos结构和原理

>**cx-framework目录结构：**
- **cocos3-libs:** 这里是从creator构建项目中提取的引擎libs，我们把它独立出来，所有项目就只需要assets
  - **cocos-libcc:** cocos android jar，你的android工程需要依赖它
  - **cocos-libso:** cocos android so，编译生成libcocos.so的工程，android需要这个.so
  - **cocos3-ios.xcodeproj:** 编译生成libcocos3 iOS.a的工程，iOS需要这个.a
  - **cocos3-mac.xcodeproj:** 编译生成libcocos3 Mac.a的工程，mac需要这个.a
- **cx:** cx-cocos的ts代码，你的creator工程需要它，请拷贝到你项目中的assets目录，或在assets目录中建立链接cx链接到它，链接命令：ln -s ../../cx-framework3.1/cx cx
  - **core:** cx-cocos框架实现类
  - **prefab:** cx-cocos内置的预制资源
  - **scripts:** cx-cocos内置的组件脚本
  - **template:** cx-cocos提供的组件模板，在设计页面时可以使用它
- **cx-native:** 负责原生交互，你的iOS/mac工程需要它，android不需要（它已经在libcocos.so中）
- **cx.d.ts:** cx-cocos的TypeScript声明文件
  

>**demo的目录结构：**
- **project:** 原生工程都在这里了（并非creator构建生成的工程）
  - **assets: 注意，** 它来源于cocos构建发布，你可以创建iOS、mac、android任意一种构建，将生成的assets拷贝到这里，建议你在这里建立一个assets链接，链接到你构建生成的assets目录，这样在每次重新构建后就不需再拷贝assets，链接命令：ln -s 路径 assets
  - **boot:** 启动js和热更新manifest文件
  - **cxdemo.android:** demo android studio工程
  - **cxdemo.ios:** demo iOS/mac工程
  - **statics:** 一些仅供原生使用的静态资源
  - **update.js:** 生成热更新文件的脚本
- **其他目录:** cocos creator生成的目录
  

>**cx-cocos设计结构**
- 在ts层面，cx-cocos包括：
    - cx: 常用变量、常用方法、UI方法
    - cx.native: 与原生交互相关
    - cx.picker: 选择器相关
    - cx.res: 资源处理相关
    - cx.script: 组件扩展功能脚本，例如为ScrollView扩展下拉刷新能力
    - cx.serv: 服务交互相关
    - cx.sys: 系统环境和配置相关
- 在原生层面，cx-cocos包括：
    - cxnative: 原生JSB接口类，对应于cx.native的实现
    - sysIntf: 内置的系统原生类，用于获取包名、环境等
    - maskIntf：内置的遮罩原生类，用于给原生UI添加遮罩

>**cx-cocos运行机制**
- app启动首先加载boot.js，处理热更新，然后加载assets的main.js、cc.js等
- app加载cc.js后，加载项目js，cx作为项目的一部分被加载，cx作为全局对象存储于window.cx
- 在你的组件脚本中，你不需要import cx-cocos的任何脚本，因为它是全局的，直接使用就可以
- **整个app只有一个场景，所有页面都是预制资源**
    - 在主场景中有一个根节点RootNode，负责滑动事件、android返回键的处理
    - 你在config.ts中定义的startPage，在主场景启动时，被addPage到RootNode中
    - 其他页面你可以通过addPage或showPage方法显示，默认会运行与页面同名的脚本（可在该方法的参数中指定加载的脚本）
    - 通过addPage或showPage方法显示的页面，它们的parent都是RootNode
    - 在addPage或showPage方法回调参数中，你可以向子页面传递参数或控制子页面
    - 如果页面定义了onChildPageClosed方法，那么子页面在关闭时，会触发这个方法
    - 你可以自定义页面进入和退出时的动画
- cx-cocos定义和实现了通用的原生交互方式
    - 通过cx.native.ins("名称").call("方法", [...参数], 回调方法)调用原生方法
    - 分别在iOS的jsIntf-ios.mm、android的jsIntf.java定义你自己的“名称”处理类
  

## 3 如何运行demo app
1. 安装cocos creator 3.1.1
2. 确保cx-framework3.1和cx3-demo在同一目录下
3. iOS/mac环境：在xcode中打开cx3-demo/project/cxdemo.ios/cx3-demo.xcodeproj，运行
4. android环境：在android studio中打开cx3-demo/project/cxdemo.android，运行
```typescript
* 在iOS/mac、android上编译或运行demo，你可以不需要打开cocos creator
* android的video遮罩暂未完成（技术困难，如果你有好的实现方式，请告诉我）
```


## 4 如何使用cx-cocos开始一个自己的项目
1. 使用cocos creator3.1.1创建一个项目，与cx-framework3.1在同一目录下
```typescript
* 建议你使用cocos creator3.1.1 (2021.06.01发布)
* 如果你使用的是creator3.1.0，可能需要重新编译cx-framework3.1中.so和.a
  重新编译前，可使用vscode编辑器，查找3.1.1，全部替换成3.1.0 
* 如果你使用的是creator3.0.x，那么cx-framework3.1中的libs工程不适用，你需要从creator构建生成的项目中，提取cocos2d（支持3.0.x的框架我并未上传至git，如有需要请联系我）
```
2. 拷贝cx3-demo中的tsconfig.json文件和project目录到你的项目目录下  
```typescript
* 拷贝tsconfig.json的目的仅仅是因为——它定义了cx.d.ts的引用，你也可以不拷贝而自行定义：
"compilerOptions": {"types": ["../cx-framework3.1/cx"]}  
```
3. 根据自己的需要，修改project目录内的工程的内容
4. creator项目设置 
   - 项目数据
     - 设计宽度：750
     - 设计高度：1334
     - 适配屏幕宽度：是
     - 适配屏幕高度：否 
   - 功能裁剪：
     - 去掉3D
     - 去掉2D中的：2D物理系统、2D相交检测算法、2D粒子系统、Tiled地图、Spine动画
5. creator构建发布设置：
    - 发布路径：不要填写成project，那会弄乱你的project目录，建议设置为native或build
    - MD5缓存：不要勾选
    - 替换插屏：**勾选，并且最小显示时间设置为0**
    - 屏幕方向(Orientation)：只勾选portrait
  
  
## 5 问题和技术支持
