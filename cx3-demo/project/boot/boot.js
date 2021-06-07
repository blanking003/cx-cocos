(function()
{
    //是否启用热更新
    var __updateEnabled = 0;

    var boot = function()
    {
        require("main.js");
    }

    if (!__updateEnabled)
    {
        boot();
        return;
    }
    var platform = __getPlatform(); //0-WINDOWS, 1-LINUX, 2-MAC 3-ANDROIDOS 4-IPHONE 5-IPAD
    var storagePath = platform == 2 ? cxnative.NativeCreator.createNativeClass("cx.sys").call("getStoragePath", []) + "/" : "";
    storagePath = jsb.fileUtils.getWritablePath() + "_cxcache/" + storagePath;
    var manifestUrl = "project.manifest";
    var manager = new jsb.AssetsManager(manifestUrl, storagePath);

    var setSearchPaths = function()
    {
        var searchPath = jsb.fileUtils.getStringFromFile('.cx.searchPaths');
        if (!searchPath)
            return;
        searchPath = JSON.parse(searchPath);
        jsb.fileUtils.setSearchPaths(searchPath);
        var fileList = [];
        var tempPath = storagePath + 'updateTemp/';
        var baseOffset = tempPath.length;
        if (jsb.fileUtils.isDirectoryExist(tempPath) && !jsb.fileUtils.isFileExist(tempPath + 'project.manifest.temp'))
        {
            jsb.fileUtils.listFilesRecursively(tempPath, fileList);
            fileList.forEach(srcPath =>
            {
                var relativePath = srcPath.substr(baseOffset);
                var dstPath = storagePath + relativePath;
                if (srcPath[srcPath.length] == '/')
                    jsb.fileUtils.createDirectory(dstPath)
                else
                {
                    if (cc.fileUtils.isFileExist(dstPath))
                        jsb.fileUtils.removeFile(dstPath)
                    jsb.fileUtils.renameFile(srcPath, dstPath);
                }
            })
            jsb.fileUtils.removeDirectory(tempPath);
        }
    };

    var updateCallback = function(event)
    {
        var completed, failed, canceled;
        switch (event.getEventCode())
        {
            case 0: //jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                console.log("...update failed: No local manifest file found.");
                failed = true;
                break;
            case 1: //jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case 2: //jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                console.log("...update failed: Fail to download manifest file.");
                failed = true;
                break;
            case 3: 
                console.log("...update NEW_VERSION_FOUND.");
                break;
            case 4: //jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                console.log("...update skip: Already is the latest version.");
                canceled = true;
                break;
            case 5: //jsb.EventAssetsManager.UPDATE_PROGRESSION:
                var msg = event.getAssetId() + event.getMessage();
                console.log("...update file: " + (!msg ? event.getDownloadedFiles() + "/" + event.getTotalFiles() : msg));
                break;
            case 6: 
                console.log("...update ASSET_UPDATED.");
                break;
            case 7: //jsb.EventAssetsManager.ERROR_UPDATING:
                console.log("...update Asset error: " + event.getAssetId() + ", " + event.getMessage());
                break;
            case 8: //jsb.EventAssetsManager.UPDATE_FINISHED:
                console.log("...update file finished.");
                completed = true;
                break;
            case 9: //jsb.EventAssetsManager.UPDATE_FAILED:
                console.log("...update failed: " + event.getMessage());
                break;
            case 10: //jsb.EventAssetsManager.ERROR_DECOMPRESS:
                console.log("...update Asset decompress error: " + event.getMessage());
            default:
                console.log("...update Asset undefined event: " + event.getEventCode());
        }
        if (canceled)
        {
            manager.setEventCallback(null);
            boot();
        }
        if (failed)
        {
            manager.setEventCallback(null);
            console.log("...update skip...");
            //如果是ios，第一次启动需要网络权限导致的更新失败，则待用户点击后授权后重启
            if (platform == 4 || platform == 5)
            {
                var fullpath = storagePath + "firstLoad.log";
                if (!jsb.fileUtils.getStringFromFile(fullpath))
                {
                    console.log("...update restartForUpdate...");
                    jsb.fileUtils.writeStringToFile((new Date().getTime()) + "", fullpath);
                    cxnative.NativeCreator.createNativeClass("cx.sys").call("restartForUpdate", []);
                    return;
                }
            }
            boot();
        }
        if (completed)
        {
            manager.setEventCallback(null);
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = manager.getLocalManifest().getSearchPaths();
            if (searchPaths)
            {
                if(searchPaths[0] != newPaths)
                    Array.prototype.unshift.apply(searchPaths, newPaths);
            }
            jsb.fileUtils.writeStringToFile(JSON.stringify(searchPaths), ".cx.searchPaths");
            jsb.fileUtils.setSearchPaths(searchPaths);
            console.log("...update completed...");
            boot();
        }
    };

    var startUpdate = function()
    {
        console.log("...update...");
        if (!manager.getLocalManifest().isLoaded())
        {
            console.log("...update getLocalManifest error...");
            boot();
        }
        else
        {
            manager.setEventCallback(updateCallback);
            if(manager.getState() == 0)
                manager.loadLocalManifest(manifestUrl);
            manager.update();
        }
    };

    setSearchPaths();
    startUpdate();
})();
